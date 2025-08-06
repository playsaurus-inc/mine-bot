const util = require('util');
const request = require('request');
const atob = require('atob');
const { token, clientId, guildId } = require(__dirname + "/botconfig.json");
const { REST, Routes, Client, Collection, Events, GatewayIntentBits, Partials, PermissionFlagsBits, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require('path');
const JSONbig = require('json-bigint')({ useNativeBigInt: true });;
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel],
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: true
    }
});
var messageText;
var userMessageHistory = {};
var channelsPosttedIn = []; //should refactor to be a part of user message history



bot.commands = new Collection();
// Grab all the command files from the commands directory you created earlier
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        bot.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();

var JSONsaves;
var JSONBannedsaves;
var bannedFromRoles;

setInterval(function () {
    log("writing to files");
    fs.writeFileSync(__dirname + '/saves.json', JSON.stringify(JSONsaves));
    fs.writeFileSync(__dirname + '/bannedSaves.json', JSON.stringify(JSONBannedsaves));
}, 1000 * 60 * 5)


fs.readFile(__dirname + '/saves.json', (err, data) => {
    if (err) throw err;
    JSONsaves = JSON.parse(data);
});

fs.readFile(__dirname + '/bannedSaves.json', (err, data) => {
    if (err) throw err;
    JSONBannedsaves = JSON.parse(data);
});

fs.readFile(__dirname + '/bannedFromRoles.json', (err, data) => {
    if (err) throw err;
    bannedFromRoles = JSON.parse(data);
});

bot.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

function log(log) {
    var time = new Date();
    console.log("[" + (time.getHours() % 12) + ":" + time.getMinutes() + ":" + time.getSeconds() + "] " + log);
}

function getRoles() {
    return new Promise((res, rej) => {
        res(bot.guilds.cache.get(guildId).roles);
    });
}

function getGuildMember(userID) {
    return new Promise((res, rej) => {
        res(bot.guilds.cache.get(guildId).members.fetch(userID));
    });
}

function getNumberOfRoles(userID) {
    return new Promise((res, rej) => {
        res(getGuildMember(userID)
            .then((member) => {
                var numRoles = member.roles.cache
                    .map((role) => role.toString());
                return numRoles.length;
            }));
    });
}

function setRole(depth, message) {

    let userID = message.author.id;

    if (bannedFromRoles.bannedFromRoles.includes(userID)) return;
    getGuildMember(userID)
        .then(guildMember => {
            var { cache } = guildMember.guild.roles;
            var rollAdded = false;
            log("adding role")

            if (depth < 304) {
                guildMember.roles.add("776582359423778818");
                rollAdded = true;
            }
            else if (depth >= 304 && depth < 500) {
                guildMember.roles.add("776583199711035483");
                rollAdded = true;
            }
            else if (depth >= 500 && depth < 1000) {
                guildMember.roles.add("776630529461190707");
                rollAdded = true;
            }
            else if (depth >= 1000 && depth < 1132) {
                guildMember.roles.add("795776541900275772");
                rollAdded = true;
            }
            else if (depth >= 1132 && depth < 1814) {
                guildMember.roles.add("822975154128814081");
                rollAdded = true;
            }
            else if (depth >= 1814) {
                guildMember.roles.add("922178836383285259");
                rollAdded = true;
            }

            if (rollAdded) {
                message.reply("You have been assigned a role on the Mr. Mine Discord. Post a message in chat to see it.");
                log("added role");
            }

        }).catch(console.error);
}

function decodeSave(data) {
    return atob(atob(data.split("|")[1])).split("|");
}

function checkSave(save, data, message) {
    log("checking save");
    var depth = save[1];
    var timeplayed = save[81] / 60;
    var gameUID = save[3];
    var userBanned = false;
    var tickets = save[115];
    var targetMember = bot.guilds.cache.get(guildId).members.cache.get(message.author.id);

    for (var i = 0; i < JSONsaves['saves'].length; i++) {
        if (JSONsaves['saves'][i].gameUID && !isNaN(gameUID)) {
            if (!userBanned && (JSONsaves['saves'][i].gameUID == gameUID && JSONsaves['saves'][i].userID != message.author.id) || tickets > 20000) {
                userBanned = true;
                message.reply("Your save was determined to be illegitimate either because you cheated or used a different users save. You will no longer be eligible for ranks on the server.");

                if (targetMember) {
                    targetMember.roles.set([]);
                }
                break;
            }
        }
    }

    if (!userBanned && !bannedFromRoles.bannedFromRoles.includes(message.author.id)) {
        JSONsaves['saves'].push({ "userID": message.author.id, "depth": depth, "timeplayed": Math.round(timeplayed), "gameUID": gameUID, "save": data });
    }
    else if (!bannedFromRoles.bannedFromRoles.includes(message.author.id)) {
        bannedFromRoles.bannedFromRoles.push(message.author.id);
        var edited_bannedFromRoles = JSON.stringify(bannedFromRoles);
        fs.writeFileSync(__dirname + '/bannedFromRoles.json', edited_bannedFromRoles);

        JSONBannedsaves['saves'].push({ "userID": message.author.id, "depth": depth, "timeplayed": Math.round(timeplayed), "gameUID": gameUID, "userBanned": userBanned, "save": data });
    }

    setRole(depth, message);
}

