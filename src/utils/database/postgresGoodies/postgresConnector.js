import { Sequelize } from "sequelize";
import logger from "../../../middlewares/logger.js";

const pgConnector = new Sequelize({
	database: process.env.PG_DATABASE,
	username: process.env.PG_USERNAME,
	password: process.env.PG_PASSWORD,
	host: process.env.PG_HOST,
	port: process.env.PG_PORT,
	dialect: "postgres",
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
	},
	logging: (msg) => logger.debug(`Postgres Connector: ${msg}`),
});

export default pgConnector;