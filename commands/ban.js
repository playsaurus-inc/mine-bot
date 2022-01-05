const Discord = require("discord.js");

module.exports.run = async (bot, message, args) =>
{

	function getGuildMember(userID)
	{
		return new Promise((res, rej) =>
		{
			res(bot.guilds.cache.get("760967463684276274").members.fetch(userID));
		});
	}

	if(!message.member.hasPermission("MANAGE_MESSAGES")) 
	{
		return message.reply("Who do you think you are?")
	}
	else
	{
		var mentionedUserId = 0;
		if(message.mentions.users.first())
		{
			mentionedUserId = message.mentions.users.first().id;
		}
		else
		{
			mentionedUserId = args[0];
		}

		if(mentionedUserId > 0)
		{
			getGuildMember(mentionedUserId).then(guildMember =>
			{
				var auditChannel = message.guild.channels.cache.find(channel => channel.name === "audit-log");
				var reason = args.slice(1).join(" ");
				guildMember.ban({days: 7, reason: `${reason}`});

				auditChannel.send(`${message.member.displayName} banned <@${mentionedUserId}> for ${reason}`)
			});
		}
		else
		{
			message.channel.send("Forgot to mention user");
		}
	}
}
module.exports.help = {
	name: "ban"
}