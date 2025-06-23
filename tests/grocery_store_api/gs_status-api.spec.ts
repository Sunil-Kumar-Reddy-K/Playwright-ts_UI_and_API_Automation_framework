import { test, expect } from "@playwright/test";
import logger from "../../winston_logger.config";

const baseUrl = "https://simple-grocery-store-api.glitch.me";

test(
    "STATUS API should return status 200 and UP",
    { tag: "@API" },
    async ({ request }) => {
        const response = await request.get(`${baseUrl}/status`);

        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        // logger.info(JSON.stringify(responseBody));
        expect(responseBody.status).toBe("UP");
    },
);
