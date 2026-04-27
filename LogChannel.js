const { EmbedBuilder, ApplicationCommandOptionType, ChannelType } = require('discord.js');
const GuildSettings = require("../../Models/Antinuke")

module.exports = {
    name: ["antinuke", "channel"],
    description: "Antinuke log kanalını ayarlar.",
    category: "Antinuke",
    options: [
        {
            name: "kanal",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            description: "Log kanalı olarak ayarlanacak kanal.",
            required: true
        }
    ],
    permissions: {
        channel: [],
        bot: [],
        user: []
    },
    settings: {
        isPremium: false,
        isPlayer: false,
        isOwner: false,
        inVoice: false,
        sameVoice: false,
    },
    run: async (interaction, client, user, language) => {
        await interaction.deferReply();

        const ow = await GuildSettings.findOne({ guildId: interaction.guild.id });

        const isOwner = interaction.user.id === interaction.guild.ownerId;
        const isOwnerLevel = ow && ow.ownerLevel.includes(interaction.user.id);

        if (!isOwner && !isOwnerLevel) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("‼ Bu komut yalnızca sunucu sahibi ve ownerLevel erişimine sahip kullanıcılar içindir.")
                        .setColor(client.color),
                ],
            });
        }

        const guildId = interaction.guildId;
        const logChannel = interaction.options.getChannel('kanal');

        const guildSettings = await GuildSettings.findOne({ guildId: guildId });
        if (!guildSettings) {
            return interaction.editReply({
                content: 'Bu sunucuda antinuke aktif değil. Lütfen önce aktif et.',
                ephemeral: true,
            });
        }

        guildSettings.logChannel = logChannel.id;
        await guildSettings.save();

        interaction.editReply({ content: `Log kanalı <#${logChannel.id}> olarak ayarlandı.` });
    }
}
