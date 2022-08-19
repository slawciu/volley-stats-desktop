import { useEffect, useState, useCallback, useContext } from "react";
import "./index.css";
import { ScoreBoard } from "../score-board";
import { Score } from "../types/score";
import { GameState } from "../types/game-state";
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/socket";
import { Action } from "../types/action";
import { Player } from "../types/player";
import { LogItem } from "./timeline";
import Timeline from '@mui/lab/Timeline';
import { API_URL } from "../config";

type GameDetails = {
  gameId: string;
  spreadsheetUrl: string;
  gameName: string;
  home: string;
  visitor: string;
};

type LogRecord = {
  action: Action;
  gameId: string;
  playersInAction: Player[];
  score: {
    general: Score;
    set: number;
    sets: Score[];
  };
};

function Display() {
  const [gameState, setGameState] = useState<GameState>();
  const [game, setGame] = useState<GameDetails>({
    gameId: "",
    spreadsheetUrl: "",
    gameName: "",
    home: "",
    visitor: "",
  });

  const client = useContext(SocketContext);

  const [log, setLog] = useState<LogRecord[]>([]);
  let { gameId } = useParams();

  const fetchTrackedScore = useCallback(async () => {
    const trackedGameResponse = await fetch(`${API_URL}/api/games/${gameId}/score`);
    const score = await trackedGameResponse.json();
    updateScore(score);
  }, [gameId]);

  const fetchGameLog = useCallback(async () => {
    const trackedGameResponse = await fetch(`${API_URL}/api/games/${gameId}`);
    const game = await trackedGameResponse.json();
    setLog(game.statsLog.reverse());
  }, [gameId]);

  const fetchTrackedGame = useCallback(async () => {
    const trackedGameResponse = await fetch(`${API_URL}/api/games/${gameId}/details`);
    const game = await trackedGameResponse.json();
    setGame(game);
  }, [gameId]);

  useEffect(() => {
    fetchTrackedScore();
    fetchTrackedGame();
    fetchGameLog();
    client.emit("attach-to-game", gameId);
  }, [fetchTrackedScore, fetchTrackedGame, gameId, fetchGameLog, client]);

  const updateScore = (score: GameState) => {
    setGameState({ ...score });
  };
  useEffect(() => {
    client.on("connect", () => {
      setConnectionStatus("CONNECTED");
      console.log("Connected");
    });

    client.on("score-update", updateScore);
    client.on("score-update", fetchGameLog);

    return () => {
      client.off("connect", () => {
        setConnectionStatus("CONNECTED");
        console.log("Connected");
      });
      client.off("score-update", updateScore);
    };
  }, []);

  const [connectionStatus, setConnectionStatus] = useState("NOT CONNECTED");
  return (
    <div className="display">
      <ScoreBoard
        gameState={gameState}
        teams={{ home: game.home, visitor: game.visitor }}
      />
      <Timeline position="alternate">
        {log.map((l, idx) => (
          <LogItem
            key={`${l.score.set}-${l.score.sets[l.score.set].home}:${l.score.sets[l.score.set].visitor}-${idx}`}
            score={l.score.sets[l.score.set]}
            action={l.action}
            players={l.playersInAction} />
        ))}
      </Timeline>

    </div>
  );
}

export default Display;
