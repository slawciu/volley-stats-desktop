import VibratingButton from "../components/vibrating-button";
import "./index.css";

type SmallPointsControlsProps = {
  scoreHome: number;
  scoreVisitor: number;
  decreaseScoreHome(): void;
  increaseScoreHome(): void;
  increaseScoreVisitor(): void;
  decreaseScoreVisitor(): void;
};

export const SmallPointsControls = (props: SmallPointsControlsProps) => {
  const {
    scoreHome,
    scoreVisitor,
    decreaseScoreHome,
    increaseScoreHome,
    increaseScoreVisitor,
    decreaseScoreVisitor,
  } = props;

  return (
    <div className="small-points-controls-container">
      <div className="points-controls">
        <VibratingButton
          duration={20}
          size="small"
          variant="contained"
          onClick={() => decreaseScoreHome()}
        >
          -
        </VibratingButton>
        <VibratingButton
          duration={20}
          size="large"
          variant="contained"
          onClick={() => increaseScoreHome()}
        >
          {scoreHome}
        </VibratingButton>
      </div>
      <div className="points-controls">
        <VibratingButton
          duration={20}
          size="large"
          variant="contained"
          onClick={() => increaseScoreVisitor()}
        >
          {scoreVisitor}
        </VibratingButton>
        <VibratingButton
          duration={20}
          size="small"
          variant="contained"
          onClick={() => decreaseScoreVisitor()}
        >
          -
        </VibratingButton>
      </div>
    </div>
  );
};
