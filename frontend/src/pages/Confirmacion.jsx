// En el useEffect, cambia la llamada API:
const ticketsConQR = await Promise.all(
  ticketsUnicos.map(async (ticket) => {
    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/.netlify/functions/generate-qr/${ticket.id}`
      )
      return { 
        ...ticket, 
        qrUrl: data.qrDataURL,
        qrImageUrl: data.qrImageUrl
      }
    } catch (error) {
      console.error('Error obteniendo QR:', error)
      return { ...ticket, qrUrl: null, qrImageUrl: null }
    }
  })
)