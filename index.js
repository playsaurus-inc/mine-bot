const util = require('util');
const request = require('request');
const atob = require('atob');
const botconfig = require(__dirname + "/botconfig.json");
const Discord = require("discord.js");
const fs = require("fs");
const JSONbig = require('json-bigint')({useNativeBigInt: true});;
const bot = new Discord.Client({disableMentions: 'everyone'});
bot.commands = new Discord.Collection();


var prefixes = ["!", "~"];
var messageText;

function log(log)
{
	var time = new Date();
	console.log("[" + (time.getHours() % 12) + ":" + time.getMinutes() + ":" + time.getSeconds() + "] " + log);
}

var JSONcommands;
var JSONsaves;
var JSONBannedsaves;
var reminders;
var bannedFromRoles;
var edited_reminders = JSON.stringify(reminders);

setInterval(function ()
{
	log("writing to files");
	fs.writeFileSync(__dirname + '/saves.json', JSON.stringify(JSONsaves));
	fs.writeFileSync(__dirname + '/bannedSaves.json', JSON.stringify(JSONBannedsaves));
}, 1000 * 60 * 5)

fs.readdir(__dirname + "/commands/", (err, files) =>
{
	if(err) log(err);

	let jsfile = files.filter(f => f.split(".").pop() === "js")
	if(jsfile.length <= 0)
	{
		log("Couldn't find commands.");
		return;
	}

	jsfile.forEach((f, i) =>
	{
		let props = require(__dirname + `/commands/${f}`);
		log(`${f} loaded!`);
		bot.commands.set(props.help.name, props);
	});
});

fs.readFile(__dirname + '/commands.json', (err, data) =>
{
	if(err) throw err;
	JSONcommands = JSON.parse(data);
});

fs.readFile(__dirname + '/difficulty.json', (err, data) =>
{
	if(err) throw err;
	difficulty = JSONbig.parse(data);
});

fs.readFile(__dirname + '/saves.json', (err, data) =>
{
	if(err) throw err;
	JSONsaves = JSON.parse(data);
});

fs.readFile(__dirname + '/bannedSaves.json', (err, data) =>
{
	if(err) throw err;
	JSONBannedsaves = JSON.parse(data);
});

fs.readFile(__dirname + '/remind.json', (err, data) =>
{
	if(err) throw err;
	reminders = JSON.parse(data);
});

fs.readFile(__dirname + '/bannedFromRoles.json', (err, data) =>
{
	if(err) throw err;
	bannedFromRoles = JSON.parse(data);
});

function getRoles()
{
	return new Promise((res, rej) =>
	{
		res(bot.guilds.cache.get("760967463684276274").roles);
	});
}

function getGuildMember(userID)
{
	return new Promise((res, rej) =>
	{
		res(bot.guilds.cache.get("760967463684276274").members.fetch(userID));
	});
}

function getNumberOfRoles(userID)
{
	return new Promise((res, rej) =>
	{
		res(getGuildMember(userID)
			.then((member) =>
			{
				var numRoles = member.roles.cache
					.map((role) => role.toString());
				return numRoles.length;
			}));
	});
}

function setRole(depth, userID)
{

	if(bannedFromRoles.bannedFromRoles.includes(userID)) return;
	getGuildMember(userID)
		.then(guildMember =>
		{

			var {cache} = guildMember.guild.roles;
			log("adding role")

			if(depth < 304)
			{
				guildMember.roles.add("776582359423778818");
			}
			else if(depth >= 304 && depth < 500) 
			{
				guildMember.roles.add("776583199711035483");
			}
			else if(depth >= 500 && depth < 1000) 
			{
				guildMember.roles.add("776630529461190707");
			}
			else if(depth >= 1000 && depth < 1332) 
			{
				guildMember.roles.add("795776541900275772");
			}
			else if(depth >= 1332 && depth < 1814) 
			{
				guildMember.roles.add("822975154128814081");
			}
			else if(depth >= 1814) 
			{
				guildMember.roles.add("922178836383285259");
			}


			log("added role");
		}).catch(console.error);
}

