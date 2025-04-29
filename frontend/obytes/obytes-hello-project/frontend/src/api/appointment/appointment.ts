import { TokenType } from '@/lib/auth/utils';
import axios from 'axios';
import { Env } from '@/lib/env';

export const fetchAppointments = async (token: TokenType) => {
  try {
    const response = await fetch(`${Env.API_URL}/api/appointments`, {
        headers: {
          'Authorization': `Bearer ${token?.access}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      return data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const searchAppointmentsByFilters = async (token: TokenType, searchQuery: string) => {
  try {
    const response = await fetch(`${Env.API_URL}/api/appointments/filters`, {
        headers: {
          'Authorization': `Bearer ${token?.access}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          query: {
            note: searchQuery.toLowerCase(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      return data;
  } catch (error) {
    console.error('Error searching appointments by filters:', error);
    throw error;
  }
}
