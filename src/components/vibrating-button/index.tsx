import Button, { ButtonProps } from "@mui/material/Button";

type VibratingButtonProps = ButtonProps & {
  duration: number;
};

const VibratingButton = (props: VibratingButtonProps) => (
  <Button
    {...props}
    onClick={(e) => {
      window.navigator.vibrate(props.duration);

      if (props.onClick) props.onClick(e);
    }}
  >
    {props.children}
  </Button>
);

export default VibratingButton;
