const fs = require('fs');
const path = require('path');

async function testUpload() {
  // 1. Get a token (using the user account created earlier)
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
  });
  const { token } = await loginRes.json();
  console.log('Token acquired:', token ? 'YES' : 'NO');

  // 2. Prepare a dummy file
  const testFilePath = path.join(__dirname, 'test-img.jpg');
  fs.writeFileSync(testFilePath, 'dummy data');

  // 3. Upload
  const formData = new FormData();
  const fileBlob = new Blob(['dummy data'], { type: 'image/jpeg' });
  formData.append('photo', fileBlob, 'test-img.jpg');

  console.log('Sending upload request...');
  try {
    const response = await fetch('http://localhost:4000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const status = response.status;
    const data = await response.json();
    console.log('Status:', status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Upload failed:', err.message);
  } finally {
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
  }
}

testUpload();
