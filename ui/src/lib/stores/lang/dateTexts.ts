import { createLangStore } from "$lib/stores/lang/definition";
import type { TextsObject } from "$lib/stores/lang/definition";

const dateTextsObject: TextsObject = {
    never: {
        PT: "nunca",
        EN: "never",
    },
    elapsedSeconds: {
        PT: "à {seconds} segundo{plural}",
        EN: "{seconds} second{plural} ago",
    },
    elapsedMinutes: {
        PT: "à {minutes} minuto{plural}",
        EN: "{minutes} minute{plural} ago",
    },
    elapsedHours: {
        PT: "à {hours} hora{hours_plural} e {minutes} minuto{minutes_plural}",
        EN: "{hours} hour{hours_plural} and {minutes} minute{minutes_plural} ago",
    },
    elapsedDays: {
        PT: "à {days} dia{days_plural} e {hours} hora{hours_plural}",
        EN: "{days} day{days_plural} and {hours} hour{hours_plural} ago",
    },
    elapsedFullDate: {
        PT: "em {date} às {time}",
        EN: "on {date} at {time}",
    },
};

export const dateTexts = createLangStore(dateTextsObject);
