import { useState } from "react";
import VibratingButton from "../../../../components/vibrating-button";
import { Player } from "../../../../types/player";

type PlayersControlsProps = {
  playersWithAttackFromZone: number[];
  players: Player[];
  onPlayerSelected(arg0: number | undefined): void;
};

export function PlayersControls({ playersWithAttackFromZone, players, onPlayerSelected }: PlayersControlsProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<number | undefined>(
    undefined
  );

  const getPlayers = (playersWithAttackFromZone: number[]) => {
    if (players.length === 0) {
      return playersWithAttackFromZone.map(n => ({ number: n })).sort((a, b) => a.number - b.number);
    }
    return players
      .filter(
        (p) =>
          playersWithAttackFromZone.indexOf(Number(p.number)) > -1
      )
      .sort((a, b) => a.number - b.number);
  };
  return (
    <div className="buttons-in-zone">
      {getPlayers(playersWithAttackFromZone)
        .map((player) => (
          <VibratingButton
            key={`opponents-player-${player.number}`}
            duration={25}
            variant="contained"
            size="small"
            sx={{
              minWidth: 20,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedPlayer === player.number) {
                setSelectedPlayer(undefined);
                onPlayerSelected(undefined);
              } else {
                setSelectedPlayer(player.number);
                onPlayerSelected(player.number);
              }
            }}
            color={
              selectedPlayer === player.number
                ? "error"
                : "primary"
            }
          >
            {player.number}
          </VibratingButton>
        ))}
      <VibratingButton
        color={
          selectedPlayer === undefined ? "error" : "primary"
        }
        duration={25}
        variant="contained"
        size="small"
        onClick={(e) => {
          e.stopPropagation();

          setSelectedPlayer(undefined);
          onPlayerSelected(undefined);
        }}
      >
        All
      </VibratingButton>
    </div>
  );
}
