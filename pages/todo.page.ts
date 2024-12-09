import { Locator, Page } from "@playwright/test";

export class TodoPage {
    readonly page: Page;
    private readonly inputTodo: Locator;
    private readonly delete: Locator;
    private readonly checkBoxes: Locator;

    constructor(page: Page) {
        this.page = page;
        this.inputTodo = page.getByPlaceholder("What needs to be done?");
        this.delete = page.locator('//button[@aria-label="Delete"]');
        this.checkBoxes = page.locator(
            '//input[@type="checkbox"][@class="toggle"]',
        );
    }

    async goto() {
        await this.page.goto("https://demo.playwright.dev/todomvc/#/");
        await this.page.waitForLoadState();
    }

    async addToDo(text: string) {
        await this.inputTodo.fill(text);
        await this.inputTodo.press("Enter");
    }

    async removeAll() {
        const todoList: Locator[] = await this.checkBoxes.all();
        const todoDeleteList: Locator[] = await this.delete.all();

        for (let i = 0; i < todoList.length; i++) {
            await this.page.waitForLoadState("domcontentloaded");
            await todoList[0].hover();
            await todoDeleteList[0].click();
        }
    }

    async remove() {
        const todoList: Locator[] = await this.checkBoxes.all();
        const todoDeleteList: Locator[] = await this.delete.all();

        for (let i = 0; i < todoList.length; i++) {
            await this.page.waitForLoadState("domcontentloaded");
            await todoList[0].hover();
            await todoDeleteList[0].click();
        }
    }
}
