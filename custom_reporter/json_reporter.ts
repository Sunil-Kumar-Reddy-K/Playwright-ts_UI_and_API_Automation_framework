import { Reporter, TestCase, TestResult, FullConfig, Suite, FullResult } from "@playwright/test/reporter";
import moment from "moment";
import * as fs from "fs";
import * as path from "path";

interface TestResultData {
  name: string;
  status: TestResult["status"];
  error?: string;
  retryCount?: number;
}

interface CustomReport {
  runTimestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  retried: number;
  totalDuration?: string;
  tests: TestResultData[];
}

class MyReporter implements Reporter {
  private reportData: CustomReport = {
    runTimestamp: moment().format("MMMM Do YYYY, h:mm:ss a"),
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    retried: 0,
    tests: [],
  };

  onBegin(config: FullConfig, suite: Suite) {
    this.reportData.totalTests = suite.allTests().length;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testResult: TestResultData = {
      name: test.title,
      status: result.status,
    };

    if (result.status === "failed" || result.status === "timedOut") {
      testResult.error = result.error?.message || "No error message available";
      this.reportData.failed++;
    } else if (result.status === "skipped") {
      this.reportData.skipped++;
    } else if (result.status === "passed") {
      this.reportData.passed++;
    }

    // Handle retries
    if (test.results.length > 1) {
      testResult.retryCount = test.results.length - 1;
      this.reportData.retried++;
    }

    this.reportData.tests.push(testResult);
  }

  async onEnd(result: FullResult) {
    // Calculate total duration
    this.reportData.totalDuration = `${Math.floor(result.duration / 60000)}m ${Math.floor((result.duration % 60000) / 1000)}s`;

    // Prepare the folder path for the report
    const folderPath = path.resolve("playwright-report/custom-reporter");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate a timestamped filename
    const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
    const reportPath = path.join(folderPath, `custom-report_${timestamp}.json`);

    try {
      // Save the JSON report to the specified path
      fs.writeFileSync(reportPath, JSON.stringify(this.reportData, null, 2));
      console.log(`Custom report saved to ${reportPath}`);
    } catch (error) {
      console.error(`Failed to save custom report: ${error}`);
    }
  }
}

export default MyReporter;
