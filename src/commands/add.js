module.exports = {
    name: "add",
    description: "Принять участника на сервер.",
    permissionRequired: 2,
    opts: [
        {
            name: "member",
            description: "Участник, которого надо принять.",
            type: 6,
            required: true,
        },
        {
            name: "nick",
            description: "Имя человека, который будет принят.",
            type: 3,
            required: true,
        },
    ],
    slash: true
};

const config = require("../../config");
const { CommandInteraction } = require("discord.js");
const mcUtil = require("minecraft-server-util");
const rcon = new mcUtil.RCON("n1.padow.host", { port: 25587, password: config.passwords.rcon });
const db = require("../database/")();

module.exports.run = async (interaction = new CommandInteraction) => {
    const gdb = await db.guild(interaction.guild.id);
    const nick = interaction.options.getString("nick")
    const member = interaction.options.getMember("member")
    rcon.on("output", res => {
        gdb.setOnObject("nicknames", member.id, nick);
        rcon.close();
        return interaction.reply({ content: `Ответ: ${res}`, ephermeal: true });
    })
    await rcon.connect().then(() => { rcon.run("easywl add " + nick).catch(err => console.error(err)) }).catch(err => { return interaction.reply("Невозможно подключиться к Rcon") })
};
