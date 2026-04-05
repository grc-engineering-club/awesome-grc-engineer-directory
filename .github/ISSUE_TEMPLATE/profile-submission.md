---
name: Submit Your Profile
about: Add yourself to the GRC Engineer Directory
title: "New Profile: YOUR-GITHUB-USERNAME"
labels: profile-submission
---

<!-- PROFILE_SUBMISSION -->
```yaml
---
# REQUIRED — fill these in
name: "Your Full Name"
github: "your-github-username"
specializations:
  - "Cloud Security"
# Options: Audit & Assurance, Cloud Security, Compliance Automation,
#   Identity & Access Management, Incident Response, Offensive Security,
#   Privacy, Risk Management, Security Architecture, Security Governance,
#   Security Operations, Third-Party Risk, Vulnerability Management

# OPTIONAL — remove lines you don't need
title: "Your Job Title"
company: "Your Company"
location: "City, Country"
linkedin: "https://linkedin.com/in/your-profile"
twitter: "@yourhandle"
bluesky: "yourname.bsky.social"
website: "https://your-website.com"
blog: "https://your-blog.com"
youtube: "your-channel-handle"
huggingface: "your-username"
credly: "https://www.credly.com/users/your-username/badges"

frameworks:
  - "SOC 2"
  - "FedRAMP"
# Options: CCPA, CJIS, CMMC, CMS ARC-AMPE, COBIT, CSA STAR, EU AI Act,
#   FedRAMP, GAO Green Book, GDPR, GovRAMP, HIPAA, HITRUST, IRS Pub 1075,
#   ISO 27001, ISO 27017, ISO 27018, ISO 42001, NIST 800-53, NIST 800-171,
#   NIST AI RMF, NIST CSF, NIST RMF, PCI-DSS, SOC 2, StateRAMP

languages:
  - "Python"
  - "Terraform"
# Options: Bash, Go, JavaScript, OPA/Rego, OSCAL, PowerShell, Python, Rust, SQL, Terraform

certifications:
  - "CISSP"

available_for:
  - "mentoring"
  - "open-source"
# Options: mentoring, speaking, consulting, open-source, hiring, freelance, collaboration

projects:
  - name: "Project Name"
    url: "https://github.com/you/project"
    description: "Brief description"
---

## About Me

Your bio here (2-4 paragraphs).

## Experience Highlights

- Key accomplishment or experience
- Another notable achievement

## Get in Touch

How people should reach out to you.
```

<!--
  HOW THIS WORKS:
  1. Edit the YAML and markdown above with your info
  2. Update the issue title to: New Profile: your-github-username
  3. Submit the issue
  4. A GitHub Action will automatically create a PR with your profile
-->
