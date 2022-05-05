const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");

const { open } = require("sqlite");

const path = require("path");
const dbpath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started running at localhost:3000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertMovieObjectToResponseObject = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};

const convertDirectorObjectToResponseObject = (object) => {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  };
};

//API-1

app.get("/movies/", async (request, response) => {
  const getMoviesArray = `
    SELECT movie_name
    FROM movie
    ;`;
  const movieObject = await db.all(getMoviesArray);
  response.send(movieObject.map((item) => ({ movieName: item.movie_name })));
});

//API-2

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesArray = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId}
    ;`;
  const movieObject = await db.get(getMoviesArray);
  response.send(convertMovieObjectToResponseObject(movieObject));
});

//API-3

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieArray = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}', '${leadActor}')
    `;
  await db.run(postMovieArray);
  response.send("Movie Successfully Added");
});

//API-4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const putMovieArray = `
    UPDATE movie
    SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId}
    `;
  await db.run(putMovieArray);
  response.send("Movie Details Updated");
});

//API-5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId}
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API-6

app.get("/directors/", async (request, response) => {
  const getDirectorsArray = `
    SELECT *
    FROM director
    ORDER BY director_id
    `;
  const directorsObject = await db.all(getDirectorsArray);
  response.send(
    directorsObject.map((item) => convertDirectorObjectToResponseObject(item))
  );
});

//API-7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovies = `
    SELECT movie_name
    FROM movie
    WHERE director_id = '${directorId}';
    `;
  const directorMovieObject = await db.all(getDirectorMovies);
  response.send(
    directorMovieObject.map((item) => ({ movieName: item.movie_name }))
  );
});

module.exports = app;
