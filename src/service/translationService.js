import { postRequest } from "./apiService";

const TRANSLATE_BATCH_ENDPOINT = "/api/translate/batch";
const MAX_BATCH_SIZE = 100;

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
    throw new Error(getErrorMessage(error), { cause: error });
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

  const translatedTexts = [];
  for (let start = 0; start < texts.length; start += MAX_BATCH_SIZE) {
    translatedTexts.push(
      ...await translateBatch(texts.slice(start, start + MAX_BATCH_SIZE), targetLang),
    );
  }

  return translatedTexts;
};
