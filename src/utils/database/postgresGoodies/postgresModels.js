
import { DataTypes } from "sequelize";
import pgConnector from "./postgresConnector.js";

export const Song = pgConnector.define("song", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	  },
	s3key: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	title: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	artist: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	album: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	genre: {
		type: DataTypes.STRING,
		allowNull: true,
	}
});