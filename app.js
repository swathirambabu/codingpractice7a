const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
    playerMatchId: dbObject.player_match_id,
    score: dbObject.score,
    fours: dbObject.fours,
    sixes: dbObject.sixes,
  };
};
//api1
app.get("/players/", async (request, response) => {
  const getAllPlayers = `select * from player_details;`;
  const playerArray = await db.all(getAllPlayers);
  response.send(
    playerArray.map((eachObject) => convertDBObjectToResponseObject(eachObject))
  );
});

//api2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayers = `select * from player_details where player_id=${playerId};`;
  const player = await db.get(getPlayers);
  response.send(convertDBObjectToResponseObject(player));
});
//api3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updateDetails = `update player_details set player_name='${playerName}' where player_id=${playerId};`;
  await db.run(updateDetails);
  response.send("Player Details Updated");
});
//api 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getAllMatch = `select * from match_details where match_id=${matchId};`;
  const matchArray = await db.get(getAllMatch);
  response.send(convertDBObjectToResponseObject(matchArray));
});