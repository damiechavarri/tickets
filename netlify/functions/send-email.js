import { createTransport } from 'nodemailer'

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: 'pyramidpatagonia@gmail.com',
    pass: 'iqkckqnnnbxhuuue'
  }
})

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' }
  }

  try {
    const { tickets, event: eventData, customerData, totalPrice } = JSON.parse(event.body)

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <h1>🎫 ${eventData.name}</h1>
        <p><strong>Para:</strong> ${customerData.nombre}</p>
        
        ${tickets.map(ticket => `
          <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0;">
            <h3>Ticket: ${ticket.id}</h3>
            <img src="${ticket.qrImageUrl}" alt="QR Code" width="150" height="150">
            <p><strong>Código:</strong> ${ticket.id}</p>
          </div>
        `).join('')}
      </body>
      </html>
    `

    const info = await transporter.sendMail({
      from: '"Tickets Digitales" <pyramidpatagonia@gmail.com>',
      to: customerData.email,
      subject: `🎫 Tickets para ${eventData.name}`,
      html: emailHTML
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, messageId: info.messageId })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    }
  }
}