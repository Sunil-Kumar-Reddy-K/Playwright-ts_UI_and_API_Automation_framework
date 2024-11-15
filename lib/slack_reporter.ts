import fs from "fs";
import path from "path";

// Adjust this path to match where your JSON report is saved
const reportPath = path.resolve(__dirname, "../custom_reporter/custom-report_*.json");

try {
    // Read all matching JSON files and get the latest one
    const files = fs.readdirSync(path.dirname(reportPath));
    const latestReport = files.filter(file => file.startsWith('custom-report_')).sort().pop();
    const fullReportPath = path.join(path.dirname(reportPath), latestReport!);

    console.log("Reading report from:", fullReportPath);
    
    const data = fs.readFileSync(fullReportPath, "utf-8");
    const report = JSON.parse(data);
    
    // Create a simple text message without emojis
    const formattedMessage = `
Time and Date of Execution: ${report.runTimestamp}
--------------------------------------
Status         | Count
---------------|-------------------
Passed         | ${report.passed}
Failed         | ${report.failed}
Skipped        | ${report.skipped}
Retried        | ${report.retried || 0}
Total          | ${report.totalTests}
Total Execution Duration: ${report.totalDuration || "N/A"}
--------------------------------------
`;

    fs.writeFileSync("./slack-message.txt", formattedMessage);
    console.log("Slack message written to slack-message.txt");
} catch (err) {
    console.error("Error parsing the report:", err);
    process.exit(1);
}

