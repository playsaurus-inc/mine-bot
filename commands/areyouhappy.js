const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {


	if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("Who do you think you are?")
	if(args[0].length < 8) {return};
	// if(!args[0]) return message.channel.send("pst. you forgot to include the number of messages you want me to clear");

	setTimeout(function() {message.channel.send(`${args[0]} are`);},1000);
	setTimeout(function() {message.channel.send(`${args[0]} you`);},2000);
	setTimeout(function() {message.channel.send(`${args[0]} happy`);},3000);
	setTimeout(function() {message.channel.send(`${args[0]} now`);},4000);
	setTimeout(function() {message.channel.send(`${args[0]} ?`);},5000);

	}

module.exports.help = {
	name: "areyouhappy"
}