function decodeSave(data)
{
	return atob(atob(data.split("|")[1])).split("|");
}


bot.on("ready", async () =>
{
	log(`${bot.user.username} is online!`);

	function readFilesAndUpdateRoles()
	{
		setInterval(function ()
		{
			var reminder = reminders.reminders;

			for(i = 0; i < reminders.reminders.length; i++)
			{

				var currentTime = Date.now();

				if(reminder[i].reminderDate <= currentTime && reminder[i].sent == false)
				{
					bot.channels.cache.get(reminder[i].channel).send("<@" + reminder[i].user + ">", {
						embed: {
							title: "Reminder",
							description: reminder[i].reminder,
						}
					});

					reminder[i].sent = true;
				}

				if(reminder[i].sent == true)
				{
					reminder.splice(i, 1);

					edited_reminders = JSON.stringify(reminders);
					fs.writeFileSync(__dirname + '/remind.json', edited_reminders)

					fs.readFile(__dirname + '/remind.json', (err, data) =>
					{
						if(err) throw err;
						reminders = JSON.parse(data);
					});
				}

			}

			edited_reminders = JSON.stringify(reminders);

			fs.writeFileSync(__dirname + '/remind.json', edited_reminders);
		}, 5000)
	};

	readFilesAndUpdateRoles();
});


