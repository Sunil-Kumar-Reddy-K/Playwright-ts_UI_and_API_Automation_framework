/**
 * @Source
 * > https://shiv-jirwankar.medium.com/verifying-pdf-file-data-in-playwright-f8b92a73925e
 * > https://www.npmjs.com/package/pdf-parse
 *
 */

import test from '../../features/steps/basepage'
import pdf from 'pdf-parse'
import fs from 'fs'

test('lets parse the pdf', { tag: '@PDF' }, async ({}) => {
    const filePath = 'documents/BDI3_ScoreReport.pdf'

    const dataBuffer = fs.readFileSync(filePath)
    await pdf(dataBuffer).then((data) => {
        // PDF text
        console.log(data.text)
        console.log(
            '==================================================================',
        )

        // PDF info
        console.log(data.info)
        console.log(
            '==================================================================',
        )

        // PDF metdata
        console.log(data.metadata)
        console.log(
            '==================================================================',
        )

        // number of pages
        console.log(data.numpages)
        console.log(
            '==================================================================',
        )

        //     expect(data.text).toContain(`Test Business
        // 123 Somewhere St
        // Melbourne, VIC 3000`);
        // expect(data.numpages).toEqual(1);
    })
})
