import express from 'express'

export function crearApiGateway({
  puerto = 4000,
  urlCatalogo = 'http://localhost:4001',
  urlPagos = 'http://localhost:4002',
} = {}) {
  const app = express()
  app.use(express.json())

  // Endpoint único que orquesta y reenvía a los microservicios
  app.post('/pedidos', async (req, res) => {
    const { cliente, direccion, items, total, pasarela = 'X' } = req.body

    if (!cliente || !direccion || !items || !total) {
      return res.status(400).json({
        exito: false,
        error: 'Datos incompletos. Se requiere cliente, direccion, items y total.',
      })
    }

    try {
      console.log(`\n[API Gateway - :${puerto}] Recibiendo pedido para cliente: ${cliente}`)

      // 1. Reenvío a Servicio de Catálogo
      const respCatalogo = await fetch(`${urlCatalogo}/catalogo/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const dataCatalogo = await respCatalogo.json()

      if (!respCatalogo.ok || !dataCatalogo.valido) {
        return res.status(400).json({
          exito: false,
          error: dataCatalogo.error || 'Error al validar catálogo',
        })
      }

      // 2. Reenvío a Servicio de Pagos
      const respPagos = await fetch(`${urlPagos}/pagos/procesar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total, pasarela }),
      })
      const dataPagos = await respPagos.json()

      if (!respPagos.ok || !dataPagos.aprobado) {
        return res.status(400).json({
          exito: false,
          error: dataPagos.error || 'Error al procesar el pago',
        })
      }

      // 3. Respuesta unificada (Composición de servicios)
      return res.status(201).json({
        exito: true,
        mensaje: 'Pedido procesado con éxito a través del API Gateway',
        pedido: {
          cliente,
          direccion,
          items: dataCatalogo.itemsVerificados,
          total: dataPagos.monto,
          transaccion: dataPagos.idTransaccion,
          pasarela: dataPagos.pasarela,
          estado: 'CONFIRMADO',
        },
      })
    } catch (error) {
      console.error('Error en API Gateway:', error)
      return res.status(502).json({
        exito: false,
        error: 'Error de comunicación con los servicios internos',
      })
    }
  })

  return app.listen(puerto, () => {
    console.log(`API Gateway escuchando en http://localhost:${puerto}`)
  })
}
