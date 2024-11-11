import { test, expect } from '@playwright/test'
import logger from '../../winston_logger.config'

const baseUrl = 'http://simple-grocery-store-api.online'
let productId: string

test.describe.serial('Products API Tests', () => {
    test(
        'GET All Products API should return status 200 and a list of products',
        { tag: '@API' },
        async ({ request }) => {
            const response = await request.get(`${baseUrl}/products`)

            expect(response.status()).toBe(200)
            const responseBody = await response.json()

            // logger.info(JSON.stringify(responseBody));

            expect(Array.isArray(responseBody)).toBe(true)
            expect(responseBody.length).toBeGreaterThan(0)
            productId = responseBody[0].id
        },
    )

    test(
        'GET Single Product API should return status 200 and product details',
        { tag: '@API' },
        async ({ request }) => {
            const response = await request.get(
                `${baseUrl}/products/${productId}`,
            )

            expect(response.status()).toBe(200)

            const responseBody = await response.json()

            // logger.info(JSON.stringify(responseBody));

            expect(responseBody).toHaveProperty('id', productId)
            expect(responseBody).toHaveProperty('name')
            expect(responseBody).toHaveProperty('price')
        },
    )
})
