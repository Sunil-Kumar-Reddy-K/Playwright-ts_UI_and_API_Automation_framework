# OrangeHRM UI Tests

UI automation for the [OrangeHRM](https://opensource-demo.orangehrmlive.com/) HR management application.

## What's Tested

| Spec File | Scenarios |
|---|---|
| `hrm_myinfo.spec.ts` | Login, navigate to My Info, edit gender, add dependents |

## Key Patterns Demonstrated

- **Page Object Model** via `pages/orangehrm/orangehrm.page.ts`
- **`@step()` decorator** for automatic Playwright report annotations
- **`test.describe.parallel()`** for independent test isolation
- **Encrypted credentials** using `lib/cryptoUtils.ts` (AES-256-CBC)

## How to Run

```bash
npx playwright test --grep @HRM --project=chromium --headed
```

**Tags:** `@UI`, `@HRM`
