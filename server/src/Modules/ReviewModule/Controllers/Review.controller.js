// Controllers/Review.controller.js
import { reviewService } from "../Services/Review.service.js";
import { ReviewModel } from "../Models/Review.model.js"; // чтобы делать публичные выборки

function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function reviewController(router) {
  // ADMIN: LIST (с любыми фильтрами, как у тебя было)
  router.get("/", async (req, res) => {
    try {
      const data = await reviewService.getReviewsList(req.query || {});
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ADMIN: GET BY ID
  router.get("/:id", async (req, res, next) => {
    try {
      const doc = await ReviewModel.findById(req.params.id).sort({ position: 1, createdAt: -1 })

        .populate({
          path: "product"
        })
        .lean();
      console.log('Fetched review by ID:', doc);
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    } catch (e) {
      next(e);
    }
  });

  // ADMIN: CREATE
  router.post("/", async (req, res, next) => {
    try {
      const body = req.body || {};

      if (!body?.name || !body?.text) {
        return res.status(400).json({ message: "name and text are required" });
      }

      const payload = {
        name: String(body.name).trim(),
        product: body.product || null, // сюда кидаешь ObjectId ProductGroup
        photoUrl: String(body.photoUrl || ""),
        text: String(body.text).trim(),
        rating: body.rating != null ? Number(body.rating) : undefined,
        status: body.status || "draft",
        position: Number(body.position || 0),
        isVisibleProduct:
          body.isVisibleProduct !== undefined
            ? !!body.isVisibleProduct
            : true,
        isVisibleMainPage:
          body.isVisibleMainPage !== undefined
            ? !!body.isVisibleMainPage
            : false,
      };

      const created = await reviewService.create(payload);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  });

  // ADMIN: PATCH (partial update)
  router.patch("/:id", async (req, res, next) => {
    try {
      const b = req.body || {};
      const patch = {};

      if (has(b, "name")) patch.name = String(b.name || "");
      if (has(b, "product")) patch.product = b.product || null;
      if (has(b, "photoUrl")) patch.photoUrl = String(b.photoUrl || "");
      if (has(b, "text")) patch.text = String(b.text || "");
      if (has(b, "rating")) patch.rating = Number(b.rating);
      if (has(b, "status")) patch.status = String(b.status || "draft");
      if (has(b, "position")) patch.position = Number(b.position || 0);
      if (has(b, "isVisibleProduct"))
        patch.isVisibleProduct = !!b.isVisibleProduct;
      if (has(b, "isVisibleMainPage"))
        patch.isVisibleMainPage = !!b.isVisibleMainPage;

      if (!Object.keys(patch).length) {
        return res.status(400).json({ message: "Nothing to update" });
      }

      const updated = await reviewService.updateById(req.params.id, patch);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (e) {
      next(e);
    }
  });

  // ADMIN: DELETE
  router.delete("/:id", async (req, res, next) => {
    try {
      const deleted = await reviewService.deleteById(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  // ==============================
  // PUBLIC: отзывы для главной
  // GET /reviews/public/main?limit=10
  // ==============================
  router.get("/public/main", async (req, res, next) => {
    try {
      const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit ?? "10", 10))
      );

      const reviews = await ReviewModel.find({
        status: "published",
        isVisibleMainPage: true,
      })
        .sort({ position: 1, createdAt: -1 })
        .limit(limit)
        .populate({
          path: "product"
        })
        .lean();

      res.json({ ok: true, data: reviews });
    } catch (e) {
      next(e);
    }
  });

  // ==============================
  // PUBLIC: отзывы для конкретного товара
  // GET /reviews/public/product/:productId?limit=20
  // productId = ObjectId ProductGroup
  // ==============================
  router.get("/public/product/:productId", async (req, res, next) => {
    try {
      const { productId } = req.params;
      const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit ?? "20", 10))
      );

      const reviews = await ReviewModel.find({
        product: productId,
        status: "published",
        isVisibleProduct: true,
      })
        .sort({ position: 1, createdAt: -1 })
        .limit(limit)
        .populate({
          path: "product"
        })
        .lean();

      res.json({ ok: true, data: reviews });
    } catch (e) {
      next(e);
    }
  });
}
