import VibratingButton from "../../../components/vibrating-button";
import { Keyboard } from "../../keyboard";
import { Player } from "../../../types/player";
import "./index.css";

type SelectPlayerProps = {
  registerAttackingPlayer(player: Player): void;
  resetAttackRecord(): void;
  players: Player[];
};

export const SelectPlayer = ({
  registerAttackingPlayer,
  resetAttackRecord,
  players
}: SelectPlayerProps) => {

  return (
    <div className="opponent-players">
      <VibratingButton
        duration={25}
        color="warning"
        variant="contained"
        onClick={() => {
          resetAttackRecord();
        }}
      >
        Wróć
      </VibratingButton>
      {players.length === 0 && (<Keyboard onConfirm={number => {
        registerAttackingPlayer(
          { number: number, name: "Unknown", id: "", position: "" },
        );
        resetAttackRecord();
      }} />)}
      {players.length > 0 && <>
        <VibratingButton
          duration={25}
          variant="contained"
          onClick={() => {
            registerAttackingPlayer({ number: 0, name: "Unknown", id: "", position: "" },
            );
            resetAttackRecord();
          }}
        >
          0 Nieznany
        </VibratingButton>
        {players
          .sort((a, b) => a.number - b.number)
          .map((player) => (
            <VibratingButton
              key={`opponents-player-${player.number}`}
              duration={25}
              variant="contained"
              onClick={() => {
                registerAttackingPlayer(
                  player,
                );
                resetAttackRecord();
              }}
            >
              {player.number} {player.name}
            </VibratingButton>
          ))}
      </>}
    </div>
  );
};