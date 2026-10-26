<<<<<<< HEAD
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
=======
import { postRequest } from './apiService'

const TRANSLATION_ENDPOINT = '/api/translate/batch'
const MAX_TRANSLATION_BATCH_SIZE = 100
const originalTextByNode = new WeakMap()
const translatedTextByNode = new WeakMap()
const trackedNodes = new Set()
const translationCache = new Map()

const getTranslations = (response) => [
  response?.translations,
  response?.translatedTexts,
  response?.data?.translations,
  response?.data?.translatedTexts,
  response?.data,
  response?.results,
].find(Array.isArray)

const getTranslatedText = (translation) => {
  if (typeof translation === 'string') return translation
  if (translation && typeof translation === 'object') {
    return translation.translatedText
      ?? translation.translation
      ?? translation.translated_text
  }
}

const getValidationDetails = (error) => {
  const detail = error?.response?.detail
    ?? error?.response?.data?.detail
    ?? error?.data?.detail
  if (!Array.isArray(detail)) return []
  return detail.map((item) => ({
    location: Array.isArray(item.loc) ? item.loc.join('.') : '',
    message: item.msg || '',
    type: item.type || '',
  }))
}

const isBatchSizeError = (error) => getValidationDetails(error).some(({ location, message, type }) => (
  location.includes('texts')
  && (
    type.includes('too_long')
    || /max(?:imum)?\s+(?:number|length|items)|at most|too many/i.test(message)
  )
))

const getRequestErrorMessage = (error) => {
  const details = getValidationDetails(error)
  if (details.length) {
    return details
      .map(({ location, message }) => [location, message].filter(Boolean).join(': '))
      .join('; ')
  }
  const detail = error?.response?.detail
    ?? error?.response?.data?.detail
    ?? error?.data?.detail
  if (typeof detail === 'string') return detail
  return error?.message || 'Translation request failed'
}

const getTextNodes = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue
      if (
        !text
        || !text.trim()
        || node.parentElement?.closest('script, style, noscript, svg, [data-translation-ui]')
      ) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  return nodes
}

const translateTexts = async (texts, targetLang) => {
  let response
  try {
    response = await postRequest(TRANSLATION_ENDPOINT, { texts, targetLang })
  } catch (error) {
    if (texts.length > 1 && isBatchSizeError(error)) {
      const midpoint = Math.ceil(texts.length / 2)
      const firstHalf = await translateTexts(texts.slice(0, midpoint), targetLang)
      const secondHalf = await translateTexts(texts.slice(midpoint), targetLang)
      return [...firstHalf, ...secondHalf]
    }
    throw new Error(getRequestErrorMessage(error), { cause: error })
  }

  const translations = getTranslations(response)
  if (!translations || translations.length !== texts.length) {
    throw new Error('Translation API returned an unexpected response')
  }

  return translations.map((translation) => {
    const text = getTranslatedText(translation)
    if (typeof text !== 'string') {
      throw new Error('Translation API returned an invalid translation')
    }
    return text
  })
}

export const translatePage = async (targetLang, { refresh = false } = {}) => {
  for (const node of trackedNodes) {
    if (!node.isConnected) trackedNodes.delete(node)
  }

  const nodes = getTextNodes()
  const translationsToFetch = new Map()

  for (const node of nodes) {
    const currentText = node.nodeValue
    const previousTranslation = translatedTextByNode.get(node)
    if (previousTranslation !== undefined && previousTranslation !== currentText) {
      originalTextByNode.set(node, currentText)
    } else if (!originalTextByNode.has(node)) {
      originalTextByNode.set(node, currentText)
    }

    trackedNodes.add(node)
    const originalText = originalTextByNode.get(node)
    const cacheKey = `${targetLang}\0${originalText}`
    if (refresh || !translationCache.has(cacheKey)) {
      translationsToFetch.set(originalText, cacheKey)
    }
  }

  if (translationsToFetch.size > 0) {
    const texts = Array.from(translationsToFetch.keys())
    for (let start = 0; start < texts.length; start += MAX_TRANSLATION_BATCH_SIZE) {
      const batch = texts.slice(start, start + MAX_TRANSLATION_BATCH_SIZE)
      const translations = await translateTexts(batch, targetLang)
      translations.forEach((text, index) => {
        translationCache.set(translationsToFetch.get(batch[index]), text)
      })
    }
  }

  for (const node of nodes) {
    const originalText = originalTextByNode.get(node)
    const translatedText = translationCache.get(`${targetLang}\0${originalText}`)
    if (node.nodeValue !== translatedText) node.nodeValue = translatedText
    translatedTextByNode.set(node, translatedText)
  }
}
>>>>>>> 41dccad (Header ObervationObservation and TranslationService api)
