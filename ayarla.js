const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const Verify = require("../../Models/Verify");

module.exports = {
    name: ["verify", "ayarla"],
    description: "Verify sistemini kurar. Doğrulama mesajını seçilen kanala gönderir.",
    category: "Verify",
    options: [
        {
            name: "rol",
            description: "Doğrulanan kullanıcılara verilecek rol.",
            type: ApplicationCommandOptionType.Role,
            required: true,
        },
        {
            name: "kanal",
            description: "Verify mesajının gönderileceği kanal.",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: true,
        },
        {
            name: "log-kanal",
            description: "Doğrulama loglarının gönderileceği kanal.",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: false,
        },
    ],
    permissions: {
        channel: [],
        bot: [PermissionFlagsBits.ManageRoles],
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

        const rol = interaction.options.getRole("rol");
        const kanal = interaction.options.getChannel("kanal");
        const logKanal = interaction.options.getChannel("log-kanal");

        if (rol.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.editReply({
                content: "Bu rol botun en yüksek rolünden yüksek veya eşit. Lütfen daha düşük bir rol seç.",
            });
        }

        let verifyData = await Verify.findOne({ guildId: interaction.guild.id });

        if (verifyData && verifyData.messageId) {
            const eskiKanal = interaction.guild.channels.cache.get(verifyData.channelId);
            if (eskiKanal) {
                const eskiMesaj = await eskiKanal.messages.fetch(verifyData.messageId).catch(() => null);
                if (eskiMesaj) await eskiMesaj.delete().catch(() => {});
            }
        }

        const verifyEmbed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle("✅ Sunucu Doğrulama")
            .setDescription("Sunucuya erişim sağlamak için aşağıdaki butona tıklayarak kendini doğrula.")
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        const buton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("verify-button")
                .setLabel("✅ Doğrula")
                .setStyle(ButtonStyle.Success)
        );

        const mesaj = await kanal.send({ embeds: [verifyEmbed], components: [buton] });

        if (!verifyData) {
            verifyData = new Verify({ guildId: interaction.guild.id });
        }

        verifyData.roleId = rol.id;
        verifyData.channelId = kanal.id;
        verifyData.logChannelId = logKanal ? logKanal.id : null;
        verifyData.messageId = mesaj.id;
        await verifyData.save();

        interaction.editReply({
            content: `✅ Verify sistemi başarıyla kuruldu!\n📌 Kanal: ${kanal}\n🎭 Rol: ${rol}${logKanal ? `\n📋 Log Kanalı: ${logKanal}` : ""}`,
        });
    },
};
