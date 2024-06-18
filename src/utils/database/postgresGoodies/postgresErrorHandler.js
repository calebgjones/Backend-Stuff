import { ValidationError, DatabaseError, TimeoutError } from 'sequelize';
import logger from '../../../middlewares/logger.js';

export const handleDbErrors = (error) => {
    if (error instanceof ValidationError) {
        logger.error("Postgres Validation Error Encountered:", error.errors);
    } else if (error instanceof DatabaseError) {
        logger.error("Postgres Database Error Encountered:", error.parent.message);
    } else if (error instanceof TimeoutError) {
        logger.error("Postgres Timeout Error Encountered:", error);
    } else {
        logger.error("Error Encountered Making Postgres Request:", error);
    }
    throw error;
};