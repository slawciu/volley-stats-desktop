import IconButton, { IconButtonProps } from "@mui/material/IconButton";

type VibratingButtonProps = IconButtonProps & {
  duration: number;
};

const VibratingIconButton = (props: VibratingButtonProps) => (
  <IconButton
    {...props}
    size="large"
    onClick={(e) => {
      window.navigator.vibrate(props.duration);

      if (props.onClick) props.onClick(e);
    }}
  >
    {props.children}
  </IconButton>
);

export default VibratingIconButton;
