import { v4 as uuidv4 } from 'uuid';
import logger from "../../middlewares/logger.js";

import pgConnector from "./postgresGoodies/postgresConnector.js";
// Import the constructors
import { SongModel }  from "../constructors.js";

// Import Sequelize Models
import { Song } from "./postgresGoodies/postgresModels.js";




const pgController = {
	admin: {
		refreshModels: async () => {
			try {
				await pgConnector.sync();
				logger.debug("Models refreshed");
			} catch (error) {
				logger.error("Unable to refresh models:", error);
			}
		},
		connect	: async () => {
			try {
				await pgConnector.authenticate();
				logger.debug("Database Connection has been established successfully.");
			} catch (error) {
				logger.error("Unable to connect to the database:", error);
			}
		},
	},
	post: {
		song: async (songData) => {
			const genSongId = uuidv4();
			let songId = genSongId;
			
			const createSong = async () => {
				await Song.create({
					songId: songId,
					title: songData.title,
					artist: songData.artist,
					album: songData.album,
					genre: songData.genre,
				});
			};

			try {
				await createSong();
				return await Song.findAll({ where: { songId: songId } });
			} catch (error) {
				logger.error("Error creating song:", error);
				throw new Error(`Error creating song: ${error}`);
			}
		},
		songs: async (songsData) => {
			const createSongs = async () => {
				await Song.bulkCreate(songsData);
			};

			try {
				await createSongs();
				return await Song.findAll();
			} catch (error) {
				logger.error("Error creating songs:", error);
				throw new Error(`Error creating songs: ${error}`);
			}
		}
	},
	delete: {
		song: async (songId) => {

			delteSong = async () => {
				await Song.destroy({ where: { songId: songId } });
			}

			try {
				await delteSong();
				return await Song.findAll({ where: { songId: songId } });
			} catch (error) {
				logger.error("Error deleting song:", error);
				throw new Error(`Error deleting song: ${error}`);
			}
		},
	},
	get: {
		song: async (songId) => {
			return await Song.findAll({ where: { songId: songId } });
		},
		songs: async () => {
			return await Song.findAll();
		},
	},	
};

export default pgController