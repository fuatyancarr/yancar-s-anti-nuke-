const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: ["moderasyon", "kilit"],
    description: "Belirtilen kanalı kilitler (mesaj gönderilemez).",
    category: "Moderasyon",
    options: [
        {
            name: "kanal",
            description: "Kilitlenecek kanal. Boş bırakılırsa mevcut kanal kilitlenir.",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        },
        {
            name: "sebep",
            description: "Kilitleme sebebi.",
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
            SendMessages: false,
        });

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("🔒 Kanal Kilitlendi")
                    .addFields(
                        { name: "Kanal", value: `${hedefKanal}`, inline: true },
                        { name: "Yetkili", value: `${interaction.user}`, inline: true },
                        { name: "Sebep", value: sebep }
                    )
                    .setTimestamp()
            ],
        });

        if (hedefKanal.id !== interaction.channel.id) {
            hedefKanal.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription(`🔒 Bu kanal **${interaction.user.tag}** tarafından kilitlendi. Sebep: ${sebep}`)
                ]
            }).catch(() => {});
        }
    },
};
