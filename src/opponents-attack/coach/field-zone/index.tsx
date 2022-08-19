import { colors } from "../../data/colors";
import { ActiveZone, AttackZone } from "../../../types/field";
import { Player } from "../../../types/player";
import { PlayersControls } from "./players-controls";
import "./index.css";

type FieldZoneProps = {
  order: number;
  data: { total: number; players?: []; }[];
  total: number;
  zone: AttackZone;
  set: number;
  players: Player[];
  activeZone?: ActiveZone;
  onClick(variant: number): void;
  onPlayerSelected(player: number | undefined): void;
};

export default function FieldZone({
  set,
  data,
  order,
  total,
  zone,
  activeZone,
  players,
  onPlayerSelected,
  onClick,
}: FieldZoneProps) {
  const sortedData = [...data].sort(function (
    a: { total: number; },
    b: { total: number; }
  ) {
    return b.total - a.total;
  });

  return (
    <div className={`zone ${[1, 5, 6].indexOf(zone.no) > -1 ? "long" : ""}`}>
      <div className={`zone-variants ${zone.variants > 1 ? "many" : ""}`}>
        {data.length > 0 &&
          Array.from({ length: zone.variants })
            .map((variant, index) => {
              const idx = zone.variants - index - 1;
              const isActive =
                activeZone?.set === set &&
                activeZone.zone === zone.no &&
                activeZone.variant === idx;
              const playersWithAttackFromZone: number[] = [
                ...(data[idx].players || []),
              ].filter((value, index, array) => array.indexOf(value) === index).map(p => Number(p));

              return (
                <div
                  onClick={() => onClick(idx)}
                  className={`zone-container ${data[idx].total === 0
                    ? "white"
                    : colors[order < 0 ? 0 : order][
                    sortedData.indexOf(data[idx])
                    ]
                    }`}
                  key={`variant-${set}-${zone.no}-${idx}`}
                >
                  {isActive && (
                    <div className="buttons-with-stats">
                      <PlayersControls
                        onPlayerSelected={onPlayerSelected}
                        players={players}
                        playersWithAttackFromZone={playersWithAttackFromZone}
                      />
                      <div className="zone-rate">
                        {total === 0
                          ? 0
                          : isNaN(
                            Number(((data[idx].total / total) * 100).toFixed(2))
                          )
                            ? 0
                            : ((data[idx].total / total) * 100).toFixed(2)}
                        %
                      </div>
                    </div>
                  )}
                  {!isActive && (
                    <div className="zone-stats">
                      <div className="zone-rate">
                        {total === 0
                          ? 0
                          : isNaN(
                            Number(((data[idx].total / total) * 100).toFixed(2))
                          )
                            ? 0
                            : ((data[idx].total / total) * 100).toFixed(2)}
                        %
                      </div>
                      <div className="total-in-zone">{data[idx].total || 0}</div>
                      {data[idx].players && (
                        <>{JSON.stringify(playersWithAttackFromZone.map(p => Number(p)))}</>
                      )}
                      <div className="spacing" />
                    </div>
                  )}
                  <div id={`zone-op-${set}-${zone.no}-${idx}`} />
                </div>
              );
            })}
      </div>
    </div>
  );
}
