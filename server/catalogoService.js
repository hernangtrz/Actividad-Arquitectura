import express from 'express'

export function crearServicioCatalogo(puerto = 4001) {
  const app = express()
  app.use(express.json())

  app.post('/catalogo/validar', (req, res) => {
    const { items = [] } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ valido: false, error: 'La lista de items no puede estar vacía' })
    }

    console.log(`[Servicio Catálogo - :${puerto}] Validando items: ${items.join(', ')}`)
    return res.json({
      valido: true,
      itemsVerificados: items,
      disponibles: true,
    })
  })

  return app.listen(puerto, () => {
    console.log(`Servicio de Catálogo escuchando en http://localhost:${puerto}`)
  })
}
