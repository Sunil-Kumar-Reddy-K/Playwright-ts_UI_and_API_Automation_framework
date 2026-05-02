# Email Automation

Automated email sending and reading using **Gmail API** with OAuth2 — enables end-to-end flows that involve email verification (e.g., password reset, registration codes).

## What's Tested

| Spec File | Scenarios |
|---|---|
| `email_automation.spec.ts` | Trigger password reset, read email via Gmail API, extract verification code |
| `email-automation.spec.ts` | Extended email automation scenarios |

## Key Patterns Demonstrated

- **Gmail API** integration via `utils/gmailService.ts`
- **OAuth2 authentication** with refresh token flow
- Reading and parsing email content programmatically
- End-to-end email verification workflows

## How to Run

```bash
# Requires Gmail OAuth credentials in .env
npx playwright test --grep @emailSend --project=chromium
```

**Tags:** `@emailSend`, `@emailCheck`
