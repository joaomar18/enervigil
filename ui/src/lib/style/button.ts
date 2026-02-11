import type { ComponentStyles } from "./components";
import { createStyleStore } from "./components";

//////////     D E F A U L T     B U T T O N     //////////

const DefaultButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "250px",
        height: "50px",
        borderRadius: "5px",
        backgroundColor: "#232528",
        disabledBackgroundColor: "#232528",
        selectedBackgroundColor: "#232528",
        borderColor: "#8A8C91",
        disabledBorderColor: "#8A8C91",
        selectedBorderColor: "#8A8C91",
        hoverColor: "#2C2E34",
        disabledHoverColor: "#2C2E34",
        selectedHoverColor: "#2C2E34",
        fontColor: "#f5f5f5",
        disabledFontColor: "#f5f5f5",
        selectedFontColor: "#f5f5f5",
        fontSize: "1rem",
        subFontSize: "0.875rem",
        fontWeight: "400",
        subFontWeight: "400",
        imageWidth: "32px",
        imageHeight: "32px",
        imageRightPos: "auto",
        imageLeftPos: "20px",
        showToolTipDelay: 300,
    },
};

export const DefaultButtonStyle = createStyleStore(DefaultButtonStyleConfig);

//////////     S U B     D E F A U L T     B U T T O N     //////////

const SubDefaultButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "150px",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#3a3a3a",
        disabledBackgroundColor: "#3a3a3a",
        selectedBackgroundColor: "#3a3a3a",
        borderColor: "#5c5c5c",
        disabledBorderColor: "#5c5c5c",
        selectedBorderColor: "#5c5c5c",
        hoverColor: "#4b4b4b",
        disabledHoverColor: "#4b4b4b",
        selectedHoverColor: "#4b4b4b",
        fontColor: "#f5f5f5",
        disabledFontColor: "#f5f5f5",
        selectedFontColor: "#f5f5f5",
        fontSize: "1rem",
        subFontSize: "0.875rem",
        fontWeight: "400",
        subFontWeight: "400",
        showToolTipDelay: 300,
    },
};

export const SubDefaultButtonStyle = createStyleStore(SubDefaultButtonStyleConfig);

//////////     P R I M A R Y     B U T T O N     //////////

const PrimaryButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "250px",
        height: "50px",
        borderRadius: "5px",
        backgroundColor: "#1a2233",
        disabledBackgroundColor: "#282828",
        selectedBackgroundColor: "#1a2233",
        borderColor: "#2F80ED",
        disabledBorderColor: "#444444",
        selectedBorderColor: "#2F80ED",
        hoverColor: "#203046",
        disabledHoverColor: "#282828",
        selectedHoverColor: "#203046",
        fontColor: "#f5f5f5",
        disabledFontColor: "#f5f5f5",
        selectedFontColor: "#f5f5f5",
        fontSize: "1rem",
        subFontSize: "0.875rem",
        fontWeight: "400",
        subFontWeight: "400",
        imageWidth: "32px",
        imageHeight: "32px",
        imageRightPos: "auto",
        imageLeftPos: "20px",
        showToolTipDelay: 300,
    },
};

export const PrimaryButtonStyle = createStyleStore(PrimaryButtonStyleConfig);

//////////     S U B     P R I M A R Y     B U T T O N     //////////

const SubPrimaryButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "150px",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#2F80ED",
        disabledBackgroundColor: "#7da5d9",
        selectedBackgroundColor: "#2F80ED",
        borderColor: "#1456B0",
        disabledBorderColor: "#6287b6",
        selectedBorderColor: "#1456B0",
        hoverColor: "#1C6DD0",
        disabledHoverColor: "#7da5d9",
        selectedHoverColor: "#1C6DD0",
        fontColor: "#f5f5f5",
        disabledFontColor: "#f5f5f5",
        selectedFontColor: "#f5f5f5",
        fontSize: "1rem",
        subFontSize: "0.875rem",
        fontWeight: "400",
        subFontWeight: "400",
        imageWidth: "20px",
        imageHeight: "20px",
        showToolTipDelay: 300,
    },
};

