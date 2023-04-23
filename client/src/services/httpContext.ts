import axios, { AxiosHeaders, Method, RawAxiosRequestHeaders } from 'axios';
import { auth } from '../firebase/firebase';

// for type headers
type MethodsHeaders = Partial<
  {
    [Key in Method as Lowercase<Key>]: AxiosHeaders;
  } & { common: AxiosHeaders }
>;

export const send = async <T>(config: {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  data?: T | undefined;
  route: string;
  headers?: RawAxiosRequestHeaders & MethodsHeaders;
  timeout?: number;
}) => {
  if (config.headers == null) config.headers = {};
  if (config.timeout == null) config.timeout = 30 * 1000;

  const { data, method, route, headers, timeout } = config;
  const requestConfig = { method: method, baseURL: BASE_URL, url: route, data: data, headers, timeout };

  // if we want to have the option to override the Authorization object this should be refactored
  if (auth.currentUser) {
    const token = await auth.currentUser?.getIdToken();
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }

  return axios(requestConfig);
};

export const BASE_URL = 'http://localhost:3001';
