// api/send-confirmation-email.js - CON VERCEL EMAIL
import { Email } from 'vercel-email';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'POST') {
    try {
      const { to, userName, eventName, quantity, ticketNumber } = req.body;
      
      console.log('📧 Enviando con Vercel Email a:', to);

      // Enviar email directo con Vercel
      await Email.send({
        from: 'confirmaciones@tickets-app.vercel.app',
        to: to,
        subject: `✅ Confirmación - ${eventName}`,
        html: `
          <h1>✅ Confirmación de Entrada</h1>
          <p>Hola ${userName},</p>
          <p>Tu compra para <strong>${eventName}</strong> ha sido confirmada.</p>
          <p><strong>Cantidad:</strong> ${quantity} entrada(s)</p>
          <p><strong>Número de orden:</strong> ${ticketNumber}</p>
          <p>Presenta este código en la entrada:</p>
          <div style="text-align: center;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketNumber}" 
                 alt="QR Code" style="border: 2px solid #ddd; padding: 10px;" />
          </div>
          <p>¡Te esperamos!</p>
        `
      });

      console.log('✅ Email enviado con Vercel');
      return res.status(200).json({ 
        success: true, 
        message: 'Email enviado correctamente' 
      });

    } catch (error) {
      console.error('❌ Error Vercel Email:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error enviando email' 
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}