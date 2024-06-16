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
logger.debug("Env Vars: " + JSON.stringify(config));

/**
 * *Postgres Setup
 */
import pgController  from "./utils/postgres.js" // test
pgController.connect(); // connect to sql DB
pgController.refreshModels();

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




app.get("/song/:songId", validationController.healthCheck, async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");


});
/**
 * * /test postgres
 */
app.get("/test", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  logger.debug("Testing Postgres Connection");

  try {
    ; // test

    res.status(200).send(await pgController.test());
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
