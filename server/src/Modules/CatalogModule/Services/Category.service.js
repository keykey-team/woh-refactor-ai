function toId(x) {
  return String(x);
}

function normalizePathStr(pathStr) {
  return String(pathStr || "").trim().replace(/^\/+|\/+$/g, "");
}

export function createCategoryService({ categoryRepo }) {
  return {
    // 1) дерево целиком
    async getTree({ status = "active" } = {}) {
      const all = await categoryRepo.listAll({ status });
      const childrenByParent = new Map();

      for (const c of all) {
        const pid = c.parentId ? toId(c.parentId) : null;
        if (!childrenByParent.has(pid)) childrenByParent.set(pid, []);
        childrenByParent.get(pid).push(c);
      }

      // сортировка детей в памяти
      for (const [k, arr] of childrenByParent.entries()) {
        arr.sort(
          (a, b) =>
            (a.sort ?? 0) - (b.sort ?? 0) ||
            (a.title?.ua || "").localeCompare(b.title?.ua || "")
        );
      }

      function buildNode(c) {
        const id = toId(c._id);
        const kids = childrenByParent.get(id) || [];
        return {
          _id: c._id,
          parentId: c.parentId,
          slug: c.slug,
          title: c.title,
          path: c.path,
          fullSlug: c.fullSlug || (Array.isArray(c.path) ? c.path.join("/") : ""),
          ancestors: c.ancestors,
          level: c.level ?? (Array.isArray(c.ancestors) ? c.ancestors.length : 0),
          status: c.status,
          sort: c.sort,
          children: kids.map(buildNode),
        };
      }

      const roots = childrenByParent.get(null) || [];
      return roots.map(buildNode);
    },

    // 2) дети одного узла
    async getChildren({ parentId = null, status = "active" } = {}) {
      if (!parentId) return categoryRepo.listRoots({ status });
      return categoryRepo.listChildren(parentId, { status });
    },

    // 3) хлебные крошки: ancestors + self
    async getBreadcrumbs({ categoryId }) {
      const cat = await categoryRepo.getById(categoryId);
      if (!cat) return [];

      const ids = [...(cat.ancestors || []), cat._id];
      const list = await categoryRepo.listByIds(ids);

      const byId = new Map(list.map((x) => [toId(x._id), x]));
      return ids.map((id) => byId.get(toId(id))).filter(Boolean);
    },

    // ✅ NEW: получить категорию по path string (skin-structure/cleansing/foam)
    async getByPath({ path, status = "active" } = {}) {
      const clean = normalizePathStr(path);
      if (!clean) return null;
      return categoryRepo.getByPathString(clean, { status });
    },

    // ✅ NEW: получить категорию по fullSlug
    async getByFullSlug({ fullSlug, status = "active" } = {}) {
      const clean = normalizePathStr(fullSlug);
      if (!clean) return null;
      return categoryRepo.getByFullSlug(clean, { status });
    },

    // ✅ NEW: subtree по path (узел + children рекурсивно)
    async getSubtreeByPath({ path, status = "active" } = {}) {
      const root = await this.getByPath({ path, status });
      if (!root) return null;

      // получаем ВСЕХ потомков одним запросом (через ancestors)
      const descendantsIds = await categoryRepo.getDescendantIds(root._id, {
        includeSelf: true,
        status,
      });

      // вытаскиваем все категории ветки
      const branch = await categoryRepo.listByIds(descendantsIds);

      // строим дерево в памяти
      const childrenByParent = new Map();
      for (const c of branch) {
        const pid = c.parentId ? toId(c.parentId) : null;
        if (!childrenByParent.has(pid)) childrenByParent.set(pid, []);
        childrenByParent.get(pid).push(c);
      }

      for (const [k, arr] of childrenByParent.entries()) {
        arr.sort(
          (a, b) =>
            (a.sort ?? 0) - (b.sort ?? 0) ||
            (a.title?.ua || "").localeCompare(b.title?.ua || "")
        );
      }

      function buildNode(c) {
        const id = toId(c._id);
        const kids = childrenByParent.get(id) || [];
        return {
          _id: c._id,
          parentId: c.parentId,
          slug: c.slug,
          title: c.title,
          path: c.path,
          fullSlug: c.fullSlug || (Array.isArray(c.path) ? c.path.join("/") : ""),
          ancestors: c.ancestors,
          level: c.level ?? (Array.isArray(c.ancestors) ? c.ancestors.length : 0),
          status: c.status,
          sort: c.sort,
          children: kids.map(buildNode),
        };
      }

      return buildNode(root);
    },
  };
}