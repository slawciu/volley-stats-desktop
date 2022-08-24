import { useState } from "react";
import VibratingButton from "../../components/vibrating-button";
import "./index.css";

type AttackFromZone = {
  zone: number;
  variant?: number;
};

type OpponentsAtackProps = {
  onClick(attack: AttackFromZone): void;
};

type VariantSelectionProps = {
  onClick(variant: number): void;
  variantsAmount: number;
};

const VariantSelection = ({
  onClick,
  variantsAmount,
}: VariantSelectionProps) => {
  return (
    <div>
      {Array.from<number>({ length: variantsAmount }).map(
        (attackVariant, idx) => (
          <VibratingButton
            key={`variant-${idx}`}
            duration={25}
            onClick={() => {
              onClick(idx + 1);
            }}
            variant="contained"
          >
            {idx + 1}
          </VibratingButton>
        )
      )}
    </div>
  );
};

const zones = [
  {
    no: 4,
    variants: 1,
  },
  {
    no: 3,
    variants: 2,
  },
  {
    no: 2,
    variants: 1,
  },
  {
    no: 5,
    variants: 1,
  },
  {
    no: 6,
    variants: 1,
  },
  {
    no: 1,
    variants: 1,
  },
];

export const OpponentsAttack = ({ onClick }: OpponentsAtackProps) => {
  const [showVariants, setShowVariants] = useState(false);
  const [zoneWithVariant, setZoneWithVariant] = useState(0);
  const [variantsAmount, setVariantsAmount] = useState(0);

  if (showVariants) {
    return (
      <VariantSelection
        onClick={(variant: number) => {
          onClick({
            zone: zoneWithVariant,
            variant,
          });
          setShowVariants(false);
        }}
        variantsAmount={variantsAmount}
      />
    );
  }

  return (
    <div className="attack-zones-container">
      Atak przeciwnika
      <div className="attack-zones">
        {zones.map((zone) => (
          <div
            key={`zone-${zone.no}`}
            className={`${
              [5, 6, 1].indexOf(zone.no) === -1 ? "first" : "second"
            }-line`}
          >
            <VibratingButton
              duration={25}
              onClick={() => {
                if (zone.variants === 1)
                  onClick({ zone: zone.no, variant: zone.variants });
                else {
                  setZoneWithVariant(zone.no);
                  setVariantsAmount(zone.variants);
                  setShowVariants(true);
                }
              }}
              variant="contained"
            >
              {zone.no}
            </VibratingButton>
          </div>
        ))}
      </div>
    </div>
  );
};
