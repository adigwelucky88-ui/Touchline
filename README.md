# Touchline

A football video platform prototype for player channels, career highlights and talent discovery.

## Run locally

Clone this repository, then run:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000 in your browser. There is no dependency installation or build step.

## Project files

- `dist/index.html`: page structure
- `dist/style.css`: styling
- `dist/app.js`: prototype interactions
- `dist/locales.js`: translations
- `dist/football.jpg`: image asset
- `.openai/hosting.json`: existing ChatGPT Sites hosting configuration

## Current status

This is an interactive prototype. Profiles, follows, saved items and uploaded media use browser-local storage; they are not shared between devices or users. Production accounts and shared video hosting require a backend.

Existing prototype: https://touchline-football.orangefawn1.chatgpt.site
