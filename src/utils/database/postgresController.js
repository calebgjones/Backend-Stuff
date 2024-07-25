import logger from "../../middlewares/logger.js";

import pgConnector from "./postgresGoodies/postgresConnector.js";
import { handleDbErrors } from './postgresGoodies/postgresErrorHandler.js';
// Import the constructors
import { SongModel }  from "../constructors.js";

// Import Sequelize Models
import { Song } from "./postgresGoodies/postgresModels.js";


const pgController = {
	admin: {
		refreshModels: async () => {
			try {
				await pgConnector.sync({ force: true });
				logger.debug("Sequelize Models refreshed");
			} catch (error) {
				handleDbErrors(error);
			}
		},
		connect	: async () => {
			try {
				await pgConnector.authenticate();
				logger.debug("Database Connection has been established successfully.");
			} catch (error) {
				handleDbErrors(error);
			}
		},
	},
	post: {
		song: async (songMetaData) => {
			const createSong = async () => {
				await Song.create({
					s3key: songMetaData.s3key,
					title: songMetaData.title,
					artist: songMetaData.artist,
					album: songMetaData.album,
					genre: songMetaData.genre,
				});
			};

			try {
				await createSong();
				return await Song.findAll({ where: { s3key: songMetaData.s3key } });
			} catch (error) {
				handleDbErrors(error);
			}
		},
		songs: async (songsData) => {
			const createSongs = async () => {
				await Song.bulkCreate(songsData);
			};

			const songIds = songsData.map(song => song.songId);

			try {
				await createSongs();
				return await Song.findAll({ where: { songId: songIds }});
			} catch (error) {
				handleDbErrors(error);
			}
		}
	},
	delete: {
		song: async (id) => {
			const deleteSong = async () => {
				await Song.destroy({ where: { id: id } });
			}

			try {
				await deleteSong();
				return await Song.findAll({ where: { id: id } });
			} catch (error) {
				handleDbErrors(error);
			}
		},
		all: async () => {
			const deleteAllTables = async () => {
				// Get all table names except Sequelize's default tables
				const tableNames = await pgConnector.query(
					"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
				);
				// Delete all tables
				for (const tableName of tableNames) {
					await pgConnector.query(`DROP TABLE IF EXISTS ${tableName.table_name} CASCADE`);
				}
			};

			try {
				await deleteAllTables();
			} catch (error) {
				handleDbErrors(error);
			}
		},
	},
	get: {
		song: async (id) => {
			console.log(await Song.findAll({ where: { id: id } }))
			return await Song.findAll({ where: { id: id } });
		},
		songs: async () => {
			return await Song.findAll();
		},
	},	
};

export default pgController