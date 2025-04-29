import axios from 'axios';
import { Env } from '@/lib/env';
import { TokenType } from '@/lib/auth/utils';


export const fetchServices = async (token: TokenType) => {
  try {
    const response = await fetch(`${Env.API_URL}/api/services`, {
      headers: {
        'Authorization': `Bearer ${token?.access}`,
      },
      });
      
    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};
