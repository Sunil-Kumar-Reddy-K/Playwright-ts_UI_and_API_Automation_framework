# ZeroStep AI-Driven Tests

AI-powered test automation using [ZeroStep](https://github.com/zerostep-ai/zerostep), which adds natural-language commands to Playwright via the `ai()` fixture.

## What's Tested

| Spec File | Scenarios |
|---|---|
| `gk_happyPath.spec.ts` | GreenKart: search, add to cart, checkout — entirely via `ai()` commands |
| `eComm_registration.spec.ts` | E-commerce site registration flow using AI interactions |
| `fileDownload.spec.ts` | File download handling with AI-driven navigation |

## Key Patterns Demonstrated

- **`ai()` fixture** from `@zerostep/playwright` for natural-language browser interactions
- **`test.slow()`** to accommodate AI processing time
- Combining AI commands with traditional Playwright assertions (`page.waitForURL`)
- Custom fixture integration via `basepage.ts`

## How to Run

```bash
# Requires ZEROSTEP_TOKEN environment variable
$env:ZEROSTEP_TOKEN = "your-token"; npx playwright test --grep @AI --project=chromium
```

**Tag:** `@AI`
