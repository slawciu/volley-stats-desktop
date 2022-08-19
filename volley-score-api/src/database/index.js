const uuid = require("uuid").v4;
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "volley-stats",
  "volley-stats-app",
  "IWil1ChangeItL4ter",
  {
    dialect: "sqlite",
    storage: "vs-db.sqlite",
    dialectOptions: {},
  }
);

const Session = sequelize.define("Session", {
  payload: {
    type: Sequelize.JSONB,
  },
});

const Statistic = sequelize.define("Statistic", {
  gameId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  payload: {
    type: Sequelize.JSONB,
  },
});

Statistic.prototype.createStats = function (gameId) {
  this.gameId = gameId;
  this.payload = {
    log: [],
    total: 0,
    attackRate: [
      {
        set: 1,
        zones: [0, 0, 0, 0, 0],
        total: 0,
      },
      {
        set: 2,
        zones: [0, 0, 0, 0, 0],
        total: 0,
      },
      {
        set: 3,
        zones: [0, 0, 0, 0, 0],
        total: 0,
      },
      {
        set: 4,
        zones: [0, 0, 0, 0, 0],
        total: 0,
      },
      {
        set: 5,
        zones: [0, 0, 0, 0, 0],
        total: 0,
      },
    ],
  };
  this.changed("payload", true);
};

Statistic.prototype.recordAttack = function (record) {
  this.payload.log.push(record);
  this.payload.total = this.payload.log.length;
  const attacksInSet = this.payload.log.filter((r) => r.set === record.set);
  this.payload.attackRate[record.set].total = attacksInSet.length;
  this.payload.attackRate[record.set].zones[record.zone - 1] =
    attacksInSet.filter((r) => r.zone === record.zone).length;

  this.changed("payload", true);
};

const FullStatistic = sequelize.define("FullStatistic", {
  gameId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  payload: {
    type: Sequelize.JSONB,
  },
});

FullStatistic.prototype.createStats = function (gameId) {
  this.gameId = gameId;
  this.payload = {
    log: [],
    total: 0,
    attackRate: [
      {
        set: 1,
        zones: [[], [], [], [], [], []],
        total: 0,
      },
      {
        set: 2,
        zones: [[], [], [], [], [], []],
        total: 0,
      },
      {
        set: 3,
        zones: [[], [], [], [], [], []],
        total: 0,
      },
      {
        set: 4,
        zones: [[], [], [], [], [], []],
        total: 0,
      },
      {
        set: 5,
        zones: [[], [], [], [], [], []],
        total: 0,
      },
    ],
  };
  this.changed("payload", true);
};

FullStatistic.prototype.recordAttack = function (record) {
  this.payload.log.push(record);
  this.payload.total = this.payload.log.length;
  const attacksInSet = this.payload.log.filter((r) => r.set === record.set);
  this.payload.attackRate[record.set].total = attacksInSet.length;
  this.payload.attackRate[record.set].zones[record.from.zone - 1].push(record);

  this.changed("payload", true);
};

const Game = sequelize.define("Game", {
  payload: {
    type: Sequelize.JSONB,
  },
});

Game.prototype.createGame = function (
  homeTeam,
  visitorTeam,
  opponentId,
  players
) {
  const id = uuid();
  this.payload = {
    id,
    stats: {
      spreadsheetId: "",
      url: "",
      fileName: "",
    },
    homeTeam: homeTeam,
    serveTeam: "HOME",
    visitorTeam: visitorTeam,
    opponentId,
    players,
    log: [[], [], [], [], []],
    rallyLog: [],
    statsLog: [],
    opponentsAttackLog: [],
    opponentsExtendedAttackLog: [],
    score: {
      set: 0,
      general: {
        home: 0,
        visitor: 0,
      },
      sets: [
        { home: 0, visitor: 0 },
        { home: 0, visitor: 0 },
        { home: 0, visitor: 0 },
        { home: 0, visitor: 0 },
        { home: 0, visitor: 0 },
      ],
    },
    finished: false,
  };
  this.changed("payload", true);
};

Game.prototype.getSpreadsheetId = function () {
  return this.payload.stats.spreadsheetId;
};

Game.prototype.getSpreadsheetUrl = function () {
  return this.payload.stats.url;
};

Game.prototype.setPlayers = function (players) {
  this.payload.players = players;
  this.changed("payload", true);
};

Game.prototype.setStatsSpreadsheet = function (spreadsheet) {
  this.payload.stats = { ...this.payload.stats, ...spreadsheet };
  this.changed("payload", true);
};

Game.prototype.getHomeName = function () {
  return this.payload.homeTeam;
};

Game.prototype.getVisitorName = function () {
  return this.payload.visitorTeam;
};

Game.prototype.getId = function () {
  return this.payload.id;
};

Game.prototype.getName = function () {
  return this.payload.stats.fileName;
};

Game.prototype.export = function () {
  return this.payload;
};

Game.prototype.recordRally = function (rally) {
  this.payload.rallyLog.push({ ...rally });
  this.changed("payload", true);
};

Game.prototype.recordOpponentsAttack = function (attackRecord) {
  this.payload.opponentsAttackLog.push({ ...attackRecord });
  this.changed("payload", true);
};

Game.prototype.recordExtendedOpponentsAttack = function (attackRecord) {
  if (!this.payload.opponentsExtendedAttackLog) {
    this.payload.opponentsExtendedAttackLog = [];
  }
  this.payload.opponentsExtendedAttackLog.push({ ...attackRecord });
  this.changed("payload", true);
};

