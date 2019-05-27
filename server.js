const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const express = require('express');
const http = require('http');

const config = require('./config/config');
const routes = require('./routes/routes');
const cronService = require('./services/cronServices');

const server = express();
const server_port = config.web_port;

server.use(bodyParser.json());
server.use(cors());
server.use(routes);
server.use(express.static(__dirname));

mongoose.connect(config.databaseUrl, { useNewUrlParser: true });
// mongoose.set('debug', true);

// Create socket server
var httpServer = http.createServer(server);
const io = require('./services/socketService').listen(httpServer);
cronService.runCheckMainValvesStatusCron();
cronService.runCheckPumpStatusCron();
cronService.runCheckRacksStatusCron();
cronService.runServerTimeCron();

// Start socket server
httpServer.listen(server_port, err => {
    if (err) {
        console.error(err);
    }
    else {
        console.log('server listening on port: ' + server_port);
    }
});

module.exports = httpServer;