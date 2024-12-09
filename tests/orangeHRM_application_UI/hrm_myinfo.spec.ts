import test from "../../features/steps/basepage";

test.describe.parallel("Edit info on Myinfo page", () => {
    test(
        `Edit gender and dependents at myinfo page`,
        { tag: ["@UI", "@HRM"] },
        async ({ hrmPage }) => {
            await test.step("Navigate to my info page and change the gender", async () => {
                await hrmPage.naviagteToMyInfoPage();
                await hrmPage.changeGender("female");
            });

            // await test.step("Navigate to Dependents from my info page and add new", async () => {
            //     await hrmPage.navigateToDependentsPage();
            //     await hrmPage.addNewDependent();
            // });

            await hrmPage.navigateToDependentsPage();
            await hrmPage.addNewDependent();
        },
    );
});
