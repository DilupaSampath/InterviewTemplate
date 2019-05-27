var config = {};

config.web_port = 3000;
config.jwtSecret = "supersecret";
config.databaseUrl = "mongodb://localhost:27017/valveSystems";
config.setListenerTimeout = 300000;
config.setFlushTimeout = 1800000;
config.delayBetweenPumpsAndMainValvesInMilliseconds = 10000;
config.activeTimeForPumpsInMilliseconds = 20000;
config.activeTimeForMainValvesInMilliseconds = 20000;
config.activeTimeForRacksInMilliseconds = 20000;

config.co2SensorTimeInMilliseconds = 10000;
config.delayBetweenMainValvesInSeconds = 10;

module.exports = config;