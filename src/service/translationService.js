import { postRequest } from "./apiService";

const TRANSLATE_BATCH_ENDPOINT = "/api/translate/batch";
const MAX_BATCH_SIZE = 10;
const translationCache = new Map();

const getValidationDetails = (error) => {
  const detail = error?.response?.detail;
  if (!Array.isArray(detail)) return [];
  return detail.map((item) => ({
    location: Array.isArray(item?.loc) ? item.loc.join(".") : "",
    message: item?.msg || "",
    type: item?.type || "",
  }));
};

const isBatchSizeError = (error) => getValidationDetails(error).some(
  ({ location, message, type }) => (
    location.includes("texts")
    && (
      type.includes("too_long")
      || /max(?:imum)?\s+(?:number|length|items)|at most|too many/i.test(message)
    )
  ),
);

const getErrorMessage = (error) => {
  const details = getValidationDetails(error);
  if (details.length) {
    return details
      .map(({ location, message }) => [location, message].filter(Boolean).join(": "))
      .join("; ");
  }
  return error?.message || "The translation request failed.";
};

const translateBatch = async (texts, targetLang) => {
  let response;
  try {
    response = await postRequest(TRANSLATE_BATCH_ENDPOINT, { texts, targetLang });
  } catch (error) {
    if (texts.length > 1 && isBatchSizeError(error)) {
      const midpoint = Math.ceil(texts.length / 2);
      const firstHalf = await translateBatch(texts.slice(0, midpoint), targetLang);
      const secondHalf = await translateBatch(texts.slice(midpoint), targetLang);
      return [...firstHalf, ...secondHalf];
    }
    const requestError = new Error(getErrorMessage(error), { cause: error });
    requestError.status = error?.status;
    requestError.response = error?.response;
    throw requestError;
  }

  if (
    !Array.isArray(response?.translatedTexts)
    || response.translatedTexts.length !== texts.length
    || !response.translatedTexts.every((text) => typeof text === "string")
  ) {
    throw new Error("The translation service returned an invalid response.");
  }

  return response.translatedTexts;
};

export const translateTexts = async (texts, targetLang) => {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  if (typeof targetLang !== "string" || !targetLang.trim()) {
    throw new Error("A target language is required.");
  }

  const cacheKeys = texts.map((text) => `${targetLang}\u0000${text}`);
  const missingTexts = [...new Set(
    texts.filter((text, index) => !translationCache.has(cacheKeys[index])),
  )];

  for (let start = 0; start < missingTexts.length; start += MAX_BATCH_SIZE) {
    const batch = missingTexts.slice(start, start + MAX_BATCH_SIZE);
    const translations = await translateBatch(batch, targetLang);
    batch.forEach((text, index) => {
      translationCache.set(`${targetLang}\u0000${text}`, translations[index]);
    });
  }

  return cacheKeys.map((key) => translationCache.get(key));
};
