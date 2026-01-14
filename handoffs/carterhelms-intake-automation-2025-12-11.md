# CarterHelms Intake Automation Update (2025-12-11)

This handoff records the changes shipped to the CarterHelms site and the current automation “next phase” state. **No secrets or credentials are stored here.**

## Shipped (CarterHelms repo)
- **Wizard step validation**: Each step blocks progression until required fields are valid; step-level error summary added.
- **Server-side validation guard**: `/api/intake/submit` re-validates full form to prevent client bypass.
- **Declarations page attachment fix**: Insurance history upload now flows through final submit and is attached to Carter’s intake email only.
- **Draft safety**: Browser localStorage stores **only safe UI state** (no PII). Full drafts are saved server-side.
- **Internal endpoint auth**: Dashboard + ACORD generation endpoints protected by password‑based JWT cookie auth; responses set `Cache-Control: no-store`.
- **KV-backed rate limits**: Applied across public/high‑cost endpoints, including submit + AI dec‑page validate/extract.
- **Google Places restored via proxy**: Intake address autocomplete uses server‑side Places proxy; requires a server Places key.
- **Supabase table alignment**: Code now matches `carrier_quotes` schema.

## Key files to know
- `carterhelms/api/intake/submit.ts` – main automation, PDFs/emails, n8n triggers.
- `carterhelms/components/intake/utils/validationUtils.ts` – full form + per-step validators.
- `carterhelms/components/intake/IntakeWizard.tsx` – wizard flow, dec‑page in‑memory handling.
- `carterhelms/components/intake/components/steps/InsuranceHistoryStep/index.tsx` – dec‑page selection + emit.
- `carterhelms/api/lib/internalAuth.ts` + `carterhelms/api/auth/*` – internal JWT auth.
- `carterhelms/api/lib/rateLimit.ts` – KV/memory rate limiter.

## Environment expectations (names only)
- Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`.
- Places: `GOOGLE_PLACES_API_KEY` (server key; legacy `VITE_*` key optional).
- Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Gemini server calls: `GEMINI_API_KEY`.
- n8n triggers: `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`, `N8N_CARRIER_WEBHOOK_URL`, `N8N_CALENDAR_WEBHOOK_URL`.

## n8n next-phase skeletons (BRAIN repo)
- `n8n-workflows/carter-quote-request.json` – receives `quote_request` payloads from submit.
- `n8n-workflows/carter-hot-lead-followup.json` – receives `schedule_followup` payloads for hot leads.

These are import‑ready webhook stubs; add carrier/EZLynx and calendar nodes inside n8n.

## Suggested next steps
1. **Fill out n8n flows**
   - Quote request: map payload → carrier submission(s) → write back to Supabase via `/api/webhooks/n8n` (`quote.requested/received`).
   - Hot lead follow‑up: create calendar event + send Carter notification.
2. **Carrier integrations**: scaffold per‑carrier adapters once credentials/specs are confirmed.
3. **Client portal MVP**: read‑only status + document access before full auth/UX buildout.
