import { postRequest } from "./apiService";

const TRANSLATE_BATCH_ENDPOINT = "/api/translate/batch";
const MAX_BATCH_SIZE = 100;

export const translateTexts = async (texts, targetLang) => {
  const translatedTexts = [];

  for (let start = 0; start < texts.length; start += MAX_BATCH_SIZE) {
    const batch = texts.slice(start, start + MAX_BATCH_SIZE);
    const response = await postRequest(TRANSLATE_BATCH_ENDPOINT, {
      texts: batch,
      targetLang,
    });

    if (
      !Array.isArray(response?.translatedTexts) ||
      response.translatedTexts.length !== batch.length ||
      !response.translatedTexts.every((text) => typeof text === "string")
    ) {
      throw new Error("The translation service returned an invalid response.");
    }

    translatedTexts.push(...response.translatedTexts);
  }

  return translatedTexts;
};
