import "./index.css";

type AttackZone = {
  no: number;
  variants: number;
};

type FieldZoneProps = {
  order: number;
  data: number[];
  total: number;
  zone: AttackZone;
  set: number;
};

const colors = [
  ["green", "light-green"],
  ["green", "light-green"],
  ["yellow", "light-yellow"],
  ["yellow", "light-yellow"],
  ["orange", "light-orange"],
  ["orange", "light-orange"],
  ["red", "light-red"],
];

export default function FieldZone({
  set,
  data,
  order,
  total,
  zone,
}: FieldZoneProps) {
  const sortedData = [...data].sort(function (a: number, b: number) {
    return b - a;
  });
  return (
    <div className={`zone ${[1, 5, 6].indexOf(zone.no) > -1 ? "long" : ""}`}>
      <div className={`zone-variants ${zone.variants > 1 ? "many" : ""}`}>
        {Array.from({ length: zone.variants }).map((variant, idx) => (
          <div
            className={`zone-container ${
              data[idx] === 0
                ? "white"
                : colors[order < 0 ? 0 : order][sortedData.indexOf(data[idx])]
            }`}
            key={`variant-${set}-${zone.no}-${idx}`}
          >
            <div className="zone-rate">
              {total === 0
                ? 0
                : isNaN(Number(((data[idx] / total) * 100).toFixed(2)))
                ? 0
                : ((data[idx] / total) * 100).toFixed(2)}
              %
            </div>
            <div className="total-in-zone">{data[idx] || 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
