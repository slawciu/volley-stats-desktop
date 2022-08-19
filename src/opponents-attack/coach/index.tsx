import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import { GameDetails } from "../../types/game-details";
import FieldZone from "./field-zone";
import "./index.css";
import { homeTeamZones, opponentTeamZones } from "../data/zones";
import Xarrow from "react-xarrows";
import { Button } from "@mui/material";
import { colors } from "../data/colors";
import { SocketContext } from "../../context/socket";
import { Player } from "../../types/player";
import { EmptyFieldZone } from "./field-zone/empty";
import { API_URL } from "../../config";

export type FullAttackRecord = {
  from: {
    zone: number;
    variant: number;
  };
  to: {
    zone: number;
  };
  player?: {
    name: string;
    number: number;
  };
  set: number;
  gameId: string;
};

type FullAttackInSet = {
  set: number;
  zones: FullAttackRecord[][];
  total: number;
};

type FullAttackStatistics = {
  log: FullAttackRecord[];
  total: number;
  attackRate: FullAttackInSet[];
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
  const [stats, setStats] = useState<FullAttackStatistics>();
  const [game, setGame] = useState<GameDetails>({
    gameId: "",
    spreadsheetUrl: "",
    gameName: "",
    home: "",
    visitor: "",
  });
  const client = useContext(SocketContext);
  const [selectedPlayer, setSelectedPlayer] = useState<number | undefined>(
    undefined
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeZone, setActiveZone] =
    useState<{ variant: number; zone: number; set: number; }>();

  const fetchStats = useCallback(async (gameId: string) => {
    const statsResponse = await fetch(`${API_URL}/api/games/${gameId}/full-stats`);
    if (statsResponse.status >= 400) {
      setStats(undefined);
      return;
    }

    const statsObject = await statsResponse.json();
    setStats({ ...statsObject });
  }, []);

  const fetchOpponents = useCallback(async () => {
    if (game.visitor.length === 0)
      return;
    try {
      const response = await fetch(`${API_URL}/api/teams?shortName=${game.visitor}`);
      const data = await response.json();
      console.log(data.players);
      setPlayers([...data.players]);
    } catch (e) {
      console.log(e);
    }
  }, [game]);

  useEffect(() => {
    if (game.gameId.length === 0) return;
    client.emit("attach-to-game", game.gameId);
    fetchStats(game.gameId);
    fetchOpponents();
  }, [client, fetchStats, game.gameId]);

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
    const updateStats = (record: FullAttackRecord) => {
      fetchStats(record.gameId);
      setActiveZone(undefined);
    };

    client.on("opponents-full-attack-recorded", updateStats);

    return () => {
      client.off("opponents-full-attack-recorded", updateStats);
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

  const caluculateVariants = (
    zone: Zone,
    set: number
  ): {
    total: number;
    attacks: { [key: number]: { zone: number; }; };
  }[] => {
    const variants: {
      total: number;
      players: number[];
      attacks: { [key: number]: { zone: number; }; };
    }[] = [];
    for (let i = 0; i < zone.variants; i++) {
      if (set < 99) {
        const attacksFromZoneVariant = stats
          ? stats.log.filter(
            (entry) =>
              entry.set === set &&
              entry.from.zone === zone.no &&
              entry.from.variant === i + 1
          )
          : [];

        variants.push({
          players: attacksFromZoneVariant
            .filter((x) => x.from.variant === i + 1)
            .filter((x) => x.player)
            .map((x) => (x.player ? x.player.number : 0)),

          attacks: groupBy(
            attacksFromZoneVariant.map((a) => a.to),
            "zone"
          ),
          total:
            stats?.log.filter(
              (entry) =>
                entry.from.zone === zone.no &&
                entry.from.variant === i + 1 &&
                entry.set === set
            ).length || 0,
        });
      } else {
        const attacksFromZoneVariant = stats
          ? stats?.log?.filter(
            (entry) =>
              entry.from.zone === zone.no && entry.from.variant === i + 1
          )
          : [];
        if (attacksFromZoneVariant)
          variants.push({
            players: attacksFromZoneVariant
              .filter((x) => x.player)
              .map((x) => (x.player ? x.player.number : 0)),
            attacks: groupBy(
              attacksFromZoneVariant
                ? attacksFromZoneVariant.map((a) => a.to)
                : [],
              "zone"
            ),
            total:
              stats?.log?.filter(
                (entry) =>
                  entry.from.zone === zone.no && entry.from.variant === i + 1
              ).length || 0,
          });
      }
    }

    return variants;
  };

  const buildSortedData = (set: number) => {
    let attackByZone = [];
    if (set < 99) {
      attackByZone = groupBy(
        stats?.log.filter((x) => x.set === set).map((x) => x.from),
        "zone"
      );
    } else {
      attackByZone = groupBy(
        stats?.log ? stats.log.map((x) => x.from) : [],
        "zone"
      );
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
    <div className="oa-coach-container">
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
      {!stats && <div>Brak statystyk dla wybranego meczu</div>}
      {stats && (
        <div>
          <h2>Atak przeciwnika</h2>
          <div className="oa-field-halves-container">
            <div className="oa-field-container">
              <h3>
                {`Ogółem: ${Number(stats?.total)}`}
                <Button
                  disabled={activeZone === undefined}
                  onClick={() => setActiveZone(undefined)}
                >
                  Ukryj strzałki
                </Button>
              </h3>
              <div className="oa-field-half">
                {zones.map((zone) => {
                  const zoneData = caluculateVariants(zone, 99);
                  const attacksInZone = zoneData
                    .map((z) => z.total)
                    .reduce((a: number, b: number) => a + b, 0);
                  return (
                    <FieldZone
                      players={players}
                      onPlayerSelected={setSelectedPlayer}
                      onClick={(variant) =>
                        setActiveZone((activeZone) => {
                          if (
                            activeZone?.set === 99 &&
                            activeZone.variant === variant &&
                            activeZone.zone === zone.no
                          )
                            return undefined;
                          return { variant, zone: zone.no, set: 99 };
                        })
                      }
                      order={sortedAttacks.indexOf(attacksInZone)}
                      set={99}
                      key={`total-zone-${zone.no}-${game.gameId}`}
                      zone={zone}
                      total={Number(stats?.total)}
                      data={zoneData}
                      activeZone={activeZone}
                    />
                  );
                })}
              </div>
              <div className="oa-net" />
              <div className="oa-field-half-home">
                {homeTeamZones.map((zone) => {
                  return (
                    <EmptyFieldZone
                      key={`home-zone-${zone.no}`}
                      set={99}
                      zone={zone}
                    />
                  );
                })}
              </div>
            </div>
            {activeZone?.set === 99 && (
              <div>
                {[1, 2, 3, 4, 5, 6].map((zoneNumber: number) => {
                  let attacksFromZone: FullAttackRecord[] = [];
                  if (stats.log)
                    attacksFromZone = stats.log
                      .filter((x) => {
                        if (selectedPlayer) {
                          if (!x.player) return false;
                          return x.player.number === selectedPlayer;
                        }
                        return true;
                      })
                      .filter(
                        (x) =>
                          x.from.zone === activeZone.zone &&
                          x.from.variant === activeZone.variant + 1
                      );

                  const directions: {
                    zone: number;
                    amount: number;
                  }[] = Array.from({ length: 6 });

                  for (let dId = 0; dId < directions.length; dId++) {
                    directions[dId] = {
                      zone: dId + 1,
                      amount: attacksFromZone
                        ? attacksFromZone.filter((x) => x.to.zone === dId + 1)
                          .length
                        : 0,
                    };
                  }
                  directions.sort((a, b) => a.amount - b.amount);
                  const zoneInDirections = directions.find(
                    (x) => x.zone === zoneNumber
                  );
                  if (!zoneInDirections || zoneInDirections.amount === 0) {
                    return null;
                  }

                  return (
                    <Xarrow
                      key={`arrow-${zoneNumber}`}
                      path="straight"
                      labels={<b>{zoneInDirections.amount}</b>}
                      headShape="arrow1"
                      strokeWidth={22}
                      headSize={2}
                      color={
                        zoneInDirections
                          ? colors[directions.indexOf(zoneInDirections) + 1][0]
                          : "white"
                      }
                      start={`zone-op-${activeZone.set}-${activeZone.zone}-${activeZone.variant}`}
                      end={`zone-op-${activeZone.set}-${zoneNumber}`}
                    />
                  );
                })}
              </div>
            )}
            {stats?.attackRate?.map((item: FullAttackInSet, idx: number) => {
              const sortedAttacks = buildSortedData(idx);
              return (
                <div className="oa-field-container" key={`set-${idx}`}>
                  <h3>
                    {`Set ${idx + 1}: ${item.total}`}
                    <Button
                      disabled={activeZone === undefined}
                      onClick={() => setActiveZone(undefined)}
                    >
                      Ukryj strzałki
                    </Button>
                  </h3>
                  <div className="oa-field-half">
                    {opponentTeamZones.map((zone) => {
                      const zoneData = caluculateVariants(zone, idx);
                      const attacksInZone = zoneData
                        .map((z) => z.total)
                        .reduce((a: number, b: number) => a + b, 0);
                      return (
                        <FieldZone
                          players={players}
                          onPlayerSelected={setSelectedPlayer}
                          onClick={(variant) =>
                            setActiveZone((activeZone) => {
                              if (
                                activeZone?.zone === zone.no &&
                                activeZone.variant === variant &&
                                activeZone.set === idx + 1
                              ) {
                                return undefined;
                              }
                              return {
                                variant,
                                zone: zone.no,
                                set: idx + 1,
                              };
                            })
                          }
                          order={sortedAttacks.indexOf(attacksInZone)}
                          set={idx + 1}
                          key={`set-${idx}-zone-${zone.no}`}
                          zone={zone}
                          activeZone={activeZone}
                          total={
                            stats?.log.filter((record) => record.set === idx)
                              .length
                          }
                          data={zoneData}
                        />
                      );
                    })}
                  </div>
                  <div className="oa-net" />
                  <div className="oa-field-half-home">
                    {homeTeamZones.map((zone) => {
                      return (
                        <EmptyFieldZone
                          key={`home-zone-${zone.no}`}
                          set={idx + 1}
                          zone={zone}
                        />
                      );
                    })}
                  </div>
                  {activeZone?.set === idx + 1 && (
                    <div>
                      {[1, 2, 3, 4, 5, 6].map((zoneNumber: number) => {
                        const attacksFromZone = stats?.attackRate[
                          activeZone.set - 1
                        ].zones[activeZone.zone - 1]
                          .filter((x) => {
                            if (selectedPlayer) {
                              if (!x.player) return false;
                              return x.player.number === selectedPlayer;
                            } else {
                              return true;
                            }
                          })
                          .filter(
                            (z) => z.from.variant === activeZone.variant + 1
                          );
                        const directions: {
                          zone: number;
                          amount: number;
                        }[] = Array.from({ length: 6 });

                        for (let dId = 0; dId < directions.length; dId++) {
                          directions[dId] = {
                            zone: dId + 1,
                            amount: attacksFromZone
                              ? attacksFromZone.filter(
                                (x) => x.to.zone === dId + 1
                              ).length
                              : 0,
                          };
                        }
                        directions.sort((a, b) => a.amount - b.amount);
                        const zoneInDirections = directions.find(
                          (x) => x.zone === zoneNumber
                        );
                        if (
                          !zoneInDirections ||
                          zoneInDirections.amount === 0
                        ) {
                          return null;
                        }

                        return (
                          <Xarrow
                            key={`arrow-${zoneNumber}`}
                            path="straight"
                            labels={<b>{zoneInDirections.amount}</b>}
                            headShape="arrow1"
                            strokeWidth={22}
                            headSize={2}
                            color={
                              zoneInDirections
                                ? colors[
                                directions.indexOf(zoneInDirections) + 1
                                ][0]
                                : "white"
                            }
                            start={`zone-op-${activeZone.set}-${activeZone.zone}-${activeZone.variant}`}
                            end={`zone-op-${activeZone.set}-${zoneNumber}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
