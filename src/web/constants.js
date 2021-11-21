const db = require("../database/")();
module.exports.get = async (id) => {
    const gdb = await db.guild("906177011482001428");
    if (gdb.get().nicknames[id]) return gdb.get().nicknames[id];
    if (gdb.get().sitenicknames[id]) return gdb.get().sitenicknames[id];
    return null;
}

module.exports.set = async (id, nick) => {
    const gdb = await db.guild("906177011482001428");
    gdb.setOnObject("sitenicknames", id, nick);
}
module.exports.addBalance = async (id, amount) => {
    const gdb = await db.guild("906177011482001428");
    if (gdb.get().sitebalance[id]) return gdb.setOnObject("sitebalance", id, gdb.get().sitebalance[id] + amount);
    return gdb.setOnObject("sitebalance", id, amount)
}
module.exports.getBalance = async (id) => {
    const gdb = await db.guild("906177011482001428");
    const balance = gdb.get().sitebalance[id];
    console.log(balance)
    if (!balance) return 0;
    return gdb.get().sitebalance[id];
}