const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: ["ozel", "kanal-gizle"],
    description: "Belirtilen kanalı @everyone'dan gizler.",
    category: "Ozel",
    options: [
        {
            name: "kanal",
            description: "Gizlenecek kanal. Boş bırakılırsa mevcut kanal.",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        },
        {
            name: "sebep",
            description: "Gizleme sebebi.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    permissions: {
        channel: [],
        bot: [PermissionFlagsBits.ManageChannels],
        user: [PermissionFlagsBits.ManageChannels],
    },
    settings: {
        isPremium: false,
        isPlayer: false,
        isOwner: false,
        inVoice: false,
        sameVoice: false,
    },
    run: async (interaction, client) => {
        await interaction.deferReply();

        const hedefKanal = interaction.options.getChannel("kanal") || interaction.channel;
        const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi.";

        await hedefKanal.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            ViewChannel: false,
        });

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("👻 Kanal Gizlendi")
                    .addFields(
                        { name: "Kanal", value: `${hedefKanal}`, inline: true },
                        { name: "Yetkili", value: `${interaction.user}`, inline: true },
                        { name: "Sebep", value: sebep }
                    )
                    .setTimestamp()
            ]
        });
    },
};
