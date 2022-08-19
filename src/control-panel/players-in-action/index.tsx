import { Rally } from "../../types/rally";
import "./index.css";

type PlayersInActionPros = {
  rally: Rally;
};

export const PlayersInAction = (props: PlayersInActionPros) => {
  const { rally } = props;

  return (
    <div className="players-in-action">
      {rally.run.map((part, idx) => (
        <div key={`player-in-action-${idx}`}>
          {part.players.map(
            (player, idx) =>
              `${player.name}${idx === part.players.length - 1 ? "" : ", "}`
          )}
          : {part.action.name}
        </div>
      ))}
    </div>
  );
};
