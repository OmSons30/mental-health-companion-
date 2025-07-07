const API_BASE = 'http://localhost:5000';

async function testLogin() {
  console.log('🔐 Testing Login...\n');

  try {
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'om30sonawane@gmail.com',
        password: 'Santoson@30'
        
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful!');
      console.log('User:', loginData.user.full_name);
      console.log('Email:', loginData.user.email);
      console.log('Access Token:', loginData.session.access_token.substring(0, 20) + '...');
      console.log('');
      console.log('🎉 Your authentication is working!');
      console.log('You can now use the frontend with backend integration.');
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', loginResponse.status);
      console.log('Error:', errorData);
    }

  } catch (error) {
    console.log('❌ Error testing login:', error.message);
  }
}

testLogin(); 