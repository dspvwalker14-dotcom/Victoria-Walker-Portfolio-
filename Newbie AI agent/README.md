# Newbie AI Agent — IT Onboarding Scheduling

## Project Overview

This project implements a workflow automation that mirrors an n8n onboarding scheduling flow for IT. It listens for Jira onboarding tickets, extracts new hire details, checks Outlook calendar availability, creates an IT onboarding meeting, sends a welcome email, and updates the Jira ticket with the result.

## Problem Statement

Many IT teams still schedule onboarding manually after a Jira ticket is created. This creates delays, scheduling conflicts, and inconsistent communication for new hires.

## Solution

This project delivers a maintainable TypeScript implementation with clear modules for:

- Jira integration
- Microsoft Graph calendar scheduling
- Email sending
- Scheduling logic and availability checks
- Validation and error handling
- Configuration through environment variables

The workflow is designed to be webhook-driven, testable, and easy to extend.

## Folder Structure

```
Newbie AI agent/
  README.md
  .env.example
  package.json
  tsconfig.json
  example-jira-webhook.json
  scripts/
    run-webhook-server.sh
  src/
    index.ts
    server.ts
    config.ts
    errors.ts
    validation.ts
    utils/
      logger.ts
    jira/
      jiraClient.ts
      jiraWebhookHandler.ts
      jiraMapper.ts
    microsoft/
      graphClient.ts
      calendarService.ts
      emailService.ts
    scheduling/
      availability.ts
      businessHours.ts
    workflow/
      onboardingWorkflow.ts
```

## Setup Instructions

1. Copy `.env.example` to `.env`.
2. Fill in your Jira and Microsoft Azure credentials.
3. Install dependencies:

```bash
cd "Newbie AI agent"
npm install
```

4. Build the project:

```bash
npm run build
```

5. Start the webhook server locally for Jira events:

```bash
npm run start:webhook
```

6. Use `src/index.ts` as the workflow entry point in a serverless deployment, or use `src/server.ts` for a local Express webhook server.

## Workflow Mapping to n8n

This project mirrors an n8n workflow by splitting the process into distinct, reusable nodes:

- Jira webhook listener -> `jira/jiraWebhookHandler.ts`
- Field extraction and mapping -> `jira/jiraMapper.ts`
- Validation node -> `validation.ts`
- Calendar availability and scheduling -> `scheduling/availability.ts`, `scheduling/businessHours.ts`
- Outlook event creation -> `microsoft/calendarService.ts`
- Email node -> `microsoft/emailService.ts`
- Jira update node -> `jira/jiraClient.ts`
- Workflow orchestration -> `workflow/onboardingWorkflow.ts`

## Notes

- The scheduling logic is unit-testable and separated from API clients.
- All sensitive configuration is driven from environment variables.
- Error handling logs failures and posts Jira comments for failed steps.
