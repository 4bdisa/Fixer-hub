import axios from 'axios';

const chapa = axios.create({
  baseURL: 'https://api.chapa.co/v1',
  headers: {
    Authorization: `Bearer ${process.env.CHAPA_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export const initiatePayment = async (data) => {
  try {
    const response = await chapa.post('/transaction/initialize', data);
    return response.data;
  } catch (error) {
    throw new Error(`Chapa API Error: ${error.response?.data?.message || error.message}`);
  }
};

export const verifyPayment = async (txRef) => {
  try {
    const response = await chapa.get(`/transaction/verify/${txRef}`);
    return response.data;
  } catch (error) {
    throw new Error(`Verification Failed: ${error.response?.data?.message || error.message}`);
  }
};