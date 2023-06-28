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

const convertPlayerDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};
const convertMatchDetailsDBObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};
//api1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from player_details;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertPlayerDBObjectToResponseObject(eachPlayer)
    )
  );
});

//api2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayers = `select * from player_details where player_id=${playerId};`;
  const player = await db.get(getPlayers);
  response.send(convertPlayerDBObjectToResponseObject(player));
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
  response.send(convertMatcDetailsDBObjectToResponseObject(matchArray));
});

//api5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `select * from player_match_score NATURAL JOIN match_details where player_id=${playerId};`;
  const playerMatches = await db.all(getPlayerMatchesQuery);
  response.send(
    playerMatches.map((eachMatch) =>
      convertMatchDetailsDBObjectToResponseObject(eachMatch)
    )
  );
});

//api 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `select player_details.player_id AS playerId,
	      player_details.player_name AS playerName from player_match_score NATURAL JOIN player_details where match_id=${matchId};`;
  const playersArray = await db.all(getMatchPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertMatchDetailsDBObjectToResponseObject(eachPlayer)
    )
  );
});
//api 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getAllQuery = `select player_id as playerId,
                                player_name as playerName,
                                SUM(score) as totalScore,
                                SUM(fours) as totalFours,
                                SUM(sixes) as totalSixes 
                                from player_match_score NATURAL JOIN player_details where player_id=${playerId};`;
  const playerArray = await db.get(getAllQuery);
  response.send(
    playerArray.map((eachPlayer) =>
      convertPlayerDBObjectToResponseObject(eachPlayer)
    )
  );
});
module.exports = app;
