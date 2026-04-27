const { EmbedBuilder, ApplicationCommandOptionType, ChannelType, PermissionFlagsBits } = require("discord.js");
const GuildSettings = require("../../Models/Antinuke");
const Snapshot = require("../../Models/Snapshot");

async function sunucuSnapshotAl(guild) {
    await guild.roles.fetch();
    await guild.channels.fetch();
    await guild.members.fetchMe();

    const roller = guild.roles.cache
        .filter(r => r.id !== guild.id)
        .map(r => ({
            id: r.id,
            name: r.name,
            color: r.color,
            permissions: r.permissions.bitfield.toString(),
            position: r.position,
            hoist: r.hoist,
            mentionable: r.mentionable,
            managed: r.managed,
        }));

    const kanallar = Array.from(guild.channels.cache.values()).map(c => {
        const base = {
            id: c.id,
            name: c.name,
            channelType: c.type,
            position: c.rawPosition,
            parentId: c.parentId || null,
            permissionOverwrites: Array.from((c.permissionOverwrites?.cache?.values() || [])).map(o => ({
                id: o.id,
                channelType: o.type,
                allow: o.allow.bitfield.toString(),
                deny: o.deny.bitfield.toString(),
            })),
        };
        if (c.isTextBased && c.isTextBased()) {
            base.topic = c.topic || null;
            base.nsfw = c.nsfw || false;
            base.rateLimitPerUser = c.rateLimitPerUser || 0;
        }
        if (c.type === 2 || c.type === 13) {
            base.bitrate = c.bitrate || 64000;
            base.userLimit = c.userLimit || 0;
        }
        return base;
    });

    return { roller, kanallar };
}

module.exports = {
    name: ["antinuke", "kur"],
    description: "Antinuke sistemini tek seferde kurar, tüm kategorileri aktif eder ve sunucu şablonunu kaydeder.",
    category: "Antinuke",
    options: [
        {
            name: "log-kanal",
            description: "Antinuke olaylarının bildirileceği log kanalı.",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: true,
        },
    ],
    permissions: {
        channel: [],
        bot: [],
        user: [],
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

        if (interaction.user.id !== interaction.guild.ownerId) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor("Red").setDescription("Bu komut yalnızca sunucu sahibi tarafından kullanılabilir.")],
            });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor("Red").setDescription("⚠️ Botun **Yönetici** yetkisi olmadan antinuke düzgün çalışamaz. Lütfen bota Yönetici yetkisi ver.")],
            });
        }

        const logKanal = interaction.options.getChannel("log-kanal");

        await interaction.editReply({
            embeds: [new EmbedBuilder().setColor("Yellow").setDescription("⏳ Ayarlar kaydediliyor...")],
        });

        let settings = await GuildSettings.findOne({ guildId: interaction.guild.id });
        if (!settings) settings = new GuildSettings({ guildId: interaction.guild.id });

        settings.logChannel = logKanal.id;
        settings.enabled.roles = true;
        settings.enabled.channels = true;
        settings.enabled.webhooks = true;
        settings.enabled.kicks = true;
        settings.enabled.bans = true;
        settings.enabled.antibot = true;
        settings.enabled.guildUpdate = true;
        settings.enabled.everyone = true;
        await settings.save();

        await interaction.editReply({
            embeds: [new EmbedBuilder().setColor("Yellow").setDescription("📸 Sunucu şablonu kaydediliyor, lütfen bekle...")],
        });

        const { roller, kanallar } = await sunucuSnapshotAl(interaction.guild);

        let snapshot = await Snapshot.findOne({ guildId: interaction.guild.id });
        if (!snapshot) snapshot = new Snapshot({ guildId: interaction.guild.id });
        snapshot.roles = roller;
        snapshot.channels = kanallar;
        snapshot.updatedAt = new Date();
        await snapshot.save();

        await interaction.editReply({
            embeds: [new EmbedBuilder().setColor("Green").setDescription(`✅ Şablon kaydedildi! **${roller.length}** rol ve **${kanallar.length}** kanal hafızaya alındı.\n\n⏳ Koruma sistemi hazırlanıyor...`)],
        });

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Anti-Nuke Sistemi Kuruldu")
            .addFields(
                { name: "📋 Log Kanalı", value: `${logKanal}`, inline: true },
                { name: "🛡️ Aktif Kategoriler", value: "Hepsi ✔️", inline: true },
                { name: "📸 Sunucu Şablonu", value: `**${roller.length}** rol, **${kanallar.length}** kanal kaydedildi.`, inline: false },
                {
                    name: "🔒 Korunan Olaylar",
                    value: [
                        "✔️ Rol oluştur/sil/güncelle",
                        "✔️ Kanal oluştur/sil/güncelle",
                        "✔️ Webhook oluştur/sil/güncelle",
                        "✔️ Üye at/yasakla",
                        "✔️ Yetkisiz bot ekleme",
                        "✔️ Sunucu adı/ikonu değiştirme",
                        "✔️ @everyone / @here ping",
                    ].join("\n"),
                    inline: false,
                }
            )
            .setFooter({ text: "Şablonu güncellemek için komutu tekrar çalıştırabilirsin." })
            .setTimestamp();

        interaction.editReply({ embeds: [embed] });
    },
};
