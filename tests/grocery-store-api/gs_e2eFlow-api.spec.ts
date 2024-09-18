import { test, expect } from '@playwright/test';
import logger from '../../winston_logger.config';  

const baseUrl = 'http://simple-grocery-store-api.online';

let cartId: string;
let productId: string;
let orderId: string;
let accessToken: string;

test.describe.serial('E2E API Tests', () => {

  test('Check API Status',{tag: '@API'}, async ({ request }) => {
    const response = await request.get(`${baseUrl}/status`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    logger.debug('API Status: ' + JSON.stringify(await responseBody));
    expect(await responseBody.status).toBe('UP');
  });

  test('Create a New Cart',{tag: '@API'}, async ({ request }) => {
    const response = await request.post(`${baseUrl}/carts`, {
      data: {}
    });

    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    logger.debug('New Cart Created:' + JSON.stringify(await responseBody));

    cartId = responseBody.cartId; 
    expect(cartId).toBeDefined();
  });

  test('Add an Item to the Cart',{tag: '@API'}, async ({ request }) => {
    const productResponse = await request.get(`${baseUrl}/products`);
    expect(productResponse.status()).toBe(200);
    const productResponseBody = await productResponse.json();

    productId = productResponseBody[0].id;  

    const addItemResponse = await request.post(`${baseUrl}/carts/${cartId}/items`, {
      data: {
        productId: productId,
        quantity: 2
      }
    });

    expect(addItemResponse.status()).toBe(201);
    const addItemResponseBody = await addItemResponse.json();
    logger.debug('Item Added to Cart:' + JSON.stringify(await addItemResponseBody));
    const itemId = addItemResponseBody.itemId; 
    expect(itemId).toBeDefined();
  });

  test('Register a New API Client',{tag: '@API'}, async ({ request }) => {
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;  
    const email = `atp${randomNumber}@example.com`;

    const registerResponse = await request.post(`${baseUrl}/api-clients`, {
      data: {
        clientName: "Anantapur computers",
        clientEmail: email
      }
    });

    expect(registerResponse.status()).toBe(201);  
    const { accessToken: token } = await registerResponse.json();
    accessToken = token;
    logger.info('Access Token: ' + accessToken);

    expect(accessToken).toBeDefined();
  });

  test('Create a New Order',{tag: '@API'}, async ({ request }) => {
    const orderResponse = await request.post(`${baseUrl}/orders`, {
      headers: {
        'Authorization': `Bearer ${accessToken}` 
      },
      data: {
        cartId: cartId,
        customerName: "John Doe"
      }
    });
  
    expect(orderResponse.status()).toBe(201);
    const orderResponseBody = await orderResponse.json();
    logger.info('New Order Created:' + JSON.stringify(await orderResponseBody));
  
    orderId = orderResponseBody.orderId;
    expect(orderId).toBeDefined();
  });

});
