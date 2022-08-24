import { useState } from "react";
import VibratingButton from "../../components/vibrating-button";
import "./index.css";

type KeyboardProps = {
  onConfirm(number: number): void;
};

export const Keyboard = ({ onConfirm }: KeyboardProps) => {

  const [typedNumber, setTypedNumber] = useState("");

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "<", "0", "X"];

  const onKeyPressed = (pressedKey: string) => {
    switch (pressedKey) {
      case "OK":
        onConfirm(Number(typedNumber));
        setTypedNumber("");
        break;
      case "X":
        setTypedNumber("");
        break;
      case "<":
        setTypedNumber(tN => tN.substring(0, tN.length - 1));
        break;
      default:
        setTypedNumber(tN => tN + pressedKey);
        break;
    }
  };

  return (<div className="keyboard">
    <div className="keyboard-display">
      {typedNumber}
    </div>
    <div className="keyboard-container">
      {keys.map(key => <VibratingButton
        key={key}
        duration={25}
        color={key === "<" || key === "X" ? "warning" : "primary"}
        variant="contained"
        onClick={() => onKeyPressed(key)}>{key}</VibratingButton>)
      }
    </div>
    <p>

      <VibratingButton
        style={{
          width: "100%",
          maxWidth: "192px"
        }}
        duration={25}
        color={"success"}
        variant="contained"
        onClick={() => { onKeyPressed("OK"); }}>OK</VibratingButton>
    </p>
  </div>);
};