const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Configurar CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Manejar preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const {
      to,
      customerName,
      eventName,
      orderId,
      tickets,
      totalPrice,
      purchaseDate
    } = JSON.parse(event.body);

    console.log('📧 Enviando email a:', to);

    // Configurar transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    // Verificar credenciales
    await transporter.verify();

    // HTML del email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket { background: white; border-left: 4px solid #10B981; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Compra Confirmada!</h1>
            <h2>${eventName}</h2>
          </div>
          
          <div class="content">
            <h2>Hola ${customerName},</h2>
            <p>Tu compra ha sido procesada exitosamente. Aquí tienes los detalles:</p>
            
            <div class="ticket">
              <h3>📋 Información de la Compra</h3>
              <p><strong>Número de Orden:</strong> ${orderId}</p>
              <p><strong>Evento:</strong> ${eventName}</p>
              <p><strong>Fecha de compra:</strong> ${new Date(purchaseDate).toLocaleDateString('es-ES')}</p>
              <p><strong>Total:</strong> $${totalPrice}</p>
            </div>

            <div class="ticket">
              <h3>🎫 Tickets Reservados</h3>
              ${tickets.map(ticket => `
                <p><strong>${ticket.type}:</strong> ${ticket.quantity} entrada${ticket.quantity !== 1 ? 's' : ''}</p>
              `).join('')}
            </div>

            <div class="ticket">
              <h3>📝 Instrucciones Importantes</h3>
              <ul>
                <li>Presenta este email en la entrada del evento</li>
                <li>Llega 30 minutos antes del horario</li>
                <li>Trae una identificación</li>
                <li>Cada ticket es personal e intransferible</li>
              </ul>
            </div>

            <p><strong>📍 Lugar:</strong> Restaurante Pirque</p>
            <p><strong>🕐 Fecha:</strong> 11 de Octubre, 2025 - 19:00</p>
            
            <p>Si tienes alguna pregunta, responde a este email.</p>
            
            <p>¡Te esperamos!</p>
            <p><strong>El equipo de Piramide Tickets</strong></p>
          </div>
          
          <div class="footer">
            <p>Este es un email automático, por favor no respondas directamente.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Configurar email
    const mailOptions = {
      from: `Piramide Tickets <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `✅ Confirmación de Compra - ${eventName}`,
      html: emailHtml
    };

    // Enviar email
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado:', result.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Email enviado correctamente',
        messageId: result.messageId
      })
    };

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Error enviando email',
        details: error.message
      })
    };
  }
};
