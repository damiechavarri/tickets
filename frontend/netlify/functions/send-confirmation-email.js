const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

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
      purchaseDate,
      ticketsWithIds // ← AGREGAR esto para los IDs individuales
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

    // Función para generar QR
    const generarQR = async (ticketId, ticketType) => {
      try {
        const qrData = `TICKET:${ticketId}|EVENTO:${eventName}|TIPO:${ticketType}`;
        const qrDataURL = await QRCode.toDataURL(qrData, {
          width: 120,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        return qrDataURL;
      } catch (error) {
        console.error('Error generando QR:', error);
        return null;
      }
    };

    // Generar QRs para todos los tickets
    let qrSections = '';
    if (ticketsWithIds) {
      for (const [ticketTypeId, ticketData] of Object.entries(ticketsWithIds)) {
        const ticketType = ticketData.type || ticketTypeId;
        let ticketQRs = '';
        
        // Generar QR para cada ticket individual
        for (let i = 0; i < ticketData.ticketIds.length; i++) {
          const ticketId = ticketData.ticketIds[i];
          const qrImage = await generarQR(ticketId, ticketType);
          
          if (qrImage) {
            ticketQRs += `
              <div style="text-align: center; display: inline-block; margin: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; background: white;">
                <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold;">Ticket #${i + 1}</p>
                <img src="${qrImage}" alt="QR ${ticketId}" style="width: 100px; height: 100px;" />
                <p style="margin: 5px 0 0 0; font-size: 9px; color: #666;">${ticketId.substring(0, 12)}...</p>
              </div>
            `;
          }
        }

        if (ticketQRs) {
          qrSections += `
            <div style="margin: 15px 0;">
              <h4 style="color: #10B981; margin-bottom: 10px;">${ticketType} (${ticketData.quantity} entrada${ticketData.quantity !== 1 ? 's' : ''})</h4>
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
                ${ticketQRs}
              </div>
            </div>
          `;
        }
      }
    }

    // HTML del email CON QRs
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
          }
          .header { 
            background: #10B981; 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .content { 
            padding: 30px; 
          }
          .ticket { 
            background: white; 
            border-left: 4px solid #10B981; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 0 8px 8px 0;
          }
          .qr-section {
            background: #f8fffb;
            border: 2px solid #10B981;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #666; 
            font-size: 12px; 
            padding: 20px;
            border-top: 1px solid #eee;
          }
          .instruction-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎉 ¡Compra Confirmada!</h1>
            <h2 style="margin: 10px 0 0 0; font-weight: normal;">${eventName}</h2>
          </div>
          
          <div class="content">
            <h2 style="color: #333;">Hola ${customerName},</h2>
            <p>Tu compra ha sido procesada exitosamente. Aquí tienes los detalles:</p>
            
            <div class="ticket">
              <h3 style="color: #10B981; margin-top: 0;">📋 Información de la Compra</h3>
              <p><strong>Número de Orden:</strong> ${orderId}</p>
              <p><strong>Evento:</strong> ${eventName}</p>
              <p><strong>Fecha de compra:</strong> ${new Date(purchaseDate).toLocaleDateString('es-ES')}</p>
              <p><strong>Total:</strong> $${totalPrice}</p>
            </div>

            <!-- SECCIÓN DE QRs -->
            ${qrSections ? `
            <div class="qr-section">
              <h3 style="color: #10B981; text-align: center; margin-top: 0;">🎫 Tus Códigos QR</h3>
              ${qrSections}
              <div class="instruction-box">
                <p style="margin: 0; font-weight: bold;">📝 Instrucciones importantes:</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Cada código QR es válido para una persona</li>
                  <li>Presenta el QR correspondiente en la entrada</li>
                  <li>Los códigos son únicos e intransferibles</li>
                </ul>
              </div>
            </div>
            ` : ''}

            <div class="ticket">
              <h3 style="color: #10B981; margin-top: 0;">📝 Información del Evento</h3>
              <p><strong>📍 Lugar:</strong> Restaurante Pirque</p>
              <p><strong>🗓️ Fecha:</strong> 11 de Octubre, 2025</p>
              <p><strong>🕐 Horario:</strong> 19:00 horas</p>
              <p><strong>⏰ Recomendación:</strong> Llega 30 minutos antes</p>
            </div>

            <div class="instruction-box">
              <p style="margin: 0; font-weight: bold;">💡 No olvides:</p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Traer una identificación</li>
                <li>Conservar este email como comprobante</li>
                <li>Cada ticket es personal</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
              <strong>¡Te esperamos!</strong><br>
              El equipo de Piramide Tickets
            </p>
          </div>
          
          <div class="footer">
            <p>Este es un email automático, por favor no respondas directamente.</p>
            <p>Si tienes preguntas, contacta a: ${process.env.GMAIL_USER}</p>
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
    console.log('✅ Email enviado con QRs:', result.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Email con QRs enviado correctamente',
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