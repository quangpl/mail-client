import axios from 'axios';

const endpoint =
  process.env.REACT_APP_API || 'https://mail-server.reviewyte.net';
export const httpClient = axios.create({
  headers: {
    token: localStorage.getItem('token'),
  },
  baseURL: endpoint,
});
export const login = async (username: string, password: string) => {
  const res = await axios.post(`${endpoint}/login`, { username, password });
  return res.data;
};

export const getMails = async () => {
  const res = await httpClient.get('/mails');
  return res.data;
};

export const sendMail = async (body: any) => {
  const formData = new FormData();
  const keys = Object.keys(body);
  for (const key of keys) {
    if (key === 'files' && body[key]?.length) {
      for (const file of body[key]) {
        formData.append('files', file);
      }
    } else {
      if (key === 'to') {
        formData.append(key, JSON.stringify(body[key]));
      } else {
        formData.append(key, body[key]);
      }
    }
  }
  const res = await httpClient.post('/mails', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getAuth = async () => {
  try {
    const res = await httpClient.get('/auth');
    return res.data;
  } catch {
    return undefined;
  }
};
