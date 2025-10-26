// api/send-confirmation-email.js
const nodemailer = require('nodemailer');

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
 // POST para enviar emails
if (req.method === 'POST') {
  try {
    const { 
      to, 
      subject, 
      userName, 
      ticketNumber, 
      eventName,
      eventDate,
      eventTime, 
      eventLocation,
      quantity,
      totalAmount,
      tickets,
      qrData
    } = req.body;
    
    console.log('📧 Datos recibidos:', { to, userName, eventName, quantity });

    // CONFIGURACIÓN NODEMAILER (Gmail example)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Tu email
        pass: process.env.EMAIL_PASS  // App Password (NO tu contraseña normal)
      }
    });

    // Generar HTML para el email con todos los QRs
    const generarHTMLTickets = () => {
      if (!tickets || !Array.isArray(tickets)) {
        return `<p><strong>Entrada General</strong> - ${quantity} ticket(s)</p>`;
      }
      
      return tickets.map(ticket => `
        <div style="margin: 20px 0; padding: 15px; border: 2px solid #22c55e; border-radius: 10px; text-align: center;">
          <h3 style="color: #22c55e; margin: 0 0 10px 0;">${ticket.type || 'Entrada General'}</h3>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.id || qrData || ticketNumber)}&margin=10" 
               alt="Código QR" 
               style="border: 2px solid #ddd; border-radius: 5px; margin: 10px 0;" />
          <p style="margin: 5px 0; font-size: 12px; color: #666;">
            ID: ${ticket.id || ticketNumber}
          </p>
        </div>
      `).join('');
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .ticket { margin: 15px 0; padding: 15px; border: 2px solid #22c55e; border-radius: 10px; }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Confirmación de Entrada</h1>
            <p>¡Tu compra ha sido confirmada!</p>
          </div>
          
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>Gracias por tu compra. Aquí tienes los detalles:</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>📋 Detalles del Evento</h3>
              <p><strong>Evento:</strong> ${eventName}</p>
              <p><strong>Fecha:</strong> ${eventDate} - ${eventTime}</p>
              <p><strong>Ubicación:</strong> ${eventLocation}</p>
              <p><strong>Cantidad:</strong> ${quantity} entrada(s)</p>
              <p><strong>Total:</strong> ${totalAmount}</p>
              <p><strong>Número de orden:</strong> ${ticketNumber}</p>
            </div>

            <h3>🎟️ Tus Entradas</h3>
            ${generarHTMLTickets()}
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>📝 Información Importante</h4>
              <ul>
                <li>Presenta el código QR en la entrada del evento</li>
                <li>Llega 30 minutos antes del horario indicado</li>
                <li>Cada código QR es único e intransferible</li>
                <li>Presenta identificación junto con el código QR</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Si tienes alguna pregunta, contáctanos.</p>
            <p>© 2024 Tu App de Tickets. Todos los derechos reservados.</p>
          </div>
        </body>
        </html>
      `
    };

    // ENVIAR EMAIL
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado:', info.messageId);

    return res.status(200).json({ 
      success: true, 
      message: '✅ Email enviado correctamente',
      messageId: info.messageId,
      data: {
        to,
        subject,
        userName,
        eventName,
        quantity,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error enviando email',
      details: error.message 
    });
  }
}

  return res.status(405).json({ error: 'Method Not Allowed' });
}