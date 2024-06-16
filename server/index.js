const express = require("express");
const cors = require('cors');
const compression = require('compression');
const uuid = require('uuid');
const config = require('../config/appconfig.js');
const Logger = require('../utils/logger.js');


const app = express();
const logger = new Logger();
app.set('config', config); // the system configrationsx


app.set('db',require('../database/db.js'))
app.set('port', process.env.DEV_APP_PORT);

app.use(compression());
app.use(require('method-override')());

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

process.on('SIGINT', () => {
	logger.log('stopping the server', 'info');
	process.exit();
});


app.use((req, res, next) => {
	req.identifier = uuid();
	const logString = `a request has been made with the following uuid [${req.identifier}] ${req.url} ${req.headers['user-agent']} ${JSON.stringify(req.body)}`;
	logger.log(logString, 'info');
	next();
});

app.use(require('../router/index.js'));

app.use((req, res, next) => {
	logger.log('the url you are trying to reach is not hosted on our server', 'error');
	const err = new Error('Not Found');
	err.status = 404;
	res.status(err.status).json({ type: 'error', message: 'the url you are trying to reach is not hosted on our server' });
	next(err);
});
module.exports = app;



