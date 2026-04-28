require('dotenv').config();
async function testRegister() {

  const users = [
    { name: 'Admin Account', email: 'admin@example.com', password: 'password123', role: 'admin', area: 'Global' },
    { name: 'NGO Coordinator', email: 'ngo@example.com', password: 'password123', role: 'ngo', area: 'Downtown' },
    { name: 'Volunteer Account', email: 'volunteer@example.com', password: 'password123', role: 'volunteer', area: 'Uptown' },
    { name: 'Regular User', email: 'user@example.com', password: 'password123', role: 'user', area: 'Midtown' },
  ];

  for (const user of users) {
    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const data = await response.json();
      console.log(`User: ${user.email}, Status: ${response.status}, Response:`, data);
    } catch (error) {
      console.error(`Failed to register ${user.email}:`, error.message);
    }
  }
}

testRegister();
