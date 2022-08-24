import { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import LoadingButton from "@mui/lab/LoadingButton";
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import { Player } from "../../../types/player";
import { API_URL } from "../../../config";

const getPositionName = (position: string) => {
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
    case "unknown":
      return "Nieznana";
    default:
      return position;
  }
};

type NewPlayerRowProps = {
  teamId: string;
};

export const NewPlayerRow = ({ teamId }: NewPlayerRowProps) => {
  const [loading, setLoading] = useState(false);
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerPosition, setNewPlayerPosition] = useState("none");

  const createPlayer = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/players`, {
        method: "POST",
        body: JSON.stringify({
          name: newPlayerName,
          number: Number(newPlayerNumber),
          position: newPlayerPosition,
          teamId
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      setNewPlayerName("");
      setNewPlayerPosition("none");
      setNewPlayerNumber("");
      setLoading(false);

    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  return (
    <TableRow >
      <TableCell><TextField variant="standard"
        value={newPlayerNumber}
        onChange={e => setNewPlayerNumber(e.target.value)}
      /></TableCell>
      <TableCell><TextField variant="standard"
        value={newPlayerName}
        onChange={e => setNewPlayerName(e.target.value)}
      /></TableCell>
      <TableCell>
        <Select
          value={newPlayerPosition}
          onChange={e => setNewPlayerPosition(e.target.value)}
        >
          {["unknown", "middle", "opposite-hitter", "outside-hitter", "setter", "libero"]
            .map((position) => (
              <MenuItem key={`option-${position}`} value={position}>{getPositionName(position)}</MenuItem>
            ))}
          <MenuItem key={`option-none`} value={"none"}>Wybierz</MenuItem>
        </Select>
        <LoadingButton
          loading={loading}
          disabled={
            newPlayerName.length === 0 || newPlayerNumber.length === 0 || newPlayerPosition === "none"
          }
          loadingPosition="start"
          onClick={createPlayer}
        >
          Dodaj
        </LoadingButton>
      </TableCell>
    </TableRow>

  );
};


export const NewTeamRow = () => {
  const [loading, setLoading] = useState(false);
  const [newTeamFullName, setTeamFullName] = useState("");
  const [newTeamShortName, setNewTeamShortName] = useState("");

  const createTeam = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/teams`, {
        method: "POST",
        body: JSON.stringify({
          shortName: newTeamShortName,
          name: newTeamFullName,
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      setNewTeamShortName("");
      setTeamFullName("");
      setLoading(false);

    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  return (
    <TableRow>
      <TableCell>Nowy zespół:</TableCell>
      <TableCell>
        <TextField variant="standard"
          value={newTeamFullName}
          onChange={e => setTeamFullName(e.target.value)}
        /></TableCell>
      <TableCell><TextField variant="standard"
        value={newTeamShortName}
        onChange={e => setNewTeamShortName(e.target.value)}
      /></TableCell>
      <TableCell>
        <LoadingButton
          loading={loading}
          disabled={
            newTeamShortName.length === 0 || newTeamFullName.length === 0
          }
          loadingPosition="start"
          startIcon={<AddIcon />}
          onClick={createTeam}
        >
          Dodaj
        </LoadingButton>
      </TableCell>
    </TableRow>
  );
};

type TeamProps = {
  players: Player[];
  teamId: string;
};

export default function Team({ players, teamId }: TeamProps) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Numer</TableCell>
            <TableCell>Zawodniczka</TableCell>
            <TableCell>Pozycja</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.sort((a, b) => a.number - b.number).map((player) => (
            <TableRow key={player.number}>
              <TableCell>{player.number}</TableCell>
              <TableCell>{player.name}</TableCell>
              <TableCell>{getPositionName(player.position)}</TableCell>
            </TableRow>
          ))}
          <NewPlayerRow teamId={teamId} />
        </TableBody>
      </Table>
    </TableContainer >
  );
};
