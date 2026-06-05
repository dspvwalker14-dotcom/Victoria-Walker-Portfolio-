# Guest-to-Member Azure AD Workflow

This project automates a Jira-triggered Azure AD contractor user conversion from `Guest` to `Member`, while capturing and preserving the contractor's existing access assignments.

## What it does

- retrieves the contractor user by email
- snapshots Azure AD group memberships and app role assignments
- changes the user's `userType` from `Guest` to `Member`
- re-applies any preserved group and application role assignments if needed
- updates the Jira ticket with the result

## Setup

### 1. Install Node.js

Install Node.js 18+ and npm.

### 2. Register an Azure AD app

Grant the app these Microsoft Graph permissions:
- `User.ReadWrite.All`
- `Group.ReadWrite.All`
- `Application.Read.All`
- `AppRoleAssignment.ReadWrite.All`
- `Directory.Read.All`

Use client credentials flow with a client secret.

### 3. Configure Jira access

Create an API token for the Jira service account and note:
- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`

### 4. Create `.env`

Create a `.env` file in the project root with:

```env
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
JIRA_BASE_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your-jira-service-account@example.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_ISSUE_KEY=PROJECT-123
TARGET_USER_EMAIL=contractor@example.com
```

### 5. Install dependencies

```bash
npm install
```

### 6. Run the workflow

```bash
npm run start
```

### 7. Optional: Dry run and verification

The script writes a snapshot file when it captures existing access. Review it before making changes.

## Notes

- This script is built for a CLI-triggered workflow. In production, plug it into a Jira webhook, Logic App, or Azure Function.
- Always test on a non-production tenant or a delegated test account before running against live users.
