import axios from 'axios'

const API_BASE_URL = 'http://localhost:4000/api'

export async function generarTicketsConQR(tickets) {
  try {
    const ticketsConQR = await Promise.all(
      tickets.map(async ticket => {
        try {
          const resp = await axios.get(`${API_BASE_URL}/generate-qr/${ticket.id}`)
          
          if (resp.data.success) {
            return { 
              ...ticket, 
              qrUrl: resp.data.url,
              qrGenerado: true
            }
          } else {
            console.warn(`Error generando QR para ${ticket.id}`)
            return { 
              ...ticket, 
              qrUrl: null,
              qrGenerado: false
            }
          }
        } catch (error) {
          console.error(`Error generando QR para ${ticket.id}:`, error)
          return { 
            ...ticket, 
            qrUrl: null,
            qrGenerado: false
          }
        }
      })
    )
    return ticketsConQR
  } catch (error) {
    console.error('Error general generando QRs:', error)
    throw error
  }
}