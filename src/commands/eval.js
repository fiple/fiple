module.exports = {
	aliases: ["evaluate", "ev"],
	permissionRequired: 4,
	checkArgs: (args) => !!args.length
};

module.exports.run = async (message, args) => {
	let content = args.join(" ");

	try {
		let evaled = await eval(content);
		if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

		if (evaled.length > 2000) message.react("✅");
		else message.reply({
			content: "```js\n" + evaled + "\n```",
			components: [{
				type: 1,
				components: [{
					type: 2,
					emoji: {
						name: "🗑"
					},
					style: 4,
					custom_id: "reply:delete"
				}]
			}]
		});
	} catch (e) {
		let err;
		if (typeof e == "string") err = e.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
		else err = e;

		message.reply({
			content: "```fix\n" + err + "\n```",
			components: [{
				type: 1,
				components: [{
					type: 2,
					emoji: {
						name: "🗑"
					},
					style: 4,
					custom_id: "reply:delete"
				}]
			}]
		});
	};
};