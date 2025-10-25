// Simple login test
const axios = require('axios');

const API_URL = 'http://localhost:8000';

async function testLogin() {
  console.log('Testing if there are existing credentials...\n');

  // Try some common test credentials
  const testCredentials = [
    { email: 'test@example.com', password: 'password123' },
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'caregiver@example.com', password: 'password' },
  ];

  for (const creds of testCredentials) {
    try {
      console.log(`Trying: ${creds.email}...`);
      const response = await axios.post(`${API_URL}/api/v1/auth/login`, creds);
      console.log(`\x1b[32m✓ Login successful with: ${creds.email}\x1b[0m`);
      console.log(`Access Token: ${response.data.access_token.substring(0, 20)}...`);

      // Test patient endpoint
      const patientsResponse = await axios.get(`${API_URL}/api/v1/patients`, {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
      });

      console.log(`\x1b[32m✓ Patient API working\x1b[0m`);
      console.log(`Total patients: ${patientsResponse.data.length}\n`);

      return response.data.access_token;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`\x1b[33m✗ Invalid credentials\x1b[0m\n`);
      } else {
        console.log(`\x1b[31m✗ Error: ${error.response?.status || error.message}\x1b[0m\n`);
      }
    }
  }

  console.log('\x1b[33mNo existing credentials worked.\x1b[0m');
  console.log('You can either:');
  console.log('1. Create a user manually through the backend');
  console.log('2. Proceed with frontend development (we can test with real user later)\n');
}

testLogin();
