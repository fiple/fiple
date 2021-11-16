const config = require("../../config"), mongoose = require("mongoose");

module.exports = () => {
    mongoose.connect(config.database_uri).catch(() => {
        client.shard.send("respawn");
    });

    return {
        guild: require("./guild")(),
        cacheGuilds: require("./guild").cacheAll,
        global: require("./global")
    };
};