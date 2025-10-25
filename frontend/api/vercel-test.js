// frontend/api/vercel-test.js
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  return res.status(200).json({
    success: true,
    message: '✅ VERCEL TEST WORKING',
    timestamp: new Date().toISOString(),
    method: req.method
  });
};