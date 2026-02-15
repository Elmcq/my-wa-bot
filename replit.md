# WA MC Bot

## Overview
WhatsApp bot for managing a Minecraft server community (SMP 46 Project). Built with Node.js using the Baileys WhatsApp library. Features include economy system, games, admin commands, server status checking, and Ramadan schedulers.

## Project Architecture
- **Runtime**: Node.js 20 (ES Modules)
- **Entry Point**: `index.js`
- **Config**: `config.js` (owner numbers, server IP)
- **Database**: JSON file (`database.json`)
- **Port**: 5000 (HTTP health check server)

### Directory Structure
- `commands/admin/` - Admin commands (backup, shutdown, etc.)
- `commands/game/` - Game commands (economy, gacha, duel, etc.)
- `commands/utility/` - Utility commands (help, weather, translate, etc.)
- `lib/` - Shared functions and character data
- `utility/` - Auto-reply and scheduler modules
- `session/` - WhatsApp auth session (gitignored)

## Key Dependencies
- `@whiskeysockets/baileys` - WhatsApp Web API
- `qrcode-terminal` - QR code display for auth
- `minecraft-server-util` - Minecraft server status
- `axios` - HTTP requests
- `mathjs` - Calculator
- `node-cron` - Scheduled tasks
- `pino` - Logging

## Running
The bot starts via `node index.js`. On first run, scan the QR code with WhatsApp to authenticate. Session data is stored in `./session/`.
