const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

    let botmessage = args.join(" ");
    if(!args[0]) return message.channel.send("Nothing is impossible");
    message.channel.send(botmessage + " is impossible and we're all going to die");

}

module.exports.help = {
    name: "impossible"
}