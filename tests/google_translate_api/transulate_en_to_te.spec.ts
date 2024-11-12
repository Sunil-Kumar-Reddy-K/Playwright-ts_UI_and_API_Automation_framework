/**
 ** @support : Supported languages for Google Translate API
 *@link https://cloud.google.com/translate/docs/languages

 ** @Repo : Repository for google-translate-api package
 * @link https://github.com/vitalets/google-translate-api?tab=readme-ov-file
 * 
 * @description
 * ⚠ **Rate Limits**: Google Translate API has request limits.
 * If too many requests are made from the same IP, you'll see a `TooManyRequestsError` (code 429).
 * Consider using a proxy to bypass rate limits.
 * 
 * @setup Proxy Setup:
 * ```typescript
 * const agent = new HttpProxyAgent('http://your-proxy-url');
 * ```
 * 
 * @command
 * Use this command to run the test:
 * ```bash
 * $env:LOG_LEVEL="debug"; npx playwright test tests/google-translate-api/translate_en_to_te.spec.ts --project=chromium
 * ```
 */

import { translate } from '@vitalets/google-translate-api'
import test from '../../features/steps/basepage'
import { HttpProxyAgent } from 'http-proxy-agent'

test('Translate English to Telugu', { tag: '@google' }, async ({}) => {
    const agent = new HttpProxyAgent('http://103.152.112.162:80')
    const { text } = await translate('I love India', {
        to: 'te',
        fetchOptions: { agent },
    })
    console.log(text)
})
