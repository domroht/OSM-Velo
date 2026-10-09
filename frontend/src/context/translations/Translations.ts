import { useSettings } from "../SettingContext";
import { translations } from "./Index";

export function useTranslation() {
    const { context } = useSettings();

    return translations[context.lang];
}