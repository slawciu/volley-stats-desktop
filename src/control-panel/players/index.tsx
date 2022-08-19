import Button from "@mui/material/Button";
import LongPressButton from "../../components/long-press-button";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/socket";
import "./index.css";
import { Player } from "../../types/player";
import { API_URL } from "../../config";

type PlayersProps = {
  gameId: string;
  players: Player[];
  playersInAction: Player[];
  onPlayerClick(player: Player): void;
};

const pressTime = 1000;

export const PlayersInGame = ({
  gameId,
  players,
  playersInAction,
  onPlayerClick,
}: PlayersProps) => {
  const [playerToChange, setPlayerToChange] = useState(0);
  const [playersInGame, setPlayersInGame] = useState<number[]>([]);
  const client = useContext(SocketContext);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const trackedGameResponse = await fetch(
          `${API_URL}/api/games/${gameId || localStorage.getItem("volley-score-tracked-game-id")
          }/players`
        );
        const players: number[] = await trackedGameResponse.json();
        setPlayersInGame([...players]);
      } catch (e) {
        console.log(e);
        setPlayersInGame([8, 21, 13, 12, 16, 22, 1, 2]);
      }
    };
    if (gameId) fetchPlayers();
  }, [gameId]);

  useEffect(() => {
    client.on("players-in-game-updated", (players) =>
      setPlayersInGame(players)
    );

    return () => {
      client.off("players-in-game-updated", (players) =>
        setPlayersInGame(players)
      );
    };
  }, []);

  const updatePlayersInGame = async (players: number[]) => {
    await fetch(
      `${API_URL}/api/games/${gameId || localStorage.getItem("volley-score-tracked-game-id")
      }/players`,
      {
        method: "PUT",
        body: JSON.stringify({
          players,
        }),
        headers: {
          "content-type": "application/json",
        },
      }
    );
  };

  const change = async (playerNumber: number) => {
    setPlayerToChange(0);
    await updatePlayersInGame([
      ...playersInGame.filter((p) => p !== playerToChange),
      playerNumber,
    ]);
  };

  return (
    <div className="players-in-game-container">
      <div className="players-in-game">
        <div className="players-in-position">
          {players
            .filter((p) => playersInGame.indexOf(p.number) > -1)
            .filter((p) => p.position === "opposite-hitter")
            .map((player) => (
              <LongPressButton
                onPress={() => setPlayerToChange(player.number)}
                onClick={() => {
                  if (player.number === playerToChange) {
                    setPlayerToChange(0);
                  } else {
                    onPlayerClick(player);
                  }
                }}
                vibrationDuration={200}
                duration={pressTime}
                variant={
                  playerToChange === player.number
                    ? "contained"
                    : playersInAction.find((p) => p.number === player.number)
                      ? "contained"
                      : "outlined"
                }
                color={playerToChange === player.number ? "warning" : "primary"}
                key={`player-in-game-${player.number}`}
              >
                <div>
                  <div className="player-number">{player.number}</div>
                  <div className="player-name">{player.name}</div>
                </div>
              </LongPressButton>
            ))}
        </div>
        <div className="players-in-position">
          {players
            .filter((p) => playersInGame.indexOf(p.number) > -1)
            .filter((p) => p.position === "middle")
            .map((player) => (
              <LongPressButton
                onPress={() => setPlayerToChange(player.number)}
                onClick={() => {
                  if (player.number === playerToChange) {
                    setPlayerToChange(0);
                  } else {
                    onPlayerClick(player);
                  }
                }}
                vibrationDuration={200}
                duration={pressTime}
                variant={
                  playerToChange === player.number
                    ? "contained"
                    : playersInAction.find((p) => p.number === player.number)
                      ? "contained"
                      : "outlined"
                }
                color={playerToChange === player.number ? "warning" : "primary"}
                key={`player-in-game-${player.number}`}
              >
                <div>
                  <div className="player-number">{player.number}</div>
                  <div className="player-name">{player.name}</div>
                </div>
              </LongPressButton>
            ))}
        </div>
        <div className="players-in-position">
          {players
            .filter((p) => playersInGame.indexOf(p.number) > -1)
            .filter((p) => p.position === "outside-hitter")
            .map((player) => (
              <LongPressButton
                onPress={() => setPlayerToChange(player.number)}
                onClick={() => {
                  if (player.number === playerToChange) {
                    setPlayerToChange(0);
                  } else {
                    onPlayerClick(player);
                  }
                }}
                vibrationDuration={200}
                duration={pressTime}
                variant={
                  playerToChange === player.number
                    ? "contained"
                    : playersInAction.find((p) => p.number === player.number)
                      ? "contained"
                      : "outlined"
                }
                color={playerToChange === player.number ? "warning" : "primary"}
                key={`player-in-game-${player.number}`}
              >
                <div>
                  <div className="player-number">{player.number}</div>
                  <div className="player-name">{player.name}</div>
                </div>
              </LongPressButton>
            ))}
        </div>
        <div className="players-in-position">
          {players
            .filter((p) => playersInGame.indexOf(p.number) > -1)
            .filter((p) => p.position === "setter")
            .map((player) => (
              <LongPressButton
                onPress={() => setPlayerToChange(player.number)}
                onClick={() => {
                  if (player.number === playerToChange) {
                    setPlayerToChange(0);
                  } else {
                    onPlayerClick(player);
                  }
                }}
                vibrationDuration={200}
                duration={pressTime}
                variant={
                  playerToChange === player.number
                    ? "contained"
                    : playersInAction.find((p) => p.number === player.number)
                      ? "contained"
                      : "outlined"
                }
                color={playerToChange === player.number ? "warning" : "primary"}
                key={`player-in-game-${player.number}`}
              >
                <div>
                  <div className="player-number">{player.number}</div>
                  <div className="player-name">{player.name}</div>
                </div>
              </LongPressButton>
            ))}
        </div>
        <div className="players-in-position">
          {players
            .filter((p) => playersInGame.indexOf(p.number) > -1)
            .filter((p) => p.position === "libero")
            .map((player) => (
              <LongPressButton
                onPress={() => setPlayerToChange(player.number)}
                onClick={() => {
                  if (player.number === playerToChange) {
                    setPlayerToChange(0);
                  } else {
                    onPlayerClick(player);
                  }
                }}
                vibrationDuration={200}
                duration={pressTime}
                variant={
                  playerToChange === player.number
                    ? "contained"
                    : playersInAction.find((p) => p.number === player.number)
                      ? "contained"
                      : "outlined"
                }
                color={playerToChange === player.number ? "warning" : "primary"}
                key={`player-in-game-${player.number}`}
              >
                <div>
                  <div className="player-number">{player.number}</div>
                  <div className="player-name">{player.name}</div>
                </div>
              </LongPressButton>
            ))}
        </div>
      </div>
      {playerToChange > 0 && (
        <div className="other-players">
          {players
            .filter((p) => p.number > 0)
            .filter((p) => playersInGame.indexOf(p.number) === -1)
            .map((player) => (
              <Button
                key={`change-${player.number}`}
                color="info"
                onClick={async (e) => {
                  await change(player.number);
                }}
              >
                <div>
                  <div className="player-number">{player.number}</div>
                  <div className="player-name">{player.name}</div>
                </div>
              </Button>
            ))}
        </div>
      )}
    </div>
  );
};
