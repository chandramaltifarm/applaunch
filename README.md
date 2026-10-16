# Launchday — Cinematic Website Launch Platform

A single-configuration-file Next.js + TypeScript + Tailwind CSS launch page with:
- Live countdown to a timezone-aware launch date
- Scissors locked until the scheduled time
- Pointer/touch draggable scissors
- Ribbon-hit detection and cutting/reveal state
- Confetti celebration
- Validated HTTP(S) destination redirect
- Responsive cinematic dark UI

## Requirements
- Node.js 20.9+ (Node.js 22 LTS recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Configure your launch
Edit `src/config/launch.config.ts`:
```ts
export const launchConfig = {
  brand: "LAUNCHDAY",
  title: "Something extraordinary",
  titleAccent: "is about to begin.",
  subtitle: "A new chapter starts with one unforgettable moment.",
  websiteUrl: "https://example.com",
  launchDate: "2026-12-31T18:00:00+05:30",
  logoText: "L",
  eyebrow: "THE COUNTDOWN IS ON",
  ribbonLabel: "THE BIG REVEAL",
  redirectDelayMs: 2800,
  enableConfetti: true,
  thumbnail: ""
} as const;
```
- Use a full URL such as `https://yourdomain.com`.
- Include a timezone offset in the date. For India, use `+05:30`.
- Set `thumbnail` to a file in `public/` if you want to add a custom thumbnail in a future extension. The current UI is designed with CSS and does not yet display this field.
- When the time arrives, the scissors unlock automatically. Drag them over the ribbon to cut it.
- After the cut, the app redirects to the destination after `redirectDelayMs`.

## Build and deploy
```bash
npm run build
npm start
```
Push the project to GitHub and import it into Vercel. The root directory should be the project root. Vercel will detect Next.js automatically.

## Important implementation notes
- This is a single-event, code-configured landing page; there is no admin dashboard or database.
- The destination site must already be deployed and publicly reachable. This app does not deploy the destination.
- The schedule is evaluated using the visitor's device clock. For high-assurance event timing, move the schedule and launch authorization to a trusted server.
- Because this is a static client-side ceremony, it cannot guarantee a globally synchronized launch or prevent a technically savvy visitor from opening a known destination URL directly.
- Only HTTP and HTTPS destinations are accepted. Do not allow arbitrary `javascript:`, `data:`, or other URL schemes.
- The configured URL is trusted code. If you later let users submit URLs through a form, validate them server-side and consider an allowlist / abuse controls.
