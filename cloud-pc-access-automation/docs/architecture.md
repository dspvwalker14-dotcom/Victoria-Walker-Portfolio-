# Cloud PC Access Automation — Architecture

## Overview

This document describes the architecture of the Cloud PC Access Automation system, including components, data flows, and integration points.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          External Triggers                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Jira Ticket Created/Updated  │  Schedule (Nightly Sync)  │  Manual Webhook │
└────────────┬────────────────────────────────────────────────────┬───────────┘
             │                                                     │
             ▼                                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Orchestration Layer                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Azure Logic Apps / Power Automate                                          │
│  - Parse Jira payload                                                       │
│  - Route to appropriate workflow                                            │
│  - Error handling & retry logic                                             │
│  - Audit logging                                                            │
└────────────┬────────────────────────────────────────────────────────────────┘
             │
    ┌────────┴────────┬────────────────┬─────────────────┐
    ▼                 ▼                ▼                 ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │   Snapshot   │  │   Provision  │  │   Transition │  │   Revoke     │
  │   Access     │  │  Cloud PC    │  │  Guest->Member│ │  Access      │
  │              │  │  & Groups    │  │              │  │              │
  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
         │                 │                  │                │
         └─────────────────┴──────────────────┴────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API Layer                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Microsoft Graph API (AAD, Groups, App Roles)                               │
│ Intune Management API (Cloud PC Assignment, Policies)                       │
│ Jira REST API (Ticket Updates, Comments)                                   │
│ Azure Key Vault (Credential Retrieval)                                      │
└────────────┬──────────────────────────────────────────────────┬─────────────┘
             │                                                  │
             ▼                                                  ▼
