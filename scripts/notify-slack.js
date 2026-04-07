const fs = require("fs/promises");
const { execSync } = require("child_process");

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

function parseJobFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  var fm = {};
  var currentKey = null;
  var currentList = null;

  match[1].split("\n").forEach(function (line) {
    var listItem = line.match(/^\s+-\s+"?([^"]*)"?$/);
    if (listItem && currentKey) {
      if (!currentList) currentList = [];
      currentList.push(listItem[1]);
      fm[currentKey] = currentList;
      return;
    }

    if (currentList) {
      currentList = null;
      currentKey = null;
    }

    var kv = line.match(/^(\w[\w_]*)\s*:\s*"?([^"]*)"?$/);
    if (kv) {
      currentKey = kv[1];
      var val = kv[2].trim();

      if (val === "[]" || val === "") {
        fm[currentKey] = val === "[]" ? [] : "";
      } else {
        fm[currentKey] = val;
      }
      currentList = null;
    }
  });

  return fm;
}

function buildSlackBlock(job) {
  var title = job.title || "Untitled Role";
  var company = job.company || "Unknown";
  var location = job.location || "";
  var workModes = Array.isArray(job.work_modes) ? job.work_modes.join(", ") : "";
  var jobTypes = Array.isArray(job.job_types) ? job.job_types.join(", ") : "";
  var frameworks = Array.isArray(job.frameworks) ? job.frameworks : [];
  var specializations = Array.isArray(job.specializations) ? job.specializations : [];
  var compensation = job.compensation || "";
  var applyUrl = job.apply_url || job.role_url || "";

  var details = [];
  if (location) details.push(":round_pushpin: " + location);
  if (workModes) details.push(workModes);
  if (jobTypes) details.push(jobTypes);

  var tags = [];
  if (frameworks.length) tags.push(":shield: " + frameworks.join(", "));
  if (specializations.length) tags.push(":dart: " + specializations.join(", "));

  var lines = [
    ":briefcase: *" + title + "* at *" + company + "*"
  ];

  if (details.length) lines.push(details.join(" · "));
  if (compensation) lines.push(":moneybag: " + compensation);
  if (tags.length) lines.push(tags.join("\n"));
  if (applyUrl) lines.push("<" + applyUrl + "|Apply →>");

  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: lines.join("\n")
    }
  };
}

async function getNewJobFiles() {
  try {
    var output = execSync(
      'git diff HEAD~1 --name-only --diff-filter=A -- "jobs/imported/"',
      { encoding: "utf8" }
    );
    return output.trim().split("\n").filter(Boolean);
  } catch (error) {
    console.log("No previous commit to diff against, checking all imported jobs.");
    return [];
  }
}

async function postToSlack(blocks) {
  var payload = { blocks: blocks };

  var response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Slack POST failed: " + response.status + " " + (await response.text()));
  }
}

async function main() {
  if (!WEBHOOK_URL) {
    console.log("SLACK_WEBHOOK_URL not set, skipping Slack notification.");
    return;
  }

  var newFiles = await getNewJobFiles();

  if (!newFiles.length) {
    console.log("No new jobs to notify about.");
    return;
  }

  console.log("Found " + newFiles.length + " new job(s) to post.");

  var blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: ":rocket: New GRC Job Listings",
        emoji: true
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: newFiles.length + " new role" + (newFiles.length === 1 ? "" : "s") + " found today on the <https://directory.grcengclub.com/jobs/|GRC Job Board>"
        }
      ]
    },
    { type: "divider" }
  ];

  for (var filePath of newFiles) {
    try {
      var content = await fs.readFile(filePath, "utf8");
      var job = parseJobFrontmatter(content);
      if (!job || !job.title) continue;
      blocks.push(buildSlackBlock(job));
      blocks.push({ type: "divider" });
    } catch (error) {
      console.warn("Skipped " + filePath + ": " + error.message);
    }
  }

  if (blocks.length <= 3) {
    console.log("No valid jobs to post after parsing.");
    return;
  }

  // Slack limits blocks to 50 per message — batch if needed
  var batchSize = 48;
  for (var i = 0; i < blocks.length; i += batchSize) {
    await postToSlack(blocks.slice(i, i + batchSize));
  }

  console.log("Posted " + newFiles.length + " job(s) to Slack.");
}

main().catch(function (error) {
  console.error(error.message || error);
  process.exitCode = 1;
});
