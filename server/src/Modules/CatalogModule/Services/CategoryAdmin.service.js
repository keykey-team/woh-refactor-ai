import mongoose from "mongoose";

function badRequest(message, details = null) {
  const err = new Error(message);
  err.code = "BAD_REQUEST";
  err.status = 400;
  if (details) err.details = details;
  return err;
}

function normalizeLocalizedText(v = {}) {
  return {
    ua: String(v?.ua || "").trim(),
    ru: String(v?.ru || "").trim(),
  };
}

function normalizeSlug(slug) {
  return String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
}

export function createCategoryAdminService({ categoryRepo }) {
  return {
    async create({
      parentId = null,
      slug,
      title,
      status = "active",
      sort = 0,
    } = {}) {
      const cleanSlug = normalizeSlug(slug);
      if (!cleanSlug) throw badRequest("slug is required");

      let parent = null;

      if (parentId) {
        if (!mongoose.Types.ObjectId.isValid(String(parentId))) {
          throw badRequest("Invalid parentId");
        }

        parent = await categoryRepo.getById(parentId);
        if (!parent) throw badRequest("Parent category not found");
      }

      const path = parent ? [...(parent.path || []), cleanSlug] : [cleanSlug];
      const fullSlug = path.join("/");
      const ancestors = parent ? [...(parent.ancestors || []), parent._id] : [];
      const level = ancestors.length;

      const existing = await categoryRepo.getByFullSlug(fullSlug, { status: null });
      if (existing) {
        throw badRequest("Category with this fullSlug already exists", { fullSlug });
      }

      return categoryRepo.create({
        parentId: parent ? parent._id : null,
        slug: cleanSlug,
        title: normalizeLocalizedText(title),
        path,
        fullSlug,
        ancestors,
        level,
        status,
        sort: Number(sort || 0),
      });
    },

    async update({
      categoryId,
      parentId,
      slug,
      title,
      status,
      sort,
    } = {}) {
      if (!mongoose.Types.ObjectId.isValid(String(categoryId))) {
        throw badRequest("Invalid categoryId");
      }

      const current = await categoryRepo.getById(categoryId);
      if (!current) throw badRequest("Category not found");

      const nextSlug = slug !== undefined ? normalizeSlug(slug) : current.slug;
      if (!nextSlug) throw badRequest("slug is required");

      let nextParentId = parentId;
      if (nextParentId === undefined) nextParentId = current.parentId || null;

      let parent = null;

      if (nextParentId) {
        if (!mongoose.Types.ObjectId.isValid(String(nextParentId))) {
          throw badRequest("Invalid parentId");
        }

        if (String(nextParentId) === String(categoryId)) {
          throw badRequest("Category cannot be parent of itself");
        }

        parent = await categoryRepo.getById(nextParentId);
        if (!parent) throw badRequest("Parent category not found");

        const descendantsIds = await categoryRepo.getDescendantIds(categoryId, {
          includeSelf: false,
          status: null,
        });

        if (descendantsIds.some((id) => String(id) === String(nextParentId))) {
          throw badRequest("Cannot move category inside its own subtree");
        }
      }

      const path = parent ? [...(parent.path || []), nextSlug] : [nextSlug];
      const fullSlug = path.join("/");
      const ancestors = parent ? [...(parent.ancestors || []), parent._id] : [];
      const level = ancestors.length;

      const existing = await categoryRepo.getByFullSlug(fullSlug, { status: null });
      if (existing && String(existing._id) !== String(categoryId)) {
        throw badRequest("Category with this fullSlug already exists", { fullSlug });
      }

      const updated = await categoryRepo.updateById(categoryId, {
        parentId: parent ? parent._id : null,
        slug: nextSlug,
        title: title !== undefined ? normalizeLocalizedText(title) : current.title,
        path,
        fullSlug,
        ancestors,
        level,
        status: status !== undefined ? status : current.status,
        sort: sort !== undefined ? Number(sort || 0) : current.sort,
      });

      // Обновляем потомков, если изменилась ветка
      const descendantsIds = await categoryRepo.getDescendantIds(categoryId, {
        includeSelf: false,
        status: null,
      });

      if (descendantsIds.length) {
        const descendants = await categoryRepo.listByIds(descendantsIds);

        for (const item of descendants) {
          const tailPath = (item.path || []).slice((current.path || []).length);
          const nextPath = [...path, ...tailPath];
          const nextFullSlug = nextPath.join("/");

          const nextAncestors = [
            ...ancestors,
            updated._id,
            ...(item.ancestors || []).slice((current.ancestors || []).length + 1),
          ];

          await categoryRepo.updateById(item._id, {
            path: nextPath,
            fullSlug: nextFullSlug,
            ancestors: nextAncestors,
            level: nextAncestors.length,
          });
        }
      }

      return updated;
    },

    async remove({ categoryId } = {}) {
      if (!mongoose.Types.ObjectId.isValid(String(categoryId))) {
        throw badRequest("Invalid categoryId");
      }

      const current = await categoryRepo.getById(categoryId);
      if (!current) throw badRequest("Category not found");

      const children = await categoryRepo.listChildren(categoryId, { status: null });
      if (children.length) {
        throw badRequest("Cannot delete category with children");
      }

      await categoryRepo.deleteById(categoryId);
      return { ok: true };
    },
  };
}