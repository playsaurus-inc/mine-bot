const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weapons')
		.setDescription('info about weapons')
		.addBooleanOption((option) =>
			option
				.setName('ephemeral')
				.setDescription(
					'By default the response is only shown to you. Set to False to share the response with others.',
				),
		),

	async execute(interaction) {
		const { options } = interaction;
		var shared = options.getBoolean('ephemeral') ?? true;

		await interaction.reply({
			content:
				'Weapons can be obtained after you reach the Underground City at 304km. There are 12 weapons in total. You first start out with a fist. The rest of the weapons can be acquired in the following ways:\n\nA lot of the weapons like Rock, Sword or Big Bomb could be dropped from normal chests.\nPickaxes, Mallet, Bow and Arrow could also be acquired by killing monsters.\nHeal and Time Travel could be aquired by opening Golden Chests.\nHowever all weapons can also be recieved from the scientist mission - Unlock New Weapon.\n\nThe Heal and Time Travel weapons have special effects. The heal weapon heals you for a small amount HP and Time Travel allows all your cooldowns for your weapons to jump forward by a little bit.\n\nEach weapon does its own amount of damage and has its own cooldown timer at which it fills up. Both of which can be improved by upgrading your weapons. These will require various amounts of different gems and oil. To upgrade your weapon and to see their statistics, click the right most building ( the statue of a knight ) in the Underground City',
			ephemeral: shared,
		});
	},
};
