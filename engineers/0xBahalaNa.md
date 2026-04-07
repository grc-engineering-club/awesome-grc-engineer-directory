---
name: Luigi Carpio
github: 0xBahalaNa
specializations:
  - Compliance Automation
  - Cloud Security
  - Identity & Access Management
languages:
  - Python
  - Bash

title: GRC Engineer
location: California

linkedin: https://linkedin.com/in/luigi-carpio
blog: https://medium.com/@0xBahalaNa
credly: https://www.credly.com/users/luigi-carpio/badges

frameworks:
  - CJIS
  - FedRAMP
  - NIST 800-53
  - NIST CSF

certifications:
  - SSCP
  - CySA+
  - PenTest+
  - Security+
  - Network+
  - A+
  - Project+
  - ITIL 4 Foundations
  - Linux LPI Essentials

available_for:
  - collaboration
  - freelance
  - hiring
  - open-source

projects:
  - name: CJIS v6.0 to FedRAMP High Gap Analysis
    url: https://github.com/0xBahalaNa/cjis-fedramp-gap-analysis
    description: Control-by-control delta analysis identifying where CJIS v6.0 exceeds FedRAMP High baseline requirements. Covers 13 gap areas including fingerprint-based screening (PS-3), AAL2 phishing-resistant MFA (IA-2), agency-managed encryption keys (SC-28), and CJIS-specific incident reporting (IR-6). Structured in OSCAL-compatible format for automated compliance validation.

  - name: NIST 800-53 Rev 5 to AWS Service Mapping
    url: https://github.com/0xBahalaNa/nist-800-53-rev-5-to-aws-mapping
    description: Maps 31 NIST 800-53 Rev 5 controls to AWS services as an OSCAL Component Definition JSON. Python generator renders markdown with FedRAMP High baseline filtering and CJIS v6.0 delta section. Covers AC, AU, CM, IA, IR, SC, and SI control families.

  - name: AWS Compliance as Code
    url: https://github.com/0xBahalaNa/aws-compliance-as-code
    description: Preventive compliance controls as SCPs and CloudFormation — audit log protection (AU-9), SSH boundary enforcement with condition logic (SC-7), S3 encryption requirements (SC-28), and secure-by-default resource deployment. Mapped across CJIS v6.0, FedRAMP High, and NIST 800-53.

  - name: AWS Config Compliance Monitor
    url: https://github.com/0xBahalaNa/aws-config-compliance-monitor
    description: Event-driven compliance monitoring with AWS Config, EventBridge, Lambda, SNS alerting, and SSM auto-remediation. Deploys Config rules for S3 encryption, security groups, and IAM password policy as CloudFormation. Maps to SI-4, AU-6, CM-6, SC-28, and SC-7 across CJIS/FedRAMP/NIST.

  - name: Policy Checker
    url: https://github.com/0xBahalaNa/policy-checker
    description: Analyzes AWS IAM policies for wildcard permissions, service-level wildcards, inverse IAM fields, and CJIS v6.0 violations (missing MFA on CJI resources, cross-account access without org restrictions). JSON output with NIST 800-53 control mappings. 27 unit tests, GitHub Actions CI/CD.

  - name: IAM Audit
    url: https://github.com/0xBahalaNa/iam-audit
    description: Audits all IAM users for MFA compliance using boto3. Exports timestamped CSV and JSON evidence with compliance rate metrics. Maps to IA-2, AU-12, and AC-2 across CJIS/FedRAMP/NIST.

  - name: Secret Scanner
    url: https://github.com/0xBahalaNa/secret-scanner
    description: Recursive directory scanner for AWS keys, passwords, and secrets with line-number reporting, binary file handling, and non-zero exit codes for CI/CD gating. Maps to IA-5(7), SC-12, and SC-28.
---

## About Me

I'm a GRC Engineer focused on compliance automation for public safety technology. My background spans three years across Identity Governance and Administration (IGA) at a financial institution, including privileged access monitoring, RBAC analysis, and user access reviews, and compliance-focused technical support at public safety technology companies operating in CJIS and FedRAMP High environments serving federal, state, and local agencies.

That combination shaped how I think about compliance: not as a checkbox exercise, but as something that should be engineered into systems. Working in a FedRAMP High environment every day while supporting customers who handle criminal justice information gave me a front-row seat to the operational reality of frameworks like CJIS, FedRAMP, and NIST 800-53, how controls actually work in production, not just on paper.

I build AWS and Python compliance automation tools targeting the intersection of CJIS and FedRAMP requirements: evidence collectors, continuous monitoring pipelines, policy-as-code scanners, and compliance-as-code infrastructure. I'm currently extending this portfolio with OSCAL tooling for FedRAMP 20x, OPA/Rego for policy-as-code, and Terraform for Infrastructure-as-Code.

## Experience Highlights

I build AWS compliance automation tools that map to CJIS v6.0, FedRAMP High, and NIST 800-53 controls, covering evidence collection, event-driven monitoring, auto-remediation, policy-as-code scanning, and preventive guardrails via CloudFormation and SCPs. I identified and fixed six bugs in published GRC Engineering source code during implementation. My IGA background (privileged access monitoring, RBAC analysis, user access reviews) gives me practical grounding in the AC, IA, and AU control families I build tooling against.

https://github.com/0xBahalaNa

## Get in Touch

Feel free to reach out if you want to discuss cloud security, GRC Engineering, public safety technology, or Python!

https://linkedin.com/in/luigi-carpio
