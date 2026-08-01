
const memory = global.__vaultTestMemory;
module.exports = {
  __esModule: true,
  default: {
    setItem: async (k, v) => { memory.set(String(k), String(v)); },
    getItem: async (k) => (memory.has(String(k)) ? memory.get(String(k)) : null),
    removeItem: async (k) => { memory.delete(String(k)); },
    multiRemove: async (keys) => { for (const k of keys) memory.delete(String(k)); },
    getAllKeys: async () => [...memory.keys()],
    clear: async () => memory.clear(),
  },
};
