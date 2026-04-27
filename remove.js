const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const Premium = require("../../Models/Premium");

module.exports = {
    name: ["premium", "remove"],
    description: "Bir kullanıcının premium üyeliğini kaldırır.",
    category: "Premium",
    options: [
        {
            name: "kullanici",
            description: "Premiumu kaldırılacak kullanıcı.",
            required: true,
            type: ApplicationCommandOptionType.User,
        }
    ],
    permissions: { channel: [], bot: [], user: [] },
    settings: { isPremium: false, isOwner: true, inVoice: false, isNSFW: false },

    run: async (interaction, client) => {
        await interaction.deferReply();

        const target = interaction.options.getUser("kullanici");

        const updated = await Premium.findOneAndUpdate(
            { Id: target.id, isPremium: true },
            {
                $set: {
                    isPremium: false,
                    'premium.redeemedBy': [],
                    'premium.redeemedAt': null,
                    'premium.expiresAt': null,
                    'premium.plan': null,
                }
            },
            { new: true }
        ).catch(() => null);

        if (!updated) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`Bu kullanıcının premium üyeliği yok.`)]
            });
        }

        client.premiums.delete(target.id);

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({ name: `Premium Kaldırıldı`, iconURL: client.user.displayAvatarURL() })
            .setDescription(`• *Kullanıcı*: ${target}\n• *Durum*: \`Premium üyeliği kaldırıldı\``)
            .setTimestamp()
            .setFooter({ text: `İşlemi yapan: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        return interaction.editReply({ embeds: [embed] });
    },
};
