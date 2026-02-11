/**
 * Defines the available sections of the application's.
 *
 * Each enum value represents a distinct functional area of the system UI,
 * used to control routing, visibility, and user interaction.
 *
 * @enum MainSection
 * @property LOGIN          Authentication and login section
 * @property DEVICES        Device management and monitoring section
 * @property CONNECTIVITY   Communication and connectivity configuration
 * @property HEALTH         System health and status overview
 * @property LOGS           Application and system log viewer
 * @property SETTINGS       General application and system settings
 * @property BACKUP         Backup and restore management
 */
export enum MainSection {
    LOGIN = "login",
    DEVICES = "devices",
    CONNECTIVITY = "connectivity",
    HEALTH = "health",
    LOGS = "logs",
    SETTINGS = "settings",
    BACKUP = "backup",
}

/**
 * Defines the available subsections of the application's.
 *
 * Each enum value represents a distinct functional subsection of the MainSection,
 * used to control routing and visibility.
 *
 * @enum PageSubsections
 * @property LOGIN          Authentication and login subsections
 * @property DEVICES        Device management subsections
 * @property CONNECTIVITY   Communication and connectivity subsections
 * @property HEALTH         System health and status subsections
 * @property LOGS           Application and system log subsections
 * @property SETTINGS       General application and system settings subsections
 * @property BACKUP         Backup and restore management subsections
 *
 */
export const PageSubsections = {
    [MainSection.LOGIN]: {},
    [MainSection.DEVICES]: {
        DASHBOARD: "dashboard",
        ADD: "add",
        EDIT: "edit",
        GENERAL_VIEW: "general_view",
    },
    [MainSection.CONNECTIVITY]: {},
    [MainSection.HEALTH]: {
        SYSTEM: "system",
    },
    [MainSection.LOGS]: {},
    [MainSection.SETTINGS]: {},
    [MainSection.BACKUP]: {},
};

/**
 * Defines the default subsection of the application's.
 *
 * Each enum value represents a default subsection of the MainSection,
 * used to control routing and visibility.
 *
 * @enum DefaultPageSubsection
 * @property LOGIN          Default authentication and login subsection
 * @property DEVICES        Default device management subsection
 * @property CONNECTIVITY   Default communication and connectivity subsection
 * @property HEALTH         Default system health and status subsection
 * @property LOGS           Default application and system log subsection
 * @property SETTINGS       Default general application and system settings subsection
 * @property BACKUP         Default backup and restore management subsection
 */
export const DefaultPageSubsection = {
    [MainSection.LOGIN]: "",
    [MainSection.DEVICES]: "dashboard",
    [MainSection.CONNECTIVITY]: "",
    [MainSection.HEALTH]: "system",
    [MainSection.LOGS]: "",
    [MainSection.SETTINGS]: "",
    [MainSection.BACKUP]: "",
};
