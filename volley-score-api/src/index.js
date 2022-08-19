const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 3004;

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api", (req, res) => {
  return res.sendStatus(200);
});

app.get("/api/players", (res, req) => {
  return req.sendStatus(200);
});
app.post("/api/players", (res, req) => {
  return req.sendStatus(201);
});

app.get("/api/teams/", (res, req) => {
  return req.sendStatus(200);
});
app.get("/api/teams/:teamId", (res, req) => {
  return req.sendStatus(200);
});
app.get("/api/teams/:teamId/players", (res, req) => {
  return req.sendStatus(200);
});
app.delete("/api/teams/:teamId/players/:playerId", (res, req) => {
  return req.sendStatus(200);
});
app.post("/api/teams", (res, req) => {
  return req.sendStatus(201);
});
app.delete("/api/teams/:teamId", (res, req) => {
  return req.sendStatus(200);
});

app.get("/api/games", (res, req) => {
  return req.sendStatus(200);
});
app.delete("/api/games/:gameId", (res, req) => {
  return req.sendStatus(200);
});

app.post(`/api/games`, async (req, res) => {
  return res.sendStatus(201);
});

app.get("/api/games/:gameId", (res, req) => {
  return req.sendStatus(200);
});

app.get("/api/games/:gameId/details", (res, req) => {
  return req.sendStatus(200);
});

const server = app.listen(port, () => {
  console.log(`Volley Score Local Server is running! (${port})`);
});

module.exports = {
  server,
};
