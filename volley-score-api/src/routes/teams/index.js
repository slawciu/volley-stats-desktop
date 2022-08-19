const { Player, Team, sequelize } = require("../../database");

const getTeamsWithPlayers = async (req, res) => {
  const teams = await Team.findAll({
    attributes: [
      [sequelize.json("payload.id"), "id"],
      [sequelize.json("payload.name"), "name"],
      [sequelize.json("payload.shortName"), "shortName"],
    ],
  });

  const players = await Player.findAll({
    attributes: [
      [sequelize.json("payload.name"), "name"],
      [sequelize.json("payload.number"), "number"],
      [sequelize.json("payload.position"), "position"],
      [sequelize.json("payload.teamId"), "teamId"],
    ],
  });
  return res.json(
    teams.map((t) => ({
      ...t.dataValues,
      players: [
        ...players
          .filter((p) => p.dataValues.teamId === t.dataValues.id)
          .map((p) => ({
            ...p.dataValues,
            number: Number(p.dataValues.number),
          }))
          .sort((a, b) => a.number - b.number),
      ],
    }))
  );
};

const getTeamByName = async (req, res) => {
  const team = await Team.findOne({
    where: { "payload.shortName": req.query.shortName },
    attributes: [
      [sequelize.json("payload.id"), "id"],
      [sequelize.json("payload.name"), "name"],
      [sequelize.json("payload.shortName"), "shortName"],
    ],
  });

  if (!team) {
    return res.json({ players: [] });
  }

  const players = await Player.findAll({
    where: { "payload.teamId": team.dataValues.id },

    attributes: [
      [sequelize.json("payload.name"), "name"],
      [sequelize.json("payload.number"), "number"],
      [sequelize.json("payload.position"), "position"],
    ],
  });
  console.log(`get players for ${req.query.shortName}`, players);
  return res.json({
    ...team.dataValues,
    players: [...players.map((p) => p.dataValues)]
      .map((p) => ({
        ...p,
        number: Number(p.number),
      }))
      .sort((a, b) => a.number - b.number),
  });
};

const getTeam = async (req, res) => {
  if (req.query.shortName) return getTeamByName(req, res);
  else return getTeamsWithPlayers(req, res);
};

const getTeamById = async (req, res) => {
  const team = await Team.findOne({
    where: { "payload.id": req.params.teamId },
    attributes: [
      [sequelize.json("payload.id"), "id"],
      [sequelize.json("payload.name"), "name"],
      [sequelize.json("payload.shortName"), "shortName"],
    ],
  });

  if (!team) {
    return res.json();
  }

  const players = await Player.findAll({
    where: { "payload.teamId": req.params.teamId },

    attributes: [
      [sequelize.json("payload.name"), "name"],
      [sequelize.json("payload.number"), "number"],
      [sequelize.json("payload.position"), "position"],
    ],
  });
  return res.json({
    ...team.dataValues,
    players: [
      ...players
        .map((p) => p.dataValues)
        .map((p) => ({
          ...p,
          number: Number(p.number),
        })),
    ],
  });
};

const createTeam = (io) => async (req, res) => {
  const { name, shortName } = req.body;
  const teamModel = await Team.create();
  teamModel.createTeam(name, shortName);
  await teamModel.save();
  io.emit("team-created");

  return res.sendStatus(201);
};

const deleteTeam = (io) => async (req, res) => {
  const { teamId } = req.params;
  const result = await Team.destroy({
    where: { "payload.id": teamId },
  });
  io.emit("team-deleted");

  return res.sendStatus(200);
};

module.exports = {
  getTeamById,
  createTeam,
  getTeam,
  deleteTeam,
};
