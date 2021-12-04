const db = require("../database/")();
const s = require("connect-redis");
const config = require("../../config");
module.exports.get = async (id) => {
    const gdb = await db.guild("906177011482001428");
    if (gdb.get().nicknames[id]) return { nick: gdb.get().nicknames[id], whitelisted: true };
    if (gdb.get().sitenicknames[id]) return { nick: gdb.get().sitenicknames[id], whitelisted: false };
    return null;
}
module.exports.getByNickname = async (nick) => {
    const gdb = await db.guild("906177011482001428");
    let obj = gdb.get().nicknames
    for (let i in obj) {
        if (obj[i] == nick) return i;
    }
    obj = gdb.get().sitenicknames;
    for (let i in obj) {
        if (obj[i] == nick) return i;
    }
    return null;
}

module.exports.set = async (id, nick) => {
    const gdb = await db.guild("906177011482001428");
    gdb.setOnObject("sitenicknames", id, nick);
}
module.exports.addBalance = async (id, amount) => {
    const gdb = await db.guild("906177011482001428");
    if (gdb.get().sitebalance[id]) return gdb.setOnObject("sitebalance", id, Number(gdb.get().sitebalance[id]) + amount);
    return gdb.setOnObject("sitebalance", id, amount)
}
module.exports.getBalance = async (id) => {
    const gdb = await db.guild("906177011482001428");
    const balance = gdb.get().sitebalance[id];
    if (!balance) return 0;
    return gdb.get().sitebalance[id];
}
module.exports.getAll = async () => {
    const gdb = await db.guild("906177011482001428")
    return gdb.get();
}
module.exports.addWhitelist = async (nick, id) => {
    const mcUtil = require("minecraft-server-util");
    const rcon = new mcUtil.RCON("n1.padow.host", { port: 25587, password: config.passwords.rcon });
    const gdb = await db.guild("906177011482001428");
    let status;
    status = async () => {
        if (id) {
            if (gdb.get().nicknames[id]) return status = { status: 400, answer: "alerady wled" }
            rcon.on("output", res => {
                gdb.setOnObject("nicknames", id, nick.nick);
                rcon.close();
                gdb.setOnObject("sitebalance", id, Number(gdb.get().sitebalance[id]) - 50);
                return status = { status: 200, answer: "ok", res: res }
            })
            await rcon.connect().then(() => { rcon.run("easywl add " + nick).catch(err => { return { status: 204, answer: err.message } }) }).catch(err => { return { status: 204, answer: "cannot connect to rcon" } })
        }
        return { status: 400, answer: id }
    }
    status = await status()
    if (!status) status = { status: 200, answer: "ok" }
    return status
}