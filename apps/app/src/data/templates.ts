export interface TemplateStep {
  id: string;
  title: string;
  description: string;
  roleId: string;
  order: number;
}

export interface TemplateRole {
  id: string;
  name: string;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  roles: TemplateRole[];
  steps: TemplateStep[];
}

export const templates: Template[] = [
  {
    id: "incident-response",
    name: "Incident Response",
    description: "Contain, investigate, and recover from production incidents with clear ownership and comms cadence.",
    category: "Operations",
    roles: [
      { id: "ic", name: "Incident Commander", description: "Owns the incident timeline, delegates tasks, and runs the comms cadence." },
      { id: "sme", name: "Subject Matter Expert", description: "Investigates root cause and implements the fix." },
      { id: "comms", name: "Communications Lead", description: "Drafts and sends status updates to stakeholders and customers." },
    ],
    steps: [
      { id: "ir-1", title: "Declare Incident", description: "Acknowledge the alert, declare severity, and start the incident clock. Post in #incidents.", order: 1, roleId: "ic" },
      { id: "ir-2", title: "Assemble Response Team", description: "Pull the on-call SME and Comms Lead into a war room. Confirm availability.", order: 2, roleId: "ic" },
      { id: "ir-3", title: "Triage and Contain", description: "Identify the blast radius. Roll back, toggle feature flags, or drain traffic to contain damage.", order: 3, roleId: "sme" },
      { id: "ir-4", title: "Investigate Root Cause", description: "Trace logs, diff recent deploys, check dependent services. Document findings in the incident thread.", order: 4, roleId: "sme" },
      { id: "ir-5", title: "Implement Fix", description: "Deploy the fix through the emergency deploy path. Validate with smoke tests.", order: 5, roleId: "sme" },
      { id: "ir-6", title: "Send Status Update", description: "Draft and send a customer-facing or internal status update. Keep it factual, no speculation.", order: 6, roleId: "comms" },
      { id: "ir-7", title: "Resolve and Close", description: "Confirm metrics are stable. Close the incident. Schedule a blameless postmortem within 48 hours.", order: 7, roleId: "ic" },
    ],
  },
  {
    id: "product-launch",
    name: "Product Launch",
    description: "Ship a feature from final QA through go-to-market, with engineering, marketing, and support alignment.",
    category: "Product",
    roles: [
      { id: "pm", name: "Product Manager", description: "Owns the launch checklist, GTM timeline, and stakeholder sign-off." },
      { id: "eng", name: "Engineering Lead", description: "Ensures the feature is deployed, monitored, and feature-flagged correctly." },
      { id: "mktg", name: "Marketing Lead", description: "Prepares the announcement, blog post, social copy, and customer email." },
      { id: "support", name: "Support Lead", description: "Prepares help docs, canned responses, and trains the support team." },
    ],
    steps: [
      { id: "pl-1", title: "Final QA Sign-off", description: "Run the full regression suite. Product signs off on acceptance criteria.", order: 1, roleId: "pm" },
      { id: "pl-2", title: "Feature Flag Audit", description: "Confirm the feature is behind a flag. Verify kill-switch works. Set gradual rollout percentage.", order: 2, roleId: "eng" },
      { id: "pl-3", title: "Monitoring Dashboard", description: "Create a launch dashboard with key metrics: error rate, latency, conversions, support ticket volume.", order: 3, roleId: "eng" },
      { id: "pl-4", title: "Marketing Assets Ready", description: "Blog post drafted and reviewed. Social copy queued. Email sequence approved. Press kit if relevant.", order: 4, roleId: "mktg" },
      { id: "pl-5", title: "Support Readiness", description: "Help center articles published. Support team briefed on known edge cases. Canned responses loaded.", order: 5, roleId: "support" },
      { id: "pl-6", title: "Staged Rollout", description: "Enable the feature for 10% → 50% → 100% over the rollout window. Watch the dashboard at each step.", order: 6, roleId: "eng" },
      { id: "pl-7", title: "Go Live — Announce", description: "Publish the blog post, send the email, post on social. Coordinate timing across channels.", order: 7, roleId: "mktg" },
      { id: "pl-8", title: "Launch Retrospective", description: "Review metrics after 48 hours. Document what went well and what to improve for the next launch.", order: 8, roleId: "pm" },
    ],
  },
  {
    id: "customer-offboarding",
    name: "Customer Offboarding",
    description: "Handle account cancellation with data export, feedback collection, and clean service teardown.",
    category: "Customer Success",
    roles: [
      { id: "csm", name: "Customer Success Manager", description: "Owns the offboarding conversation, collects feedback, and confirms data export." },
      { id: "eng", name: "Engineering", description: "Runs the data export, purges PII, and decommissions resources." },
      { id: "finance", name: "Finance", description: "Processes final invoice or refund. Confirms subscription cancellation." },
    ],
    steps: [
      { id: "co-1", title: "Receive Cancellation Request", description: "Log the cancellation in the CRM. Confirm the request is authorized by the account owner.", order: 1, roleId: "csm" },
      { id: "co-2", title: "Exit Interview", description: "Schedule a 15-minute call or send a feedback form. Capture reason for churn.", order: 2, roleId: "csm" },
      { id: "co-3", title: "Data Export", description: "Generate a full data export (projects, assets, analytics). Deliver via secure link with 7-day expiry.", order: 3, roleId: "eng" },
      { id: "co-4", title: "Final Billing", description: "Issue the final invoice for unbilled usage. Process any eligible refund. Confirm subscription cancelled in payment processor.", order: 4, roleId: "finance" },
      { id: "co-5", title: "Data Purge", description: "Schedule PII deletion per retention policy. Tear down dedicated infrastructure. Revoke access tokens.", order: 5, roleId: "eng" },
      { id: "co-6", title: "Close and Report", description: "Mark account as closed. Log churn reason in the monthly report. Send confirmation email to customer.", order: 6, roleId: "csm" },
    ],
  },
  {
    id: "security-audit",
    name: "Security Audit",
    description: "Quarterly security review covering access controls, dependency CVEs, infrastructure posture, and compliance artifacts.",
    category: "Security",
    roles: [
      { id: "sec", name: "Security Lead", description: "Owns the audit scope, runs the review, and writes the audit report." },
      { id: "eng", name: "Engineering Lead", description: "Remediates findings and applies patches." },
      { id: "ops", name: "Infrastructure Lead", description: "Reviews IAM, network policies, and infrastructure-as-code for drift." },
    ],
    steps: [
      { id: "sa-1", title: "Define Audit Scope", description: "List systems, repos, and infrastructure in scope. Confirm compliance framework requirements (SOC 2, ISO 27001, etc.).", order: 1, roleId: "sec" },
      { id: "sa-2", title: "Access Control Review", description: "Audit IAM roles, service account permissions, and SSH key inventory. Revoke stale access.", order: 2, roleId: "ops" },
      { id: "sa-3", title: "Dependency Scan", description: "Run `pnpm audit` and Dependabot across all repos. Prioritize critical/high CVEs. Open remediation tickets.", order: 3, roleId: "eng" },
      { id: "sa-4", title: "Infrastructure Posture", description: "Review firewall rules, security groups, and network policies. Check for open ports, unencrypted endpoints, and unpatched hosts.", order: 4, roleId: "ops" },
      { id: "sa-5", title: "Secrets Hygiene", description: "Scan repos and logs for hardcoded secrets. Rotate any exposed credentials. Verify secret manager access controls.", order: 5, roleId: "sec" },
      { id: "sa-6", title: "Remediate Findings", description: "Apply patches, rotate keys, tighten policies. Document each remediation with a link to the commit or change request.", order: 6, roleId: "eng" },
      { id: "sa-7", title: "Publish Audit Report", description: "Write the audit summary: scope, findings (critical/high/medium/low), remediations applied, residual risk. Distribute to stakeholders.", order: 7, roleId: "sec" },
    ],
  },
];
