
import { DataTypes } from "sequelize";
import pgConnector from "./postgresConnector.js";

export const SongModel = pgConnector.define("SongModel", {
	songId: {
		type: DataTypes.STRING, primaryKey: true, allowNull: false,
	},
	title: {
		type: DataTypes.STRING, allowNull: false,
	},
	artist: {
		type: DataTypes.STRING, allowNull: false,
	},
	album: {
		type: DataTypes.STRING, allowNull: true,
	},
	genre: {
		type: DataTypes.STRING, allowNull: true,
	}
});