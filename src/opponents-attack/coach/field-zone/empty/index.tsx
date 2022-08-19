import { AttackZone } from "../../../../types/field";

type EmptyFieldZoneProps = {
  set: number;
  zone: AttackZone;
};

export const EmptyFieldZone = ({ zone, set }: EmptyFieldZoneProps) => {
  return (
    <div className={`zone ${[1, 5, 6].indexOf(zone.no) > -1 ? "long" : ""}`}>
      <div className={`zone-variants`}>
        <div className={`zone-container home`}>
          <div id={`zone-op-${set}-${zone.no}`} className="total-in-zone">
            {zone.no}
          </div>
        </div>
      </div>
    </div>
  );
};
