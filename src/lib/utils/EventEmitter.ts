export type EventEmitterHandler<T> = (value: T) => void;

export class EventEmitter<T> {
  #handlers = new Set<EventEmitterHandler<T>>();
  #onceHandlers = new Set<EventEmitterHandler<T>>();

  on(handler: EventEmitterHandler<T>) {
    this.#handlers.add(handler);

    return () => this.off(handler);
  }

  once(handler: EventEmitterHandler<T>) {
    this.#onceHandlers.add(handler);

    return () => this.off(handler);
  }

  off(handler: EventEmitterHandler<T>) {
    this.#handlers.delete(handler);
    this.#onceHandlers.delete(handler);
  }

  emit(value: T) {
    this.#handlers.forEach((handler) => handler(value));
    this.#onceHandlers.forEach((handler) => handler(value));
    this.#onceHandlers.clear();
  }
}

export default EventEmitter;