┌──────────────────────────────────────┐   ┌──────────────────────────────┐
│   Microsoft 365 / Entra ID           │   │   Audit & Logging            │
├──────────────────────────────────────┤   ├──────────────────────────────┤
│ • User Accounts                      │   │ • Azure Storage (Events)     │
│ • Security Groups                    │   │ • SharePoint Lists           │
│ • App Role Assignments               │   │ • Immutable Audit Trail      │
│ • Conditional Access Policies        │   │ • Compliance Reports         │
├──────────────────────────────────────┤   └──────────────────────────────┘
│   Intune / Cloud PC                  │
├──────────────────────────────────────┤
│ • Cloud PC Devices                   │
│ • Group Policy / Compliance          │
│ • Device Assignment                  │
│ • Provisioning Policies              │
└──────────────────────────────────────┘
```

## Core Workflows

### 1. Provision Cloud PC for New User

**Trigger**: Jira ticket `[CLOUD-PC] Provision Device for <User>`

**Steps**:
1. **Validate request** — Check user exists in Azure AD; verify requestor is authorized
2. **Query user profile** — Retrieve user's department, role, security clearance
3. **Select device pool** — Match device pool to user profile (e.g., "finance-pool", "dev-pool")
4. **Assign Cloud PC** — Call Intune API to assign device; enroll in device group
5. **Configure policies** — Apply relevant Conditional Access and Intune compliance policies
6. **Assign security groups** — Add user to application-specific groups (e.g., OneDrive, Teams, Line-of-Business app)
7. **Audit & notify** — Log assignment in Azure Storage; post Jira comment with device details

**Expected outcome**: User receives Cloud PC device; can sign in within 15–30 minutes.

### 2. Guest-to-Member Transition

**Trigger**: Jira ticket `[AZURE] Convert <User> from Guest to Member`

**Steps**:
1. **Snapshot current access**:
   - Azure AD group memberships (direct + transitive)
   - App role assignments
   - SharePoint site access
   - Teams memberships
   - OneDrive permissions
   - Any Cloud PC assignments

2. **Change user type** — PATCH user object: `userType: "Guest"` → `"Member"`

3. **Restore access** — Re-apply groups and roles captured in step 1 (may auto-restore depending on policy)

4. **Verify permissions** — Query user's updated memberships; confirm no unintended removals

5. **Update collaboration settings** — Adjust sharing policies, meeting organizer rights, etc.

6. **Audit & notify** — Log before/after state; post summary to Jira

**Expected outcome**: User transitions without losing critical access; audit trail preserved.

### 3. Revoke Access

**Trigger**: Jira ticket `[AZURE] Revoke Access for <User>` or scheduled offboarding

**Steps**:
1. **Collect active sessions** — Query Cloud PC device status; list active Entra ID sessions
2. **Remove group memberships** — Remove from application and resource groups (preserve role groups for audit)
3. **Revoke app role assignments** — Remove user from SaaS apps and Line-of-Business applications
4. **Wipe Cloud PC** — Initiate device wipe or reset in Intune
5. **Mark user as inactive** — Optionally disable or hide from GAL if org policy permits
6. **Archive audit trail** — Move access history to immutable storage for compliance

**Expected outcome**: User loses all access; devices are wiped; audit trail remains for discovery/compliance.

## Data Models

### Access Snapshot

```json
{
  "user": {
    "id": "...",
    "userPrincipalName": "contractor@example.com",
    "displayName": "John Doe",
    "userType": "Guest",
    "createdDateTime": "2024-01-01T00:00:00Z"
  },
  "groups": [
    { "id": "group-id", "displayName": "Finance Team", "type": "SecurityGroup" },
    { "id": "group-id", "displayName": "Acme Inc. Contractors", "type": "DynamicGroup" }
  ],
  "appRoleAssignments": [
    { "id": "assignment-id", "resourceId": "resource-id", "appRoleId": "role-id", "resourceDisplayName": "Salesforce" }
  ],
  "cloudPcAssignments": [
    { "deviceId": "device-id", "deviceName": "CPM-001", "status": "Assigned" }
  ],
  "capturedAt": "2024-06-05T14:30:00Z"
}
```

### Workflow Event (Audit Log)

```json
{
  "eventId": "uuid",
  "timestamp": "2024-06-05T14:30:00Z",
  "workflowType": "ProvisionCloudPC",
  "targetUser": "user@example.com",
  "requestor": "admin@example.com",
  "jiraTicket": "CLOUD-PC-123",
  "action": "assigned_device",
  "details": {
    "deviceId": "device-id",
    "policy": "policy-name"
  },
  "status": "success",
  "errorMessage": null,
  "duration_ms": 1250
}
```

## Security & Compliance

- **Least Privilege**: Service principal uses application-level permissions; no shared accounts
- **Credential Rotation**: Secrets stored in Azure Key Vault; rotated on a schedule
- **Audit Immutability**: Events logged to Azure Storage with encryption and retention policies
- **Rate Limiting**: Jira/Graph API calls throttled to avoid service disruption
- **Error Isolation**: Failed workflows do not cascade; each action is logged separately

## Deployment Considerations

- **Development**: Logic App Standard in dev subscription; test against non-production Entra ID tenant
- **Staging**: Full workflow in staging environment; test with dedicated test users
- **Production**: Managed Identity on Logic App; Azure Monitor alerting on workflow failures; Jira ticket auto-escalation for manual review

## Integration Points

| System      | Method                           | Auth                      | Purpose                           |
|-------------|----------------------------------|---------------------------|-----------------------------------|
| Jira        | REST API                         | API Token (Basic Auth)    | Read tickets; post comments       |
| Azure AD    | Microsoft Graph API              | OAuth 2.0 (Client Creds)  | Query/modify users, groups        |
| Intune      | Microsoft Graph/Intune API       | OAuth 2.0 (Client Creds)  | Assign Cloud PC, policies         |
| Key Vault   | Managed Identity                 | Azure RBAC                | Retrieve credentials              |
| Audit       | Azure Storage Tables/Blobs       | Managed Identity          | Persist event logs                |

## Error Handling

- **Transient errors** (e.g., throttling, timeouts) — Automatic retry with exponential backoff
- **Validation errors** (e.g., user not found) — Fail fast; post detailed error to Jira
- **Partial failures** (e.g., group add succeeded, policy apply failed) — Log each step; alert for manual remediation
- **Critical failures** (e.g., API authentication) — Page on-call engineer; create high-priority Jira ticket

## Monitoring & Alerting

- **Azure Monitor**: Track Logic App runs, API call latency, error rates
- **Jira Alerts**: Auto-escalate long-running workflows to high-priority status
- **Email/Teams**: Daily digest of provisioned users, failed workflows, and pending approvals

## Future Enhancements

- Self-service request portal (Power Apps)
- Dynamic policy templates based on role/department
- ML-based anomaly detection for access changes
- Multi-cloud support (AWS IAM, GCP identity)
- Advanced compliance reporting (SOC 2, FedRAMP)
