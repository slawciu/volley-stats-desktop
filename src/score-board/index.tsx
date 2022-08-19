import { GameState } from "../types/game-state";
import "./index.css";

type ScoreBoardProps = {
  gameState: GameState | undefined;
  small?: boolean;
  teams: {
    home: string;
    visitor: string;
  };
};

export const ScoreBoard = ({ gameState, small, teams }: ScoreBoardProps) => {
  if (!gameState) {
    return (
      <div className="score-container">
        <div className="main-score">-:-</div>
        <div>-:-</div>
      </div>
    );
  }

  const mainScoreHome = gameState.general.home;
  const mainScoreVisitor = gameState.general.visitor;
  return (
    <div className={`score-container ${small ? "small" : ""}`}>
      <div className="teams">
        <div className="top-score">{teams.home}</div>
        <div className="bottom-score">{teams.visitor}</div>
      </div>
      <div className="main-score score">
        <div className="top-score">{mainScoreHome}</div>
        <div className="bottom-score">{mainScoreVisitor}</div>
      </div>
      {gameState.sets.map((setScore, idx: number) => {
        if (idx > gameState.set) {
          return <div key={`set-score-${idx}`} />;
        }
        return (
          <div key={`set-score-${idx}`} className="score">
            <div className="top-score">{setScore.home}</div>

            <div className="bottom-score"> {setScore.visitor}</div>
          </div>
        );
      })}
    </div>
  );
};
