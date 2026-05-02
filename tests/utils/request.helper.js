import { request } from '@playwright/test';

const apiRequest = async (baseURL) => {
  return await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};

export { apiRequest };
