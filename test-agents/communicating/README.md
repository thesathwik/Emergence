# Test Communicating Agent

This agent demonstrates proper platform integration by implementing:

- `/api/webhook/register` - Registers the agent with the platform
- `/api/webhook/ping` - Maintains connection with periodic pings
- Platform result reporting

## Required Environment Variables

- `PLATFORM_URL` - The platform base URL (defaults to https://emergence-platform.com)

## Usage

```bash
npm install
npm start
```