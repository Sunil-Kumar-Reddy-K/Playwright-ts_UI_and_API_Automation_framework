import base from '../../features/steps/basepage';
import { TodoPage } from '../../pages/todo.page';

const test = base.extend<{ todoPage: TodoPage }>({
    todoPage: async ({ page }, use) => {
        const todoPage = new TodoPage(page)
        await todoPage.goto()
        await todoPage.addToDo('item1')
        await todoPage.addToDo('item2')
        await use(todoPage)
        await todoPage.removeAll()
    },
})

test('should add an item', async ({ todoPage }) => {
    await todoPage.addToDo('my item')
})

test('should remove an item', async ({ todoPage }) => {
    await todoPage.remove()
})