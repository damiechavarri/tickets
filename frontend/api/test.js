// frontend/api/test.js
export default function handler(req, res) {
  res.status(200).json({ 
    message: '✅ API TEST WORKING',
    timestamp: new Date().toISOString()
  });
}