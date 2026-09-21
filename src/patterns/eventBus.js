class EventBus extends EventTarget {
  emit(nombreEvento, data) {
    this.dispatchEvent(new CustomEvent(nombreEvento, { detail: data }))
  }

  on(nombreEvento, callback) {
    const handler = (e) => callback(e.detail)
    this.addEventListener(nombreEvento, handler)
    return () => this.removeEventListener(nombreEvento, handler)
  }
}

export const eventBus = new EventBus()
