
            const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');

            module.exports = {
                data: new SlashCommandBuilder()
                .setName("golem")
                .setDescription("info about the golem")
                .addBooleanOption(option => 
                    option.setName('ephemeral')
            .setDescription('By default the response is only shown to you. Set to False to share the response with others.')




                ),
            
                async execute(interaction)
                {
                    const {channel, options} = interaction;
                    var shared = options.getBoolean("ephemeral") == null ? true : options.getBoolean("ephemeral") ? true : false;
                    
                    await interaction.reply({content: "The Golem can be found at ||50Km||, he ||lives in a cave to the left|| and sells blueprints.", ephemeral: shared })
                }
            }
        