Game.prototype.recordStatsLog = function (newEntry) {
  this.payload.statsLog.push({ ...newEntry });
  this.changed("payload", true);
};

Game.prototype.getStatsLog = function () {
  return this.payload.statsLog;
};

Game.prototype.getScore = function () {
  return this.payload.score;
};

Game.prototype.decreaseHomeScore = function () {
  if (this.payload.finished) return;

  if (this.payload.score.sets[this.payload.score.set].home === 0) return;

  this.payload.score.sets[this.payload.score.set].home -= 1;

  const scoreInSet = this.payload.score.sets[this.payload.score.set];

  this.payload.log[this.payload.score.set].push({ ...scoreInSet });

  if (this.payload.score.set < 4) {
    if (scoreInSet.home >= 25 && scoreInSet.home - scoreInSet.visitor >= 2) {
      this.payload.score.set += 1;
      this.payload.score.general.home += 1;
    }
  } else {
    if (scoreInSet.home >= 15 && scoreInSet.home - scoreInSet.visitor >= 2) {
      this.payload.score.general.home += 1;
    }
  }

  this.payload.finished =
    this.payload.score.general.home === 3 ||
    this.payload.score.general.visitor === 3;
  this.changed("payload", true);
};

Game.prototype.homeScores = function () {
  if (this.payload.finished) return;
  let scoreInSet = this.payload.score.sets[this.payload.score.set];

  if (
    (scoreInSet.visitor >= 25 && scoreInSet.visitor - scoreInSet.home >= 2) ||
    (scoreInSet.home >= 25 && scoreInSet.home - scoreInSet.visitor >= 2)
  ) {
    this.payload.score.set += 1;
    scoreInSet = this.payload.score.sets[this.payload.score.set];
  }

  this.payload.score.sets[this.payload.score.set].home += 1;

  this.payload.log[this.payload.score.set].push({ ...scoreInSet });

  if (this.payload.score.set < 4) {
    if (scoreInSet.home >= 25 && scoreInSet.home - scoreInSet.visitor >= 2) {
      this.payload.score.general.home += 1;
    }
  } else {
    if (scoreInSet.home >= 15 && scoreInSet.home - scoreInSet.visitor >= 2) {
      this.payload.score.general.home += 1;
    }
  }

  this.payload.finished =
    this.payload.score.general.home === 3 ||
    this.payload.score.general.visitor === 3;
  this.changed("payload", true);
};

Game.prototype.decreaseVisitorScore = function () {
  if (this.payload.finished) return;
  if (this.payload.score.sets[this.payload.score.set].visitor === 0) return;

  this.payload.score.sets[this.payload.score.set].visitor -= 1;

  const scoreInSet = this.payload.score.sets[this.payload.score.set];
  this.payload.log[this.payload.score.set].push({ ...scoreInSet });

  if (this.payload.score.set < 4) {
    if (scoreInSet.visitor >= 25 && scoreInSet.visitor - scoreInSet.home >= 2) {
      this.payload.score.set += 1;
      this.payload.score.general.visitor += 1;
    }
  } else {
    if (scoreInSet.visitor >= 15 && scoreInSet.visitor - scoreInSet.home >= 2) {
      this.payload.score.general.visitor += 1;
    }
  }

  this.payload.finished =
    this.payload.score.general.home === 3 ||
    this.payload.score.general.visitor === 3;
  this.changed("payload", true);
};

Game.prototype.visitorScores = function () {
  if (this.payload.finished) return;

  let scoreInSet = this.payload.score.sets[this.payload.score.set];

  if (
    (scoreInSet.visitor >= 25 && scoreInSet.visitor - scoreInSet.home >= 2) ||
    (scoreInSet.home >= 25 && scoreInSet.home - scoreInSet.visitor >= 2)
  ) {
    this.payload.score.set += 1;
    scoreInSet = this.payload.score.sets[this.payload.score.set];
  }

  this.payload.score.sets[this.payload.score.set].visitor += 1;

  this.payload.log[this.payload.score.set].push({ ...scoreInSet });

  if (this.payload.score.set < 4) {
    if (scoreInSet.visitor >= 25 && scoreInSet.visitor - scoreInSet.home >= 2) {
      this.payload.score.general.visitor += 1;
    }
  } else {
    if (scoreInSet.visitor >= 15 && scoreInSet.visitor - scoreInSet.home >= 2) {
      this.payload.score.general.visitor += 1;
    }
  }

  this.payload.finished =
    this.payload.score.general.home === 3 ||
    this.payload.score.general.visitor === 3;
  this.changed("payload", true);
};

Game.prototype.getLog = function () {
  return this.prototype.log;
};

const Team = sequelize.define("Team", {
  payload: {
    type: Sequelize.JSONB,
  },
});

Team.prototype.createTeam = function (name, shortName) {
  const id = uuid();
  this.payload = {
    id,
    name,
    shortName,
  };
  this.changed("payload", true);
};

const Player = sequelize.define("Player", {
  payload: {
    type: Sequelize.JSONB,
  },
});

Player.prototype.createPlayer = function (name, number, teamId, position) {
  const id = uuid();
  this.payload = {
    id,
    name,
    number,
    position,
    teamId,
  };
  this.changed("payload", true);
};

const db = {};
db.sequelize = sequelize;
db.Game = Game;
db.Session = Session;
db.Statistic = Statistic;
db.FullStatistic = FullStatistic;
db.Player = Player;
db.Team = Team;

const connect = async () => {
  try {
    await db.sequelize.sync();
    console.log("Connected to database");
  } catch (e) {
    console.log(`Error while connecting to the database...`, e);
  }
};

connect();

module.exports = db;
