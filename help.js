const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const { readdirSync } = require("fs");

module.exports = {
    name: ["help"],
    description: "Mevcut tüm komutlar hakkında bilgi verir.",
    category: "Utility",
    options: [],
    permissions: {
        channel: [],
        bot: [],
        user: [],
    },
    settings: {
        isPremium: false,
        isOwner: false,
        inVoice: false,
        isNSFW: false,
    },
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });

        const categories = readdirSync("./commands/");

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`Lütfen aşağıdan bir kategori seç!`);

        const row = new ActionRowBuilder()
            .addComponents([
                new StringSelectMenuBuilder()
                    .setCustomId("help-category")
                    .setPlaceholder(`Kategori seç...`)
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setOptions(categories.map(category =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(category)
                            .setValue(category)
                    ))
            ]);

        interaction.editReply({ embeds: [embed], components: [row] }).then(async (msg) => {
            let filter = (i) => (i.isStringSelectMenu()) && i.user && i.message.author.id == client.user.id;
            let collector = await msg.createMessageComponentCollector({
                filter,
                time: 90000
            });

            collector.on('collect', async (m) => {
                if (m.isStringSelectMenu()) {
                    if (m.customId === "help-category") {
                        await m.deferUpdate();
                        let [directory] = m.values;

                        const embed = new EmbedBuilder()
                            .setAuthor({ name: `${interaction.guild.members.me.displayName} Yardım Menüsü`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                            .setDescription(`Bot ön eki: \`/\``)
                            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                            .setColor(client.color)
                            .addFields({ name: `❯  ${directory.toUpperCase()} [${client.slash.filter(c => c.category === directory).size}]`, value: `${client.slash.filter(c => c.category === directory).map(c => `\`${c.name.at(-1)}\``).join(", ")}`, inline: false })
                            .setFooter({ text: `© ${interaction.guild.members.me.displayName} | Toplam Komut: ${client.slash.size}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                        msg.edit({ embeds: [embed] });
                    }
                }
            });

            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    const timed = new EmbedBuilder()
                        .setDescription(`Yardım menüsü zaman aşımına uğradı. Tekrar kullanmak için /help yaz.`)
                        .setColor(client.color);

                    msg.edit({ embeds: [timed], components: [] });
                }
            });
        });
    },
};
