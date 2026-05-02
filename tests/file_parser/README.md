# PDF Parsing

Demonstrates parsing and validating PDF file content using [pdf-parse](https://www.npmjs.com/package/pdf-parse) within Playwright tests.

## What's Tested

| Spec File | Scenarios |
|---|---|
| `pdf_parser.spec.ts` | Read a local PDF file, extract text/metadata/info, log and validate content |

## Key Patterns Demonstrated

- **`pdf-parse`** library for extracting text, metadata, and info from PDF buffers
- **`fs.readFileSync()`** to load PDF files from disk
- Validating document content without a browser (headless PDF testing)

## How to Run

```bash
npx playwright test tests/file_parser/ --project=chromium
```

**Tag:** `@PDF`
