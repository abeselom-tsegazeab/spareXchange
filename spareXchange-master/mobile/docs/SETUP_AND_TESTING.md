# SpareXChange Mobile — Setup & Testing

This guide covers local development setup, backend connectivity, and module-by-module testing aligned with the 10 Postman collections in the repo root.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Expo CLI | via `npx expo` (SDK 56) |
| MongoDB | running locally or Atlas URI in backend `.env` |
| Android Studio / emulator | optional (or Expo Go on a physical device) |

## 1. Start the backend

```bash
cd backend
npm install
# Configure .env (MONGO_URI, JWT_SECRET, etc.) — see backend README
npm run dev
```

The API listens on **http://localhost:5000** by default.

## 2. Install and run the mobile app

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (SDK 56) or press `a` for the Android emulator.

## 3. Configure the API URL

The app resolves the backend URL in this order:

1. `EXPO_PUBLIC_API_URL` environment variable
2. `app.json` → `expo.extra.apiUrl`
3. Expo dev-server host + port `5000`
4. Fallback: `http://10.0.2.2:5000` (Android emulator)

### Physical device on the same Wi‑Fi

Set your PC's LAN IP in `mobile/app.json`:

```json
"extra": {
  "apiUrl": "http://192.168.x.x:5000"
}
```

Or create `mobile/.env`:

```
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000
```

Restart Expo after changing the URL.

### Socket.io (Module 9)

Real-time events use the same host as `API_ORIGIN` (`SOCKET_URL` in `src/config/env.js`). If REST works but live updates do not, confirm port 5000 is reachable and not blocked by a firewall.

## 4. Create a test account

1. Open the app → **Sign up**
2. Verify email if your backend requires it (check Mailtrap / console logs)
3. Sign in — JWT is stored in SecureStore and sent as `Authorization: Bearer`

Optional: use seeded users from backend scripts if available.

## 5. Module testing checklist

Each module maps to a Postman collection at the repo root. Use these flows in the app after signing in.

### Module 1 — Identity & Security
- Sign up, login, logout
- Edit profile, upload profile picture
- MFA setup / verify
- Request role verification (Profile → Apply for verified role)

### Module 2 — Marketplace
- Browse listings, filters, recommendations
- Create / edit / delete listing (Sell tab)
- Listing detail, report listing

### Module 3 — Exponent Exchanges
- Propose exchange from listing detail
- Accept / counter / cancel / handshake / handover photos
- Open dispute on exchange

### Module 4 — Sustainability
- Submit recycling (Eco tab)
- View eco points, leaderboard

### Module 5 — Professional Services
- Create technician request, submit quote, complete handshake

### Module 6 — Saved Search Alerts
- Browse → Save search
- Profile → Saved searches, toggle alerts

### Module 7 — Communication & Trust
- Messages, chat, notifications inbox
- Write review (after `fully_completed` exchange)
- Report user

### Module 8 — Operations & Intelligence
- Admin user: Profile → Operations dashboard
- Seller: Sell → Market insights
- Reports list / detail, admin jobs

### Module 9 — Notifications & Real-time
- Push token registers on login (best-effort in simulator)
- Profile → Notification settings (preferences, devices)
- Notifications → History
- Socket events refresh messages, notifications, exchanges while app is open

### Module 10 — Community Engagement
- Profile → Community (highlights feed)
- Profile → Achievements, check for new badges
- Public profiles from listing seller, exchange counterparty, technician profile
- Activity feed (personal and per-user)

## 6. Bundle verification

Before release builds, confirm the JS bundle compiles:

```bash
cd mobile
npx expo export --platform android
```

Expected: **~1500 modules**, output in `mobile/dist/`.

## 7. Known backend quirks (mobile workarounds)

| Issue | Mobile behavior |
|-------|-----------------|
| `GET /api/messages/unread-count` route order | Unread derived from conversations list |
| Push FCM stubbed on backend | Token registration works; delivery may not |
| Review requires exchange `fully_completed` | UI only offers review when eligible |
| Exchange cancel uses `cancelReason` | Mobile sends correct field name |

## 8. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Network error on all requests | Check API URL, backend running, same Wi‑Fi |
| Images not loading | Paths under `/uploads/` need `API_ORIGIN` prefix (handled by `resolveAssetUrl`) |
| 401 after idle | Token expired — sign in again |
| Real-time not updating | Confirm socket URL; restart app after login |
| Expo Go push notifications | Limited; use a development build for full push testing |

## 9. Project structure (reference)

```
mobile/
  App.js                 # Root + RealtimeBootstrap
  src/
    api/                 # Axios modules per domain
    store/               # Zustand stores
    navigation/          # Root, tabs, feature stacks
    screens/             # UI by feature
    services/            # Push + socket integration
    components/          # Shared UI
    config/              # env, theme, catalogs
```

For APK / production builds, see [APK_DEPLOYMENT_GUIDE.md](./APK_DEPLOYMENT_GUIDE.md).
