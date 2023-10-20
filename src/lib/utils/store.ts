import localforage from "localforage";
import EventEmitter from "./EventEmitter";
import debounce from "./debounce";

export interface Store<T> {
  getValue: () => T;
  setValue: (value: T) => void;
  subscribe: EventEmitter["on"];
}

export function createPersistedStore<T>(
  key: string,
  initialValue: T,
): Store<T> {
  const store = createStore(initialValue);

  localforage.getItem<T>(key).then((value) => {
    if (value !== null) {
      store.setValue(value);
    }
  });

  store.subscribe(
    debounce(() => {
      localforage.setItem(key, store.getValue());
    }, 1000),
  );

  return store;
}

export function createStore<T>(initialValue: T): Store<T> {
  let currentValue = initialValue;
  const emitter = new EventEmitter<void>();

  return {
    getValue() {
      return currentValue;
    },
    setValue(value: T) {
      currentValue = value;
      emitter.emit();
    },
    subscribe: emitter.on,
  };
}
