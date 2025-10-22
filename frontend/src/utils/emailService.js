import axios from 'axios'

// URL para Netlify
const BACKEND_URL = import.meta.env.PROD 
  ? 'https://tusitio.netlify.app'  // Cambiar por tu URL de Netlify
  : 'http://localhost:4000'

export async function enviarEmailTickets(tickets, event, customerData, totalPrice) {
  try {
    console.log('📧 Enviando email via Netlify...')

    const response = await axios.post(`${BACKEND_URL}/.netlify/functions/send-email`, {
      tickets,
      event, 
      customerData,
      totalPrice
    })

    console.log('✅ Email enviado exitosamente via Netlify')
    return response.data

  } catch (error) {
    console.error('❌ Error enviando email:', error.response?.data || error.message)
    return { 
      success: false, 
      error: error.response?.data?.error || error.message 
    }
  }
}