const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
    name: ["ozel", "duyuru"],
    description: "Seçilen kanala özel embed duyuru gönderir.",
    category: "Ozel",
    options: [
        {
            name: "baslik",
            description: "Duyurunun başlığı.",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "icerik",
            description: "Duyurunun içeriği.",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "kanal",
            description: "Duyurunun gönderileceği kanal. Boş bırakılırsa mevcut kanal.",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: false,
        },
        {
            name: "ping",
            description: "Duyuruyla birlikte herkesi etiketle?",
            type: ApplicationCommandOptionType.Boolean,
            required: false,
        },
        {
            name: "resim",
            description: "Duyuruya eklenecek resim URL'si.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    permissions: {
        channel: [],
        bot: [PermissionFlagsBits.SendMessages],
        user: [PermissionFlagsBits.Administrator],
    },
    settings: {
        isPremium: false,
        isPlayer: false,
        isOwner: false,
        inVoice: false,
        sameVoice: false,
    },
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: true });

        const baslik = interaction.options.getString("baslik");
        const icerik = interaction.options.getString("icerik");
        const kanal = interaction.options.getChannel("kanal") || interaction.channel;
        const ping = interaction.options.getBoolean("ping") || false;
        const resim = interaction.options.getString("resim");

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`📢 ${baslik}`)
            .setDescription(icerik)
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()
            .setFooter({ text: `Duyuran: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        if (resim) {
            try { embed.setImage(resim); } catch {}
        }

        await kanal.send({
            content: ping ? "@everyone" : null,
            embeds: [embed],
            allowedMentions: ping ? { parse: ["everyone"] } : { parse: [] },
        });

        interaction.editReply({ content: `✅ Duyuru ${kanal} kanalına gönderildi.` });
    },
};
