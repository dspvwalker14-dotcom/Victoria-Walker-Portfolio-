import axios from 'axios';
import { config } from '../config';

const graphBaseUrl = 'https://graph.microsoft.com/v1.0';

export async function getGraphAccessToken(): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${config.azureTenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: config.azureClientId,
    client_secret: config.azureClientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  const response = await axios.post(tokenUrl, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return response.data.access_token;
}

export async function graphGet(path: string, accessToken: string, params?: Record<string, string>) {
  const url = `${graphBaseUrl}${path}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    params
  });
  return response.data;
}

export async function graphPost(path: string, accessToken: string, body: any) {
  const url = `${graphBaseUrl}${path}`;
  const response = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}
