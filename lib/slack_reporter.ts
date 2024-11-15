import fs from "fs";
import path from "path";

// Adjust this path to match where your JSON report is saved
const reportPath = path.resolve("playwright-report/custom-reporter/custom-report_*.json");
const files = fs.readdirSync(path.dirname(reportPath)).filter(file => file.startsWith("custom-report_"));
const latestReport = files.length ? path.join(path.dirname(reportPath), files[files.length - 1]) : null;

if (latestReport) {
    try {
        const data = fs.readFileSync(latestReport, "utf-8");
        const report = JSON.parse(data);

        // Create a formatted message combining both metadata and test results
        const formattedMessage = `
          📅 **Time and Date of Execution**: ${report.runTimestamp}

          :bell: **Test Results Notification** :bell:
          
          :page_facing_up: **Repository:** Sunil-302
          :branch: **Branch:** \`${process.env.GITHUB_REF}\`
          :memo: **Results available in Artifacts**: [View Artifacts](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID})
          :clock10: **Commit:** \`${process.env.GITHUB_SHA}\`
          |----------------------------------------------|
  
          | ✅ Passed  => ${report.passed}       |
          | ❌ Failed  => ${report.failed}       |
          | ⏭️ Skipped => ${report.skipped}     |
          | 🔄 Retried => ${report.retried || 0}|
          | 📊 Total   => ${report.totalTests}   |
          ⏰ **Total Execution Duration**: ${report.totalDuration || "N/A"}
          |----------------------------------------------|
          
          Powered by GitHub Actions | Triggered on \`${process.env.GITHUB_EVENT_NAME}\`
        `;
        
        // Write the formatted message to a file for Slack notification
        fs.writeFileSync("./slack-message.txt", formattedMessage);
    } catch (err) {
        console.error("Error parsing the report:", err);
        process.exit(1);
    }
}