import express from 'express'

export function crearServicioPagos(puerto = 4002) {
  const app = express()
  app.use(express.json())

  app.post('/pagos/procesar', (req, res) => {
    const { total, pasarela = 'X' } = req.body

    if (!total || Number(total) <= 0) {
      return res.status(400).json({
        aprobado: false,
        error: 'El total debe ser mayor a 0',
      })
    }

    const txId = `${pasarela}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    console.log(`[Servicio Pagos - :${puerto}] Pago procesado por $${total} vía Pasarela ${pasarela}. Tx: ${txId}`)

    return res.json({
      aprobado: true,
      idTransaccion: txId,
      monto: Number(total),
      pasarela,
      fecha: new Date().toISOString(),
    })
  })

  return app.listen(puerto, () => {
    console.log(`Servicio de Pagos escuchando en http://localhost:${puerto}`)
  })
}
