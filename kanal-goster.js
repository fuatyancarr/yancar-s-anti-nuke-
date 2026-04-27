const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: ["ozel", "kanal-goster"],
    description: "Gizlenmiş bir kanalı @everyone'a tekrar görünür yapar.",
    category: "Ozel",
    options: [
        {
            name: "kanal",
            description: "Görünür yapılacak kanal. Boş bırakılırsa mevcut kanal.",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        },
        {
            name: "sebep",
            description: "Görünür yapma sebebi.",
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
            ViewChannel: null,
        });

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("👁️ Kanal Görünür Yapıldı")
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
