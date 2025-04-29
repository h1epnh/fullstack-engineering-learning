import axios from 'axios';

const API_URL = 'http://localhost:3000/api/staff';

export const fetchStaffs = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching staffs:', error);
    throw error;
  }
};