bot.on("message", async message =>
{

	if(message.author.bot) return;
	var memberJoinTime;

	if(message.member)
	{
		memberJoinTime = message.member.joinedTimestamp;
	};

	if(message.channel.type != "dm")
	{
		if(message.guild.id == "760967463684276274")
		{
			getNumberOfRoles(message.author.id)
				.then((numRoles) =>
				{
					var lowercaseMessage = message.content.toLowerCase();
					if(numRoles <= 1 && (lowercaseMessage.includes("@everyone") || lowercaseMessage.includes("free") || lowercaseMessage.includes("steam") || lowercaseMessage.includes("airdrop")) && (lowercaseMessage.includes("nitro") || lowercaseMessage.includes("nltro")) && (message.embeds.length > 0 || lowercaseMessage.includes("https:/"))) 
					{
						console.log(message.content);
						var auditChannel = message.guild.channels.cache.find(channel => channel.name === "audit-log");
						message.delete();
						message.member.ban({days: 7, reason: 'posting nitro scam'})
							.then(console.log)
							.catch(console.error);

						auditChannel.send(`Banned <@${message.member.id}> for posting nitro scam.`)
					}
				});
		}
	}

	var currentTime = Date.now();

	var questionStarters = ["what", "any idea", "why", "whats"]
	

	for(var i = 0; i < questionStarters.length; i++)
	{

		if(message.content.toLowerCase().includes(questionStarters[i]) && (message.content.toLowerCase().includes("red star") || message.content.toLowerCase().includes("red name")))
		{
			message.channel.send("The red names are the names of players who chose to support the game by buying 650 tickets or 1400 tickets at one time.")
			break;
		}
		if(message.content.toLowerCase().includes(questionStarters[i]) && (message.content.toLowerCase().includes("mime") || message.content.toLowerCase().includes("112")))
		{
			message.channel.send("That's Mr. Mime, he's just vibin. He doesn't do anything.")
			break;
		}
		if((message.content.toLowerCase().includes("any") || message.content.toLowerCase().includes("give me") || message.content.toLowerCase().includes("are there")) && message.content.toLowerCase().includes("code"))
		{
			message.channel.send("The devs randomly create the codes and they typically expire after a few days or uses.\nIf the latest ones in <#764279333262852138> don't work it's unlikely there is any available.\nPlease do not ask for any codes and NEVER ask the devs for codes.");
			return;
		}
	}


	//DM REQUESTING SAVE CODE

	if(message.channel.type === "dm")
	{
		if(bannedFromRoles.bannedFromRoles.includes(message.author.id))
		{
			message.reply("Your save was determined to be illegitimate either because you cheated or used a different users save. You will no longer be eligible for ranks on the server.");
		}
		else
		{
			log("received DM");
			if(message.attachments.first())
			{
				if(message.attachments.first().name === `message.txt`)
				{
					request.get(message.attachments.first().url)
						.on('error', console.error)
						.pipe(fs.createWriteStream(__dirname + '/message.txt'))
						.on('finish', function ()
						{
							fs.readFile(__dirname + '/message.txt', "utf8", (err, data) =>
							{
								var save = ""

								if(data.includes("|"))
								{
									var save = decodeSave(data);
								}
								if(save.length < 450)
								{
									message.reply("Your save is missing data, please make sure to paste all of the text. It's okay if Discord asks you to convert it to a file.\nIf you sent me your save by clicking on my name on the right pannel and pasting the text in the little box, Discord automatically cuts the text to 500 characters. So please send it from this DM actual DM page.")
								}
								else
								{
									var depth = save[1];
									var timeplayed = save[81] / 60;
									var gameUID = save[3];
									var userBanned = false;
									var tickets = save[115];
									var targetMember = bot.guilds.cache.get("760967463684276274").members.cache.get(message.author.id);

									for(var i = 0; i < JSONsaves['saves'].length; i++)
									{
										if(JSONsaves['saves'][i].gameUID && !isNaN(gameUID))
										{
											if(userBanned == false && (JSONsaves['saves'][i].gameUID == gameUID && JSONsaves['saves'][i].userID != message.author.id) || tickets > 20000)
											{
												userBanned = true;
												bannedFromRoles.bannedFromRoles.push(message.author.id);
												var edited_bannedFromRoles = JSON.stringify(bannedFromRoles);
												fs.writeFileSync(__dirname + '/bannedFromRoles.json', edited_bannedFromRoles);
												message.reply("Your save was determined to be illegitimate either because you cheated or used a different users save. You will no longer be eligible for ranks on the server.");

												if(targetMember)
												{
													targetMember.roles.set([]);
												}
											}
										}
									}

									if(userBanned == false && !bannedFromRoles.bannedFromRoles.includes(message.author.id))
									{
										JSONsaves['saves'].push({"userID": message.author.id, "depth": depth, "timeplayed": Math.round(timeplayed), "gameUID": gameUID, "save": data});
									}
									else
									{
										JSONBannedsaves['saves'].push({"userID": message.author.id, "depth": depth, "timeplayed": Math.round(timeplayed), "gameUID": gameUID, "userBanned": userBanned, "save": data});
									}


									setRole(depth, message.author.id);
								}

							})
						})

				}
			} else if(message.content.length > 200 && message.content.includes("|") && !message.content.includes(" "))
			{
				var save = decodeSave(message.content);

				if(save.length < 450)
				{
					message.reply("Your save is missing data, please make sure to paste all of the text. It's okay if Discord asks you to convert it to a file.\nIf you sent me your save by clicking on my name on the right pannel and pasting the text in the little box, Discord automatically cuts the text to 500 characters. So please send it from this DM actual DM page.")
				}
				else
				{
					var depth = save[1];
					var timeplayed = save[81] / 60;
					var gameUID = save[3];
					var userBanned = false;
					var targetMember = bot.guilds.cache.get("760967463684276274").members.cache.get(message.author.id);


					for(var i = 0; i < JSONsaves['saves'].length; i++)
					{
						if(JSONsaves['saves'][i].gameUID && !isNaN(gameUID))
						{
							if(userBanned == false && JSONsaves['saves'][i].gameUID == gameUID && JSONsaves['saves'][i].userID != message.author.id)
							{
								userBanned = true;
								bannedFromRoles.bannedFromRoles.push(message.author.id);
								var edited_bannedFromRoles = JSON.stringify(bannedFromRoles);
								fs.writeFileSync(__dirname + '/bannedFromRoles.json', edited_bannedFromRoles);
								message.reply("Your save was determined to be illegitimate either because you cheated or used a different users save. You will no longer be eligible for ranks on the server.");

								if(targetMember)
								{
									targetMember.roles.set([]);
								}
							}
						}
					}

					if(userBanned == false && !bannedFromRoles.bannedFromRoles.includes(message.author.id))
					{
						JSONsaves['saves'].push({"userID": userID, "depth": depth, "timeplayed": Math.round(timeplayed), "gameUID": gameUID, "save": data});
					}
					else
					{
						JSONBannedsaves['saves'].push({"userID": userID, "depth": depth, "timeplayed": Math.round(timeplayed), "gameUID": gameUID, "userBanned": userBanned, "save": data});
					}

					setRole(depth, userID);
				}
			} else
			{
				log(message.content);
			}
		}
	}

	if(JSONcommands)
	{
		var commands = JSONcommands.commands;
		for(x = 0; x < commands.length; x++)
		{
			for(i = 0; i < commands[x].command.length; i++)
			{
				for(n = 0; n < prefixes.length; n++)
				{
					if(message.content.toLowerCase().startsWith(prefixes[n] + commands[x].command[i].toLowerCase()))
					{
						var commandToCheck = message.content.substr(prefixes[n].length, message.content.length);
						if(commandToCheck.length == commands[x].command[i].length)
						{
							message.channel.send("" + commands[x].response.split("\\n").join("\n"));
							return;
						}
					}
				}
			}
		}
	}

	if(message.channel.id == 761441663397789696 && !message.content.toLowerCase().startsWith("report:"))
	{
		log(message.content);
		if(!message.member.hasPermission("MANAGE_MESSAGES"))
		{
			message.delete();
			message.member.send("Hey, it appears you posted in the bug reports channel with out the proper format. If your message was a bug report, please edit it to include \"report:\" and resend it to the bug reports channel, thanks! \n\n Message Copy: " + message.content)
				.then(console.log)
				.catch(console.error);

			message.channel.send("Please only use this channel for bug reports. All messages should start with \"Report:\". Discussions should be had in <#760967463684276278>. If you have more information you want to add, please edit your report with more details. If your message was a report, a copy of it has been sent to your DM's.")
		}
	}


	if(message.channel.id == 761441702753206273)
	{
		if(!message.content.toLowerCase().startsWith("idea:") && !message.content.toLowerCase().startsWith("suggestion:"))
		{
			log(message.content);
			if(!message.member.hasPermission("MANAGE_MESSAGES"))
			{
				message.delete();
				message.member.send("Hey, it appears you posted in the ideas and suggestions channel with out the proper format. If your message was an idea, please edit it to include \"idea:\" and resend it to the ideas channel, thanks! \n\n Message Copy:" + message.content)
					.then(console.log)
					.catch(console.error);

				message.channel.send("Please only use this channel for ideas and suggestions. All messages should start with \"Idea:\". Discussions should be had in <#760967463684276278>. If you have more information you want to add, please edit your idea with more details.")
			}
		}
		else
		{
			message.react('👍');
			message.react('👎');
		}
	}


	//Auto mod stuff

	if(message.content.includes("discord.gg")) 
	{
		var auditChannel = message.guild.channels.cache.find(channel => channel.name === "audit-log");
		if(memberJoinTime > currentTime - 43200000)
		{
			message.delete();
			log("Link posted by " + message.author.username);
			message.member.send("Do not post links to other Discord Servers")
				.then(console.log)
				.catch(console.error);

			auditChannel.send(`Warned <@${message.member.id}> for posting links to a different Discord server.`)
		}
	}

	if(message.author.id == 769105768539619329)
	{
		if(message.content.includes("||") && !message.attachments.first())
		{
			message.channel.send("", {
				embed: {
					fields: [
						{
							name: 'Un-Brodigered message',
							value: message.content.split("|").join(""),
						}
					],
				}
			});
		}
		else if(message.attachments.first())
		{
			if(message.attachments.first().name.includes("SPOILER"))
			{
				message.channel.send({
					embed: {
						fields: [
							{
								name: 'Un-Brodigered message',
								value: message.content.split("|").join(""),
							}
						],
						image: {
							url: "attachment://unbrodigered.jpg"
						}
					},
					files: [{
						attachment: message.attachments.first().url,
						name: "unbrodigered.jpg"
					}],
				});
			}
		}
	}

	var msConversion = [
		{
			time: ['s', 'second', 'seconds', 'sec', 'secs'],
			MS: 1000,
		},
		{
			time: ['m', 'minute', 'minutes', 'min', 'mins'],
			MS: 60000,
		},
		{
			time: ['h', 'hour', 'hours'],
			MS: 3600000,
		},
		{
			time: ['d', 'day', 'days'],
			MS: 86400000,
		},
		{
			time: ['month', 'months'],
			MS: 2592000000,
		},
		{
			time: ['y', 'year', 'years', 'yrs'],
			MS: 946080000000,
		}
	];

	for(n = 0; n < prefixes.length; n++)
	{

		if(message.content.startsWith(prefixes[n] + "remindme")) 
		{
			if(message.content.includes("\""))
			{
				var messageArray2 = message.content.split("\"");
				log(messageArray2);
			}

			if(messageArray2[1] === undefined || messageArray2[3] === undefined)
			{
				message.reply("You are missing an argument");
				return;
			}

			var timeArray = messageArray2[3].split(",");
			log(timeArray);

			var reminderDate = 0;

			for(x = 0; x < msConversion.length; x++)
			{
				for(i = 0; i < msConversion[x].time.length; i++)
				{
					for(n = 0; n < timeArray.length; n++)
					{
						var regexStr = timeArray[n].match(/[a-z]+|[^a-z]+/gi);

						if(regexStr[1].length == msConversion[x].time[i].length)
						{
							if(regexStr[1].toLowerCase().includes(msConversion[x].time[i]) > 0)
							{
								var ms = msConversion[x].MS;
								reminderDate = reminderDate + (msConversion[x].MS * parseInt(regexStr[0]));
							}
						}
					}
				}
			}
			reminderDate = reminderDate + Date.now();

			reminders['reminders'].push({"user": message.author.id, "channel": message.channel.id, "reminderDate": reminderDate, "reminder": messageArray2[1], "sent": false});
			message.reply("Your reminder has been set", {
				embed: {
					title: "Reminder",
					fields: [
						{
							name: 'Date',
							value: new Date(reminderDate).toString(),
						},
						{
							name: 'Description',
							value: messageArray2[1],
						}
					],
				}
			});

			return;
		}

		if(message.content.startsWith(prefixes[n] + "newCommand") || message.content.startsWith(prefixes[n] + "newcommand")) 
		{

			var messageArray = message.content.split("\"");
			log(messageArray[1]);
			log(messageArray[3]);

			if(!message.author.id == 238449007813197824 || !message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("Who do you think you are?")

			if(messageArray[3] === undefined)
			{
				message.channel.send("Command needs a response. Proper format is: \n`!newcommand \"command\" \"response\"`");
				return;
			}

			var doesCommandExist = false;

			if(JSONcommands) 
			{
				var commands = JSONcommands.commands;
				for(x = 0; x < commands.length; x++) 
				{
					for(i = 0; i < commands[x].command.length; i++)
					{
						for(n = 0; n < prefixes.length; n++)
						{
							if(messageArray[1].toLowerCase() == commands[x].command[i].toLowerCase())
							{
								var embed = new Discord.MessageEmbed()
									.setTitle("ERROR: Command already exists")
									.addField("Existing command", messageArray[1])
									.addField("Existing response", commands[x].response.split("\\n").join("\n"))
								message.reply("This command already exists, use !deleteCommand to remove the old command first or use a different command name", embed);
								doesCommandExist = true;
								return;

							}
						}
					}
				}
			}

			if(!doesCommandExist)
			{
				if(JSONcommands['commands']) 
				{
					JSONcommands['commands'].push({"command": [messageArray[1]], "count": 0, "response": messageArray[3]})
				}
				else 
				{
					message.reply("Failed to read command file please try again");
				}

				var edited_JSONcommands = JSON.stringify(JSONcommands);
				fs.writeFileSync(__dirname + '/commands.json', edited_JSONcommands);
				message.reply("", {
					embed: {
						title: "Command added",
						fields: [
							{
								name: 'Command name:',
								value: messageArray[1],
								inline: true,
							},
							{
								name: 'Response:',
								value: messageArray[3],
							}
						],
					}
				});
			}

		}
		else if(message.content.startsWith(prefixes[n] + "deleteCommand") || message.content.startsWith(prefixes[n] + "deletecommand")) 
		{

			if(!message.author.id == 238449007813197824 || !message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("Who do you think you are?");
			var messageArray = message.content.split("\"");

			if(messageArray[1] === undefined)
			{
				message.channel.send("Failed to supply command name. Proper format is: \n`!deleteCommand \"command\"`");
				return;
			}

			for(var i = 0; i < JSONcommands['commands'].length; i++)
			{
				if(JSONcommands['commands'][i].command == messageArray[1])
				{
					console.log("removing command " + JSONcommands['commands'][i].command[0]);
					JSONcommands['commands'].splice(i, 1);
				}
			}

			var edited_JSONcommands = JSON.stringify(JSONcommands);
			fs.writeFileSync(__dirname + '/commands.json', edited_JSONcommands);
			message.reply("command deleted");
		}

		if(message.content.toLowerCase().startsWith(prefixes[n] + "requestsave"))
		{
			var messageArray = message.content.split(" ");
			if(message.member.hasPermission("MANAGE_MESSAGES"))
			{
				var mentionedUserId = 0;
				if(message.mentions.users.first())
				{
					mentionedUserId = message.mentions.users.first().id;
				}
				else
				{
					mentionedUserId = messageArray[1];
					console.log(mentionedUserId);
				}

				var saves = "";
				if(bannedFromRoles.bannedFromRoles.includes(mentionedUserId))
				{
					saves = JSONBannedsaves;
				}
				else
				{
					saves = JSONsaves;
				}

				for(var i = saves.saves.length; i > 0; i--)
				{
					if(saves.saves[i])
					{
						if(saves.saves[i].userID == mentionedUserId)
						{
							var save = new Discord.MessageAttachment(Buffer.from(JSON.stringify(saves.saves[i].save), 'utf-8'), 'save.txt')
							if(bannedFromRoles.bannedFromRoles.includes(mentionedUserId))
							{
								message.channel.send("Users save has been marked as cheated");
							}
							message.channel.send("Found latest user save", save);
							break;
						}
					}
				}
			}
			else
			{
				message.reply("Who do you think you are?");
			}
		}

		if(message.content.toLowerCase().startsWith(prefixes[n] + "whois"))
		{
			var messageArray = message.content.split(" ");
			var target;
			if(message.mentions.users.first())
			{
				target = message.mentions.users.first();
			}
			else if(messageArray[1])
			{
				target = messageArray[1];
			}
			else
			{
				target = message.author;
			}


			getGuildMember(target.id)
				.then((user) =>
				{
					const whois = new Discord.MessageEmbed()

						.setAuthor(`${target.username}`)
						.addField('Discord Name', `${target.username}`, true)
						.addField('Tag', `${target.discriminator}`, true)
						.addField('Joined Server Date', `${user.joinedAt}`, true)
						.addField('Account Creation Date', `${target.createdAt}`, true)
						.setThumbnail(target.displayAvatarURL({dynamic: false}))
						.setColor('RANDOM')
					message.channel.send(whois)
				})
		}


		if(message.content.toLowerCase().startsWith(prefixes[n] + "banfromroles"))
		{
			var messageArray = message.content.split(" ");
			if(message.member.hasPermission("MANAGE_MESSAGES"))
			{
				var mentionedUserId = 0;
				if(message.mentions.users.first())
				{
					mentionedUserId = message.mentions.users.first().id;
				}
				else
				{
					mentionedUserId = messageArray[1];
				}

				var targetMember = message.guild.members.cache.get(mentionedUserId);

				bannedFromRoles.bannedFromRoles.push(mentionedUserId);
				targetMember.roles.set([]);
				var edited_bannedFromRoles = JSON.stringify(bannedFromRoles);
				fs.writeFileSync(__dirname + '/bannedFromRoles.json', edited_bannedFromRoles);

				message.channel.send(`<@${mentionedUserId}> banned from roles`)

			}
			else
			{
				message.reply("Who do you think you are?");
			}
		}

		if(message.content.toLowerCase().startsWith(prefixes[n] + "unbanfromroles"))
		{
			var messageArray = message.content.split(" ");
			if(message.member.hasPermission("MANAGE_MESSAGES"))
			{
				var mentionedUserId = 0;
				if(message.mentions.users.first())
				{
					mentionedUserId = message.mentions.users.first().id;
				}
				else
				{
					mentionedUserId = messageArray[1];
				}

				var indexOfUser = bannedFromRoles.bannedFromRoles.indexOf(messageArray[1]);
				if(indexOfUser > 0)
				{
					bannedFromRoles.bannedFromRoles == bannedFromRoles.bannedFromRoles.splice(indexOfUser, 1);
				}
				var edited_bannedFromRoles = JSON.stringify(bannedFromRoles);
				fs.writeFileSync(__dirname + '/bannedFromRoles.json', edited_bannedFromRoles);

				message.channel.send(`<@${mentionedUserId}> unbanned from roles`)
			}
			else
			{
				message.reply("Who do you think you are?");
			}
		}
	}

	var prefix = false;
	for(const thisPrefix of prefixes)
	{
		if(message.content.startsWith(thisPrefix)) prefix = thisPrefix;
	}
	if(!prefix) return;

	var messageArray = message.content.split(" ");
	var cmd = messageArray[0];
	var args = messageArray.slice(1);

	var commandfile = bot.commands.get(cmd.slice(prefix.length));
	if(commandfile) commandfile.run(bot, message, args);
});

bot.on('messageUpdate', (oldMessage, newMessage) =>
{
	console.log("message updated");
	if(newMessage.author.id == 769105768539619329)
	{
		if(!oldMessage.content.includes("||") && newMessage.content.includes("||"))
		{
			if(newMessage.content.includes("||") && !newMessage.attachments.first())
			{
				newMessage.channel.send("", {
					embed: {
						fields: [
							{
								name: 'Un-Brodigered message',
								value: newMessage.content.split("|").join(""),
							}
						],
					}
				});
			}
			else if(newMessage.attachments.first())
			{
				if(newMessage.attachments.first().name.includes("SPOILER"))
				{
					newMessage.channel.send({
						embed: {
							fields: [
								{
									name: 'Un-Brodigered message',
									value: newMessage.content.split("|").join(""),
								}
							],
							image: {
								url: "attachment://unbrodigered.jpg"
							}
						},
						files: [{
							attachment: newMessage.attachments.first().url,
							name: "unbrodigered.jpg"
						}],
					});
				}
			}
		}
	}
});

bot.on('messageDelete', (newMessage) =>
{
	if(newMessage.author.id == 769105768539619329 || newMessage.author.id == 84919460380565504)
	{
		if(!newMessage.content.includes("||") && !newMessage.attachments.first())
		{
			newMessage.channel.send("", {
				embed: {
					fields: [
						{
							name: 'Un-Brodigered message',
							value: newMessage.content.split("|").join(""),
						}
					],
				}
			});
		}
		else if(newMessage.attachments.first())
		{
			if(!newMessage.attachments.first().name.includes("SPOILER"))
			{
				newMessage.channel.send({
					embed: {
						fields: [
							{
								name: 'Un-Brodigered message',
								value: newMessage.content.split("|").join(""),
							}
						],
						image: {
							url: "attachment://unbrodigered.jpg"
						}
					},
					files: [{
						attachment: newMessage.attachments.first().url,
						name: "unbrodigered.jpg"
					}],
				});
			}
		}
	}
});

bot.on('error', console.error)

bot.login(botconfig.token);

