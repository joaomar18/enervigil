import type { ComponentStyles } from "./components";
import { createStyleStore } from "./components";

//////////     D A S H B O A R D     C O N T A I N E R     //////////

const DashboardContainerStyleConfig: ComponentStyles = {
    dark: {
        scrollbarTrackColor: "#242a32",
        scrollbarThumbColor: "#12161b",
    },
};

export const DashboardContainerStyle = createStyleStore(DashboardContainerStyleConfig);

//////////     L E F T     P A N E L     //////////

const LeftPanelStyleConfig: ComponentStyles = {
    dark: {
        overlayMaskBackgroundColor: "rgba(0, 0, 0, 0.3)",
        backgroundColor: "#15191f",
        borderRightColor: "rgba(255, 255, 255, 0.02)",
        scrollbarTrackColor: "#323a45",
        scrollbarThumbColor: "#1e242b",
        sectionTextColor: "rgba(255, 255, 255, 0.4)",
        sectionTextWeight: "500",
        sectionBorderBottomColor: "rgba(255, 255, 255, 0.1)",
        textColor: "#eeeeee",
        textWeight: "300",
    },
};

export const LeftPanelStyle = createStyleStore(LeftPanelStyleConfig);

//////////     F U L L     S C R E E N     P A N E L     //////////

const FullScreenPanelStyleConfig: ComponentStyles = {
    dark: {
        blurFilter: "8px",
        background: "rgba(24, 29, 35, 0.25)",
        paddingHorizontal: "50px",
        paddingTop: "50px",
        paddingBottom: "50px",
    },
};

export const FullScreenPanelStyle = createStyleStore(FullScreenPanelStyleConfig);

//////////     L I N K     //////////

const LinkStyleConfig: ComponentStyles = {
    dark: {
        height: "48px",
        paddingLeftText: "10px",
        imageContainerWidth: "50px",
        imageWidth: "40px",
        imageHeight: "40px",
        imagePaddingRight: "0px",
        arrowImageWidth: "24px",
        arrowImageHeight: "24px",
        fontSize: "1rem",
        textColor: "#eeeeee",
        disabledTextColor: "#5c5e66",
        backgroundColor: "transparent",
        hoverColor: "rgba(255, 255, 255, 0.05)",
        selectedColor: "#2F4138",
        selectedHoverColor: "rgba(47, 65, 56, 0.8)",
        expandedColor: "rgba(255, 255, 255, 0.15)",
        expandedHoverColor: "rgba(255, 255, 255, 0.25)",
        subContentBorderColor: "rgba(255, 255, 255, 0.1)",
    },
};

export const LinkStyle = createStyleStore(LinkStyleConfig);

//////////     S U B     L I N K     //////////

const SubLinkStyleConfig: ComponentStyles = {
    dark: {
        height: "40px",
        paddingLeftText: "10px",
        imageContainerWidth: "50px",
        imageWidth: "24px",
        imageHeight: "24px",
        imagePaddingRight: "8px",
        arrowImageWidth: "0px",
        arrowImageHeight: "0px",
        fontSize: "14px",
        textColor: "rgba(255, 255, 255, 0.7)",
        disabledTextColor: "#5c5e66",
        backgroundColor: "transparent",
        hoverColor: "rgba(255, 255, 255, 0.03)",
        selectedColor: "rgba(255, 255, 255, 0.08)",
        selectedHoverColor: "rgba(255, 255, 255, 0.12)",
        expandedColor: "transparent",
        expandedHoverColor: "rgba(255, 255, 255, 0.03)",
        subContentBorderColor: "rgba(255, 255, 255, 0.08)",
    },
};

export const SubLinkStyle = createStyleStore(SubLinkStyleConfig);

//////////     L O G O U T     //////////

const LogoutStyleConfig: ComponentStyles = {
    dark: {
        width: "125px",
        height: "40px",
        borderRadius: "20px",
        backgroundColor: "#14161c",
        hoverColor: "#2a2e3a",
        borderColor: "#2a2e3a",
        fontSize: "1rem",
        paddingLeft: "10px",
        paddingRight: "20px",
        paddingLeftText: "0px",
        imageWidth: "32px",
        imageHeight: "32px",
        textColor: "#eeeeee",
        textWeight: "400",
        showToolTipDelay: 300,
    },
};

export const LogoutStyle = createStyleStore(LogoutStyleConfig);

//////////     S E A R C H     B A R     //////////

const SearchBarStyleConfig: ComponentStyles = {
    dark: {
        width: "80%",
        height: "40px",
        borderRadius: "20px",
        searchButtonWidth: "75px",
        backgroundColor: "#14161c",
        buttonBgColor: "#1C2126",
        buttonHoverColor: "#232731",
        borderColor: "#2a2e3a",
        buttonBorderColor: "#2a2e3a",
        selectedBorderColor: "#3B7DFF",
        imageWidth: "32px",
        imageHeight: "32px",
        textColor: "#eee",
        showToolTipDelay: 300,
    },
};

export const SearchBarStyle = createStyleStore(SearchBarStyleConfig);
