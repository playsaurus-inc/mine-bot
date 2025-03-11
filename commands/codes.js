
            const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');

            module.exports = {
                data: new SlashCommandBuilder()
                .setName("codes")
                .setDescription("info about codes")
                .addBooleanOption(option => 
                    option.setName('ephemeral')
            .setDescription('By default the response is only shown to you. Set to False to share the response with others.')




                ),
            
                async execute(interaction)
                {
                    const {channel, options} = interaction;
                    var shared = options.getBoolean("ephemeral") == null ? true : options.getBoolean("ephemeral") ? true : false;
                    
                    await interaction.reply({content: "The devs create the codes.\nThe codes are given out randomly.\nPlease do not ask for any codes.\nNEVER ask the devs for any codes.\nLook in <#764279333262852138> for codes.\nThe codes expire after a certain amount of time.", ephemeral: shared })
                }
            }
        