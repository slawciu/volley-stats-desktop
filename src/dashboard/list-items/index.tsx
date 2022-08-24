import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
type ListItemsProps = {
  onClick(item: string): void;
};

export const mainListItems = ({ onClick }: ListItemsProps) => {
  return (
    <React.Fragment>
      <ListItemButton onClick={() => onClick("dashboard")}>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>
      <ListItemButton onClick={() => onClick("team")}>
        <ListItemIcon>
          <GroupsIcon />
        </ListItemIcon>
        <ListItemText primary="Twoja Drużyna" />
      </ListItemButton>

      <ListItemButton onClick={() => onClick("opponents")}>
        <ListItemIcon>
          <PeopleOutlineIcon />
        </ListItemIcon>
        <ListItemText primary="Drużyny" />
      </ListItemButton>

      <ListItemButton onClick={() => onClick("games")}>
        <ListItemIcon>
          <BarChartIcon />
        </ListItemIcon>
        <ListItemText primary="Rozegrane mecze" />
      </ListItemButton>

      <ListItemButton onClick={() => onClick("configuration")}>
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary="Konfiguracja" />
      </ListItemButton>
    </React.Fragment>
  );
};