# Google Translate API

Integrates the [google-translate-api](https://github.com/vitalets/google-translate-api) package to perform translation within Playwright tests.

## What's Tested

| Spec File | Scenarios |
|---|---|
| `transulate_en_to_te.spec.ts` | Translate "I love India" from English to Telugu using Google Translate API via HTTP proxy |

## Key Patterns Demonstrated

- **`@vitalets/google-translate-api`** for programmatic translation
- **HTTP proxy agent** (`http-proxy-agent`) to bypass rate limits
- Using third-party APIs inside Playwright test context

## How to Run

```bash
npx playwright test tests/google_translate_api/ --project=chromium
```

**Tag:** `@google`
