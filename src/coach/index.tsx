import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import { GameDetails } from "../types/game-details";
import FieldZone from "./field-zone";
import { SocketContext } from "../context/socket";
import "./index.css";
import { API_URL } from "../config";

type AttackRecord = {
  zone: number;
  set: number;
  gameId: string;
  variant: number;
};

type AttackInSet = {
  set: number;
  zones: number[];
  total: number;
};

type AttackStatistics = {
  log: AttackRecord[];
  total: number;
  attackRate: AttackInSet[];
};

type Zone = {
  no: number;
  variants: number;
};

const zones = [
  {
    no: 1,
    variants: 1,
  },
  {
    no: 6,
    variants: 1,
  },
  {
    no: 5,
    variants: 1,
  },

  {
    no: 2,
    variants: 1,
  },
  {
    no: 3,
    variants: 2,
  },
  {
    no: 4,
    variants: 1,
  },
];

var groupBy = function (xs: any, key: string) {
  return xs.reduce(function (rv: any, x: any) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

export const Coach = () => {
  let { gameId } = useParams();
  const [existingGames, setExistingGames] = useState<GameDetails[]>([]);
  const [stats, setStats] = useState<AttackStatistics>();
  const [game, setGame] = useState<GameDetails>({
    gameId: "",
    spreadsheetUrl: "",
    gameName: "",
    home: "",
    visitor: "",
  });
  const client = useContext(SocketContext);

  const fetchStats = useCallback(async (gameId: string) => {
    const statsResponse = await fetch(`${API_URL}/api/games/${gameId}/stats`);
    if (statsResponse.status >= 400) {
      setStats(undefined);
      return;
    }

    const statsObject = await statsResponse.json();
    setStats({ ...statsObject });
  }, []);

  useEffect(() => {
    if (game.gameId.length === 0) return;
    client.emit("attach-to-game", game.gameId);
    fetchStats(game.gameId);
  }, [fetchStats, game.gameId]);

  const fetchExistingGames = async (activeGameId: string | null) => {
    const existingGamesResponse = await fetch(`${API_URL}/api/games?limit=10`);
    const existingGames = await existingGamesResponse.json();
    setExistingGames(
      existingGames.filter((game: GameDetails) => game.gameId !== null)
    );

    if (!activeGameId) return;
    const previouslyTrackedGame = existingGames.find(
      (eG: GameDetails) => eG.gameId === activeGameId
    );
    if (!previouslyTrackedGame) return;
    setGame({ ...previouslyTrackedGame });

    localStorage.setItem("volley-score-tracked-game-id", activeGameId);
  };

  useEffect(() => {
    fetchExistingGames(
      gameId || localStorage.getItem("volley-score-tracked-game-id")
    );
  }, []);

  useEffect(() => {
    const updateStats = (record: AttackRecord) => {
      fetchStats(record.gameId);
    };

    client.on("opponents-attack-recorded", updateStats);

    return () => {
      client.off("opponents-attack-recorded");
      client.disconnect();
    };
  }, []);

  const handleChange = async (event: SelectChangeEvent) => {
    const existingGame = existingGames.find(
      (eG) => eG.gameId === event.target.value
    );
    if (!existingGame) return;
    setGame({ ...existingGame });
    await fetchExistingGames(existingGame.gameId);
    localStorage.setItem("volley-score-tracked-game-id", existingGame.gameId);

    client.emit("attach-to-game", existingGame.gameId);
  };

  const caluculateVariants = (zone: Zone, set: number): number[] => {
    const variants: number[] = [];
    for (let i = 0; i < zone.variants; i++) {
      if (set < 99) {
        variants.push(
          stats?.log.filter(
            (entry) =>
              entry.zone === zone.no &&
              entry.variant === i + 1 &&
              entry.set === set
          ).length || 0
        );
      } else {
        variants.push(
          stats?.log.filter(
            (entry) => entry.zone === zone.no && entry.variant === i + 1
          ).length || 0
        );
      }
    }

    return variants;
  };

  const buildSortedData = (set: number) => {
    let attackByZone = [];
    if (set < 99) {
      attackByZone = groupBy(
        stats?.log.filter((x) => x.set === set),
        "zone"
      );
    } else {
      attackByZone = groupBy(stats?.log ? stats.log : [], "zone");
    }

    const attacksArray = [];

    for (let i = 1; i <= 6; i++) {
      attacksArray.push(attackByZone[i] ? attackByZone[i].length : 0);
    }

    attacksArray.sort(function (a: number, b: number) {
      return a - b;
    });

    return attacksArray;
  };

  const sortedAttacks = buildSortedData(99);

  return (
    <div className="coach-container">
      <FormControl fullWidth>
        <InputLabel id="select-game-label">Gra</InputLabel>
        <Select
          labelId="select-game-label"
          id="select-game"
          value={game.gameId}
          label="Gra"
          onChange={handleChange}
        >
          {existingGames.map((existingGame: GameDetails) => (
            <MenuItem
              key={`existing-game-${existingGame.gameId}`}
              value={existingGame.gameId}
            >
              {existingGame.gameName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <h2>Atak przeciwnika</h2>
      <div className="field-halves-container">
        <div>
          <h3>{`Ogółem: ${Number(stats?.total)}`}</h3>
          <div className="field-half">
            {zones.map((zone) => {
              const zoneData = caluculateVariants(zone, 99);
              const attacksInZone = zoneData.reduce(
                (a: number, b: number) => a + b,
                0
              );
              return (
                <FieldZone
                  order={sortedAttacks.indexOf(attacksInZone)}
                  set={99}
                  key={`total-zone-${zone.no}-${game.gameId}`}
                  zone={zone}
                  total={Number(stats?.total)}
                  data={zoneData}
                />
              );
            })}
          </div>
        </div>
        {stats?.attackRate.map((item: AttackInSet, idx: number) => {
          const sortedAttacks = buildSortedData(idx);
          return (
            <div key={`set-${idx}`}>
              <h3>{`Set ${idx + 1}: ${item.total}`}</h3>
              <div className="field-half">
                {zones.map((zone) => {
                  const zoneData = caluculateVariants(zone, idx);
                  const attacksInZone = zoneData.reduce(
                    (a: number, b: number) => a + b,
                    0
                  );
                  return (
                    <FieldZone
                      order={sortedAttacks.indexOf(attacksInZone)}
                      set={idx + 1}
                      key={`set-${idx}-zone-${zone.no}`}
                      zone={zone}
                      total={
                        stats?.log.filter((record) => record.set === idx).length
                      }
                      data={zoneData}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
