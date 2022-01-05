const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {


	if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("Who do you think you are?")
	if(!args[0]) return message.channel.send("pst. you forgot to include the number of messages you want me to clear");
	if(args[0] > 20) return message.channel.send("Maximum purge is 20");
	message.channel.bulkDelete(args[0]).then(() => {
		message.channel.send(`**GET PURGED!** \n https://media1.tenor.com/images/89e84eace2054a939f6e09a96aabf283/tenor.gif \n Cleared ${args[0]} messages.`)
	});

}

module.exports.help = {
	name: "purge"
}