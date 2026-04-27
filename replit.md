# AntiNuke Discord Bot

A Discord bot that protects servers from malicious actions (mass channel/role deletion, unauthorized bot additions, mass bans/kicks). Built with discord.js v14 and Firebase Firestore.

## Tech Stack

- **Runtime**: Node.js 20
- **Library**: discord.js v14
- **Database**: Firebase Firestore (via firebase-admin)
- **Package Manager**: npm

## Project Structure

- `index.js` — Entry point
- `bot.js` — MainClient class extending discord.js Client
- `Handler/` — Dynamic loaders for commands, events, antinuke logic, and database
  - `Handler/Database/Firebase.js` — Firestore initialization
  - `Handler/Database/Model.js` — Mongoose-style wrapper around Firestore (find/findOne/findOneAndUpdate/insertMany/etc.)
  - `Handler/Database/Connect.js` — Initializes Firebase at startup
  - `Handler/Database/Premium.js` — Cron job that expires old premiums
- `commands/` — Slash command implementations (Antinuke, Premium, Utility, Verify, Ozel)
- `Events/` — Discord event listeners (ready, interactionCreate, guildMemberAdd, etc.)
- `Models/` — Firestore-backed models (Antinuke, Premium, Redeem, Snapshot, Hosgeldin, OtoRol, Verify, Uyari)
- `Settings/config.js` — Loads environment variables
- `deploySlash.js` — Script to register slash commands with Discord

## Firestore Collections

| Model     | Collection      | Document ID                  |
|-----------|-----------------|------------------------------|
| Antinuke  | guildSettings   | `<guildId>`                  |
| Hosgeldin | hosgeldin       | `<guildId>`                  |
| OtoRol    | otorol          | `<guildId>`                  |
| Verify    | verify          | `<guildId>`                  |
| Snapshot  | snapshots       | `<guildId>`                  |
| Premium   | premiums        | `<userId>`                   |
| Redeem    | redeems         | `<code>`                     |
| Uyari     | uyarilar        | `<guildId>_<userId>`         |

## Environment Variables (Secrets)

All configured as Replit Secrets:
- `TOKEN` — Discord bot token
- `FIREBASE_SERVICE_ACCOUNT_KEY` — Firebase Admin service account JSON (entire JSON as string)
- `EMBED_COLOR` — Hex color for bot embeds
- `DEV_ID` — Developer's Discord user ID
- `OWNER_ID` — Bot owner's Discord user ID
- `error` / `join` / `leave` — Optional webhook URLs for logging (can be left empty)

## Workflow

- **Start application**: `npm start` (runs `node --no-warnings index.js`)

## Bot Presence

Rotating "Playing" status (updates every 15s):
- `Made By fuatyancar`
- `<total_members> kullanıcı koruyor`
- `<guild_count> sunucuda aktif`

## Migration Notes (MongoDB → Firebase)

- The `Handler/Database/Model.js` wrapper exposes a Mongoose-compatible API (`find`, `findOne`, `findOneAndUpdate`, `findOneAndDelete`, `create`, `insertMany`, `updateMany`, `deleteMany`, plus `new Model({...}).save()` and `.deleteOne()` instance methods, including legacy `findOne(query, callback)` style).
- Each model defines its Firestore collection, a key function/field, and default field values.
- Update operators supported: `$set`, `$inc`, `$push`, `$pull`, `$unset`. Query operators supported: `$lte`, `$lt`, `$gte`, `$gt`, `$ne`, `$in`.
- All existing command/handler/event code works unchanged.
