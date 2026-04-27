const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const GuildSettings = require("../../Models/Antinuke")

module.exports = {
    name: ["antinuke", "settings"],
    description: "Sunucunun antinuke ayarlarını gösterir.",
    category: "Antinuke",
    options: [],
    permissions: {
        channel: [],
        bot: [],
        user: ["Administrator"]
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

        const data = await GuildSettings.findOne({ guildId: interaction.guild.id });
        if (!data) {
            interaction.editReply({ content: `Veri bulunamadı.`, ephemeral: true });
        } else {
            const emoji = { true: "✔️", false: "❌" }

            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`🚩 Antinuke Ayarları`)
                        .setDescription([
                            `**Anti Rol:** ${emoji[data.enabled.roles]}`,
                            `**Anti Kanal:** ${emoji[data.enabled.channels]}`,
                            `**Anti Webhook:** ${emoji[data.enabled.webhooks]}`,
                            `**Anti Ban:** ${emoji[data.enabled.bans]}`,
                            `**Anti Kick:** ${emoji[data.enabled.kicks]}`,
                            `**Anti Bot Ekleme:** ${emoji[data.enabled.antibot]}`,
                            `**Anti Sunucu Güncelleme:** ${emoji[data.enabled.guildUpdate]}`,
                            `**Anti Everyone / Here:** ${emoji[data.enabled.everyone ?? false]}`,
                        ].join("\n"))
                        .addFields({ name: "📋 Log Kanalı", value: data.logChannel ? `<#${data.logChannel}>` : "Ayarlanmamış" })
                        .setColor(client.color)
                        .setTimestamp()
                ]
            });
        }
    }
}
