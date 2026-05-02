# Playwright TypeScript Automation Framework

[![Playwright Tests](https://github.com/Sunil-Kumar-Reddy-K/Playwright-ts_UI_and_API_Automation_framework/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/Sunil-Kumar-Reddy-K/Playwright-ts_UI_and_API_Automation_framework/actions/workflows/playwright.yml)

A multi-paradigm test automation framework built with **Playwright** and **TypeScript**, covering UI, API, BDD, AI-driven, accessibility, and email automation testing.

---

## Table of Contents

- [Framework Architecture](#framework-architecture)
- [Test Suites](#test-suites)
  - [UI Testing](#ui-testing)
  - [API Testing](#api-testing)
  - [BDD Testing](#bdd-testing)
  - [AI-Driven Testing](#ai-driven-testing)
  - [Accessibility Testing](#accessibility-testing)
  - [Specialized Testing](#specialized-testing)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Reporting](#reporting)
- [Code Quality](#code-quality)

---

## Framework Architecture

```
                            +-----------------------+
                            |   playwright.config   |
                            |   (multi-project)     |
                            +-----------+-----------+
                                        |
              +------------+------------+------------+------------+
              |            |            |            |            |
         +----v----+  +----v----+  +----v----+  +----v----+  +----v----+
         |   UI    |  |   API   |  |   BDD   |  |   AI    |  |  A11Y   |
         | @UI     |  | @API    |  | @BDD    |  | @AI     |  | @A11Y   |
         | POM     |  | request |  | Gherkin |  | ZeroStep|  | axe-core|
         +---------+  +---------+  +---------+  +---------+  +---------+
              |                         |
         +----v----+              +----v----+
         | pages/  |              |features/|
         | (POM)   |              | (steps) |
         +---------+              +---------+
```

| Paradigm | Approach | Tag | CI Job |
|---|---|---|---|
| **UI Testing** | Page Object Model with custom fixtures | `@UI` | `ui-tests` |
| **API Testing** | Playwright `request` fixture (no external HTTP libs) | `@API` | `api-tests` |
| **BDD Testing** | Gherkin features with `playwright-bdd` | `@BDD` | `bdd-tests` |
| **AI Testing** | Natural-language commands via ZeroStep `ai()` | `@AI` | `ai-tests` |
| **Accessibility** | axe-core scans with WCAG compliance gates | `@A11Y` | — |

> *Built with healthcare (Section 508, ADA) and insurance (EU Accessibility Act) compliance requirements in mind — industries where accessibility failures carry legal and financial risk.*

---

## Test Suites

### UI Testing

| Suite | Description | Details |
|---|---|---|
| [GreenKart UI](tests/green_kart_application_UI/) | E-commerce: search, cart, checkout, multi-product ordering | POM, custom fixtures, popup handling |
| [OrangeHRM UI](tests/orangeHRM_application_UI/) | HR app: login, My Info editing, dependents management | `@step()` decorator, encrypted credentials |
| [API Mocking](tests/api_mocking/) | Route interception: modify live HTTP responses | `page.route()`, `route.fetch()`, `route.fulfill()` |
| [Timer Control](tests/timer_control/) | Playwright Clock API: fast-forward browser time | `page.clock.install()`, `page.clock.fastForward()` |
| [Tesseract OCR](tests/tesseract_ocr/) | Extract text from screenshots via OCR | `Tesseract.recognize()`, canvas validation |

### API Testing

| Suite | Description | Details |
|---|---|---|
| [Grocery Store API](tests/grocery_store_api/) | Full E2E: status, cart CRUD, auth, order placement | `test.describe.serial()`, Bearer tokens, shared state |
| [Google Translate](tests/google_translate_api/) | Third-party API integration with proxy support | `@vitalets/google-translate-api`, HTTP proxy |

### BDD Testing

| Suite | Description | Details |
|---|---|---|
| [BDD Features](features/) | Gherkin scenarios for GreenKart and Riverside | `playwright-bdd`, `createBdd()`, step definitions |

### AI-Driven Testing

| Suite | Description | Details |
|---|---|---|
| [ZeroStep AI](tests/zero_step/) | Natural-language browser automation | `ai()` fixture, combines with traditional assertions |

### Accessibility Testing

| Suite | Description | Details |
|---|---|---|
| [axe-core A11Y](tests/accessibility_axe/) | 11 modules, 59 tests — from basics to CI gates | WCAG 2.1 AA, POM integration, reporting, beyond-axe |

### Specialized Testing

| Suite | Description | Details |
|---|---|---|
| [Email Automation](tests/email_automation/) | Gmail API: send, read, extract verification codes | OAuth2, programmatic email parsing |
| [PDF Parsing](tests/file_parser/) | Extract and validate PDF content | `pdf-parse`, metadata inspection |
| [Fixtures Learning](tests/fixtures_learning/) | Traditional vs fixture-based test setup comparison | `base.extend<T>()`, dependency injection |
| [Playwright v1.59](tests/playwright_v1.59_features/) | Hands-on exploration of 6 new Playwright features | Screencast API, browser bindings, async disposables |
| [Interview Practice](tests/interview/) | Quick automation exercises for interview prep | API validation, e-commerce patterns |

---

## Project Structure

```
.
├── tests/                          # All test specs (organized by feature)
│   ├── green_kart_application_UI/  # GreenKart e-commerce UI tests
│   ├── orangeHRM_application_UI/   # OrangeHRM HR app UI tests
│   ├── grocery_store_api/          # REST API tests (serial E2E flow)
│   ├── zero_step/                  # AI-driven tests (ZeroStep)
│   ├── accessibility_axe/          # 11-module axe-core A11Y suite
│   ├── api_mocking/                # Route interception & response mocking
│   ├── timer_control/              # Clock API manipulation
│   ├── tesseract_ocr/              # OCR-based visual text extraction
│   ├── email_automation/           # Gmail API integration
│   ├── file_parser/                # PDF content validation
│   ├── google_translate_api/       # Translation API integration
│   ├── fixtures_learning/          # Playwright fixtures comparison
│   ├── playwright_v1.59_features/  # New feature exploration (6 modules)
│   ├── interview/                  # Interview practice exercises
│   └── others/                     # Experimental tests
├── pages/                          # Page Object Model (grouped by app)
│   ├── greenkart/                  # Homepage, Cart, Offers
│   ├── orangehrm/                  # OrangeHRM page
│   ├── riverside/                  # Riverside Score login
│   └── todomvc/                    # TodoMVC page (fixtures learning)
├── features/                       # BDD Gherkin features + step definitions
│   └── steps/                      # Step definitions & base fixtures
├── utils/                          # Gmail API helpers
├── lib/                            # Crypto utils, Slack reporter
├── custom_reporter/                # Custom Playwright reporters (JSON, TXT)
├── env/                            # Environment configs (.env.local, .env.ci)
├── .github/workflows/              # CI/CD pipeline (4 parallel jobs)
└── playwright.config.ts            # Multi-project configuration
```

> Each folder contains its own `README.md` with detailed documentation.

---

## Tech Stack

| Category | Tools |
|---|---|
| **Framework** | Playwright, TypeScript |
| **Test Patterns** | Page Object Model, BDD (Gherkin), AI-driven |
| **BDD** | playwright-bdd, Cucumber Gherkin |
| **AI Testing** | ZeroStep (`@zerostep/playwright`) |
| **Accessibility** | @axe-core/playwright, WCAG 2.1 AA |
| **API Testing** | Playwright `request` fixture (built-in) |
| **OCR** | Tesseract.js |
| **PDF** | pdf-parse |
| **Email** | Gmail API, OAuth2 |
| **Logging** | Winston (debug/info levels) |
| **Encryption** | AES-256-CBC (`lib/cryptoUtils.ts`) |
| **CI/CD** | GitHub Actions (4 parallel jobs) |
| **Notifications** | Slack (per test type channel) |
| **Reporting** | HTML, Ortoni, CTRF, Custom JSON/TXT reporters |
| **Code Quality** | ESLint (strict), Prettier |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Sunil-Kumar-Reddy-K/Playwright-ts_UI_and_API_Automation_framework.git

# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Set up environment
cp env/.env.local.example env/.env.local   # Configure your env vars
```

---

## Running Tests

```bash
# Run all tests
npx playwright test

# Run by tag
npx playwright test --grep @UI
npx playwright test --grep @API
npx playwright test --grep @AI
npx playwright test --grep @A11Y

# Run BDD tests
npx bddgen --tags "@BDD" && npx playwright test --project=bdd_chromium

# Run a specific suite
npx playwright test tests/green_kart_application_UI/ --project=chromium

# Run with headed browser
npx playwright test --grep @UI --project=chromium --headed

# Run with debug mode
npx playwright test tests/grocery_store_api/ --debug

# Enable debug logging
$env:LOG_LEVEL = "debug"; npx playwright test --grep @HRM --project=chromium
```

---

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/playwright.yml`) runs **4 parallel jobs** on every PR and on a schedule (Mon/Thu 5 AM IST):

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  UI Tests   │  AI Tests   │  API Tests  │  BDD Tests  │
│  --grep @UI │  --grep @AI │  --grep @API│  bdd_chromium│
│  Playwright │  Playwright │  Node LTS   │  Playwright  │
│  container  │  container  │  container  │  container   │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┘
       └─────────────┴──────┬──────┴─────────────┘
                     check-failures
                     (aggregation)
```

Each job:
- Generates **CTRF reports** with AI summaries
- Sends **Slack notifications** to dedicated channels per test type
- Uploads **HTML reports** as artifacts (30-day retention)

---

## Reporting

| Reporter | Output |
|---|---|
| **HTML** | `playwright-report/html-reports/` (timestamped) |
| **Ortoni** | `playwright-report/ortoni-report/` (visual report) |
| **CTRF** | `playwright-report/ctrf-reports/` (CI-friendly JSON) |
| **Custom JSON** | Via `custom_reporter/json_reporter.ts` |
| **Custom TXT** | Via `custom_reporter/txt_reporter.ts` |

```bash
# Generate CTRF summary report
npm run ctrf-report
```

---

## Code Quality

```bash
# Lint all test files
npx eslint tests

# Auto-fix linting issues
npx eslint tests --fix

# Format with Prettier
npx prettier --write tests
```

- **ESLint**: Strict mode, `no-floating-promises: error`
- **Prettier**: 4-space tabs, double quotes, trailing commas, semicolons
- **TypeScript**: Strict mode, no `any` unless necessary
