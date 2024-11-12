import { expect, Locator, Page, BrowserContext } from '@playwright/test';


export class RIVERSIDE_LoginPage {
    private readonly page: Page;
    private readonly context: BrowserContext;
    private readonly USERNAME_INPUTBOX: Locator;
    private readonly PASSWORD_INPUTBOX: Locator;
    private readonly SIGNIN_BUTTON: Locator;
    private readonly WJV_TILE: Locator;
    private readonly TEST_ASSSIGNMENTS_HEADING: Locator;
    private readonly NO_RADIO_BUTTON: Locator;
    private readonly WEB_TABLES_HEADER: Locator;
    private readonly WEB_TABLES_EDIT_ICON: Locator;
    private readonly REGISTRATION_FORM_HEADER: Locator;
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
        this.USERNAME_INPUTBOX = page.getByPlaceholder('Username');
        this.PASSWORD_INPUTBOX = page.getByPlaceholder('Password');
        this.SIGNIN_BUTTON = page.getByRole('button', { name: 'Sign In' });
        this.TEST_ASSSIGNMENTS_HEADING = page.getByRole('heading', { name: 'My Test Assignments' });
        this.WJV_TILE = page.getByLabel('Woodcock Johnson V');
        this.NO_RADIO_BUTTON = page.locator(`#noRadio`); // Using CSS Selector
        this.WEB_TABLES_HEADER = page.getByRole('columnheader');
        this.WEB_TABLES_EDIT_ICON = page.getByRole('row', { name: 'Cierra' }).getByTitle('Edit').locator('svg'); // Chaining Locators
        this.REGISTRATION_FORM_HEADER = page.getByText('Registration Form');
        this.REGISTRATION_FORM_CLOSE_BUTTON = page.getByRole('button', { name: 'Close' });
        this.DOUBLE_CLICK_BUTTON = page.locator('#doubleClickBtn');
        this.DOUBLE_CLICK_TEXT = page.getByText('You have done a double click');
        this.RIGHT_CLICK_BUTTON = page.locator('#rightClickBtn');
        this.RIGHT_CLICK_TEXT = page.getByText('You have done a right click');
        this.HOME_LINK = page.getByText('Home', { exact: true });
        this.DOWNLOAD_BUTTON = page.locator(`#downloadButton`);
        this.UPLOAD_BUTTON = page.locator(`#uploadFile`)
        this.UPLOADED_FILE_TEXT = page.getByText('sampleFile.jpeg');
    }

    async navigateToRiverside(): Promise<void> {
        await this.page.goto("https://riversidescore.com/");
    }

    // async loginToRiverside(){
    //     await this.USERNAME_INPUTBOX.fill(testConfig.username);
    //     await this.PASSWORD_INPUTBOX.fill(testConfig.password);
    //     await this.SIGNIN_BUTTON.click();
    //     await this.WJV_TILE.click();
    //     await this.page.waitForLoadState();
    // }

    async inputUsername(username: string){
        await this.USERNAME_INPUTBOX.fill(username);
    }   

    async inputPassword(password: string){  
        await this.PASSWORD_INPUTBOX.fill(password);
    }

    async clickSignInButton(){
        await this.SIGNIN_BUTTON.click();
    } 

    async selectWJVTile(){
        await this.WJV_TILE.click();
        await this.page.waitForLoadState();

    } 

    async validateTestAssignmentsHeading(){
        await expect(this.TEST_ASSSIGNMENTS_HEADING).toBeVisible();
    }


}