import Button, { ButtonProps } from "@mui/material/Button";
import { useState } from "react";

type LongPressButtonProps = ButtonProps & {
  duration: number;
  vibrationDuration: number;
  onPress(): void;
};

const VibratingButton = (props: LongPressButtonProps) => {
  const [timerId, setTimerId] = useState<NodeJS.Timeout>();
  const { onPress, duration, vibrationDuration, ...otherProps } = props;
  return (
    <Button
      {...otherProps}
      onTouchStart={() => {
        const timer = setTimeout(() => {
          window.navigator.vibrate(vibrationDuration);
          onPress();
        }, duration);
        setTimerId(timer);
      }}
      onTouchEnd={() => {
        if (timerId) {
          clearTimeout(timerId);
        }
      }}
    >
      {props.children}
    </Button>
  );
};

export default VibratingButton;
