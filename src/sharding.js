require("nodejs-better-console").overrideConsole();
const { ShardingManager } = require("discord.js");
const config = require("../config");

const manager = new ShardingManager(__dirname + "/bot.js", {
    totalShards: config.shards || "auto",
    token: config.token,
    mode: "worker"
});

manager.on("shardCreate", async (shard) => {
    shard.on("message", (m) => {
        if (m == "respawn") {
            console.warn(`[Manager] Shard ${shard.id} has requested a restart.`);
            shard.respawn();
        };
    });
    console.log(`[Manager] Shard ${shard.id} is starting.`);
});

manager.spawn({ amount: config.shards || "auto", delay: 1500, timeout: -1 });