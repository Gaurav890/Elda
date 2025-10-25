// Quick test of backend login
const axios = require('axios');

const API_URL = 'http://localhost:8000';

async function testBackendNow() {
  console.log('Testing Backend Login...\n');

  // Test 1: Check if backend is responding
  try {
    await axios.get(`${API_URL}/health`, { timeout: 3000 });
    console.log('✅ Backend is running\n');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend is NOT running!');
      console.log('   Please start the backend:');
      console.log('   cd /Users/gaurav/Elda/backend');
      console.log('   source venv/bin/activate');
      console.log('   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload\n');
      return;
    }
  }

  // Test 2: Try to login with test user
  console.log('Testing login with test@example.com...');
  try {
    const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });

    console.log('✅ Login successful!');
    console.log('   Access Token:', response.data.access_token.substring(0, 30) + '...');
    console.log('   User:', response.data.caregiver.first_name, response.data.caregiver.last_name);
    console.log('\n✅ Backend is working correctly!\n');
  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
    console.log('');
  }

  // Test 3: Try to register new user
  console.log('Testing registration...');
  try {
    const response = await axios.post(`${API_URL}/api/v1/auth/register`, {
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      first_name: 'Test',
      last_name: 'User',
    });

    console.log('✅ Registration successful!');
    console.log('   User:', response.data.caregiver.first_name, response.data.caregiver.last_name);
  } catch (error) {
    console.log('❌ Registration failed!');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY:');
  console.log('- Frontend: http://localhost:3000');
  console.log('- Backend: http://localhost:8000');
  console.log('- Test User: test@example.com / password123');
  console.log('='.repeat(50) + '\n');
}

testBackendNow();
