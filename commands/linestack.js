const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {


	if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("Who do you think you are?")
	if(args[0].length < 8) {return};
	// if(!args[0]) return message.channel.send("pst. you forgot to include the number of messages you want me to clear");

	setTimeout(function() {message.channel.send(`${args[0]} plz`);},1000);
	setTimeout(function() {message.channel.send(`${args[0]} no`);},2000);
	setTimeout(function() {message.channel.send(`${args[0]} line`);},3000);
	setTimeout(function() {message.channel.send(`${args[0]} stack`);},4000);


	}

module.exports.help = {
	name: "nolinestack"
}