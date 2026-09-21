function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const inventario = {
  async reservar(items) {
    await delay(300)
    // Simular falla intermitente (30% de probabilidad)
    if (Math.random() < 0.3) {
      throw new Error('Inventario no disponible')
    }
    return { reservado: true, items }
  },
}
