const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits, ChannelType } = require("discord.js");
const Hosgeldin = require("../../Models/Hosgeldin");

module.exports = {
    name: ["ozel", "hosgeldin"],
    description: "Hoşgeldin mesajı sistemini kurar. (Premium özellik)",
    category: "Ozel",
    options: [
        {
            name: "islem",
            description: "Hoşgeldin sistemini kur, test et veya kapat.",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "Kur / Güncelle", value: "kur" },
                { name: "Test Mesajı Gönder", value: "test" },
                { name: "Kapat", value: "kapat" },
            ],
        },
        {
            name: "kanal",
            description: "Hoşgeldin mesajının gönderileceği kanal.",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: false,
        },
        {
            name: "mesaj",
            description: "Hoşgeldin mesajı. {kullanici} = mention, {sunucu} = sunucu adı, {uye_sayisi} = üye sayısı",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    permissions: {
        channel: [],
        bot: [],
        user: [PermissionFlagsBits.Administrator],
    },
    settings: {
        isPremium: true,
        isPlayer: false,
        isOwner: false,
        inVoice: false,
        sameVoice: false,
    },
    run: async (interaction, client) => {
        await interaction.deferReply();

        const islem = interaction.options.getString("islem");
        const kanal = interaction.options.getChannel("kanal");
        const mesaj = interaction.options.getString("mesaj");

        let kayit = await Hosgeldin.findOne({ guildId: interaction.guild.id });

        if (islem === "kapat") {
            if (!kayit || !kayit.aktif) {
                return interaction.editReply({ embeds: [new EmbedBuilder().setColor("Red").setDescription("Hoşgeldin sistemi zaten kapalı.")] });
            }
            kayit.aktif = false;
            await kayit.save();
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor(client.color).setTitle("👋 Hoşgeldin Sistemi Kapatıldı").setTimestamp()]
            });
        }

        if (islem === "test") {
            if (!kayit || !kayit.kanalId) {
                return interaction.editReply({ embeds: [new EmbedBuilder().setColor("Red").setDescription("Önce hoşgeldin sistemini kur!")] });
            }
            const testKanal = interaction.guild.channels.cache.get(kayit.kanalId);
            if (!testKanal) return interaction.editReply({ embeds: [new EmbedBuilder().setColor("Red").setDescription("Hoşgeldin kanalı bulunamadı.")] });

            const testMesaj = kayit.mesaj
                .replace("{kullanici}", interaction.user.toString())
                .replace("{sunucu}", interaction.guild.name)
                .replace("{uye_sayisi}", interaction.guild.memberCount);

            await testKanal.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(kayit.embedRenk || client.color)
                        .setTitle("👋 Hoşgeldiniz!")
                        .setDescription(testMesaj)
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `${interaction.guild.name} • Test mesajı`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                        .setTimestamp()
                ]
            });
            return interaction.editReply({ content: "✅ Test mesajı gönderildi!" });
        }

        if (!kanal) {
            return interaction.editReply({ embeds: [new EmbedBuilder().setColor("Red").setDescription("Lütfen bir kanal seç!")] });
        }

        if (!kayit) kayit = new Hosgeldin({ guildId: interaction.guild.id });
        kayit.kanalId = kanal.id;
        if (mesaj) kayit.mesaj = mesaj;
        kayit.aktif = true;
        await kayit.save();

        const ornekMesaj = kayit.mesaj
            .replace("{kullanici}", interaction.user.toString())
            .replace("{sunucu}", interaction.guild.name)
            .replace("{uye_sayisi}", interaction.guild.memberCount);

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("✅ Hoşgeldin Sistemi Kuruldu")
                    .addFields(
                        { name: "📌 Kanal", value: `${kanal}`, inline: true },
                        { name: "📝 Mesaj Önizlemesi", value: ornekMesaj, inline: false }
                    )
                    .setFooter({ text: "Değişkenler: {kullanici} {sunucu} {uye_sayisi}" })
                    .setTimestamp()
            ]
        });
    },
};
