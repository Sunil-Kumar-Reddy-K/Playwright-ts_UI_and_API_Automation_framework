# BDD Features (playwright-bdd)

Behavior-Driven Development tests using [playwright-bdd](https://vitalets.github.io/playwright-bdd/) — Gherkin feature files with Playwright-style step definitions.

## Structure

```
features/
  gk_addMultipleProducts.feature    # GreenKart: add multiple products scenario
  riverside_login.feature           # Riverside Score: login flow
  implementing_evaluate.feature     # Browser evaluate() usage in BDD
  steps/
    basepage.ts                     # Custom fixtures, @step() decorator, createBdd() setup
    gk_addMultipleProducts_steps.ts # Step definitions for GreenKart feature
    riverside_login_steps.ts        # Step definitions for Riverside login
```

## Key Patterns

- **`createBdd()`** from `playwright-bdd` for step definitions
- **Custom fixtures** in `basepage.ts` injecting page objects (homepage, cart, riverside, hrmPage)
- **`@step()` decorator** for automatic report annotations on POM methods
- **AES-256-CBC encryption** for credentials via `lib/cryptoUtils.ts`

## How to Run

```bash
# Generate BDD test files, then run
npx bddgen --tags "@BDD" && npx playwright test --project=bdd_chromium --workers=1 --headed
```

**Tag:** `@BDD`
