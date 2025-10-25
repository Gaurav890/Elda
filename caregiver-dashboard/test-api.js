// Test script for backend API endpoints
const axios = require('axios');

const API_URL = 'http://localhost:8000';

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

async function testBackend() {
  console.log(`${colors.blue}=== Testing Backend API ===${colors.reset}\n`);

  // Test 1: Check if backend is running
  console.log('1. Testing backend connection...');
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    console.log(`${colors.green}✓ Backend is running${colors.reset}`);
    console.log(`  Status: ${response.status}`);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`${colors.red}✗ Backend is not running${colors.reset}`);
      console.log(`  Please start the backend server at ${API_URL}`);
      return;
    }
    // Health endpoint might not exist, try another approach
    console.log(`${colors.yellow}⚠ /health endpoint not found, trying docs...${colors.reset}`);
    try {
      await axios.get(`${API_URL}/docs`, { timeout: 5000 });
      console.log(`${colors.green}✓ Backend is running (docs accessible)${colors.reset}`);
    } catch (docsError) {
      console.log(`${colors.red}✗ Cannot connect to backend${colors.reset}`);
      return;
    }
  }

  // Test 2: Check auth endpoints (without authentication)
  console.log('\n2. Testing auth endpoints structure...');
  try {
    // This should return 422 (validation error) not 404
    await axios.post(`${API_URL}/api/v1/auth/login`, {});
  } catch (error) {
    if (error.response && error.response.status === 422) {
      console.log(`${colors.green}✓ Auth endpoints exist${colors.reset}`);
      console.log(`  POST /api/v1/auth/login - Ready`);
    } else if (error.response && error.response.status === 404) {
      console.log(`${colors.red}✗ Auth endpoints not found${colors.reset}`);
    }
  }

  // Test 3: Check patients endpoints (will fail without auth, but we can see if endpoint exists)
  console.log('\n3. Testing patients endpoints structure...');
  try {
    await axios.get(`${API_URL}/api/v1/patients`);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log(`${colors.green}✓ Patient endpoints exist (authentication required)${colors.reset}`);
      console.log(`  GET /api/v1/patients - Ready (requires auth)`);
    } else if (error.response && error.response.status === 404) {
      console.log(`${colors.red}✗ Patient endpoints not found${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ Unexpected response: ${error.response?.status}${colors.reset}`);
    }
  }

  // Test 4: Try to register a test user to get auth token
  console.log('\n4. Testing patient endpoints with authentication...');
  console.log(`${colors.yellow}Note: This will attempt to create a test caregiver account${colors.reset}`);

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  try {
    // Register
    const registerResponse = await axios.post(`${API_URL}/api/v1/auth/register`, {
      email: testEmail,
      password: testPassword,
      first_name: 'Test',
      last_name: 'Caregiver',
      phone_number: '+1-555-0100',
    });

    const accessToken = registerResponse.data.access_token;
    console.log(`${colors.green}✓ Successfully registered test account${colors.reset}`);

    // Test GET /api/v1/patients with auth
    const patientsResponse = await axios.get(`${API_URL}/api/v1/patients`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`${colors.green}✓ GET /api/v1/patients - Working${colors.reset}`);
    console.log(`  Total patients: ${patientsResponse.data.length}`);

    // Test POST /api/v1/patients
    const createPatientResponse = await axios.post(
      `${API_URL}/api/v1/patients`,
      {
        first_name: 'Test',
        last_name: 'Patient',
        date_of_birth: '1945-01-01',
        timezone: 'America/New_York',
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    console.log(`${colors.green}✓ POST /api/v1/patients - Working${colors.reset}`);
    console.log(`  Created patient: ${createPatientResponse.data.full_name}`);

    const patientId = createPatientResponse.data.id;

    // Test GET /api/v1/patients/{id}
    const patientDetailResponse = await axios.get(
      `${API_URL}/api/v1/patients/${patientId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    console.log(`${colors.green}✓ GET /api/v1/patients/{id} - Working${colors.reset}`);
    console.log(`  Retrieved patient: ${patientDetailResponse.data.full_name}`);

    // Test PATCH /api/v1/patients/{id}
    const updatePatientResponse = await axios.patch(
      `${API_URL}/api/v1/patients/${patientId}`,
      {
        phone_number: '+1-555-TEST',
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    console.log(`${colors.green}✓ PATCH /api/v1/patients/{id} - Working${colors.reset}`);
    console.log(`  Updated patient phone: ${updatePatientResponse.data.phone_number}`);

    // Test DELETE /api/v1/patients/{id}
    await axios.delete(
      `${API_URL}/api/v1/patients/${patientId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    console.log(`${colors.green}✓ DELETE /api/v1/patients/{id} - Working${colors.reset}`);

    console.log(`\n${colors.green}=== All Patient API Tests Passed! ===${colors.reset}`);
    console.log(`${colors.blue}The backend is fully functional and ready for development.${colors.reset}\n`);

  } catch (error) {
    console.log(`${colors.red}✗ Error during authenticated tests${colors.reset}`);
    if (error.response) {
      console.log(`  Status: ${error.response.status}`);
      console.log(`  Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`  Error: ${error.message}`);
    }
  }
}

// Run the tests
testBackend().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
