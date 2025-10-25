// Check actual backend response format
const axios = require('axios');

const API_URL = 'http://localhost:8000';

async function checkResponse() {
  console.log('Checking actual backend response format...\n');

  try {
    const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });

    console.log('✅ Login Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Login Error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

checkResponse();
