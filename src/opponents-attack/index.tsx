import { useCallback, useContext, useEffect, useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { SmallPointsControls } from "../points-controls";
import { OpponentsAttack } from "./opponents-attack";
import { SocketContext } from "../context/socket";
import { GameDetails } from "../types/game-details";
import { GameState } from "../types/game-state";
import { Player } from "../types/player";
import "./index.css";
import { API_URL } from "../config";

type OpponentsAttackProps = {
  showGameSelector: boolean;
};

function OpponentsAttackPanel({ showGameSelector }: OpponentsAttackProps) {
  const [existingGames, setExistingGames] = useState<GameDetails[]>([]);
  const [game, setGame] = useState<GameDetails>({
    gameId: "",
    spreadsheetUrl: "",
    gameName: "",
    home: "",
    visitor: "",
  });
  const [scoreHome, setScoreHome] = useState(0);
  const [scoreVisitor, setScoreVisitor] = useState(0);

  const client = useContext(SocketContext);
  const [players, setPlayers] = useState<Player[]>([]);

  const fetchExistingGames = useCallback(
    async (activeGameId: string | null) => {
      const existingGamesResponse = await fetch(`${API_URL}/api/games?limit=10`);
      const existingGames = await existingGamesResponse.json();
      setExistingGames(
        existingGames.filter((game: GameDetails) => game.gameId !== null)
      );

      if (!activeGameId) return;
      const previouslyTrackedGame = existingGames.find(
        (eG: GameDetails) => eG.gameId === activeGameId
      );
      if (!previouslyTrackedGame) return;
      setGame(previouslyTrackedGame);
      client.emit("attach-to-game", activeGameId);

      localStorage.setItem("volley-score-tracked-game-id", activeGameId);
    },
    []
  );

  const fetchTrackedGame = useCallback(async () => {
    if (game.gameId.length === 0) return;

    const trackedGameResponse = await fetch(`${API_URL}/api/games/${game.gameId}/score`);
    const score = await trackedGameResponse.json();
    updateScore(score);
  }, [game.gameId]);

  const updateScore = (score: GameState) => {
    setScoreHome(score.sets[score.set].home);
    setScoreVisitor(score.sets[score.set].visitor);
  };

  useEffect(() => {
    fetchExistingGames(localStorage.getItem("volley-score-tracked-game-id"));
  }, []);

  useEffect(() => {
    client.on("connect", () => {
    });

    client.on("new-game-available", fetchExistingGames);

    client.on("score-update", updateScore);

    return () => {
      client.on("connect", () => {
      });
      client.off("new-game-available", fetchExistingGames);
      client.off("score-update", updateScore);
    };
  }, []);


  const increaseScoreVisitor = () => {
    client.emit("score-visitor", game.gameId);
  };

  const increaseScoreHome = () => {
    client.emit("score-home", game.gameId);
  };

  const decreaseScoreHome = () => {
    client.emit("decrease-score-home", game.gameId);
  };

  const decreaseScoreVisitor = () => {
    client.emit("decrease-score-visitor", game.gameId);
  };

  const fetchOpponents = useCallback(async () => {
    if (game.visitor.length === 0)
      return;
    try {
      const response = await fetch(`${API_URL}/api/teams?shortName=${game.visitor}`);
      const data = await response.json();
      setPlayers([...data.players]);
    } catch (e) {
      console.log(e);
    }
  }, [game]);

  useEffect(() => {
    if (!game) {
      return;
    }
    fetchOpponents();
    fetchTrackedGame();
  }, [game, fetchTrackedGame, fetchOpponents]);

  const handleChange = (event: SelectChangeEvent) => {
    const existingGame = existingGames.find(
      (eG) => eG.gameId === event.target.value
    );
    if (!existingGame) return;
    setGame(existingGame);
    localStorage.setItem("volley-score-tracked-game-id", existingGame.gameId);

    client.emit("attach-to-game", existingGame.gameId);
  };

  return (
    <div className="opponents-attack-container">
      {showGameSelector && <div className="new-game-container">
        <FormControl fullWidth>
          <InputLabel id="select-game-label">Gra</InputLabel>
          <Select
            labelId="select-game-label"
            id="select-game"
            value={game.gameId}
            label="Gra"
            onChange={handleChange}
          >
            {existingGames.map((existingGame: GameDetails) => (
              <MenuItem
                key={`existing-game-${existingGame.gameId}`}
                value={existingGame.gameId}
              >
                {existingGame.gameName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>}
      <OpponentsAttack
        players={players}
        onClick={(attack) => {
          client.emit("opponents-attack-full", {
            ...attack,
            gameId: game.gameId,
          });
        }}
      />
      {showGameSelector && <>
        <SmallPointsControls
          decreaseScoreHome={decreaseScoreHome}
          increaseScoreHome={increaseScoreHome}
          increaseScoreVisitor={increaseScoreVisitor}
          decreaseScoreVisitor={decreaseScoreVisitor}
          scoreHome={scoreHome}
          scoreVisitor={scoreVisitor}
        />
      </>}
    </div>
  );
}

export default OpponentsAttackPanel;
