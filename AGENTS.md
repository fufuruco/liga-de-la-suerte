# Project Notes

- This app uses a React/Vite frontend and a Node HTTP API backed by SQLite.
- `server/index.js` owns persistence, validation and score calculations.
- `src/api/client.js` is the frontend API boundary; keep UI components off raw fetch calls.
- `scripts/dev.js` starts and stops the API and Vite together.
- The SQLite database is stored in `data/` and must never be committed.
- Run `npm run build` and `npm run lint` after relevant changes.
- Do not reintroduce hosted SDK or hosted-auth assumptions into the game flow.
