import { v4 as uuidv4 } from 'uuid';
import logger from "../middlewares/logger.js";

import pgConnector from "./databaseGoodies/postgresConnector.js";
// Import the constructors
import { Song }  from "./constructors.js";

// Import Sequelize Models
import { SongModel } from "./databaseGoodies/postgresModels.js";


console.log(new Song({ songId: "test", title: "test", artist: "test", album: "test", genre: "test" }));

const pgController = {
	connect: async () => {
		try {
			await pgConnector.authenticate();
			logger.debug("Database Connection has been established successfully.");
		} catch (error) {
			logger.error("Unable to connect to the database:", error);
		}
	},
	refreshModels: async () => {
		try {
			await pgConnector.sync();
			logger.debug("Models refreshed");
		} catch (error) {
			logger.error("Unable to refresh models:", error);
		}
	},
	test: async () => {
		const genSongId = uuidv4();

		let songId = genSongId;

		await SongModel.create({
			songId: songId,
			s3Key: "test",
			title: "test",
			artist: "test",
			album: "test",
			genre: "test"
		});

		return await SongModel.findAll({ where: { songId: songId } });
	},
	insert: {
		song: async (songData) => {
			
			await SongModel.create({
				songId: songData.songId,
				title: songData.title,
				artist: songData.artist,
				album: songData.album,
				genre: songData.genre,
			});

			return await SongModel.findAll({ where: { songId: songId } });
		},
	},
	delete: {
		song: async (songId) => {
			return await SongModel.destroy({ where: { songId: songId } });
		},
	},
	select: {
		song: async (songId) => {
			return await SongModel.findAll({ where: { songId: songId } });
		},
		songs: async () => {
			return await SongModel.findAll();
		},
	},	
};

export default pgController