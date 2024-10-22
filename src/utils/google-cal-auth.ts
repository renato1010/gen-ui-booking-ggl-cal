import { JWT } from 'google-auth-library';
import { Resource } from 'sst';

const keysJson: { client_email: string; private_key: string } = JSON.parse(
  Resource.GoogleCalServiceAccJson.value
);
export const auth = new JWT({
  email: keysJson.client_email,
  key: keysJson.private_key,
  scopes: ['https://www.googleapis.com/auth/calendar'],
  subject: 'contact@renatoperez.dev'
});