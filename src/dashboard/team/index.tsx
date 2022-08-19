import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { API_URL } from "../../config";
import { SocketContext } from "../../context/socket";
import { Team } from "../../types/team";
import TeamTable from "../components/team-table";

export default function TeamSection() {
  const client = useContext(SocketContext);
  const [team, setTeam] = useState<Team | undefined>(undefined);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    fetchTeams();
  }, []);

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
      setTeam(data.find((x: Team) => x.shortName === "Polonia"));
    } catch (e) {
      console.log(e);
      setTeam(undefined);
    }
  }, []);

  const handleChange = (e: SelectChangeEvent<string>) => {

  };

  useEffect(() => {
    client.on(`player-created`, (teamId: string) => team && team.id && team.id === teamId && fetchPlayers());

    return () => {
      client.off(`player-created`, (teamId: string) => team && team.id && team.id === teamId && fetchPlayers());
    };
  }, []);

  if (team)
    return (
      <Fragment>
        <Select
          id="select-game"
          value={team?.id}
          onChange={handleChange}
        >
          {teams.map((team: Team) => (
            <MenuItem
              key={`team-select-${team.id}`}
              value={team.id}
            >
              {team.name}
            </MenuItem>
          ))}
        </Select>
        <TeamTable teamId={team.id} players={team.players} />
      </Fragment>
    );

  return <span />;
};
