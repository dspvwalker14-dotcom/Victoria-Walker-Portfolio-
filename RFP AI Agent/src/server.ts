import express from 'express';
import bodyParser from 'body-parser';
import { config, validateConfig } from './config';
import { handleRFPRequest } from './index';
import { error, info } from './utils/logger';

const app = express();
const port = config.port;

app.use(bodyParser.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/api/rfp-response', async (req, res) => {
  try {
    const configErrors = validateConfig();
    if (configErrors.length > 0) {
      return res.status(500).json({ errors: configErrors });
    }

    const payload = req.body;
    const result = await handleRFPRequest(payload);
    info('RFP request processed', { success: result.success });

    return res.status(200).json(result);
  } catch (err) {
    error('RFP processing failed', { err });
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.listen(port, () => {
  info(`RFP AI Agent webhook server listening on port ${port}`);
});
