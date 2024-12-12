import { expect, Locator, Page, BrowserContext } from "@playwright/test";

export class RIVERSIDE_LoginPage {
    private readonly page: Page;
    private readonly context: BrowserContext;
    private readonly USERNAME_INPUTBOX: Locator;
    private readonly PASSWORD_INPUTBOX: Locator;
    private readonly SIGNIN_BUTTON: Locator;
    private readonly WJV_TILE: Locator;
    private readonly TEST_ASSSIGNMENTS_HEADING: Locator;
    private readonly EXAMINEES_HEADER: Locator;
    private readonly LOADING_ICON: Locator;
    private readonly EXAMINEE_MANAGEMENT_HEADING: Locator;
    private readonly NOTIFICATION_CENTER: Locator;
    private readonly REGISTRATION_FORM_CLOSE_BUTTON: Locator;
    private readonly DOUBLE_CLICK_BUTTON: Locator;
    private readonly DOUBLE_CLICK_TEXT: Locator;
    private readonly RIGHT_CLICK_BUTTON: Locator;
    private readonly RIGHT_CLICK_TEXT: Locator;
    private readonly HOME_LINK: Locator;
    private readonly DOWNLOAD_BUTTON: Locator;
    private readonly UPLOAD_BUTTON: Locator;
    private readonly UPLOADED_FILE_TEXT: Locator;

    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;
        this.USERNAME_INPUTBOX = page.getByPlaceholder("Username");
        this.PASSWORD_INPUTBOX = page.getByPlaceholder("Password");
        this.SIGNIN_BUTTON = page.getByRole("button", { name: "Sign In" });
        this.TEST_ASSSIGNMENTS_HEADING = page.locator(
            '//div[@class="main-container"]//h1',
        );
        this.WJV_TILE = page.getByLabel("Woodcock Johnson V");
        this.EXAMINEES_HEADER = page.locator(
            '//button[@aria-label="Examinees"]',
        );
        this.LOADING_ICON = page.locator(".loading-icon");
        this.EXAMINEE_MANAGEMENT_HEADING = page.getByRole("heading", {
            name: "EXAMINEE MANAGEMENT",
        }); // Chaining Locators
        this.NOTIFICATION_CENTER = page.locator(
            '//div[@class="WJVHome_mcs_box"]',
        );
        this.REGISTRATION_FORM_CLOSE_BUTTON = page.getByRole("button", {
            name: "Close",
        });
        this.DOUBLE_CLICK_BUTTON = page.locator("#doubleClickBtn");
        this.DOUBLE_CLICK_TEXT = page.getByText("You have done a double click");
        this.RIGHT_CLICK_BUTTON = page.locator("#rightClickBtn");
        this.RIGHT_CLICK_TEXT = page.getByText("You have done a right click");
        this.HOME_LINK = page.getByText("Home", { exact: true });
        this.DOWNLOAD_BUTTON = page.locator(`#downloadButton`);
        this.UPLOAD_BUTTON = page.locator(`#uploadFile`);
        this.UPLOADED_FILE_TEXT = page.getByText("sampleFile.jpeg");
    }

    async navigateToRiverside(): Promise<void> {
        await this.page.goto(process.env.ENVIRONMENT + "");
    }

    // async loginToRiverside(){
    //     await this.USERNAME_INPUTBOX.fill(testConfig.username);
    //     await this.PASSWORD_INPUTBOX.fill(testConfig.password);
    //     await this.SIGNIN_BUTTON.click();
    //     await this.WJV_TILE.click();
    //     await this.page.waitForLoadState();
    // }

    async inputUsername(username: string) {
        await this.USERNAME_INPUTBOX.fill(username);
    }

    async inputPassword(password: string) {
        await this.PASSWORD_INPUTBOX.fill(password);
    }

    async clickSignInButton() {
        await this.SIGNIN_BUTTON.click();
    }

    async selectWJVTile() {
        await this.WJV_TILE.click();
        await this.page.waitForLoadState();
    }

    async validateTestAssignmentsHeading() {
        await expect(this.TEST_ASSSIGNMENTS_HEADING).toBeVisible();
    }

    async clickOnExamineesHeader() {
        await this.EXAMINEES_HEADER.click();
    }

    async expectPageToBeExamineeManagement() {
        await expect(async () => {
            await expect(this.LOADING_ICON).not.toBeVisible({ timeout: 5000 });
            await this.page.reload();
            await expect(this.EXAMINEE_MANAGEMENT_HEADING).toBeVisible();
        }).toPass({ timeout: 60000, intervals: [1000, 2000, 5000] });
    }

    async changeTheHeaderTextTo(text: string) {
        /**
         * Overview of the evaluate() Method
            The evaluate() method in Playwright allows you to execute JavaScript code within the context of a web page.
            This is useful for manipulating the DOM, executing custom functions, and accessing or modifying global variables.
         */
        const element: Locator = this.TEST_ASSSIGNMENTS_HEADING; // Selecting <h1> element

        if (element) {
            await element.evaluate((element, newText) => {
                element.innerHTML = newText; // Set innerHTML to newText
            }, text); // Pass text as an argument
        }
    }

    async assertTheText(text: string) {
        await expect(this.TEST_ASSSIGNMENTS_HEADING).toHaveText(text);
    }

    async verifyNotificationCenterBorderStyle() {
        /**
         * @PerplexityLink = https://www.perplexity.ai/search/i-want-u-to-go-through-the-fol-JRYGnW2bS4ObygN1Huil2A
         */

        const notificationCenter: Locator = this.NOTIFICATION_CENTER;

        const borderStyle = await notificationCenter.evaluate((element) => {
            const computedStyle = window.getComputedStyle(element);
            return `borderWidth= ${computedStyle.borderWidth}, borderStyle= ${computedStyle.borderStyle}`;
        });

        console.log("The border style = ", borderStyle);
    }

    async navigateTo(url: string) {
        /**
         * @PerplexityLink = https://www.perplexity.ai/search/i-want-u-to-go-through-the-fol-JRYGnW2bS4ObygN1Huil2A
         */
        await this.page.evaluate((newURL) => {
            window.location.href = newURL; // Redirecting to another site
        }, url);

        // Wait for navigation to complete
        await this.page.waitForLoadState("networkidle");
        expect(this.page.url()).toBe(url);
    }
}
