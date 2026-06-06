import express from 'express';
import bodyParser from 'body-parser';
import { config, validateConfig } from './config';
import { handleJiraWebhook } from './index';
import { error, info } from './utils/logger';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(bodyParser.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/webhook/jira', async (req, res) => {
  try {
    const configErrors = validateConfig();
    if (configErrors.length > 0) {
      return res.status(500).json({ errors: configErrors });
    }

    const payload = req.body;
    const result = await handleJiraWebhook(payload);
    info('Webhook processed', { result });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    error('Webhook processing failed', { err });
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.listen(port, () => {
  info(`Newbie AI Agent webhook server listening on port ${port}`);
});
