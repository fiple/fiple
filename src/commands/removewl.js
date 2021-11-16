module.exports = {
    name: "removewl",
    description: "Удалить участника с сервера.",
    permissionRequired: 2,
    opts: [
        {
            name: "member",
            description: "Участник, которого надо удалить.",
            type: 6,
            required: true,
        },
    ],
    slash: true
};
const config = require("../../config");
const { CommandInteraction } = require("discord.js");
const mcUtil = require("minecraft-server-util");
const rcon = new mcUtil.RCON("n1.padow.host", { port: 25587, password: config.passwords.rcon });
const db = require("../database")();

module.exports.run = async (interaction = new CommandInteraction) => {
    const gdb = await db.guild(interaction.guild.id);
    const member = interaction.options.getMember("member");
    const nick = gdb.get().nicknames[member.user.id];
    if (!gdb.get().nicknames[member.user.id]) { return interaction.reply({ content: "Человека нет в вайтлисте", ephemeral: true }) }
    rcon.on("output", res => {
        gdb.setOnObject("nicknames", member.id, null);
        rcon.close();
        return interaction.reply({ content: `Ответ: ${res}`, ephemeral: true });
    })
    await rcon.connect().then(() => { rcon.run("easywl remove " + nick).catch(err => console.error(err)) }).catch(err => { return interaction.reply("Невозможно подключиться к Rcon") })
};