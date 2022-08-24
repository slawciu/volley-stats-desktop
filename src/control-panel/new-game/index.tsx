import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useCallback, useEffect, useState } from "react";
import { GameDetails } from "../../types/game-details";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Autocomplete from '@mui/material/Autocomplete';
import "./index.css";
import { Player } from "../../types/player";
import { Team } from "../../types/team";
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
  const [home, setHome] = useState("Polonia");
  const [loading, setLoading] = useState(false);
  const [opponent, setOpponent] = useState("");
  const [mainSquad, setMainSquad] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [team, setTeam] = useState<Team | undefined>(undefined);

  const handleClose = () => {
    setHome("Polonia");
    setMainSquad([]);

    setOpen(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const createResponse = await fetch(`${API_URL}/api/games`, {
      method: "POST",
      body: JSON.stringify({
        home,
        visitors: teams.find(x => x.name === opponent)?.shortName,
        opponentId: teams.find(x => x.name === opponent)?.id,
        mainSquad: mainSquad.map((s) => s.number),
      }),
      headers: {
        "content-type": "application/json",
      },
    });
    const createdGame = await createResponse.json();
    onGameCreated(createdGame);
    setLoading(false);
    setHome("");
    setMainSquad([]);

    setOpen(false);
  };

  const handlePlayerChange = (playerNumber: number, isPlayerIn: boolean) => {
    setMainSquad((s) => {
      if (isPlayerIn) {
        const player = team?.players.find((p) => p.number === playerNumber);
        if (!player) {
          return s;
        }

        return [...s, player];
      } else {
        return [...s.filter((x) => x.number !== playerNumber)];
      }
    });
  };

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/teams?shortName=Polonia`);
      const data = await response.json();
      setTeam(data);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/teams`);
    try {
      const data = await response.json();
      setTeams(data);
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchTeams(),
        fetchPlayers()
      ]);
    };
    fetchData();
  }, [fetchPlayers, fetchTeams]);

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
            disabled
            margin="dense"
            id="home"
            label="Gospodarz"
            type="text"
            fullWidth
            variant="standard"
          />
          <Autocomplete
            freeSolo
            options={teams.map(t => t.name)}
            onChange={(e, newInputValue) => setOpponent(newInputValue || "")}
            renderInput={(params) => <TextField  {...params}
              type="text"
              margin="dense"
              fullWidth
              variant="standard"
              label="Przeciwnik" />}
          />
          <FormControl
            required
            error={mainSquad.length > 8}
            component="fieldset"
            variant="standard"
          >
            <FormLabel component="legend">Pierwszy skład (max. 8)</FormLabel>
            <FormGroup>
              <div className="players-draft">
                {team?.players
                  .map((player) => {
                    return (
                      <FormControlLabel
                        key={`player-opt-${player.number}`}
                        control={
                          <Checkbox
                            checked={mainSquad.some(
                              (x) => x.number === player.number
                            )}
                            onChange={(e) =>
                              handlePlayerChange(
                                player.number,
                                e.target.checked
                              )
                            }
                            name={player.name}
                          />
                        }
                        label={player.name}
                      />
                    );
                  })}
              </div>
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Anuluj</Button>
          <LoadingButton
            loading={loading}
            disabled={
              mainSquad.length < 6 || mainSquad.length > 9
            }
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
