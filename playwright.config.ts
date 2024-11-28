import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig, defineBddProject } from 'playwright-bdd';
import { OrtoniReportConfig } from "ortoni-report";
import moment from "moment";
import dotenv from 'dotenv';

// Generate a timestamp for unique report folder names
const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");

const testDir = defineBddConfig({
  language: 'en',
  features: "features/**.feature",
  steps: "features/steps/**.ts",
});

const reportConfig: OrtoniReportConfig = {
  open: process.env.CI ? "never" : "never",
  folderPath: "playwright-report/ortoni-report",
  filename: `ortoni-report_${timestamp}.html`,
  title: "Test Report",
  showProject: !true,
  projectName: "Playwright Automation",
  testType: "Regression",
  authorName: "Sunil Kalluru",
  base64Image: false,
  stdIO: true,
  preferredTheme: "light"
};

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

dotenv.config({ path: `env/.env.${process.env.ENV}`});

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 3 : 3,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI 
    ? [ 
        ["list"], // Minimal reporter for CI
        ["html", { outputFolder: `playwright-report/html-reports/report_${timestamp}` }],
        ['./custom_reporter/json_reporter.ts'],
        // ["json", { outputFile: `playwright-report/json-reports/test-results_${timestamp}.json` }],
        // ["junit", { outputFile: `playwright-report/junit-reports/test-results_${timestamp}.xml` }] 
      ] 
    : [ 
        ["list"], // More detailed local report
        ["html", { outputFolder: `playwright-report/html-reports/report_${timestamp}` }], 
        ["ortoni-report", reportConfig],
        // ['./custom_reporter/txt_reporter.ts'],
        ['./custom_reporter/json_reporter.ts'],

        // ["json", { outputFile: `playwright-report/json-reports/test-results_${timestamp}.json` }]
      ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://rahulshettyacademy.com/',
    headless: true,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
  },

  snapshotPathTemplate: '__snapshots__/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{-snapshotSuffix}{ext}',


  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      testDir: "./tests",

      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "bdd_chromium",
      testDir,
      use: { ...devices["Desktop Chrome"] },
    },

    {
      ...defineBddProject({
        name: 'Project_01',
        features: 'project-one/*.feature',
        steps: 'project-one/steps/*.ts',
      }),
    },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
