// api/send-confirmation-email.js - VERSIÓN CORREGIDA
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { to, userName, eventName, quantity } = req.body;
      
      console.log('📧 Email simulado para:', to);
      
      // SIMULACIÓN TEMPORAL - Quitar cuando Nodemailer funcione
      return res.status(200).json({ 
        success: true, 
        message: '✅ Email simulado enviado correctamente',
        simulated: true,
        data: { to, userName, eventName, quantity }
      });
      
    } catch (error) {
      console.error('❌ Error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Error interno',
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}