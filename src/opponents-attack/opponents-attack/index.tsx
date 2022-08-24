import { useState } from "react";
import VibratingButton from "../../components/vibrating-button";
import { homeTeamZones, opponentTeamZones } from "../data/zones";
import { Player } from "../../types/player";
import "./index.css";
import { SelectPlayer } from "./select-player";

type AttackFromZone = {
  from: {
    zone: number;
    variant: number;
  };
  to?: {
    zone: number;
  };
  player?: {
    name: string;
    number: number;
  };
};

type OpponentsAtackProps = {
  onClick(attack: AttackFromZone): void;
  players: Player[];
};

type AttackRecord = {
  from: {
    zone: number;
    variant: number;
  };
  to?: {
    zone: number;
  };
};

enum RecordStages {
  ATTACK = 0,
  PLAYER = 1,
}

export const OpponentsAttack = ({ onClick, players }: OpponentsAtackProps) => {
  const [recordStage, setRecordStage] = useState<RecordStages>(
    RecordStages.ATTACK
  );
  const [attack, setAttack] = useState<AttackRecord>({
    from: {
      zone: 0,
      variant: 0,
    },
    to: { zone: 0 },
  });

  const setAttackOriginZone = (zone: number, variant: number) => {
    setAttack({
      from: {
        zone,
        variant,
      },
    });
  };

  const setAttackDestinationZone = (zone: number) => {
    setAttack((a) => ({
      ...a,
      to: {
        zone,
      },
    }));
    setRecordStage(RecordStages.PLAYER);
  };
  const resetAttackRecord = () => {
    setAttack({
      from: {
        zone: 0,
        variant: 0,
      },
      to: { zone: 0 },
    });
    setRecordStage(RecordStages.ATTACK);
  };

  if (recordStage === RecordStages.ATTACK) {
    return (
      <div className="oa-field-container">
        <div className="oa-attack-zones">
          {opponentTeamZones.map((zone) => {
            const line = [5, 6, 1].indexOf(zone.no) === -1 ? "first" : "second";
            return (
              <div key={`zone-${zone.no}`} className={`oa-${line}-line`}>
                <div className="oa-zone">
                  {Array.from({ length: zone.variants }).map((variant, idx) => (
                    <VibratingButton
                      key={`zone-${zone.no}-${idx}`}
                      size="large"
                      duration={25}
                      className={`zone-button${zone.variants === 1 ? "" : "-double"}`}
                      onClick={() => {
                        if (attack.from.zone === 0)
                          setAttackOriginZone(zone.no, idx + 1);
                        else setAttackDestinationZone(zone.no);
                      }}
                      variant="contained"
                    >
                      {zone.variants === 1 ? zone.no : `${zone.no}/${idx + 1}`}
                    </VibratingButton>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="oa-net" />
        <div className="oa-attack-zones">
          {homeTeamZones.map((zone) => {
            const line = [5, 6, 1].indexOf(zone.no) === -1 ? "first" : "second";
            return (
              <div key={`zone-${zone.no}`} className={`oa-${line}-line`}>
                <div className="oa-zone">
                  <VibratingButton
                    disabled={attack.from.zone === 0}
                    style={{
                      width: "30vw",
                      borderRadius: 0,
                      height: line === "first" ? "10vh" : "15vh",
                    }}
                    size="large"
                    duration={25}
                    onClick={() => {
                      setAttackDestinationZone(zone.no);
                    }}
                    variant="contained"
                  >
                    {zone.no}
                  </VibratingButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (recordStage === RecordStages.PLAYER) {
    return <SelectPlayer
      players={players}
      resetAttackRecord={resetAttackRecord}
      registerAttackingPlayer={(player: Player) => {
        onClick({
          ...attack,
          player
        });
      }}
    />;

  }
  return <span />;
};
