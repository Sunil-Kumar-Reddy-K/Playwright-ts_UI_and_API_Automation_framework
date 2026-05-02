# CLAUDE.md — Project Instructions

## Project Overview
Playwright TypeScript UI & API Automation Framework testing GreenKart, OrangeHRM, Riverside Score, and Simple Grocery Store API. Uses POM, BDD (playwright-bdd), ZeroStep AI, and direct API testing.

## Code Style & Conventions

### General
- Use TypeScript strict mode — no `any` types unless absolutely necessary
- Follow existing Prettier config: 4-space tabs, double quotes, trailing commas, semicolons
- Run `npx prettier --write` on changed files before committing
- ESLint rules are strict — always await promises (`no-floating-promises: error`)

### Page Objects (pages/)
- Keep locators as **private** class properties
- Expose only **public async methods** for interactions
- Use the `@step()` decorator from `features/steps/basepage.ts` for methods that should appear in reports
- Name POM files as `<app>.page.ts` or `<page-name>.ts` (follow existing convention)
- Each page class should accept `Page` (or `BrowserContext`) in constructor

### Test Files (tests/)
- Place tests in appropriate subdirectory under `tests/` by app/feature
- Name spec files as `<feature>-<type>.spec.ts` or `<feature>.spec.ts`
- Always add test tags: `@UI`, `@API`, `@AI`, `@BDD`, `@PDF`, `@HRM`, `@google`, `@emailSend`
- Use `test.describe.serial()` for API tests with shared state
- Use `test.describe.parallel()` for independent UI tests
- Keep test data inline or in env files — no separate JSON fixtures unless necessary

### BDD (features/)
- Feature files go in `features/`, step definitions in `features/steps/`
- Tag BDD scenarios with `@BDD` plus any relevant domain tags
- Use `createBdd()` from `features/steps/basepage.ts` for step definitions
- Run `npx bddgen` after adding/modifying feature files

### API Tests
- Use Playwright's built-in `request` fixture — no external HTTP libraries
- Assert status codes AND response body content
- Use Bearer token auth pattern consistent with existing grocery store tests

## File Organization
- Page objects → `pages/`
- Test specs → `tests/<app-or-feature>/`
- Utilities → `utils/`
- Shared libs (crypto, reporters) → `lib/`
- Custom reporters → `custom_reporter/`
- BDD features → `features/`, steps → `features/steps/`
- Environment config → `env/.env.local`, `env/.env.ci`

## Security
- NEVER commit secrets, tokens, or credentials in plain text
- Use `lib/cryptoUtils.ts` (AES-256-CBC) to encrypt sensitive values
- Store encrypted values in env files, decrypt at runtime
- Gmail OAuth tokens and API keys go in `.env` (gitignored root file) only
- Do not log sensitive data even at debug level

## Testing & Running
- Run all tests: `npx playwright test`
- Run by tag: `npx playwright test --grep @UI`
- Run specific file: `npx playwright test tests/path/to/file.spec.ts`
- Run BDD tests: `npx bddgen --tags "@BDD" && npx playwright test --project=bdd_chromium`
- Run API tests only: `npx playwright test --grep @API`
- Generate reports: `npm run ctrf-report`
- Set log level: `$env:LOG_LEVEL="debug"` (PowerShell) before running tests

## CI/CD
- GitHub Actions workflow: `.github/workflows/playwright.yml`
- 4 parallel jobs: UI, AI, API, BDD — each filtered by tags
- Playwright container: `mcr.microsoft.com/playwright:v1.48.1-jammy`
- When updating Playwright version, also update the container image version in CI
- Slack notifications go to separate channels per test type

## Do NOT
- Do not install additional HTTP client libraries (axios, node-fetch) — use Playwright's request API
- Do not create separate test data JSON files unless the data is complex and reused across multiple tests
- Do not modify `features/steps/basepage.ts` without understanding fixture dependencies
- Do not skip ESLint or Prettier checks
- Do not store unencrypted credentials anywhere in the repo
