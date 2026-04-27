const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: ["moderasyon", "ac"],
    description: "Kilitli bir kanalın kilidini açar.",
    category: "Moderasyon",
    options: [
        {
            name: "kanal",
            description: "Kilidi açılacak kanal. Boş bırakılırsa mevcut kanalın kilidi açılır.",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        },
        {
            name: "sebep",
            description: "Kilit açma sebebi.",
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
            SendMessages: null,
        });

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("🔓 Kanal Kilidi Açıldı")
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
                        .setColor("Green")
                        .setDescription(`🔓 Bu kanalın kilidi **${interaction.user.tag}** tarafından açıldı.`)
                ]
            }).catch(() => {});
        }
    },
};