export const SubPrimaryButtonStyle = createStyleStore(SubPrimaryButtonStyleConfig);

//////////     D A N G E R     B U T T O N     //////////

const DangerButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "250px",
        height: "50px",
        borderRadius: "5px",
        backgroundColor: "#23171a",
        disabledBackgroundColor: "#282828",
        selectedBackgroundColor: "#23171a",
        borderColor: "#FF3B30",
        disabledBorderColor: "#444444",
        selectedBorderColor: "#FF3B30",
        hoverColor: "#3b181a",
        disabledHoverColor: "#282828",
        selectedHoverColor: "#3b181a",
        fontColor: "#f5f5f5",
        disabledFontColor: "#f5f5f5",
        selectedFontColor: "#f5f5f5",
        fontSize: "1rem",
        subFontSize: "0.875rem",
        fontWeight: "400",
        subFontWeight: "400",
        imageWidth: "32px",
        imageHeight: "32px",
        imageRightPos: "auto",
        imageLeftPos: "20px",
        showToolTipDelay: 300,
    },
};

export const DangerButtonStyle = createStyleStore(DangerButtonStyleConfig);

//////////     S U B     D A N G E R     B U T T O N     //////////

const SubDangerButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "150px",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#E74C3C",
        disabledBackgroundColor: "#3a2323",
        selectedBackgroundColor: "#E74C3C",
        borderColor: "#A93226",
        disabledBorderColor: "#5a3a3a",
        selectedBorderColor: "#A93226",
        hoverColor: "#C0392B",
        disabledHoverColor: "#2a1818",
        selectedHoverColor: "#C0392B",
        fontColor: "#f5f5f5",
        disabledFontColor: "#f5f5f5",
        selectedFontColor: "#f5f5f5",
        fontSize: "1rem",
        subFontSize: "0.875rem",
        fontWeight: "400",
        subFontWeight: "400",
        imageWidth: "20px",
        imageHeight: "20px",
        showToolTipDelay: 300,
    },
};

export const SubDangerButtonStyle = createStyleStore(SubDangerButtonStyleConfig);

//////////     S U C E S S     B U T T O N     //////////

const SucessButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "250px",
        height: "50px",
        borderRadius: "5px",
        backgroundColor: "#16281a",
        disabledBackgroundColor: "#282828",
        selectedBackgroundColor: "#16281a",
        borderColor: "#1a8d46",
        disabledBorderColor: "#444444",
        selectedBorderColor: "#1a8d46",
        hoverColor: "#1c3922",
        disabledHoverColor: "#282828",
        selectedHoverColor: "#1c3922",
        fontColor: "#f5f5f5",
        disabledFontColor: "#f5f5f5",
        selectedFontColor: "#f5f5f5",
        fontSize: "1rem",
        subFontSize: "0.875rem",
        fontWeight: "400",
        subFontWeight: "400",
        imageWidth: "32px",
        imageHeight: "32px",
        imageRightPos: "auto",
        imageLeftPos: "20px",
        showToolTipDelay: 300,
    },
};

export const SucessButtonStyle = createStyleStore(SucessButtonStyleConfig);

//////////     S U B     S U C E S S     B U T T O N     //////////

const SubSucessButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "150px",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#1a8d46",
        disabledBackgroundColor: "#6a8d76",
        selectedBackgroundColor: "#1a8d46",
        borderColor: "#145a36",
        disabledBorderColor: "#55705d",
        selectedBorderColor: "#145a36",
        hoverColor: "#17673a",
        disabledHoverColor: "#6a8d76",
        selectedHoverColor: "#17673a",
        fontColor: "#f5f5f5",
        disabledFontColor: "#f5f5f5",
        selectedFontColor: "#f5f5f5",
        fontSize: "1rem",
        subFontSize: "0.875rem",
        fontWeight: "400",
        subFontWeight: "400",
        imageWidth: "20px",
        imageHeight: "20px",
        showToolTipDelay: 300,
    },
};

export const SubSucessButtonStyle = createStyleStore(SubSucessButtonStyleConfig);
