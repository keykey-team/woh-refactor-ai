// Repos/CharacteristicMeta.repo.js
export function createCharacteristicMetaRepo({ CharacteristicMeta }) {
  return {
    async list({ status = "active" } = {}) {
      return CharacteristicMeta.find(status ? { status } : {}).sort({ sort: 1, key: 1 }).lean();
    },

    async listFilterable({ status = "active", scope = null } = {}) {
      const q = { ...(status ? { status } : {}), filterable: true };
      if (scope) q.scope = scope;
      return CharacteristicMeta.find(q).sort({ sort: 1, key: 1 }).lean();
    },

    async listSearchable({ status = "active", scope = "group" } = {}) {
      // searchable обычно нужно только для group, но оставляем гибко
      const q = { ...(status ? { status } : {}), searchable: true };
      if (scope) q.scope = scope;
      return CharacteristicMeta.find(q).sort({ sort: 1, key: 1 }).lean();
    },
  };
}