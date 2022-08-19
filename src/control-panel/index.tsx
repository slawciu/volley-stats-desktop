import { useCallback, useContext, useEffect, useState } from "react";
import SportsVolleyballIcon from "@mui/icons-material/SportsVolleyball";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DoneIcon from "@mui/icons-material/Done";
import SportsIcon from "@mui/icons-material/Sports";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ScoreBoard } from "../score-board";
import { PlayersInGame } from "./players";
import { Actions } from "./actions";
import { PlayersInAction } from "./players-in-action";
import { SmallPointsControls } from "../points-controls";
import NewGameDialog from "./new-game";
import OpponentsAttackPanel from "../opponents-attack";
import { SocketContext } from "../context/socket";
import { GameDetails } from "../types/game-details";
import { Team } from "../types/team";
import { GameState } from "../types/game-state";
import { Player } from "../types/player";
import { Rally } from "../types/rally";
import "./index.css";
import { API_URL } from "../config";

function ControlPanel() {
  const [existingGames, setExistingGames] = useState<GameDetails[]>([]);
  const [newGameDialogOpen, setNewGameDialogOpen] = useState(false);
  const [game, setGame] = useState<GameDetails>({
    gameId: "",
    spreadsheetUrl: "",
    gameName: "",
    home: "",
    visitor: "",
  });
  const [interfaceActive, setInterfaceActive] = useState(true);
  const [scoreHome, setScoreHome] = useState(0);
  const [scoreVisitor, setScoreVisitor] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    general: { home: 0, visitor: 0 },
    set: 0,
    sets: [{ home: 0, visitor: 0 }],
  });

  const [playersInAction, setPlayersInAction] = useState<Player[]>([]);
  const [rally, setRally] = useState<Rally>({
    run: [],
    start: null,
    stop: null,
  });
  const [team, setTeam] = useState<Team | undefined>(undefined);

  const client = useContext(SocketContext);

  const fetchExistingGames = useCallback(
    async (activeGameId: string | null) => {
      const existingGamesResponse = await fetch(`${API_URL}/api/games?limit=10`);
      const existingGames = await existingGamesResponse.json();
      setExistingGames(
        existingGames
          .filter((game: GameDetails) => game.gameId !== null)
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

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/teams?shortName=Polonia`);
      const data = await response.json();
      setTeam(data);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const fetchTrackedGame = useCallback(async () => {
    if (game.gameId.length === 0) return;

    const trackedGameResponse = await fetch(`${API_URL}/api/games/${game.gameId}/score`);
    const score = await trackedGameResponse.json();
    updateScore(score);
  }, [game.gameId]);

  const updateScore = (score: GameState) => {
    setGameState({ ...score });
    setScoreHome(score.sets[score.set].home);
    setScoreVisitor(score.sets[score.set].visitor);
  };

  useEffect(() => {
    fetchPlayers();
    fetchExistingGames(localStorage.getItem("volley-score-tracked-game-id"));
  }, []);

  useEffect(() => {
    client.on("connect", () => {
    });

    client.on("new-game-available", fetchExistingGames);

    client.on("score-update", updateScore);

    return () => {
      client.off("connect");

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

  const onGameCreated = (game: GameDetails) => {
    fetchExistingGames(game.gameId);
    setInterfaceActive(true);
    client.emit("attach-to-game", game.gameId);
  };

  useEffect(() => {
    if (!game) {
      return;
    }
    fetchTrackedGame();
  }, [game, fetchTrackedGame]);

  const handleSelectedGameChange = (event: SelectChangeEvent) => {
    const existingGame = existingGames.find(
      (eG) => eG.gameId === event.target.value
    );
    if (!existingGame) return;
    setGame(existingGame);
    localStorage.setItem("volley-score-tracked-game-id", existingGame.gameId);

    client.emit("attach-to-game", existingGame.gameId);
  };

  const [shareScoreContent, setShareScoreContent] = useState("copy");
  const [shareCoachContent, setShareCoachContent] = useState("copy");

  const changeShareScoreContent = () => {
    setTimeout(() => {
      setShareScoreContent("copy");
    }, 2000);
    setShareScoreContent("success");
  };

  const changeShareCoachContent = () => {
    setTimeout(() => {
      setShareCoachContent("copy");
    }, 2000);
    setShareCoachContent("success");
  };

  return (
    <div className="control-panel">
      <div className="new-game-container">
        <FormControl fullWidth>
          <InputLabel id="select-game-label">Gra</InputLabel>
          <Select
            labelId="select-game-label"
            id="select-game"
            value={game.gameId}
            label="Gra"
            onChange={handleSelectedGameChange}
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
        <Button
          disabled={!interfaceActive}
          onClick={() => setNewGameDialogOpen(true)}
          startIcon={<SportsVolleyballIcon />}
        >
          Nowa Gra
        </Button>
      </div>
      <div className="flex-row center">
        <ScoreBoard
          small={true}
          gameState={gameState}
          teams={{ home: game.home, visitor: game.visitor }}
        />
        <CopyToClipboard
          text={`${window.location.host}/${game.gameId}`}
          onCopy={changeShareScoreContent}
        >
          <Button>
            {shareScoreContent === "copy" ? <ContentCopyIcon /> : <DoneIcon />}
          </Button>
        </CopyToClipboard>
        <CopyToClipboard
          text={`${window.location.host}/coach/${game.gameId}`}
          onCopy={changeShareCoachContent}
        >
          <Button>
            {shareCoachContent === "copy" ? <SportsIcon /> : <DoneIcon />}
          </Button>
        </CopyToClipboard>
      </div>
      <div className="flex-row">
        <div className="flex-column">
          <PlayersInGame
            gameId={game.gameId}
            players={team ? team.players : []}
            playersInAction={playersInAction}
            onPlayerClick={(player) => {
              setPlayersInAction((pia) =>
                pia.find((x: Player) => x.number === player.number)
                  ? [...pia.filter((p) => p.number !== player.number)]
                  : [...pia, player]
              );
            }}
          />

          <PlayersInAction rally={rally} />
        </div>
        <div className="flex-column">
          <Actions
            playersInAction={playersInAction}
            onActionClick={(action) => {
              client.emit("action-log", {
                action,
                playersInAction,
                gameId: game.gameId,
              });

              setRally((r) => {
                if (r.run.length === 0) {
                  r.start = new Date().toISOString();
                }
                r.run.push({
                  players: playersInAction,
                  action: action,
                });
                return r;
              });
              setPlayersInAction([]);

              if (
                action.id.indexOf("kill") > -1 ||
                action.id.indexOf("error") > -1 ||
                action.id.indexOf("point") > -1
              ) {
                client.emit("rally", {
                  ...rally,
                  stop: new Date().toISOString(),
                  gameId: game.gameId,
                });
                setRally({ run: [], start: null, stop: null });
              }
            }}
          />

        </div>
        <div className="horizontal flex-column ">
          <OpponentsAttackPanel showGameSelector={false} />
        </div>
      </div>
      <SmallPointsControls
        decreaseScoreHome={decreaseScoreHome}
        increaseScoreHome={increaseScoreHome}
        increaseScoreVisitor={increaseScoreVisitor}
        decreaseScoreVisitor={decreaseScoreVisitor}
        scoreHome={scoreHome}
        scoreVisitor={scoreVisitor}
      />
      <NewGameDialog
        open={newGameDialogOpen}
        setOpen={(state) => setNewGameDialogOpen(state)}
        onGameCreated={onGameCreated}
      />
    </div>
  );
}

export default ControlPanel;
