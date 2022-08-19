import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import { GameDetails } from "../../types/game-details";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { API_URL } from "../../config";

type NewGameDialogProps = {
  open: boolean;
  setOpen(state: boolean): void;
  onGameCreated(game: GameDetails): void;
};

export default function NewGameDialog({
  open,
  setOpen,
  onGameCreated,
}: NewGameDialogProps) {
  const [home, setHome] = useState("");
  const [loading, setLoading] = useState(false);
  const [visitors, setVisitors] = useState("");

  const handleClose = () => {
    setHome("");
    setVisitors("");

    setOpen(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const createResponse = await fetch(`${API_URL}/api/games`, {
      method: "POST",
      body: JSON.stringify({
        home,
        visitors,
      }),
      headers: {
        "content-type": "application/json",
      },
    });
    const createdGame = await createResponse.json();
    onGameCreated(createdGame);
    setLoading(false);
    setHome("");
    setVisitors("");
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Nowa gra</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Dla podanych drużyn utworzymy również arkusz ze statystykami. To
            zajmie chwilę.
          </DialogContentText>
          <TextField
            value={home}
            onChange={(e) => setHome(e.target.value)}
            autoFocus
            margin="dense"
            id="home"
            label="Gospodarz"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            value={visitors}
            onChange={(e) => setVisitors(e.target.value)}
            margin="dense"
            id="home"
            label="Goście"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Anuluj</Button>
          <LoadingButton
            loading={loading}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
          >
            OK
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
