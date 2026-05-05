import mongoose from "mongoose";

export function badRequest(message, details = null) {
  const err = new Error(message);
  err.code = "BAD_REQUEST";
  err.status = 400;
  if (details) err.details = details;
  return err;
}

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id));
}

export function toObjectId(id, field = "id") {
  if (!isValidObjectId(id)) {
    throw badRequest(`Некорректный ObjectId в поле ${field}`, {
      field,
      value: id,
    });
  }

  return new mongoose.Types.ObjectId(String(id));
}

export function normalizeLocalizedText(v = {}) {
  return {
    ua: String(v?.ua || "").trim(),
    en: String(v?.en || "").trim(),
  };
}

export function normalizeCharacteristic(item = {}) {
  return {
    key: String(item?.key || "").trim(),
    type: item?.type || "string",
    unit: item?.unit ?? null,
    value: item?.value ?? null,
    values: Array.isArray(item?.values)
      ? item.values.filter((x) => x !== undefined && x !== null)
      : [],
  };
}

export function normalizeVariationAxis(axis = {}) {
  return {
    axisId: String(axis?.axisId || "").trim(),
    title: normalizeLocalizedText(axis?.title),
    type: axis?.type || "string",
    unit: axis?.unit ?? null,
    valuesPreset: Array.isArray(axis?.valuesPreset)
      ? axis.valuesPreset.filter((x) => x !== undefined && x !== null)
      : [],
  };
}

export function normalizeCategoryIds(categoryIds = []) {
  if (!Array.isArray(categoryIds)) return [];

  return categoryIds
    .filter((x) => x !== undefined && x !== null && x !== "")
    .map((x, i) => toObjectId(x, `categoryIds[${i}]`));
}

export function normalizeStocks(stocks = []) {
  if (!Array.isArray(stocks)) return [];

  return stocks
    .filter(Boolean)
    .map((item, i) => ({
      warehouseId: toObjectId(item?.warehouseId, `stocks[${i}].warehouseId`),
      onHand: Number(item?.onHand || 0),
      reserved: Number(item?.reserved || 0),
    }));
}

export function buildOptionValuesFromMap(variationAxes = [], optionMap = {}) {
  return variationAxes.map((axis) => optionMap?.[axis.axisId] ?? null);
}

export function buildOptionKey(optionValues = []) {
  return optionValues.map((x) => String(x ?? "")).join("|");
}

export function buildOptionMapFromValues(variationAxes = [], optionValues = []) {
  const map = {};
  variationAxes.forEach((axis, idx) => {
    map[axis.axisId] = optionValues?.[idx] ?? null;
  });
  return map;
}

export function normalizeOfferForSave(rawOffer = {}, variationAxes = []) {
  const optionMap =
    rawOffer?.optionMap && typeof rawOffer.optionMap === "object"
      ? rawOffer.optionMap
      : buildOptionMapFromValues(variationAxes, rawOffer?.optionValues || []);

  const optionValues = buildOptionValuesFromMap(variationAxes, optionMap);
  const optionKey = buildOptionKey(optionValues);

  return {
    _id: rawOffer?._id || null,
    sku: String(rawOffer?.sku || "").trim(),
    price: rawOffer?.price == null ? null : Number(rawOffer.price),
    opt_price: rawOffer?.opt_price == null ? null : Number(rawOffer.opt_price),
    available: Boolean(rawOffer?.available),
    img: String(rawOffer?.img || ""),
    optionMap,
    optionValues,
    optionKey,
    characteristics: Array.isArray(rawOffer?.characteristics)
      ? rawOffer.characteristics.map(normalizeCharacteristic)
      : [],
    stocks: normalizeStocks(rawOffer?.stocks || []),
  };
}

export function parseNumStrict(v, param) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) {
    throw badRequest(`Параметр ${param} должен быть числом`, { param });
  }
  return n;
}

export function parseBoolNullable(v, param) {
  if (v === undefined || v === null || v === "") return null;
  if (v === true || v === "true" || v === 1 || v === "1") return true;
  if (v === false || v === "false" || v === 0 || v === "0") return false;
  throw badRequest(`Параметр ${param} должен быть boolean`, { param });
}

export function safeJsonParse(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(String(value));
  } catch {
    throw badRequest("Некорректный JSON в query", { value });
  }
}

export function buildGroupCharacteristicsFilter(char) {
  const charObj = safeJsonParse(char, null);
  if (!charObj || typeof charObj !== "object") return {};

  const and = [];

  for (const [key, value] of Object.entries(charObj)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      const arr = value.filter((x) => x !== undefined && x !== null);
      if (!arr.length) continue;

      and.push({
        $or: [
          { characteristics: { $elemMatch: { key, value: { $in: arr } } } },
          { characteristics: { $elemMatch: { key, "value.value": { $in: arr } } } },
          { characteristics: { $elemMatch: { key, values: { $in: arr } } } },
          { characteristics: { $elemMatch: { key, "values.value": { $in: arr } } } },
        ],
      });
    } else {
      and.push({
        $or: [
          { characteristics: { $elemMatch: { key, value } } },
          { characteristics: { $elemMatch: { key, "value.value": value } } },
          { characteristics: { $elemMatch: { key, values: value } } },
          { characteristics: { $elemMatch: { key, "values.value": value } } },
        ],
      });
    }
  }

  return and.length ? { $and: and } : {};
}