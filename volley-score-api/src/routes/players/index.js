const { Player, sequelize } = require("../../database");

const getAllPlayers = async (req, res) => {
  const players = await Player.findAll({
    attributes: [
      [sequelize.json("payload.name"), "name"],
      [sequelize.json("payload.number"), "number"],
      [sequelize.json("payload.position"), "position"],
    ],
  });
  return res.json(
    players.map((p) => ({
      ...p,
      number: Number(p.number),
    }))
  );
};

const getPlayersInTeam = async (req, res) => {
  const players = await Player.findAll({
    where: { "payload.teamId": req.params.teamId },
    attributes: [
      [sequelize.json("payload.id"), "id"],
      [sequelize.json("payload.name"), "name"],
      [sequelize.json("payload.number"), "number"],
      [sequelize.json("payload.position"), "position"],
    ],
  });
  return res.json(
    players.map((p) => ({
      ...p.dataValues,
      number: Number(p.dataValues.number),
    }))
  );
};

const createPlayer = (io) => async (req, res) => {
  const { name, number, teamId, position } = req.body;
  const playerModel = await Player.create();
  playerModel.createPlayer(name, number, teamId, position);
  await playerModel.save();
  io.emit("player-created", teamId);
  return res.sendStatus(201);
};

const deletePlayer = (io) => async (req, res) => {
  const { playerId, teamId } = req.params;
  console.log(`Delete player ${playerId} from team ${teamId}`);
  await Player.destroy({
    where: { "payload.id": playerId },
  });
  io.emit("player-deleted", teamId);
  return res.sendStatus(201);
};

module.exports = {
  getAllPlayers,
  createPlayer,
  getPlayersInTeam,
  deletePlayer,
};
