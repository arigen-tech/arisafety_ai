import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { translateTexts } from "../service/translationService";

export const useTranslatedApiValues = (rows, getValues) => {
  const { language } = useOutletContext();
  const sourceRows = useMemo(() => rows.map(getValues), [getValues, rows]);
  const resultKey = JSON.stringify([language, sourceRows]);
  const [translationResult, setTranslationResult] = useState({ key: "", rows: [] });
  const [errorResult, setErrorResult] = useState({ key: "", message: "" });

  useEffect(() => {
    let active = true;
    const flatValues = sourceRows.flat();
    const translatableValues = flatValues.filter((value) => value.trim() && value.trim() !== "-");

    if (language === "English" || translatableValues.length === 0) {
      return () => { active = false; };
    }

    const translate = async () => {
      try {
        const translatedValues = await translateTexts(translatableValues, language);
        if (!active) return;

        let translatedIndex = 0;
        const translatedFlatValues = flatValues.map((value) => (
          value.trim() && value.trim() !== "-" ? translatedValues[translatedIndex++] : value
        ));
        let offset = 0;
        const translatedRows = sourceRows.map((row) => {
          const translatedRow = translatedFlatValues.slice(offset, offset + row.length);
          offset += row.length;
          return translatedRow;
        });
        setTranslationResult({ key: resultKey, rows: translatedRows });
      } catch (error) {
        console.error("API response translation failed:", error);
        if (active) {
          setErrorResult({
            key: resultKey,
            message: error.message || "API response translation failed.",
          });
        }
      }
    };

    translate();
    return () => { active = false; };
  }, [language, resultKey, sourceRows]);

  return {
    translatedRows: translationResult.key === resultKey ? translationResult.rows : sourceRows,
    translationError: errorResult.key === resultKey ? errorResult.message : "",
  };
};
