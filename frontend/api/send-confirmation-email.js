// frontend/api/send-confirmation-email.js - VERSIÓN SIMPLIFICADA
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  console.log('🎯 FUNCIÓN INICIADA - Vercel');
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('🔍 Verificando variables de entorno...');
    console.log('🔍 GMAIL_USER:', process.env.GMAIL_USER ? '✅' : '❌');
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      throw new Error('Variables de entorno no configuradas');
    }

    const body = JSON.parse(event.body);
    console.log('📧 Procesando email para:', body.to);

    // CONFIGURACIÓN BÁSICA
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    // VERIFICAR CONEXIÓN
    await transporter.verify();
    console.log('✅ Conexión con Gmail exitosa');

    // EMAIL SIMPLE SIN QRs (por ahora)
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10B981; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0;">🎉 ¡Compra Confirmada!</h1>
          <h2 style="margin: 10px 0 0 0; font-weight: normal;">${body.eventName}</h2>
        </div>
        
        <div style="padding: 30px;">
          <h2>Hola ${body.customerName},</h2>
          <p>Tu compra ha sido procesada exitosamente.</p>
          
          <div style="background: white; border-left: 4px solid #10B981; padding: 20px; margin: 20px 0;">
            <h3 style="color: #10B981; margin-top: 0;">📋 Información</h3>
            <p><strong>Orden:</strong> ${body.orderId}</p>
            <p><strong>Evento:</strong> ${body.eventName}</p>
            <p><strong>Total:</strong> $${body.totalPrice}</p>
          </div>

          <div style="background: #f8fffb; border: 2px solid #10B981; padding: 20px; border-radius: 10px;">
            <h3 style="color: #10B981; text-align: center;">🎫 Tus Tickets</h3>
            <p style="text-align: center;">Los códigos QR están disponibles en tu página de confirmación:</p>
            <p style="text-align: center;">
              <a href="https://tickets-cyan-nu.vercel.app/#/confirmacion/${body.eventId}" 
                 style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver Mis Tickets con QR
              </a>
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `Piramide Tickets <${process.env.GMAIL_USER}>`,
      to: body.to,
      subject: `✅ Confirmación - ${body.eventName}`,
      html: emailHtml
    };

    console.log('📤 Enviando email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado:', result.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Email enviado correctamente'
      })
    };

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message
      })
    };
  }
};