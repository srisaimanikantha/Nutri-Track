const axios = require('axios');

async function testSignup() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/signup', {
      email: 'test' + Math.random() + '@example.com',
      password: 'password123',
      displayName: 'Test User'
    });
    console.log('Signup Successful:', res.data);
  } catch (err) {
    console.error('Signup Failed:', err.response ? err.response.data : err.message);
  }
}

testSignup();
