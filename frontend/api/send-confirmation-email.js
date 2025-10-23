// api/send-confirmation-email.js
// import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET para testing
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'success',
      message: '✅ API funcionando en Vercel',
      timestamp: new Date().toISOString()
    });
  }

  // POST para enviar emails
  if (req.method === 'POST') {
    try {
      const { to, subject, userName, ticketNumber, eventName } = req.body;
      
      console.log('📧 Datos recibidos:', { to, subject, userName, ticketNumber, eventName });
      
      // Respuesta simulada por ahora
      return res.status(200).json({ 
        success: true, 
        message: '✅ Email simulado enviado correctamente',
        data: {
          to,
          subject, 
          userName,
          ticketNumber,
          eventName,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('❌ Error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}