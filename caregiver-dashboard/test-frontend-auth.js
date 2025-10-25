// Test frontend auth flow
const axios = require('axios');

const API_URL = 'http://localhost:8000';

async function testAuthFlow() {
  console.log('Testing Complete Auth Flow...\n');

  try {
    // Step 1: Login
    console.log('1. Login with test@example.com...');
    const loginResponse = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });

    const { access_token, refresh_token } = loginResponse.data;
    console.log('✅ Got tokens');
    console.log('   Access Token:', access_token.substring(0, 30) + '...');
    console.log('');

    // Step 2: Fetch caregiver data
    console.log('2. Fetch caregiver data with token...');
    const meResponse = await axios.get(`${API_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.log('✅ Got caregiver data:');
    console.log('   Name:', meResponse.data.first_name, meResponse.data.last_name);
    console.log('   Email:', meResponse.data.email);
    console.log('   ID:', meResponse.data.id);
    console.log('');

    console.log('✅ Login flow works perfectly!');
    console.log('');
    console.log('You can now login at: http://localhost:3000/login');
    console.log('Email: test@example.com');
    console.log('Password: password123');
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testAuthFlow();
