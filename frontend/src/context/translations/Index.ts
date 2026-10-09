import en from "./en.json";
import da from "./da.json";

export const translations = {
    EN: en,
    DA: da,
};

export type Language = keyof typeof translations;