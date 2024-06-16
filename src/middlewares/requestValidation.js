import logger from './logger.js'

const healthCheck = (req, res, next) => {
    logger.info(`Health Check Endpoint Hit by IP Address: ${req.socket.remoteAddress}`)
    next();
}

const test = (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send("This is a test of the validation middleware");
}


const validationController = {
    healthCheck: healthCheck,
    test: test
}

export default validationController
