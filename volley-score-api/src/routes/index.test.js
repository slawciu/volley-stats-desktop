const request = require("supertest");
const { server } = require("../index");

describe("Should serve endpoints", function () {
  afterAll(() => {
    server.close();
  });

  it("GET /api", async function () {
    const response = await request(server).get("/api");
    expect(response.statusCode).toBe(200);
  });

  it("GET /players", async function () {
    const response = await request(server).get("/api/players");
    expect(response.statusCode).toBe(200);
  });

  it("POST /players", async function () {
    const response = await request(server).post("/api/players");
    expect(response.statusCode).toBe(201);
  });

  it("GET /teams", async function () {
    const response = await request(server).get("/api/teams");
    expect(response.statusCode).toBe(200);
  });

  it("GET /games", async function () {
    const response = await request(server).get("/api/games");
    expect(response.statusCode).toBe(200);
  });

  it("POST /games", async function () {
    const response = await request(server).post("/api/games");
    expect(response.statusCode).toBe(201);
  });

  it("GET /games/:gameId", async function () {
    const response = await request(server).get("/api/games/1");
    expect(response.statusCode).toBe(200);
  });

  it("GET /games/:gameId/details", async function () {
    const response = await request(server).get("/api/games/1/details");
    expect(response.statusCode).toBe(200);
  });

  it("DELETE /games/:gameId", async function () {
    const response = await request(server).delete("/api/games/1");
    expect(response.statusCode).toBe(200);
  });

  it("POST /teams", async function () {
    const response = await request(server).post("/api/teams");
    expect(response.statusCode).toBe(201);
  });

  it("GET /teams/:teamId", async function () {
    const response = await request(server).get("/api/teams/1");
    expect(response.statusCode).toBe(200);
  });

  it("GET /teams/:teamId/players", async function () {
    const response = await request(server).get("/api/teams/:teamId/players");
    expect(response.statusCode).toBe(200);
  });

  it("DELETE /teams/:teamId/players/:playerId", async function () {
    const response = await request(server).delete("/api/teams/1/players/1");
    expect(response.statusCode).toBe(200);
  });

  it("DELETE /teams/:teamId", async function () {
    const response = await request(server).delete("/api/teams/:teamId");
    expect(response.statusCode).toBe(200);
  });
});
