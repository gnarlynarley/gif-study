export default class CleanupCollector {
  #methods = new Set<() => void>();

  add(method: () => void) {
    this.#methods.add(method);
  }

  cleanup() {
    this.#methods.forEach((m) => m());
    this.#methods.clear();
  }
}
