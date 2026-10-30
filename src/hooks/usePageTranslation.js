import { useCallback, useEffect, useRef, useState } from "react";
import { translateTexts } from "../service/translationService";

const SUPPORTED_LANGUAGES = ["English", "Hindi", "Marathi"];
const TRANSLATABLE_ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"];
const TEXT_EXCLUSIONS = "script, style, noscript, textarea, input, select, [contenteditable='true'], [data-translation-api='true']";

const getSavedLanguage = () => {
  const savedLanguage = localStorage.getItem("websiteLanguage");
  return SUPPORTED_LANGUAGES.includes(savedLanguage) ? savedLanguage : "English";
};

export const usePageTranslation = () => {
  const [language, setLanguage] = useState(getSavedLanguage);
  const [translationAttempt, setTranslationAttempt] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState("");
  const textRecords = useRef(new WeakMap());
  const attributeRecords = useRef(new WeakMap());

  const selectLanguage = useCallback((nextLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) return;
    localStorage.setItem("websiteLanguage", nextLanguage);
    if (nextLanguage === "English") setIsTranslating(false);
    if (nextLanguage === language) {
      setTranslationAttempt((attempt) => attempt + 1);
    }
    setTranslationError("");
    setLanguage(nextLanguage);
  }, [language]);

  useEffect(() => {
    const root = document.body;
    let active = true;
    let observer;
    let debounceTimer;
    let translating = false;
    let translationFailed = false;
    let scanRequested = false;

    const restoreEnglish = () => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();

      while (node) {
        const record = textRecords.current.get(node);
        if (record && node.textContent === record.translated) {
          node.textContent = record.original;
          record.translated = "";
          record.language = "";
        }
        node = walker.nextNode();
      }

      root.querySelectorAll(TRANSLATABLE_ATTRIBUTES.map((name) => `[${name}]`).join(",")).forEach((element) => {
        const records = attributeRecords.current.get(element);
        if (!records) return;

        TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
          const record = records.get(attribute);
          if (record && element.getAttribute(attribute) === record.translated) {
            element.setAttribute(attribute, record.original);
            record.translated = "";
            record.language = "";
          }
        });
      });
    };

    if (language === "English") {
      restoreEnglish();
      return undefined;
    }

    const collectTranslationItems = () => {
      const items = [];
      const textNodes = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = textNodes.nextNode();

      while (node) {
        const textNode = node;
        const parent = textNode.parentElement;
        const currentText = textNode.textContent || "";
        if (parent && !parent.closest(TEXT_EXCLUSIONS) && currentText.trim()) {
          let record = textRecords.current.get(textNode);
          if (!record) {
            record = { original: currentText, translated: "", language: "" };
            textRecords.current.set(textNode, record);
          } else if (currentText !== record.translated) {
            record.original = currentText;
            record.translated = "";
            record.language = "";
          }

          if (currentText !== record.translated || record.language !== language) {
            items.push({
              getValue: () => textNode.textContent,
              expectedValue: currentText,
              setValue: (value) => { textNode.textContent = value; },
              source: record.original,
              setTranslated: (value) => {
                record.translated = value;
                record.language = language;
              },
              isConnected: () => textNode.isConnected,
            });
          }
        }
        node = textNodes.nextNode();
      }

      root.querySelectorAll(TRANSLATABLE_ATTRIBUTES.map((name) => `[${name}]`).join(",")).forEach((element) => {
        TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
          const currentText = element.getAttribute(attribute) || "";
          if (!currentText.trim()) return;

          let records = attributeRecords.current.get(element);
          if (!records) {
            records = new Map();
            attributeRecords.current.set(element, records);
          }
          let record = records.get(attribute);
          if (!record) {
            record = { original: currentText, translated: "", language: "" };
            records.set(attribute, record);
          } else if (currentText !== record.translated) {
            record.original = currentText;
            record.translated = "";
            record.language = "";
          }

          if (currentText !== record.translated || record.language !== language) {
            items.push({
              getValue: () => element.getAttribute(attribute),
              expectedValue: currentText,
              setValue: (value) => { element.setAttribute(attribute, value); },
              source: record.original,
              setTranslated: (value) => {
                record.translated = value;
                record.language = language;
              },
              isConnected: () => element.isConnected,
            });
          }
        });
      });

      return items;
    };

    const translatePendingContent = async () => {
      if (translationFailed) return;
      if (!active || translating) {
        scanRequested = true;
        return;
      }
      translating = true;
      setIsTranslating(true);

      try {
        do {
          scanRequested = false;
          const items = collectTranslationItems();
          for (let start = 0; start < items.length; start += 10) {
            const batch = items.slice(start, start + 10);
            const translations = await translateTexts(batch.map((item) => item.source), language);
            if (!active) return;

            batch.forEach((item, index) => {
              if (item.isConnected() && item.getValue() === item.expectedValue) {
                item.setValue(translations[index]);
                item.setTranslated(translations[index]);
              }
            });
          }
        } while (active && scanRequested);
      } catch (error) {
        translationFailed = true;
        console.error("Website translation failed:", error);
        if (active) {
          const message = error?.status === 401
            ? "Your session has expired. Log in again to translate."
            : error?.status === 403
              ? "Your account is not authorized to use translation."
              : error?.status === 503
                ? "The backend cannot reach Ollama. Set OLLAMA_HOST=http://localhost:11434 and restart the backend."
                : error?.status
                  ? error.message || `Translation failed (HTTP ${error.status}).`
                  : "The translation backend is unreachable. Make sure it is running at http://localhost:8951.";
          setTranslationError(message);
        }
      } finally {
        translating = false;
        if (active) setIsTranslating(false);
        if (active && scanRequested) translatePendingContent();
      }
    };

    const scheduleTranslation = () => {
      if (translationFailed) return;
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(translatePendingContent, 100);
    };

    observer = new MutationObserver(scheduleTranslation);
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
    });
    translatePendingContent();

    return () => {
      active = false;
      observer.disconnect();
      window.clearTimeout(debounceTimer);
    };
  }, [language, translationAttempt]);

  return { language, selectLanguage, isTranslating, translationError };
};
