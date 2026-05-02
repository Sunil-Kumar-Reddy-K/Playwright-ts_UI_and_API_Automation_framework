# Tesseract.js OCR Testing

Uses [Tesseract.js](https://github.com/naptha/tesseract.js) to extract text from screenshots within Playwright tests — useful for validating canvas/image-rendered content that has no DOM text.

## What's Tested

| Spec File | Scenarios |
|---|---|
| `rs_logoRead.spec.ts` | Screenshot the Riverside Score logo, run OCR, assert extracted text contains "Riverside Score" |

## Key Patterns Demonstrated

- **`locator.screenshot()`** to capture element-level screenshots as `Buffer`
- **`Tesseract.recognize()`** for image-to-text extraction
- Validating non-DOM content (logos, images, canvas elements)

## How to Run

```bash
npx playwright test tests/tesseract_ocr/ --project=chromium --headed
```

**Tag:** `@UI`
