/**
 ** App Packages
 */
 import express from "express";
 import cors from "cors";
 import dotenv from "dotenv"; // for use of environment variables
 import http from "http";


const config = dotenv.config(); // Prints Local Variables

/**
 * * Observability
 */
import logger from "./middlewares/logger.js" // logging

/**
 ** App Setup
 */
const app = express();
app.use(cors());
app.use(express.json());
logger.debug("Env Vars: " + JSON.stringify(config));

/**
 * *Postgres Setup
 */
import pgController  from "./utils/database/postgresController.js" // test
pgController.admin.connect(); // connect to sql DB
pgController.admin.refreshModels();

logger.debug("Connected to Postgres");

/**
 * *Import Utilities
 */
//import utilityWrapper from "./utils/utilityWrapper.js" // For s3 / sftp connections
logger.debug("Imported Utilities");

/**
 * *Import Middlewares
 */
import validationController from "./middlewares/requestValidation.js" // For request validation
logger.debug("Imported Middlewares");

/**
 * * HTTPS Setup
 */
const httpServer = http.createServer(app); // server var

logger.info("Starting server....");

/**
 *
 * Routes:
 * - /health
 */

/**
 * * /health for healthchecks in the future
 */
app.get("/health", validationController.healthCheck, async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send("Server Ready");
});







/**
 * *GET /song/:songId
 */
app.get("/song/:songId", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  logger.debug(`Retrieving song with songId: ${req.params.songId}`);

  const songId = req.params.songId;
  const requestedSong = await pgController.get.song(songId);

  try {
    res.status(200).send(await requestedSong);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * *GET /songs
 */
app.get("/songs", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  logger.debug(`Retrieving songs`);

  const requestedSongs = await pgController.get.songs();

  try {
    res.status(200).send(await requestedSongs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * *POST /song
 */
app.post("/song", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  logger.debug(`Creating song: ${req.body.title}`);

  const songData = req.body;
  const newSong = await pgController.post.song(songData);

  try {
    res.status(200).send(await newSong);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * *POST /songs
 */
app.post("/songs", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  logger.debug(`Creating songs`);

  const songData = req.body;
  const newSongs = await pgController.post.songs(songData);

  try {
    res.status(200).send(await newSongs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// START SERVER
const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
