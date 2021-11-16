module.exports = {
    aliases: ["execute", "ex"],
    permissionRequired: 4,
    checkArgs: (args) => !!args.length
};

const { exec } = require("child_process");

module.exports.run = (message, args) => {
    exec(args.join(" "), (err, res) => {
        message.reply({
            content: "```fix\n" + err || res + "\n```",
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    emoji: {
                        id: null,
                        name: "🗑"
                    },
                    style: 4,
                    custom_id: "reply:delete"
                }]
            }]
        });
    });
};