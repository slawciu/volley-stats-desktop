import { useState, useEffect, useCallback, Fragment, useContext } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { NewPlayerRow, NewTeamRow } from "../components/team-table";
import { SocketContext } from '../../context/socket';
import { Player } from '../../types/player';
import { Team } from '../../types/team';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import DeleteIcon from "@mui/icons-material/Delete";
import { API_URL } from '../../config';

function Row(props: { team: Team; onDeleteButton(team: Team): void; }) {
  const { team, onDeleteButton } = props;
  const client = useContext(SocketContext);
  const [players, setPlayers] = useState<Player[]>([]);

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/teams/${team.id}/players`);
      const data = await response.json();
      setPlayers([...data]);
    } catch (e) {
      console.log(e);
      setPlayers([]);
    }
  }, [team]);

  const deletePlayer = useCallback(async (playerId: string) => {
    try {
      await fetch(`${API_URL}/api/teams/${team.id}/players/${playerId}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.log(e);
    }
  }, [team.id]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    client.on(`player-created`, (teamId: string) => teamId === team.id && fetchPlayers());
    client.on(`player-deleted`, (teamId: string) => teamId === team.id && fetchPlayers());

    return () => {
      client.off(`player-created`);
      client.off(`player-deleted`);
    };
  }, []);

  const [open, setOpen] = useState(false);
  const getPositionName = useCallback((position: string) => {
    switch (position) {
      case "middle":
        return "Środek Bloku";
      case "opposite-hitter":
        return "Atak";
      case "outside-hitter":
        return "Przyjmująca";
      case "setter":
        return "Rozegranie";
      case "libero":
        return "Libero";
      default:
        return position;
    }
  }, []
  );

  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {team.name}
        </TableCell>
        <TableCell >{team.shortName}</TableCell>
        <TableCell ><Button onClick={() => onDeleteButton(team)} color="error"><DeleteIcon /></Button></TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Numer</TableCell>
                    <TableCell>Zawodniczka</TableCell>
                    <TableCell>Pozycja</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {players.sort((a, b) => a.number - b.number).map((player) => (
                    <TableRow key={player.number}>
                      <TableCell>{player.number}</TableCell>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>{getPositionName(player.position)}</TableCell>
                      <TableCell ><Button onClick={() => { deletePlayer(player.id); }} color="error"><DeleteIcon /></Button></TableCell>

                    </TableRow>
                  ))}
                  <NewPlayerRow teamId={team.id} />
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

export default function Opponents() {
  const [teams, setTeams] = useState<Team[]>([]);
  const client = useContext(SocketContext);
  const [confirmationDialogContext, setConfirmationDialogContext] = useState({ isOpen: false, teamId: "", teamName: "" });

  const fetchTeams = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/teams`);
    try {
      const data = await response.json();
      setTeams([...data]);
    } catch (e) {
      console.log(e);
      setTeams([]);
    }
  }, []);

  const deleteTeam = useCallback(async (teamId: string) => {
    try {
      await fetch(`${API_URL}/api/teams/${teamId}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    client.on("team-created", fetchTeams);
    client.on("team-deleted", fetchTeams);
  }, []);

  useEffect(() => {
    fetchTeams();
  }, []);


  const handleClose = () => {
    setConfirmationDialogContext({
      teamId: "",
      isOpen: false,
      teamName: ""
    });
  };

  return (
    <>
      <Dialog
        open={confirmationDialogContext.isOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Czy na pewno chcesz usunąć tę drużynę?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`Usunięcie jest nieodwracalne. Czy na pewno chcesz usunąć drużynę `}
            <b>{confirmationDialogContext.teamName}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Anuluj</Button>
          <Button color="error" onClick={() => { deleteTeam(confirmationDialogContext.teamId); handleClose(); }} autoFocus>
            Usuń
          </Button>
        </DialogActions>
      </Dialog>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Pełna Nazwa</TableCell>
              <TableCell >Nazwa skrócona</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => (
              <Row key={team.id} team={team} onDeleteButton={(team: Team) => setConfirmationDialogContext({ teamId: team.id, teamName: team.name, isOpen: true })} />
            ))}
            <NewTeamRow />
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
