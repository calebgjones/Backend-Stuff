/**
 ** App Packages
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv"; // for use of environment variables
import http from "http";
import multer from "multer";
import fs from "fs";

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


// Load and Log env vars
dotenv.config();

logger.debug("Env Vars: " + JSON.stringify({
  PORT: process.env.PORT,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  PGUSER: process.env.PGUSER,
  PGHOST: process.env.PGHOST,
  PGPASSWORD: process.env.PGPASSWORD,
  PGDATABASE: process.env.PGDATABASE,
  PGPORT: process.env.PGPORT,
  LOG_LEVEL: process.env.LOG_LEVEL,
  APP_NAME: process.env.APP_NAME
}));
const upload = multer({ dest: "../../uploads", limits: { fileSize: 50000000, files: 1 } });

/**
 * *Postgres Setup
 */
import pgController from "./utils/database/postgresController.js" // test
pgController.admin.connect(); // connect to sql DB

// Uncomment to reset the database
//pgController.delete.all();
//pgController.admin.refreshModels();

logger.debug("Connected to Postgres");

/**
 * *Import Utilities
 */
//import utilityWrapper from "./utils/utilityWrapper.js" // For s3 / sftp connections
logger.debug("Imported Utilities");
import { s3Controller } from "./utils/s3/awsS3.js";

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
 * *GET /song/:songId
 */
app.get("/song/:id", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  logger.debug(`Retrieving song with songId: ${req.params.id}`);

  const requestedSong = await pgController.get.song(req.params.id);
  const presignedUrl = await s3Controller.getPresignedURL(requestedSong[0].dataValues.s3key);

  let songData = requestedSong[0].dataValues;
  songData.presignedUrl = presignedUrl;

  try {
    res.status(200).send(await songData);
  } catch (error) {
    logger.error(error);
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
    logger.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * *POST /song
 */
app.post('/song', upload.single('file'), async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  const localFilePath = req.file.path;
  try {
    console.log(req.file.mimetype)
    const fileData = fs.createReadStream(localFilePath);

    let songMetaData = req.body;

    const uploadSong = async () => {
      const s3key = await s3Controller.uploadSong(fileData);
      songMetaData.s3key = await s3key;

      logger.error(songMetaData)

      const updateDb = pgController.post.song(songMetaData); 
      return await updateDb;
    };

    res.status(200).send(await uploadSong());
  } catch (error) {
    logger.error(error);
    res.status(500).send("Internal Server Error");
  } finally {
    fs.unlinkSync(localFilePath, err => {
      if (err) {
        logger.error(err);
      }
    });    
  }
});

/**
 * *DELETE /song/:songId
 */
app.delete("/song/:id", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  logger.debug(`Deleting song with songId: ${req.params.id}`);

  const retrievedSong = await pgController.get.song(req.params.id);

  if (await retrievedSong.length === 0) {
    res.status(404).send("Song not found");
  } else {
    const s3Key = await retrievedSong[0].dataValues.s3key;
    const deleteS3Obj = async () => {
      await s3Controller.deleteSong(s3Key);
    };

    const deleteSong = async () => {
      await pgController.delete.song(req.params.id);
    }

    try {
      await deleteS3Obj();
      await deleteSong();
      res.status(200).send("Song deleted");
    } catch (error) {
      logger.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
});









/**
 * * /health for healthchecks in the future
 */
app.get("/health", validationController.healthCheck, async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send("Health has been probed, and it was a success");
});

/**
 * * /ready for k8s readiness
 */
app.get("/ready", validationController.healthCheck, async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send("To Be Implemented, K8s Readiness Probe");
});






// START SERVER
const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
