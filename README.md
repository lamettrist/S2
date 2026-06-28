<img width="2683" height="1797" alt="image" src="https://github.com/user-attachments/assets/0f4b4e41-c6f2-4b3b-9230-787db627a49f" />

# S2
***S2** is an improved version of the old Spades tracker that I made before that leverages custom house rules, featuring a workspace environment, keybinds, and **TABS!*** Now, all your games can be organized so you can track and look at past games with ease, and they persist over sessions 😄

## Features
- Tabs that are persistent over reloads
- Renaming of teams so the game can be edited on the fly
- Simplified tracking in an excel-style format
- Tracking of Game Winners and Points w/Bets
- Keybinds for them power users (well I love keybinds so maybe for me)
- Client only (no server needed)

## Setup
To setup S2, all you need is either the [node](https://nodejs.org) runtime (or equivalent) or [bun](https://bun.sh) and then run:

Bun only:
```
bun install
bun run dev
```

Node only:
```
npm install
npm run dev
```

Boom, S2 is now setup and running locally (if you want this in production please deploy on Vercel).

## Why did I decide to make this?

The old version of the spades tracker (which can be seen at [github.com/lamettrist/Spades](https://github.com/lamettrist/Spades)) has many issues, such as no further utilization for power users like me or the fact that other teams can't dynamically be added on the fly (and the fact that it's over a year old, being released in December of 2024), which this version aims to resolve with our custom house-rules.

## Issues?

Please make a ticket!
