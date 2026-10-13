# GrowKit (real app)

Next.js 14 + Prisma (Postgres) + Instagram API (Instagram Login) + Stripe + Anthropic.

## What works in this code
- Connect Instagram (OAuth), long-lived encrypted token, weekly token refresh
- Comment-to-DM: webhook receives comments, matches your keyword, sends a private-reply DM and optional public reply (signature-verified, de-duplicated, ignores your own comments)
- Automations dashboard (add, toggle, delete), Free plan limited to 1
- AI reply drafts (Pro only, POST /api/ai/reply, never auto-posts)
- Stripe Pro subscription with 7-day trial, webhook upgrades/downgrades plan
- Disconnect and delete data, Meta data-deletion callback, privacy page
- Inbox (/inbox): pulls real comments from your latest 5 posts, drafts replies with Claude in your voice, you edit and approve, then it posts the reply (or hide / skip)
- public/demo.html is the visual demo of the full product (inbox, content, insights, deals)

## Not built yet (next phases)
Analytics pages, content calendar/publishing, deals CRM backed by the database, background queue for high volume.

## Setup
1. Database: create a free Postgres (Neon or Supabase). Put the URL in DATABASE_URL.
2. Meta app: developers.facebook.com > Create app > Business > add Instagram > "API setup with Instagram login".
   - Copy the Instagram app ID and secret to IG_APP_ID, IG_APP_SECRET.
   - Valid OAuth redirect: https://YOURDOMAIN/api/instagram/callback
   - Webhooks: callback https://YOURDOMAIN/api/webhooks/instagram, verify token = your IG_WEBHOOK_VERIFY_TOKEN, subscribe to "comments".
   - Data deletion URL: https://YOURDOMAIN/api/instagram/delete ; privacy URL: https://YOURDOMAIN/privacy
   - Add your own Business/Creator Instagram as an Instagram Tester and accept the invite. In development mode this works for you and testers without review.
3. Stripe: create a $19/month product, put the price id in STRIPE_PRICE_PRO. Add webhook https://YOURDOMAIN/api/stripe/webhook for checkout.session.completed and customer.subscription.deleted; put its secret in STRIPE_WEBHOOK_SECRET.
4. Anthropic: API key in ANTHROPIC_API_KEY.
5. Copy .env.example to .env and fill it in (generate secrets with: openssl rand -hex 32).
6. npm install && npx prisma db push && npm run dev. For local webhooks use a tunnel (ngrok) and set APP_URL to it.

## Deploy
Push to GitHub, import in Vercel, add the same env vars, deploy. vercel.json schedules the weekly token refresh (set CRON_SECRET).

## Going public
To serve customers other than testers, submit App Review (Advanced Access) for instagram_business_manage_comments and instagram_business_manage_messages, with a screen recording of the flow. It takes days to weeks. Private replies work only within 7 days of the comment, once per comment.
