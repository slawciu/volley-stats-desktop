import { useCallback } from "react";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import HotelIcon from '@mui/icons-material/Hotel';
import RepeatIcon from '@mui/icons-material/Repeat';
import Typography from '@mui/material/Typography';
import "./index.css";
import { Score } from '../../types/score';
import { Action } from '../../types/action';
import { Player } from '../../types/player';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ErrorIcon from '@mui/icons-material/Error';
import SecurityIcon from '@mui/icons-material/Security';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
type LogItemProps = {
  score: Score;
  action: Action;
  players: Player[];
};

export const LogItem = ({ score, action, players }: LogItemProps) => {
  const getActionName = useCallback((actionType: string, result: number) => {
    switch (actionType) {
      case "attack":
        return "Atak";
      case "block":
        return "Blok";
      case "serve":
        return "Zagrywka";
      case "receive":
        return "Przyjęcie";
      case "error":
        if (result > 0) {
          return "Błąd przeciwnika";
        } else {
          return "Punkt dla przeciwnika";
        }
      default:
        return actionType;
    }
  }, []);
  const getActionIcon = useCallback((actionType: string) => {
    switch (actionType) {
      case "attack":
        return <RocketLaunchIcon />;
      case "block":
        return <SecurityIcon />;
      case "serve":
        return <SportsVolleyballIcon />;
      case "receive":
        return <CallReceivedIcon />;
      case "error":
        return <VolunteerActivismIcon />;
      default:
        return <FastfoodIcon />;
    }
  }, []);
  return (
    <TimelineItem
      position={action.result >= 0 ? "left" : "right"}
    >
      <TimelineOppositeContent
        sx={{ m: 'auto 0' }}
        align="right"
        color="text.secondary"
      >
        {`${score.home}:${score.visitor}`}
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineConnector />
        <TimelineDot color={action.result === 0 ? "primary" : action.result > 0 ? "success" : "error"}>
          {getActionIcon(action.type)}
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent sx={{ py: '12px', px: 2 }}>
        <Typography variant="h6" component="span">
          {players.map(p => `${p.number} ${p.name}`).join(", ")}
        </Typography>
        <Typography>{getActionName(action.type, action.result)}</Typography>
      </TimelineContent>
    </TimelineItem>
  );

};

export default function CustomizedTimeline() {
  return (
    <div className='timeline-container'>
      <Timeline position="alternate">
        <TimelineItem>
          <TimelineOppositeContent
            sx={{ m: 'auto 0' }}
            align="right"
            variant="body2"
            color="text.secondary"
          >
            9:30 am
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot>
              <FastfoodIcon />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="h6" component="span">
              Eat
            </Typography>
            <Typography>Because you need strength</Typography>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent
            sx={{ m: 'auto 0' }}
            variant="body2"
            color="text.secondary"
          >
            10:00 am
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot color="primary">
              <LaptopMacIcon />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="h6" component="span">
              Code
            </Typography>
            <Typography>Because it&apos;s awesome!</Typography>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot color="primary" variant="outlined">
              <HotelIcon />
            </TimelineDot>
            <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="h6" component="span">
              Sleep
            </Typography>
            <Typography>Because you need rest</Typography>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
            <TimelineDot color="secondary">
              <RepeatIcon />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="h6" component="span">
              Repeat
            </Typography>
            <Typography>Because this is the life you love!</Typography>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  );
}
