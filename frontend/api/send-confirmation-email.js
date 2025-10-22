const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

exports.handler = async (event, context) => {
  // [Mantén todo el código inicial igual...]

  try {
    const {
      to,
      customerName,
      eventName,
      orderId,
      tickets,
      totalPrice,
      purchaseDate,
      ticketsWithIds
    } = JSON.parse(event.body);

    console.log('📧 Enviando email a:', to);

    // Configurar transporter...
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.verify();

    // Generar QRs como archivos adjuntos
    const attachments = [];
    let qrReferences = '';

    if (ticketsWithIds) {
      for (const [ticketTypeId, ticketData] of Object.entries(ticketsWithIds)) {
        const ticketType = ticketData.type || ticketTypeId;
        
        for (let i = 0; i < ticketData.ticketIds.length; i++) {
          const ticketId = ticketData.ticketIds[i];
          
          try {
            // Generar QR como buffer (archivo adjunto)
            const qrData = `TICKET:${ticketId}|EVENTO:${eventName}|TIPO:${ticketType}`;
            const qrBuffer = await QRCode.toBuffer(qrData, {
              width: 200,
              margin: 1,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            });

            const filename = `qr-${ticketId}.png`;
            
            // Agregar como archivo adjunto
            attachments.push({
              filename: filename,
              content: qrBuffer,
              contentType: 'image/png',
              cid: `qr_${ticketId}` // Content ID para referencia en HTML
            });

            // Agregar referencia en el HTML
            qrReferences += `
              <div style="text-align: center; display: inline-block; margin: 10px; padding: 15px; border: 2px solid #10B981; border-radius: 8px; background: white;">
                <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #10B981;">${ticketType} #${i + 1}</p>
                <img src="cid:qr_${ticketId}" alt="QR ${ticketId}" style="width: 120px; height: 120px; border: 1px solid #ddd;" />
                <p style="margin: 8px 0 0 0; font-size: 10px; color: #666;">ID: ${ticketId.substring(0, 12)}...</p>
              </div>
            `;

          } catch (error) {
            console.error('Error generando QR adjunto:', error);
          }
        }
      }
    }

    // HTML del email con referencias a archivos adjuntos
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #10B981; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .ticket { background: white; border-left: 4px solid #10B981; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .qr-section { background: #f8fffb; border: 2px solid #10B981; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .qr-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; padding: 20px; border-top: 1px solid #eee; }
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
            ${qrReferences ? `
            <div class="qr-section">
              <h3 style="color: #10B981; text-align: center; margin-top: 0;">🎫 Tus Códigos QR</h3>
              <p style="text-align: center; margin-bottom: 20px;">Cada código QR es único y válido para una entrada.</p>
              <div class="qr-container">
                ${qrReferences}
              </div>
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin-top: 20px;">
                <p style="margin: 0; font-weight: bold;">📝 Instrucciones importantes:</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Presenta el código QR correspondiente en la entrada</li>
                  <li>Cada QR es válido para una persona</li>
                  <li>Los códigos son únicos e intransferibles</li>
                  <li>Llega 30 minutos antes del evento</li>
                </ul>
              </div>
            </div>
            ` : '<p>⚠️ Los códigos QR no están disponibles en este email. Por favor visita la página de confirmación.</p>'}

            <div class="ticket">
              <h3 style="color: #10B981; margin-top: 0;">📝 Información del Evento</h3>
              <p><strong>📍 Lugar:</strong> Restaurante Pirque</p>
              <p><strong>🗓️ Fecha:</strong> 11 de Octubre, 2025</p>
              <p><strong>🕐 Horario:</strong> 19:00 horas</p>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
              <strong>¡Te esperamos!</strong><br>
              El equipo de Piramide Tickets
            </p>
          </div>
          
          <div class="footer">
            <p>Este es un email automático, por favor no respondas directamente.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Configurar email CON ADJUNTOS
    const mailOptions = {
      from: `Piramide Tickets <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `✅ Confirmación de Compra - ${eventName}`,
      html: emailHtml,
      attachments: attachments // ← AGREGAR ARCHIVOS ADJUNTOS
    };

    // Enviar email
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado con ${attachments.length} QRs adjuntos:`, result.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: `Email con ${attachments.length} QRs enviado correctamente`,
        messageId: result.messageId,
        qrsEnviados: attachments.length
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