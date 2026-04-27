const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const GuildSettings = require("../../Models/Antinuke");

module.exports = {
  name: ["antinuke", "enable"],
  description: "Sunucu için belirli bir antinuke kategorisini aktif eder.",
  category: "Antinuke",
  options: [
    {
      name: "kategori",
      type: ApplicationCommandOptionType.String,
      required: true,
      description: "Aktif edilecek antinuke kategorisi.",
      choices: [
        {
          name: "Hepsini Koru",
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
  run: async (interaction, client) => {
    await interaction.deferReply();
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
      interaction.channel.send({
        content: "**Uyarı**: Yönetici iznine sahip değilim, lütfen Yönetici iznini ver!"
      });
    }

    if (interaction.user.id !== interaction.guild.ownerId) {
      return interaction.editReply({ content: `Bu sunucunun sahibi değilsin.`, ephemeral: true });
    }

    const category = interaction.options.getString("kategori");

    let settings = await GuildSettings.findOne({
      guildId: interaction.guild.id,
    });
    if (!settings) {
      settings = new GuildSettings({ guildId: interaction.guild.id });
    }

    if (category === "all") {
      settings.enabled.roles = true;
      settings.enabled.channels = true;
      settings.enabled.webhooks = true;
      settings.enabled.kicks = true;
      settings.enabled.bans = true;
      settings.enabled.antibot = true;
      settings.enabled.guildUpdate = true;
      settings.enabled.everyone = true;

      await settings.save();

      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🚩 Antinuke Ayarları")
            .setDescription(
              `
        Anti Rol Oluştur/Sil:        ✔️\n
        Anti Kanal Oluştur/Sil:      ✔️\n
        Anti Webhook Oluştur/Sil:    ✔️\n
        Anti Kick:                   ✔️\n
        Anti Bot Ekleme:             ✔️\n
        Anti Ban:                    ✔️\n
        Anti Everyone/Here:          ✔️
        `
            )
            .setColor(client.color)
            .setFooter({
              text: "İpucu: Log kanalı ayarlamak için `/antinuke channel` komutunu kullan.",
            }),
        ],
      });
    } else {
      if (settings.enabled[category] === true) {
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.color)
              .setDescription(`Bu kategori zaten aktif! 😉`)
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      } else {
        settings.enabled[category] = true;
        await settings.save();

        const Anti = {
          roles: "Anti Rol",
          channels: "Anti Kanal",
          webhooks: "Anti Webhook",
          kicks: "Anti Kick",
          bans: "Anti Ban",
          antibot: "Anti Bot Ekleme",
          guildUpdate: "Anti Sunucu Güncelleme",
          everyone: "Anti Everyone / Here"
        };

        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${Anti[category]} ✔️ aktif edildi.`)
              .setColor(client.color)
              .setTimestamp(),
          ],
        });
      }
    }
  },
};
