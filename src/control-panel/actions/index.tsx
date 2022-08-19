import { actions } from "../../game/actions";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import VibratingIconButton from "../../components/vibrating-icon-button";
import "./index.css";
import { Player } from "../../types/player";
import { Action } from "../../types/action";

const getIconForAction = (result: number) => {
  switch (result) {
    case -1:
      return <SentimentVeryDissatisfiedIcon fontSize="inherit" />;
    case 0:
      return <SentimentNeutralIcon fontSize="inherit" />;
    case 1:
      return <SentimentSatisfiedAltIcon fontSize="inherit" />;
    default:
      return <SentimentNeutralIcon fontSize="inherit" />;
  }
};

const getColor = (action: string) => {
  if (action === "reception-excellent") {
    return "success";
  }

  if (action === "opponent-error") {
    return "success";
  }

  if (action === "opponent-point") {
    return "error";
  }

  if (action.indexOf("error") > -1) {
    return "error";
  }

  if (action.indexOf("kill") > -1) {
    return "success";
  }

  return "primary";
};

type ActionsProps = {
  playersInAction: Player[];
  onActionClick(action: Action): void;
};

export const Actions = (props: ActionsProps) => {
  const { playersInAction, onActionClick } = props;
  return (
    <div className="actions">
      {actions.map((group, idx) => (
        <div key={`group-${idx}`} className="action">
          {group[0].name}
          <div className="actions-group">
            {group.map((action) => (
              <VibratingIconButton
                duration={25}
                size="large"
                disabled={
                  playersInAction.length === 0 &&
                  !action.id.includes("opponent")
                }
                color={getColor(action.id)}
                key={`action-${action.id}`}
                onClick={() => onActionClick(action)}
              >
                {getIconForAction(action.result)}
              </VibratingIconButton>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
