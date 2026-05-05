// Services/Review.service.js
import mongoose from "mongoose";
import { reviewRepository } from "../Repositories/Review.repository.js";
import { ProductGroup } from "../../CatalogModule/Models/ProductGroup.model.js";

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(String(v));

function buildFilter(qs = {}) {
  const f = {};
  // Поиск по name/text
  if (qs.q) {
    const rx = new RegExp(String(qs.q).trim(), "i");
    f.$or = [{ name: rx }, { text: rx }];
  }
  // Фильтр по статусу
  if (qs.status) {
    const arr = String(qs.status)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (arr.length) f.status = { $in: arr };
  }
  // Фильтр по min/max рейтингу
  const minR = Number(qs.minRating);
  const maxR = Number(qs.maxRating);
  if (Number.isFinite(minR) || Number.isFinite(maxR)) {
    f.rating = {};
    if (Number.isFinite(minR)) f.rating.$gte = Math.max(1, minR);
    if (Number.isFinite(maxR)) f.rating.$lte = Math.min(5, maxR);
  }
  // По id (опционально)
  if (qs.id && isObjectId(qs.id)) f._id = qs.id;

  return f;
}

function buildSelect(qs = {}) {
  // экономия трафика: можно пробросить ?select=name,photoUrl,text
  if (!qs.select) return "";
  return String(qs.select)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}

export const reviewService = {
  async getReviewsList(qs = {}) {
    const filter = buildFilter(qs);
    const select = buildSelect(qs);
    const sort = qs.sort || "-createdAt";
    const page = Number(qs.page || 1);
    const limit = Number(qs.limit || 20);
    return reviewRepository.findList({ filter, select, sort, page, limit });
  },

  async findById(id) {
    return reviewRepository.findById(id);
  },

  async create(data) {
    // валидация rating на уровне сервиса дополнительно
    if (data.rating != null) {
      const r = Number(data.rating);
      if (!Number.isFinite(r) || r < 1 || r > 5) {
        throw new Error("rating must be between 1 and 5");
      }
      data.rating = Math.round(r);
    }

    // создаём сам отзыв
    const created = await reviewRepository.create(data);

    // если отзыв привязан к товару — положим его id в productGroup.reviews
    if (created?.product && isObjectId(created.product)) {
      try {
        await ProductGroup.findByIdAndUpdate(
          created.product,
          {
            $addToSet: { reviews: created._id },
          },
          { new: false }
        );
      } catch (err) {
        console.error(
          "Не удалось записать отзыв в ProductGroup.reviews при создании",
          created.product,
          err
        );
      }
    }

    return created;
  },

  async updateById(id, patch) {
    // нормализуем рейтинг, если пришёл
    if (patch.rating != null) {
      const r = Number(patch.rating);
      if (!Number.isFinite(r) || r < 1 || r > 5) {
        throw new Error("rating must be between 1 and 5");
      }
      patch.rating = Math.round(r);
    }

    // вытаскиваем текущий отзыв, чтобы понять старый product
    const existing = await reviewRepository.findById(id);
    if (!existing) return null;

    const prevProductId = existing.product
      ? String(existing.product)
      : null;

    // обновляем отзыв
    await reviewRepository.updateById(id, patch);

    // читаем обновлённый отзыв
    const updated = await reviewRepository.findById(id);
    if (!updated) return null;

    const nextProductId = updated.product
      ? String(updated.product)
      : null;

    // если привязка к товару изменилась — синхронизируем массив reviews в ProductGroup
    try {
      // убираем отзыв из старого товара, если был и изменился
      if (prevProductId && prevProductId !== nextProductId) {
        await ProductGroup.findByIdAndUpdate(
          prevProductId,
          { $pull: { reviews: updated._id } },
          { new: false }
        );
      }

      // добавляем в новый товар, если есть и изменился
      if (nextProductId && nextProductId !== prevProductId && isObjectId(nextProductId)) {
        await ProductGroup.findByIdAndUpdate(
          nextProductId,
          { $addToSet: { reviews: updated._id } },
          { new: false }
        );
      }
    } catch (err) {
      console.error(
        "Не удалось синхронизировать ProductGroup.reviews при обновлении",
        { prevProductId, nextProductId, reviewId: id },
        err
      );
    }

    return updated;
  },

  async deleteById(id) {
    // сначала найдём отзыв, чтобы узнать product
    const existing = await reviewRepository.findById(id);
    if (!existing) return null;

    // удаляем отзыв
    const deleted = await reviewRepository.deleteById(id);

    // убираем id этого отзыва из всех productGroups, где он был
    try {
      await ProductGroup.updateMany(
        { reviews: existing._id },
        { $pull: { reviews: existing._id } }
      );
    } catch (err) {
      console.error(
        "Не удалось удалить ссылку на отзыв из ProductGroup.reviews при удалении",
        { reviewId: id },
        err
      );
    }

    return deleted;
  },
};
