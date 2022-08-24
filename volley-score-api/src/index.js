const express = require("express");
const cors = require("cors");

const bodyParser = require("body-parser");
const app = express();

const http = require("http");
const httpServer = http.createServer(app);
const { Server } = require("socket.io");

const GameModel = require("./database").Game;
const Statistic = require("./database").Statistic;
const FullStatistic = require("./database").FullStatistic;

const { sequelize, Session } = require("./database");
const {
  getAllPlayers,
  createPlayer,
  getPlayersInTeam,
  deletePlayer,
} = require("./routes/players");
const {
  getTeam,
  getTeamById,
  createTeam,
  deleteTeam,
} = require("./routes/teams");

const {
  getAllGames,
  getGameById,
  getGameDetails,
  deleteGame,
} = require("./routes/games");

const {
  createSpreadsheetForGame,
  storeOpponentAttackRecordInSpreadsheet,
  storeLogInSpreadsheet,
} = require("./cloud-api");

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const port = 3004;

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.get("/api", (req, res) => {
  return res.sendStatus(200);
});

app.get("/api/players", getAllPlayers);
app.post("/api/players", createPlayer(io));

app.get("/api/teams/", getTeam);
app.get("/api/teams/:teamId", getTeamById);
app.get("/api/teams/:teamId/players", getPlayersInTeam);
app.delete("/api/teams/:teamId/players/:playerId", deletePlayer(io));
app.post("/api/teams", createTeam(io));
app.delete("/api/teams/:teamId", deleteTeam(io));

app.get("/api/games", getAllGames);
app.delete("/api/games/:gameId", deleteGame(io));

app.post(`/api/games`, async (req, res) => {
  const { home, visitors, mainSquad, opponentId } = req.body;
  try {
    const game = await GameModel.create();
    game.createGame(home, visitors, opponentId, mainSquad);
    const fileName = `${game.getHomeName()}-${game.getVisitorName()}-${new Date().toISOString()}`;
    let spreadsheet = {};

    try {
      spreadsheet = await createSpreadsheetForGame(fileName);
    } catch (e) {
      console.log(`Spreadsheet for game ${fileName} not created`, e);
    }

    game.setStatsSpreadsheet({ fileName, ...spreadsheet });
    await game.save();
    io.emit("new-game-available");
    // TODO: make it return 201 instead of this object. Socket.io?
    return res.json({
      gameId: game.getId(),
      gameName: game.getName(),
      spreadsheetUrl: game.getSpreadsheetUrl(),
      visitor: game.getVisitorName(),
      home: game.getHomeName(),
    });
  } catch (e) {
    console.log(`Error while creating a new game`, e);
    return res.sendStatus(500);
  }
});

app.get("/api/games/:gameId", getGameById);

app.get("/api/games/:gameId/details", getGameDetails);

const getCurrentPlayers = async (gameId) => {
  console.log(`Get current players for game ${gameId}`);
  const game = await GameModel.findOne({
    where: { "payload.id": gameId },
    attributes: [[sequelize.json("payload.players"), "players"]],
  });
  console.log(`Get current players for game`, game);

  if (!game) {
    return null;
  }

  return JSON.parse(game.dataValues.players);
};

const getScoreForGame = async (gameId) => {
  const score = await GameModel.findOne({
    where: { "payload.id": gameId },
    attributes: [[sequelize.json("payload.score"), "score"]],
  });

  if (!score) {
    return null;
  }

  return JSON.parse(score.dataValues.score);
};

app.get("/api/games/:gameId/players", async (req, res) => {
  const players = await getCurrentPlayers(req.params.gameId);

  if (!players) {
    return res.sendStatus(404);
  }

  return res.json(players);
});

app.put("/api/games/:gameId/players", async (req, res) => {
  const { players } = req.body;
  console.log(players);
  const gameModel = await GameModel.findOne({
    where: { "payload.id": req.params.gameId },
  }).catch((e) => console.log(e));
  gameModel.setPlayers(players);
  await gameModel.save();
  io.to(req.params.gameId).emit("players-in-game-updated", players);

  return res.sendStatus(200);
});

app.get("/api/games/:gameId/score", async (req, res) => {
  const score = await getScoreForGame(req.params.gameId);

  if (!score) {
    return res.sendStatus(404);
  }

  return res.json(score);
});

app.get("/api/games/:gameId/stats", async (req, res) => {
  const gameModel = await Statistic.findOne({
    where: { gameId: req.params.gameId },
  }).catch((e) => console.log(e));

  if (!gameModel) {
    return res.sendStatus(404);
  }

  return res.json(gameModel.payload);
});

app.get("/api/games/:gameId/full-stats", async (req, res) => {
  const statsModel = await FullStatistic.findOne({
    where: { gameId: req.params.gameId },
  }).catch((e) => console.log(e));

  if (!statsModel) {
    return res.sendStatus(404);
  }

  return res.json(statsModel.payload);
});

io.of("/").adapter.on("join-room", async (room, id) => {
  if (room !== id) {
    console.log(`socket ${id} has joined room ${room}`);
  }
});

io.of("/").adapter.on("leave-room", async (room, id) => {
  if (room !== id) {
    console.log(`socket ${id} has left room ${room}`);
  }
});

