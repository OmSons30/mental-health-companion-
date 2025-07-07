const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Test signup endpoint
    console.log('2. Testing signup endpoint...');
    const signupResponse = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123',
        full_name: 'Test User'
      })
    });

    if (signupResponse.ok) {
      const signupData = await signupResponse.json();
      console.log('✅ Signup successful:', signupData.message);
      console.log('User ID:', signupData.user.id);
      console.log('Access Token:', signupData.session.access_token.substring(0, 20) + '...');
      console.log('');

      // Test login endpoint
      console.log('3. Testing login endpoint...');
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123'
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful:', loginData.message);
        console.log('User:', loginData.user.full_name);
        console.log('');

        // Test create transaction
        console.log('4. Testing transaction creation...');
        const transactionResponse = await fetch(`${API_BASE}/api/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.session.access_token}`
          },
          body: JSON.stringify({
            amount: 100.50,
            type: 'expense',
            category: 'Food',
            description: 'Test transaction'
          })
        });

        if (transactionResponse.ok) {
          const transactionData = await transactionResponse.json();
          console.log('✅ Transaction created:', transactionData.message);
          console.log('Transaction ID:', transactionData.transaction.id);
          console.log('');

          // Test get transactions
          console.log('5. Testing get transactions...');
          const getTransactionsResponse = await fetch(`${API_BASE}/api/transactions`, {
            headers: {
              'Authorization': `Bearer ${loginData.session.access_token}`
            }
          });

          if (getTransactionsResponse.ok) {
            const transactionsData = await getTransactionsResponse.json();
            console.log('✅ Transactions retrieved:', transactionsData.transactions.length, 'transactions');
            console.log('');

            // Test transaction summary
            console.log('6. Testing transaction summary...');
            const summaryResponse = await fetch(`${API_BASE}/api/transactions/summary`, {
              headers: {
                'Authorization': `Bearer ${loginData.session.access_token}`
              }
            });

            if (summaryResponse.ok) {
              const summaryData = await summaryResponse.json();
              console.log('✅ Summary retrieved:');
              console.log('Total transactions:', summaryData.summary.total_transactions);
              console.log('Total income:', summaryData.summary.total_income);
              console.log('Total expenses:', summaryData.summary.total_expenses);
              console.log('Net amount:', summaryData.summary.net_amount);
            } else {
              console.log('❌ Summary failed:', summaryResponse.status);
            }
          } else {
            console.log('❌ Get transactions failed:', getTransactionsResponse.status);
          }
        } else {
          console.log('❌ Transaction creation failed:', transactionResponse.status);
        }
      } else {
        console.log('❌ Login failed:', loginResponse.status);
      }
    } else {
      console.log('❌ Signup failed:', signupResponse.status);
    }

  } catch (error) {
    console.log('❌ Error testing API:', error.message);
  }
}

testAPI(); 