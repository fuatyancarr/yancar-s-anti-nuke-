const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const GuildSettings = require("../../Models/Antinuke");

module.exports = {
  name: ["antinuke", "disable"],
  description: "Sunucu için belirli bir antinuke kategorisini devre dışı bırakır.",
  category: "Antinuke",
  options: [
    {
      name: "kategori",
      type: ApplicationCommandOptionType.String,
      required: true,
      description: "Devre dışı bırakılacak antinuke kategorisi.",
      choices: [
        {
          name: "Hepsini Kapat",
          value: "all",
        },
        {
          name: "Anti Rol",
          value: "roles",
        },
        {
          name: "Anti Kanal",
          value: "channels",
        },
        {
          name: "Anti Webhook",
          value: "webhooks",
        },
        {
          name: "Anti Bot Ekleme",
          value: "antibot",
        },
        {
          name: "Anti Kick",
          value: "kicks",
        },
        {
          name: "Anti Ban",
          value: "bans",
        },
        {
          name: "Anti Sunucu Güncelleme",
          value: "guildUpdate",
        },
        {
          name: "Anti Everyone / Here",
          value: "everyone",
        }
      ],
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
  run: async (interaction, client, user, language) => {
    await interaction.deferReply();

    if (interaction.user.id !== interaction.guild.ownerId) {
      return interaction.editReply({ content: `Bu sunucunun sahibi değilsin.`, ephemeral: true });
    }

    const category = interaction.options.getString("kategori");

    let settings = await GuildSettings.findOne({ guildId: interaction.guild.id });
    if (!settings) return interaction.editReply({ content: "Bu sunucuda antinuke aktif değil." });

    if (category === "all") {
      settings.enabled.roles = false;
      settings.enabled.channels = false;
      settings.enabled.webhooks = false;
      settings.enabled.kicks = false;
      settings.enabled.bans = false;
      settings.enabled.antibot = false;
      settings.enabled.guildUpdate = false;
      settings.enabled.everyone = false;

      await settings.save();

      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🚩 Antinuke Ayarları")
            .setDescription(
              `
        Anti Rol Oluştur/Sil:        ❌\n
        Anti Kanal Oluştur/Sil:      ❌\n
        Anti Webhook Oluştur/Sil:    ❌\n
        Anti Kick:                   ❌\n
        Anti Bot Ekleme:             ❌\n
        Anti Ban:                    ❌
        `
            )
            .setColor(client.color)
            .setFooter({
              text: "Tüm antinuke kategorileri devre dışı bırakıldı. Şüpheli bir eylem yapılırsa bot hiçbir şey yapmayacak.",
            }),
        ],
      });
    } else {
      if (settings.enabled[category] === false) {
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`Bu kategori zaten devre dışı.`)
              .setColor("Red")
              .setTimestamp(),
          ],
          ephemeral: true
        });
      } else {
        settings.enabled[category] = false;
        await settings.save();

        const Anti = {
          roles: "Anti Rol Oluştur/Sil",
          channels: "Anti Kanal Oluştur/Sil",
          webhooks: "Anti Webhook Oluştur/Sil/Güncelle",
          kicks: "Anti Kick",
          bans: "Anti Ban",
          antibot: "Anti Bot Ekleme",
          guildUpdate: "Anti Sunucu Güncelleme",
          everyone: "Anti Everyone / Here"
        };

        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${Anti[category]} ❌ devre dışı bırakıldı.`)
              .setColor(client.color),
          ],
        });
      }
    }
  },
};
