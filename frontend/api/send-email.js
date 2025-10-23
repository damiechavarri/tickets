// /api/send-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { to, subject, html, userEmail, userName, ticketDetails } = req.body;

    // Validar campos requeridos
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Configurar transporter (usando Gmail como ejemplo)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Usar contraseña de aplicación
      },
    });

    // Enviar email
    const info = await transporter.sendMail({
      from: `"Ticket System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email enviado:', info.messageId);
    res.status(200).json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Email enviado correctamente' 
    });

  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({ 
      error: 'Error al enviar el email',
      details: error.message 
    });
  }
}