export const EstadosCB = {
  CERRADO: 'CERRADO',
  ABIERTO: 'ABIERTO',
  SEMI_ABIERTO: 'SEMI-ABIERTO',
}

export class CircuitBreaker {
  constructor({ umbralFallos = 3, tiempoEsperaMs = 5000 } = {}) {
    this.umbralFallos = umbralFallos
    this.tiempoEsperaMs = tiempoEsperaMs
    this.estado = EstadosCB.CERRADO
    this.fallosConsecutivos = 0
    this.proximoIntento = 0
  }

  async ejecutar(fn) {
    const ahora = Date.now()

    // Si está ABIERTO, verificar si ya venció el tiempo de espera para pasar a SEMI-ABIERTO
    if (this.estado === EstadosCB.ABIERTO) {
      if (ahora >= this.proximoIntento) {
        this.estado = EstadosCB.SEMI_ABIERTO
      } else {
        throw new Error('Inventario no disponible, intenta más tarde (Circuito ABIERTO)')
      }
    }

    try {
      const resultado = await fn()
      this.alExito()
      return resultado
    } catch (error) {
      this.alFallo()
      throw error
    }
  }

  alExito() {
    this.fallosConsecutivos = 0
    this.estado = EstadosCB.CERRADO
  }

  alFallo() {
    this.fallosConsecutivos++

    if (this.estado === EstadosCB.SEMI_ABIERTO || this.fallosConsecutivos >= this.umbralFallos) {
      this.estado = EstadosCB.ABIERTO
      this.proximoIntento = Date.now() + this.tiempoEsperaMs
    }
  }

  getEstado() {
    // Si está abierto y ya pasó el tiempo, en la práctica ya puede probarse
    if (this.estado === EstadosCB.ABIERTO && Date.now() >= this.proximoIntento) {
      return EstadosCB.SEMI_ABIERTO
    }
    return this.estado
  }
}
