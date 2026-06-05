# Cloud PC Access Automation

## Project Overview

Cloud PC Access Automation is an enterprise solution for managing access provisioning, assignment, and troubleshooting of Microsoft Cloud PC (Windows 365 and Intune) environments at scale. It automates access control workflows triggered by Jira tickets, integrating Azure AD, Intune, and notification systems to ensure contractors, employees, and partners receive appropriate access permissions with minimal manual overhead.

## Problem Statement

Organizations managing hybrid workforces with Cloud PC deployments face several challenges:

1. **Manual access provisioning** — IT staff manually assign Cloud PC devices, configure Entra ID group memberships, and apply Intune policies for each user request, leading to delays and inconsistencies.
2. **Inconsistent onboarding** — New contractors lack standardized access rules; some receive full permissions, others partial, creating compliance and security gaps.
3. **Audit and compliance gaps** — Manual workflows leave incomplete trails; role-based access policies are not enforced consistently.
4. **High operational cost** — Reactive support tickets and lack of automation consume 40-60% of IT admin time for routine access changes.
5. **Guest-to-Member transitions** — When contractors transition to permanent staff, their existing access (Cloud PC assignments, security groups, app permissions) must be preserved and re-applied correctly.

## Solution

This project provides a **declarative, event-driven automation framework** that:

1. **Ingests Jira tickets** describing the access change (e.g., "Provision Cloud PC for contractor John", "Upgrade Jane from guest to member")
2. **Snapshots current state** of the user's access (Cloud PC assignments, group memberships, app roles)
3. **Applies policy-driven workflows** using Intune, Azure AD, and Graph API to enforce the requested change
4. **Preserves permissions** during transitions (guest-to-member, contractor-to-employee)
5. **Audits and logs** all changes to a centralized store for compliance
6. **Notifies stakeholders** via Jira comments, email, and Teams messages upon completion or failure

## Key Features

- **Jira Integration**: Trigger workflows via ticket creation/transition
- **Azure AD Automation**: User type changes, group membership management, app role assignments
- **Intune Cloud PC Management**: Device assignment, policy application, compliance verification
- **Access Snapshot & Restore**: Capture pre-change state; re-apply permissions after transitions
- **Audit Logging**: Immutable record of all provisioning actions
- **Error Handling & Retry**: Graceful failure modes with detailed error reports to Jira
- **Extensible Webhooks**: Integrate with Logic Apps, Power Automate, or custom services

## Technologies Used

- **Microsoft Graph API** — Query and modify Azure AD, Intune, and user objects
- **Azure Logic Apps / Power Automate** — Orchestrate workflows and integrate with Jira
- **Jira REST API** — Consume ticket data and post status updates
- **Node.js / TypeScript** — CLI and scheduled task execution
- **Azure Key Vault** — Secure credential storage
- **Azure Storage / SharePoint** — Audit log persistence
- **Intune Management API** — Cloud PC and policy assignment

## Business Impact

- **Reduces provisioning time** from 1-2 days to <30 minutes
- **Improves compliance** through consistent, auditable workflows
- **Cuts operational cost** by automating 80% of routine access changes
- **Enhances security** via policy enforcement and least-privilege assignment
- **Strengthens contractor onboarding** with standardized, repeatable processes
- **Enables self-service** for low-risk requests through pre-defined workflows

## Getting Started

See [Architecture](docs/architecture.md) for technical design.

Scripts and configuration templates are in `scripts/`.

### Prerequisites

- Azure AD tenant with appropriate Graph API permissions
- Intune environment with Cloud PC licenses
- Jira Cloud or Server instance with API access
- Node.js 18+ and npm (optional for local testing)

### Quick Start

1. Review [Architecture](docs/architecture.md)
2. Configure Azure AD app registration with Graph permissions
3. Set up a Jira service account and API token
4. Create a Logic App or deploy the CLI script
5. Test on a non-production user first

## Support

For issues, enhancements, or architecture questions, contact the IT Engineering team.