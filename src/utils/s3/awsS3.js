import logger from "../../middlewares/logger.js";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { v4 as uuidv4 } from 'uuid';


/**
 * Local Vars
 */

const s3Client = new S3Client();
const genSongId = () => {return uuidv4()}; // Generate UUID for song

/**
 * Public Vars
 */

const handleErrors = (err) => {
	logger.error(`Error Occurred Making Request To Bucket: ${err}`);

	const rawStatus = err.$metadata.httpStatusCode;
	const rawMessage = 'Unable To Fulfill Request: ' + err.message;
	const status = rawStatus === undefined ? 500 : rawStatus;
	const message = rawMessage === undefined ? "Error Occurred Handling Request to/from Bucket" : rawMessage;

	return { status: status, message: message };
};

/**
 * Public Functions
 */
const uploadSong = async (songData) => {
    let songId = genSongId();

	logger.debug(`Uploading song with UUID: ${songId} to S3 Bucket`);
	
    
	try {
        const uploadFile = async (songData, songId) => {
            const requestParams = { Bucket: process.env.AWS_S3_BUCKET, Key: songId, Body: songData, ContentLength: songData.length };
            const response = await s3Client.send(new PutObjectCommand(requestParams));
            const responseCode = await response.$metadata.httpStatusCode;
    
            return (await responseCode === 200) ? songId : () => {throw new Error("Error deleting file from S3 Bucket")};
        }

		return uploadFile(songData, songId);
	} catch (err) {
		return handleErrors(err);
	} finally {
		logger.debug(`S3 Upload for song by UUID: ${songId} Completed`);
	}
};

const deleteSong = async (s3Key) => {
	logger.debug(`Deleting song with UUID: ${s3Key} from S3 Bucket`);

	try {
		const deleteFile = async (s3Key) => {
			const requestParams = { Bucket: process.env.AWS_S3_BUCKET, Key: s3Key };
			const response = await s3Client.send(new DeleteObjectCommand(requestParams));
			const responseCode = await response.$metadata.httpStatusCode;

			return (await responseCode === 200) ? songId : () => {throw new Error("Error deleting file from S3 Bucket")};
		}

		return deleteFile(s3Key);
	} catch (err) {
		return handleErrors(err);
	} finally {
		logger.debug(`S3 Deletion for song by UUID: ${s3Key} Completed`);
	}
};

const getPresignedURL = async (s3Key) => {
    logger.debug(`Generating Presigned URL for song with UUID: ${s3Key}`);

    try {
        const command = new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: s3Key });
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour

        return signedUrl;
    } catch (err) {
        return handleErrors(err);
    } finally {
        logger.debug(`Generated Presigned URL for song with UUID: ${s3Key}`);
    }
};

export const s3Controller = {
    uploadSong,
	deleteSong,
	getPresignedURL
};