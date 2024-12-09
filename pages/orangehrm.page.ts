import { expect, Locator, Page } from "@playwright/test";
import { step } from "../features/steps/basepage";

export class Hrmpage {
    readonly page: Page;
    private readonly inputUsername: Locator;
    private readonly inputPassword: Locator;
    private readonly btnSubmit: Locator;

    private readonly searchInputBox: Locator;
    readonly searchIcon: Locator;
    private readonly loadingIcon: Locator;
    private readonly myInfo: Locator;
    private readonly maleRadioButton: Locator;
    private readonly femaleRadioButton: Locator;
    private readonly successfullyUpdatedMessage: Locator;
    private readonly saveButton: Locator;
    private readonly dependents: Locator;
    private readonly addButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.inputUsername = page.locator('input[name="username"]');
        this.inputPassword = page.locator('input[name="password"]');
        this.btnSubmit = page.locator('button[type="submit"]');
        this.searchInputBox = page.getByPlaceholder(
            "Search for Vegetables and Fruits",
        );
        this.searchIcon = page.getByRole("banner").getByRole("button");
        this.loadingIcon = page.locator(".oxd-form-loader");
        this.myInfo = page.getByRole("link", { name: "My Info" });
        this.maleRadioButton = page
            .locator("label")
            .filter({ hasText: /^Male$/ })
            .locator("span");
        this.femaleRadioButton = page
            .locator("label")
            .filter({ hasText: "Female" })
            .locator("span");
        this.successfullyUpdatedMessage = page.getByText(
            "SuccessSuccessfully Updated×",
        );
        this.saveButton = page
            .locator("form")
            .filter({ hasText: "Employee Full NameEmployee" })
            .getByRole("button");
        this.dependents = page.getByRole("link", { name: "Dependents" });
        this.addButton = page.locator('button[class*="oxd-button--text"]');
    }

    async naviagteToMyInfoPage() {
        await this.myInfo.click();
        await this.loadingIcon.waitFor({ state: "visible", timeout: 20_000 });
        await this.loadingIcon.waitFor({ state: "hidden", timeout: 20_000 });
        await this.saveButton.waitFor({ state: "visible", timeout: 10_000 });
        await this.page.waitForURL("**/viewPersonalDetails/**");
    }

    async changeGender(gender: string) {
        if (gender == "male") {
            await this.maleRadioButton.click();
        } else {
            await this.femaleRadioButton.click();
        }
        await this.saveButton.click();
        await expect(this.successfullyUpdatedMessage).toBeVisible();
    }

    @step("Navigate to dependents page and add new")
    async navigateToDependentsPage() {
        await this.dependents.click();
        await this.page.waitForURL("**/viewDependents/**");
        await this.addButton.first().click();
    }

    async addNewDependent() {
        await this.addButton.first().click();
    }
}