bot.once(Events.ClientReady, c => {
    log(`${c.user.username} is online!`);
});


bot.on(Events.MessageCreate, message => {
    if (message.author.bot) return;
    var memberJoinTime;

    if (message.member) {
        memberJoinTime = message.member.joinedTimestamp;
    };

    var currentTime = Date.now();

    var questionStarters = ["what", "any idea", "why", "whats"]


    for (var i = 0; i < questionStarters.length; i++) {
        let lowercaseMessage = message.content.toLowerCase();

        if (lowercaseMessage.includes(questionStarters[i]) && (lowercaseMessage.includes("red star") || lowercaseMessage.includes("red name"))) {
            message.reply({ content: "The red names are the names of players who chose to support the game by buying 650 tickets or 1400 tickets at one time." })
            break;
        }
        if (lowercaseMessage.includes(questionStarters[i]) && (lowercaseMessage.includes("mime") || lowercaseMessage.includes("112"))) {
            message.reply({ content: "That's Mr. Mime, he's just vibin. He doesn't do anything." })
            break;
        }
        if ((lowercaseMessage.includes("any") || lowercaseMessage.includes("give me") || lowercaseMessage.includes("are there")) && lowercaseMessage.includes("code")) {
            message.reply({ content: "The devs randomly create the codes and they typically expire after a few days or uses.\nIf the latest ones in <#764279333262852138> don't work it's unlikely there is any available.\nPlease do not ask for any codes and NEVER ask the devs for codes." });
            return;
        }
    }

    //DM REQUESTING SAVE CODE
    if (message.channel.isDMBased()) {
        if (bannedFromRoles.bannedFromRoles.includes(message.author.id)) {
            message.reply("Your save was determined to be illegitimate either because you cheated or used a different users save. You will no longer be eligible for ranks on the server.");
        }
        else {
            log("received DM");
            if (message.attachments.first()) {
                if (message.attachments.first().name === `message.txt`) {
                    request.get(message.attachments.first().url)
                        .on('error', console.error)
                        .pipe(fs.createWriteStream(__dirname + '/message.txt'))
                        .on('finish', function () {
                            fs.readFile(__dirname + '/message.txt', "utf8", (err, data) => {
                                var save = "";

                                if (data.includes("|")) {
                                    var save = decodeSave(data);
                                }

                                if (save.length < 450) {
                                    message.reply("Your save is missing data, please make sure to paste all of the text. It's okay if Discord asks you to convert it to a file.\nIf you sent me your save by clicking on my name on the right pannel and pasting the text in the little box, Discord automatically cuts the text to 500 characters. So please send it from the actual DM page.")
                                }
                                else {
                                    checkSave(save, data, message);
                                }
                            })
                        })

                }
            }
            else if (message.content.length > 200 && message.content.includes("|") && !message.content.includes(" ")) {
                var save = decodeSave(message.content);

                if (save.length < 450) {
                    message.reply("Your save is missing data, please make sure to paste all of the text. It's okay if Discord asks you to convert it to a file.\nIf you sent me your save by clicking on my name on the right pannel and pasting the text in the little box, Discord automatically cuts the text to 500 characters. So please send it from this DM actual DM page.")
                }
                else {
                    checkSave(save, data, message);
                }
            }
            else {
                log(message.content);
            }
        }
    }

    if (message.channel.id == 761441663397789696 && !message.content.toLowerCase().startsWith("report:")) {
        log(message.content);
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            message.delete();
            message.member.send({ content: "Hey, it appears you posted in the bug reports channel with out the proper format. If your message was a bug report, please edit it to include \"report:\" and resend it to the bug reports channel, thanks! \n\n Message Copy: " + message.content })
                .then(console.log)
                .catch(console.error);

            message.channel.send({ content: "Please only use this channel for bug reports. All messages should start with \"Report:\". Discussions should be had in <#760967463684276278>. If you have more information you want to add, please edit your report with more details. If your message was a report, a copy of it has been sent to your DM's." })
                .then(console.log)
                .catch(console.error);
        }
    }


    if (message.channel.id == 761441702753206273) {
        if (!message.content.toLowerCase().startsWith("idea:") && !message.content.toLowerCase().startsWith("suggestion:")) {
            log(message.content);
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                message.delete();
                message.member.send({ content: "Hey, it appears you posted in the ideas and suggestions channel with out the proper format. If your message was an idea, please edit it to include \"idea:\" and resend it to the ideas channel, thanks! \n\n Message Copy:" + message.content })
                    .then(console.log)
                    .catch(console.error);

                message.channel.send({ content: "Please only use this channel for ideas and suggestions. All messages should start with \"Idea:\". Discussions should be had in <#760967463684276278>. If you have more information you want to add, please edit your idea with more details." })
                    .then(console.log)
                    .catch(console.error);
            }
        }
        else {
            message.react('👍');
            message.react('👎');
        }
    }

    //Auto mod stuff

    // Enhanced scam detection with gaming-aware patterns
    if (!message.channel.isDMBased() && message.guild.id == guildId && !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        var lowercaseMessage = message.content.toLowerCase();
        var auditChannel = message.guild.channels.cache.find(channel => channel.name === "audit-log");
        
        // Built-in scam patterns
        var builtInPatterns = [
            {
                trigger: ["telegram"],
                suspicious: ["earn", "profit", "teach", "show you", "pay me", "interested people", "drop a message", "get started", "within", "hours", "days"],
                minSuspicious: 2,
                reason: "telegram financial scam",
                action: "timeout"
            },
            {
                trigger: ["verify", "scan"],
                suspicious: ["account", "qr code", "qr-code", "steam", "link your", "connect your", "click here", "visit"],
                minSuspicious: 1,
                reason: "account verification scam",
                action: "timeout"
            },
            {
                trigger: ["pay me", "send me"],
                suspicious: ["when you", "after you", "receive", "teach", "show", "method", "strategy"],
                minSuspicious: 1,
                reason: "payment request scam",
                action: "timeout"
            },
            {
                trigger: ["giveaway", "free nitro"],
                suspicious: ["telegram", "scan", "verify", "qr", "dm me", "message me", "click", "visit"],
                minSuspicious: 1,
                reason: "giveaway verification scam",
                action: "timeout"
            },
            {
                trigger: ["teach you", "show you", "i'll teach"],
                suspicious: ["telegram", "message me", "dm me", "interested people", "pay me", "percentage", "%"],
                minSuspicious: 1,
                reason: "mentoring scam",
                action: "timeout"
            }
        ];

        // Check each pattern
        for (let pattern of builtInPatterns) {
            let hasTrigger = pattern.trigger.some(word => lowercaseMessage.includes(word));
            if (hasTrigger) {
                let suspiciousCount = pattern.suspicious.filter(word => lowercaseMessage.includes(word)).length;
                
                if (suspiciousCount >= pattern.minSuspicious) {
                    console.log(`Scam detected: ${pattern.reason}, triggers: ${pattern.trigger}, suspicious: ${suspiciousCount}`);
                    message.delete();
                    
                    if (pattern.action === "ban") {
                        message.member.ban({ days: 7, reason: pattern.reason })
                            .then(console.log)
                            .catch(console.error);
                        
                        message.member.send(`You have been banned from the Mr. Mine Discord for ${pattern.reason}.`)
                            .then(console.log)
                            .catch(console.error);
                            
                        auditChannel.send({ content: `Banned <@${message.member.id}> for ${pattern.reason}. Message: \`\`\`${message.content}\`\`\`` });
                    } else {
                        // 24 hour timeout
                        message.member.timeout(24 * 60 * 60 * 1000, pattern.reason)
                            .then(console.log)
                            .catch(console.error);

                        message.member.send(`You have been timed out for 24 hours from the Mr. Mine Discord for possible ${pattern.reason}. Contact a moderator if you believe this was a mistake.`)
                            .then(console.log)
                            .catch(console.error);

                        auditChannel.send({ content: `Timed out <@${message.member.id}> for possible ${pattern.reason}. Message: \`\`\`${message.content}\`\`\`` });
                    }
                    break;
                }
            }
        }
    }

    if (message.content.includes("Checkout this game I am playing https://play.google.com")) {
        message.delete();
    }


    if (!message.channel.isDMBased()) {
        if (message.guild.id == guildId) {
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                getNumberOfRoles(message.author.id)
                    .then((numRoles) => {
                        var lowercaseMessage = message.content.toLowerCase();
                        if ((lowercaseMessage.includes("@everyone") || lowercaseMessage.includes("free") || lowercaseMessage.includes("steam") || lowercaseMessage.includes("airdrop")) && (lowercaseMessage.includes("nitro") || lowercaseMessage.includes("nltro")) && (message.embeds.length > 0 || lowercaseMessage.includes("https:/"))) {
                            console.log(message.content);
                            var auditChannel = message.guild.channels.cache.find(channel => channel.name === "audit-log");
                            message.delete();
                            message.member.ban({ days: 7, reason: 'posting nitro scam' })
                                .then(console.log)
                                .catch(console.error);

                            auditChannel.send({ content: `Banned <@${message.member.id}> for posting nitro scam. Message content: \`\`\`${message.content}\`\`\`` })
                        }
                    });
            }


            if (message.content.toLowerCase().includes("discord.gg")) {
                var auditChannel = message.guild.channels.cache.find(channel => channel.name === "audit-log");
                if (memberJoinTime > currentTime - 43200000) {
                    message.delete();
                    log("Link posted by " + message.author.username);
                    message.member.send("Do not post links to other Discord Servers")
                        .then(console.log)
                        .catch(console.error);

                    auditChannel.send({ content: `Warned <@${message.member.id}> for posting links to a different Discord server.` })
                }
            }

            if (memberJoinTime > currentTime - 43200000) {
                var autoBanWords = ["nigger", "nigga", "jew", "n1gger", "n!gger"];
                var auditChannel = message.guild.channels.cache.find(channel => channel.name === "audit-log");

                for (i = 0; i < autoBanWords.length; i++) {
                    if (message.content.toLowerCase().includes(autoBanWords[i])) {
                        message.delete();

                        message.member.send("You have been banned from the Mr. Mine Discord for posting racist comments.")
                            .then(console.log)
                            .catch(console.error);

                        message.member.ban({ days: 7, reason: 'Posted racist comments' })
                            .then(console.log)
                            .catch(console.error);


                        auditChannel.send({ content: `Banned <@${message.member.id}> for posting racist comments.` })
                    }
                }

                if (userMessageHistory[message.author.id]) {
                    userMessageHistory[message.author.id].push(currentTime);

                    if (userMessageHistory[message.author.id].length > 6) {
                        userMessageHistory[message.author.id] = userMessageHistory[message.author.id].slice(-6);

                        if (userMessageHistory[message.author.id][0] - userMessageHistory[message.author.id][5] > -8000) {
                            if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
                            var auditChannel = message.guild.channels.cache.find(channel => channel.name === "audit-log");
                            
                            // Delete recent messages from this user in this channel (message frequency spam)
                            message.channel.messages.fetch({ limit: 20 })
                                .then(messages => {
                                    const userMessages = messages.filter(msg => 
                                        msg.author.id === message.author.id && 
                                        msg.createdTimestamp > Date.now() - 30000 // Last 30 seconds
                                    );
                                    message.channel.bulkDelete(userMessages).catch(console.error);
                                })
                                .catch(console.error);

                            message.member.send("You have been banned for spamming")
                                .then(console.log)
                                .catch(console.error);

                            message.member.ban({ days: 7, reason: 'spamming' })
                                .then(console.log)
                                .catch(console.error);

                            auditChannel.send({ content: `Banned <@${message.member.id}> for spamming (posting 6 messages within 8 seconds)` })
                        }
                    }
                }
                else {
                    userMessageHistory[message.author.id] = [currentTime];
                }
            }

            var channel = message.channel.id;
            if (channelsPosttedIn[message.author.id]) {
                let user = channelsPosttedIn[message.author.id];
                let keys = Object.keys(user);

                user[channel] = currentTime;

                if (keys.length > 3) {
                    delete user[keys[0]];
                    keys = Object.keys(user);
                }

                let messageHistory = [];
                keys.forEach(key => messageHistory.push(user[key]));
                var sortedHistory = messageHistory.sort((a, b) => a - b);
                console.log(sortedHistory);

                if (sortedHistory[0] - sortedHistory[3] > -10000) {
                    console.log("posting too fast");

                    if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

                    var auditChannel = message.guild.channels.cache.find(channel => channel.name === "audit-log");
                    
                    // Delete recent messages from this user across multiple channels (channel hopping spam)
                    const guild = message.guild;
                    const channels = Object.keys(channelsPosttedIn[message.author.id]);
                    
                    channels.forEach(channelId => {
                        const channel = guild.channels.cache.get(channelId);
                        if (channel) {
                            channel.messages.fetch({ limit: 20 })
                                .then(messages => {
                                    const userMessages = messages.filter(msg => 
                                        msg.author.id === message.author.id && 
                                        msg.createdTimestamp > Date.now() - 15000 // Last 15 seconds
                                    );
                                    channel.bulkDelete(userMessages).catch(console.error);
                                })
                                .catch(console.error);
                        }
                    });

                    message.member.send("You have been banned for spamming")
                        .then(console.log)
                        .catch(console.error);

                    message.member.ban({ days: 7, reason: 'spamming' })
                        .then(console.log)
                        .catch(console.error);

                    auditChannel.send({ content: `Banned <@${message.member.id}> for spamming (posting to 4 different channels within 10 seconds). Message content: \`\`\`${message.content}\`\`\`` })
                }
            }
            else {
                channelsPosttedIn[message.author.id] = { [channel]: currentTime };
            }
        }
    }
});


bot.on('error', console.error)

bot.login(token);

