import axios from 'axios';
import { API_URL } from '../config';

export const loginUser = async (data) => {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    return response.data;
};