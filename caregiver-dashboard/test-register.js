// Test registration endpoint
const axios = require('axios');

const API_URL = 'http://localhost:8000';

async function testRegister() {
  console.log('Testing registration endpoint...\n');

  try {
    const response = await axios.post(`${API_URL}/api/v1/auth/register`, {
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      first_name: 'Test',
      last_name: 'User',
      phone_number: '+1-555-0100',
    });

    console.log('\x1b[32m✓ Registration successful!\x1b[0m');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('\x1b[31m✗ Registration failed\x1b[0m');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.log('Error: Cannot connect to backend at', API_URL);
      console.log('\nIs the backend server running?');
    } else {
      console.log('Error:', error.message);
    }
  }
}

testRegister();
