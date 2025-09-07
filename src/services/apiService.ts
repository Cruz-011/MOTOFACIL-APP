import axios from 'axios';

const BASE_URL = 'http://SEU_BACKEND_JAVA_URL/api';

export const fetchHomeData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/home`);
    return response.data;
  } catch {
    return null;
  }
};

export const fetchProfileData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/profile`);
    return response.data;
  } catch {
    return null;
  }
};

export const fetchSettingsData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/settings`);
    return response.data;
  } catch {
    return null;
  }
};

// ...adicione outras funções conforme necessário...
