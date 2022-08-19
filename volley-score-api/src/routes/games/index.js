const { Game, sequelize } = require("../../database");

const getAllGames = async (req, res) => {
  if (req.query.limit) {
    return getLatestGames(req, res);
  }
  const games = await Game.findAll({
    order: [["createdAt", "DESC"]],
    attributes: [
      [sequelize.json("payload.id"), "gameId"],
      [sequelize.json("payload.stats.url"), "spreadsheetUrl"],
      [sequelize.json("payload.stats.fileName"), "gameName"],
      [sequelize.json("payload.visitorTeam"), "visitor"],
      [sequelize.json("payload.homeTeam"), "home"],
      "createdAt",
    ],
  });
  return res.json(games);
};

const getLatestGames = async (req, res) => {
  if (isNaN(req.query.limit)) {
    return res.sendStatus(403);
  }

  const games = await Game.findAll({
    limit: req.query.limit,
    order: [["createdAt", "DESC"]],
    attributes: [
      [sequelize.json("payload.id"), "gameId"],
      [sequelize.json("payload.stats.url"), "spreadsheetUrl"],
      [sequelize.json("payload.stats.fileName"), "gameName"],
      [sequelize.json("payload.visitorTeam"), "visitor"],
      [sequelize.json("payload.homeTeam"), "home"],
      "createdAt",
    ],
  });
  return res.json(games);
};

const getGameById = async (req, res) => {
  const gameModel = await Game.findOne({
    where: { "payload.id": req.params.gameId },
  });

  if (!gameModel) {
    return res.sendStatus(404);
  }

  return res.json(gameModel.payload);
};

const getGameDetails = async (req, res) => {
  const gameModel = await Game.findOne({
    where: { "payload.id": req.params.gameId },
  });

  if (!gameModel) {
    return res.sendStatus(404);
  }

  return res.json({
    gameId: gameModel.getId(),
    gameName: gameModel.getName(),
    spreadsheetUrl: gameModel.getSpreadsheetUrl(),
    visitor: gameModel.getVisitorName(),
    home: gameModel.getHomeName(),
  });
};

const deleteGame = (io) => async (req, res) => {
  const { gameId } = req.params;

  await Game.destroy({
    where: { "payload.id": gameId },
  });
  io.emit("game-deleted", gameId);

  return res.sendStatus(200);
};

module.exports = {
  getAllGames,
  getGameById,
  getGameDetails,
  deleteGame,
  getLatestGames,
};
