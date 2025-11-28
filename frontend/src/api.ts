import axios from 'axios';
import { FilterParams } from './types';
import { Compound,ApiResponse } from './types';

const API_BASE_URL = 'http://104.194.156.115:443/api';





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
