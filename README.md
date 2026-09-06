# NexMeet

NexMeet is a lightweight private video-meeting platform for friends, students, and small groups.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your local environment file:
   ```powershell
   Copy-Item .env.example .env.local
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Supabase Auth Setup

Set these values in `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

In Supabase Authentication URL Configuration, set the Site URL to your app URL, such as `http://localhost:3000` for local development. Add `http://localhost:3000/auth/confirm` as a redirect URL while developing.

For email confirmation, use this confirmation email template URL:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

## Manual Regression Check

O. During an active two-person call, participant B refreshes the browser. Participant A may briefly see B disappear, but B must automatically reconnect using the same participant session and identity, without showing the manual Join Meeting screen or creating a permanent duplicate participant.
