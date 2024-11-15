import { Reporter, TestCase, TestResult, FullResult, FullConfig, Suite } from "@playwright/test/reporter";
import moment from "moment";
import * as fs from "fs"; // File system module
import * as path from "path"; // Path module for handling folder structure

class MyReporter implements Reporter {
  introMessage = "";
  failsMessage = "";
  passed = 0;
  failed = 0;
  skipped = 0;

  onBegin(config: FullConfig, suite: Suite) {
    this.introMessage = `- Test run started at ${moment().format("MMMM Do YYYY, h:mm:ss a")}\n- Number tests cases to run: ${suite.allTests().length}`;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    switch (result.status) {
      case "failed":
      case "timedOut":
        this.addFailMessage(`❌ Test ${test.title} failed\n>${result.error?.message}`);
        this.failed++;
        break;
      case "skipped":
        this.addFailMessage(`⚠️ Test ${test.title} skipped`);
        this.skipped++;
        break;
      case "passed":
        this.passed++;
        break;
    }
  }

  async onEnd(result: FullResult) {
    const message = await this.buildMessage(result);

    // Create the 'custom-reporter' folder if it doesn't exist
    const folderPath = path.resolve("playwright-report/custom-reporter");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    // Generate filename with date and time to avoid overwriting
    const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
    const reportPath = path.join(folderPath, `text-report_${timestamp}.txt`);

    // Write the report to the generated file path
    fs.writeFileSync(reportPath, message);

    console.log(`Custom report saved to ${reportPath}`);
  }

  private addFailMessage(message: string) {
    this.failsMessage += `\n${message}`;
  }

  private async buildMessage(result: FullResult) {
     const duration = moment.duration(result.duration, "milliseconds");
     const minutes = Math.floor(duration.asMinutes());
     const seconds = duration.seconds();

    const resultMarkdownMessage = `
      Test run results
      ---
      ${this.introMessage}
      ---
      Summary:
        - ⌛ Duration  of test run: ${minutes} minutes and ${seconds} seconds
        - 📦 Tests results: 
          - ✅ ${this.passed}
          - ❌ ${this.failed}
          - ⏩ ${this.skipped}
      
      ${this.failsMessage ? `Tests Failed ❌\n${this.failsMessage}` : "👍 All tests passed successfully!"}
          
      To see the full report, please visit our CI/CD pipeline with reporter.`;

    return resultMarkdownMessage;
  }
}

export default MyReporter;
