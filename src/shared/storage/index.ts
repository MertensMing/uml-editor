export function createStorage<T>(key: string) {
  function set(item: T) {
    window.localStorage.setItem(key, JSON.stringify(item));
  }

  function get(): T | undefined {
    const data = window.localStorage.getItem(key);
    return !data ? undefined : (JSON.parse(data) as T);
  }

  return {
    set,
    get,
  };
}
