import { parseJiraWebhook, isOnboardingTicket, JiraIssuePayload } from '../jira/jiraWebhookHandler';
import { mapIssueToNewHire, NewHireInfo } from '../jira/jiraMapper';
import { validateWebhookEvent, validateNewHireInfo } from '../validation';
import { findOnboardingSlot, createOnboardingEvent } from '../microsoft/calendarService';
import { sendWelcomeEmail } from '../microsoft/emailService';
import { postInternalJiraComment } from '../jira/jiraClient';
import { error, info } from '../utils/logger';
import { ValidationError, WorkflowError } from '../errors';

export interface WorkflowResult {
  ticketKey: string;
  meetingCreated: boolean;
  emailSent: boolean;
  errors: string[];
}

export async function runOnboardingWorkflow(payload: any): Promise<WorkflowResult> {
  try {
    validateWebhookEvent(payload);
    const issue = parseJiraWebhook(payload as JiraIssuePayload);

    if (!isOnboardingTicket(issue)) {
      info('Skipping non-onboarding ticket', { ticketKey: issue.ticketKey });
      return { ticketKey: issue.ticketKey, meetingCreated: false, emailSent: false, errors: [] };
    }

    const newHire = mapIssueToNewHire(issue);
    validateNewHireInfo(newHire);

    const slot = await findOnboardingSlot(newHire);
    const event = await createOnboardingEvent(newHire, slot);

    info('Calendar event created', { eventId: event.id, ticketKey: issue.ticketKey });

    await sendWelcomeEmail(newHire, slot.start, slot.timeZone);
    info('Welcome email sent', { ticketKey: issue.ticketKey });

    const comment = `IT onboarding session scheduled for ${newHire.newHireName} on ${slot.start} (${slot.timeZone}).\n\n- Calendar invite created\n- Welcome email sent`;
    await postInternalJiraComment(issue.ticketKey, comment);

    return { ticketKey: issue.ticketKey, meetingCreated: true, emailSent: true, errors: [] };
  } catch (err) {
    const details = err instanceof ValidationError ? err.details.join(', ') : err instanceof WorkflowError ? err.message : `${err}`;
    const message = `Onboarding workflow failed: ${details}`;

    error(message, { error: err });
    await postInternalJiraComment(payload?.issue?.key || 'unknown', `Automation failed: ${message}`);

    return {
      ticketKey: payload?.issue?.key || 'unknown',
      meetingCreated: false,
      emailSent: false,
      errors: [message]
    };
  }
}