io.on("connection", async (socket) => {
  console.log(`Socket ${socket.id} connected.`);

  socket.on("disconnect", async (reason) => {
    console.log(`Socket ${socket.id} disconnected due to ${reason}`);
    let sessions = await Session.findAll({
      where: { "payload.socket": socket.id },
    });
    await Promise.all(sessions.map(async (s) => await s.destroy()));
  });

  socket.on("attach-to-game", async (gameId) => {
    console.log(`Socket ${socket.id} is going to join ${gameId}`);
    let session = await Session.findOne({
      where: { "payload.socket": socket.id },
    });
    if (session && session.payload) {
      console.log(
        `Socket ${socket.id} is already tracking ${session.payload.gameId}. Leaving...`
      );
      socket.leave(session.payload.gameId);
    } else {
      session = await Session.create({
        payload: {
          socket: socket.id,
          gameId: "",
        },
      });
    }

    socket.join(gameId);
    session.payload = {
      gameId,
      socket: socket.id,
    };
    await session.changed("payload", true);
    await session.save();
  });

  socket.on("score-home", async (gameId) => {
    const gameModel = await GameModel.findOne({
      where: { "payload.id": gameId },
    });
    gameModel.homeScores();
    await gameModel.save();
    io.to(gameId).emit("score-update", await getScoreForGame(gameId));
  });

  socket.on("decrease-score-home", async (gameId) => {
    let game = await GameModel.findOne({
      where: { "payload.id": gameId },
    });

    game.decreaseHomeScore();
    await game.save();

    io.to(gameId).emit("score-update", await getScoreForGame(gameId));
  });

  socket.on("score-visitor", async (gameId) => {
    let game = await GameModel.findOne({
      where: { "payload.id": gameId },
    });

    game.visitorScores();
    await game.save();

    io.to(gameId).emit("score-update", await getScoreForGame(gameId));
  });

  socket.on("decrease-score-visitor", async (gameId) => {
    let game = await GameModel.findOne({
      where: { "payload.id": gameId },
    });

    game.decreaseVisitorScore();
    await game.save();

    io.to(gameId).emit("score-update", await getScoreForGame(gameId));
  });

  socket.on("action-log", async (actionRecord) => {
    let game = await GameModel.findOne({
      where: { "payload.id": actionRecord.gameId },
    });

    console.log(
      new Date().toISOString(),
      await getScoreForGame(actionRecord.gameId)
    );

    if (!game) {
      console.log(
        `Action log for non-existing game ${actionRecord.gameId}`,
        actionRecord
      );
      return;
    }

    if (actionRecord.action.result === 1) {
      game.homeScores();
    } else if (actionRecord.action.result === -1) {
      game.visitorScores();
    }

    await game.save();
    game = await GameModel.findOne({
      where: { "payload.id": actionRecord.gameId },
    });

    const statsRecord = {
      ...actionRecord,
      score: JSON.parse(JSON.stringify(game.getScore())),
    };
    const score = await getScoreForGame(actionRecord.gameId);
    console.log(new Date().toISOString(), score);

    game.recordStatsLog(statsRecord);
    await game.save();
    io.to(actionRecord.gameId).emit("score-update", score);
    await storeLogInSpreadsheet(game.getSpreadsheetId(), statsRecord).catch(
      (e) => {
        console.log(`Error while storing log in spreadsheet`);
      }
    );
  });

  socket.on("rally", async (rally) => {
    let game = await GameModel.findOne({
      where: { "payload.id": rally.gameId },
    });

    console.log(game.payload.rallyLog);

    game.recordRally(rally);

    await game.save();
  });

  socket.on("opponents-attack", async (event) => {
    const { zone, variant, gameId } = event;
    let game = await GameModel.findOne({
      where: { "payload.id": gameId },
    });

    if (!game) {
      return;
    }

    const record = {
      zone,
      variant: variant || 0,
      set: game.getScore().set,
      gameId,
    };
    game.recordOpponentsAttack(record);
    await game.save();

    let stats = await Statistic.findOne({
      where: {
        gameId,
      },
    }).catch((e) => console.log(e));

    if (!stats) {
      stats = await Statistic.create({ gameId });
      stats.createStats(gameId);
    }

    stats.recordAttack(record);

    await stats.save();

    io.to(gameId).emit("opponents-attack-recorded", record);
    try {
      await storeOpponentAttackRecordInSpreadsheet(
        game.getSpreadsheetId(),
        record
      );
    } catch (e) {
      console.log(`Error while saving opponents attack to spreadsheet.`);
    }
  });

  socket.on("opponents-attack-full", async (event) => {
    const { from, to, player, gameId } = event;
    let game = await GameModel.findOne({
      where: { "payload.id": gameId },
    });

    if (!game) {
      return;
    }

    const record = {
      from,
      to,
      set: game.getScore().set,
      player,
      gameId,
    };
    game.recordExtendedOpponentsAttack(record);
    await game.save();

    let stats = await FullStatistic.findOne({
      where: {
        gameId,
      },
    }).catch((e) => console.log(e));

    if (!stats) {
      stats = await FullStatistic.create({ gameId });
      stats.createStats(gameId);
    }

    stats.recordAttack(record);

    await stats.save();

    io.to(gameId).emit("opponents-full-attack-recorded", record);
    try {
      await storeOpponentAttackRecordInSpreadsheet(
        game.getSpreadsheetId(),
        record
      );
    } catch (e) {
      console.log(`Error while saving opponents attack to spreadsheet.`);
    }
  });
});

const server = httpServer.listen(port, () => {
  console.log(`Volley Score Local Server is running! (${port})`);
});
module.exports = {
  server,
};
