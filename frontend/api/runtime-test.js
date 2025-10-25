// frontend/api/runtime-test.js
const { now } = require('@vercel/node');

module.exports = now((req, res) => {
  res.json({ 
    success: true, 
    message: 'RUNTIME TEST',
    time: new Date().toISOString()
  });
});