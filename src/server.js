/**
 ** App Packages
 */
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv"); // for use of environment variables
const http = require("http");

const config = dotenv.config(); // Prints Local Variables

/**
 * * Observability
 */
const logger = require("./middlewares/logger.js"); // logging

/**
 ** App Setup
 */
const app = express();
app.use(cors());
logger.debug("Env Vars: " + JSON.stringify(config));

//const dbController = require("./utils/db.js"); // test
//dbController.connect(); // connect to sql DB
//dbController.refreshModels();

/**
 * *Import Utilities
 */
const { utilityWrapper } = require("./utils/utilityWrapper.js"); // For s3 / sftp connections
logger.debug("Imported Utilities");

/**
 * *Import Middlewares
 */
const { validationController } = require("./middlewares/requestValidation.js"); // For request validation
logger.debug("Imported Middlewares");

/**
 * * HTTPS Setup
 */
const httpServer = http.createServer(app); // server var


/**
 *
 * Routes:
 * - /health
 */


logger.info("Starting server....");

/**
 * * /health for healthchecks in the future
 */
app.get("/health", validationController.healthCheck, async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send("Server Running");
});

/**
 * * /validationTest for testing the validation middleware
 */
app.get("/validationTest", validationController.test, async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send("Server Running");
});


// START SERVER
const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
