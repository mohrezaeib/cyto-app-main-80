import axios from 'axios';
import { FilterParams } from './types';
import { Compound,ApiResponse } from './types';

const API_BASE_URL = 'http://ms3fa.helmholtz-hzi.de:80/api';





// Main fetch function
export const fetchCompounds = async (params: FilterParams = {}): Promise<ApiResponse> => {
  try {
    const response = await axios.get<ApiResponse>(`${API_BASE_URL}/items`, {
      params: {
        page: 1,
        per_page: 50,
        ...params // Get costomized params
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching compounds:', error);
    throw error;
  }
};
