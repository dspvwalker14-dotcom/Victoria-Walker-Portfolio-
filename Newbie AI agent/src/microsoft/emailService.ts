import { graphPost, getGraphAccessToken } from './graphClient';
import { NewHireInfo } from '../jira/jiraMapper';
import { config } from '../config';

export async function sendWelcomeEmail(newHire: NewHireInfo, eventDateTime: string, eventTimeZone: string) {
  const accessToken = await getGraphAccessToken();
  const message = {
    subject: 'Welcome! Your First-Day IT Onboarding Session',
    body: {
      contentType: 'HTML',
      content: `Hi ${newHire.newHireName},<br/><br/>Welcome to the team!<br/><br/>I’ve scheduled your IT onboarding session for ${eventDateTime} (${eventTimeZone}). During this session, we’ll help you get set up, walk through your IT access, answer any questions, and make sure you have what you need for your first day.<br/><br/>You should also receive a calendar invite with the meeting details.<br/><br/>Please do not share passwords or credentials by email. Any required access information will be provided securely through the appropriate company process.<br/><br/>Looking forward to meeting you!<br/><br/>Best,<br/>${config.itOwnerDisplayName}`
    },
    toRecipients: [
      {
        emailAddress: {
          address: newHire.newHireEmail,
          name: newHire.newHireName
        }
      }
    ]
  };

  return graphPost(`/users/${encodeURIComponent(config.itOwnerEmail)}/sendMail`, accessToken, {
    message,
    saveToSentItems: true
  });
}
