import type { ComponentStyles } from "./components";
import { createStyleStore } from "./components";

//////////     A C T I O N     //////////

const ActionStyleConfig: ComponentStyles = {
    dark: {
        width: "40px",
        height: "40px",
        borderRadius: "20px",
        backgroundColor: "#14161c",
        borderColor: "#2a2e3a",
        hoverColor: "#2a2e3a",
        imageWidth: "32px",
        imageHeight: "32px",
        showToolTipDelay: 300,
    },
};

export const ActionStyle = createStyleStore(ActionStyleConfig);

//////////     S L O T T E D     A C T I O N     //////////

const SlottedActionStyleConfig: ComponentStyles = {
    dark: {
        width: "fit-content",
        height: "40px",
        borderRadius: "20px",
        backgroundColor: "#14161c",
        borderColor: "#2a2e3a",
        hoverColor: "#2a2e3a",
        showToolTipDelay: 300,
    },
};

export const SlottedActionStyle = createStyleStore(SlottedActionStyleConfig);

//////////     T O A S T     //////////

const ToastStyleConfig: ComponentStyles = {
    dark: {
        topBorderRadius: "10px",
        bottomBorderRadius: "0px",
        innerBackgroundColor: "#181d23",
        alertBackgroundColor: "rgba(245, 101, 101, 0.08)",
        alertBorderColor: "#f56565",
        warningBackgroundColor: "rgba(245, 158, 11, 0.08)",
        warningBorderColor: "#f59e0b",
        infoBackgroundColor: "rgba(59, 130, 246, 0.08)",
        infoBorderColor: "#3b82f6",
        neutralBackgroundColor: "rgba(107, 114, 128, 0.08)",
        neutralBorderColor: "#6b7280",
        textColor: "#ffffff",
    },
};

export const ToastStyle = createStyleStore(ToastStyleConfig);

//////////     F O R M     A L E R T     //////////

const FormAlertStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        height: "fit-content",
        maxHeight: "auto",
        padding: "10px",
        textSize: "15px",
        textWeight: "400",
        textLeftPadding: "5px",
        textIndent: "-4px",
        borderRadiusRight: "5px",
        iconSize: "30px",
        alertBackgroundColor: "rgba(245, 101, 101, 0.08)",
        alertBorderLeft: "2px solid #f56565",
        alertIconColor: "#f56565",
        alertTextColor: "#ff7979",
        warningBackgroundColor: "rgba(245, 158, 11, 0.08)",
        warningBorderLeft: "2px solid #f59e0b",
        warningIconColor: "#f59e0b",
        warningTextColor: "#fbbf24",
        infoBackgroundColor: "rgba(59, 130, 246, 0.08)",
        infoBorderLeft: "2px solid #3b82f6",
        infoIconColor: "#3b82f6",
        infoTextColor: "#60a5fa",
        neutralBackgroundColor: "rgba(107, 114, 128, 0.08)",
        neutralBorderLeft: "2px solid #6b7280",
        neutralIconColor: "#6b7280",
        neutralTextColor: "#9ca3af",
        lineClamp: "auto",
        closeButtonWidth: "32px",
        closeButtonHeight: "32px",
        closeButtonImageWidth: "24px",
        closeButtonImageHeight: "24px",
        closeButtonColor: "#9ca3af",
        closeButtonHoverColor: "#e5e7eb",
    },
};

export const FormAlertStyle = createStyleStore(FormAlertStyleConfig);

//////////     C H E C K B O X     //////////

const CheckboxStyleConfig: ComponentStyles = {
    dark: {
        width: "1.5em",
        height: "1.5em",
        checkMarkWidth: 24,
        checkMarkHeight: 24,
        checkMarkStroke: 2.5,
        disabledBackgroundColor: "#42505f",
        disabledBorderColor: "#5a646e",
        enabledBackgroundColor: "#2f80ed",
        enabledBorderColor: "#5a646e",
        badFormatBackgroundColor: "#e74c3c",
        badFormatBorderColor: "#5a646e",
        disabledCheckMarkColor: "rgb(170,170,170)",
        enabledCheckMarkColor: "rgb(255,255,255)",
    },
};

export const CheckBoxStyle = createStyleStore(CheckboxStyleConfig);

//////////     E D I T A B L E     T E X T     //////////

const EditableTextStyleConfig: ComponentStyles = {
    dark: {
        width: "75%",
        fontSize: "1.1rem",
        fontColor: "#f5f5f5",
        borderColorBottom: "rgba(255, 255, 255, 0.2)",
        invalidBorderColorBottom: "#e74c3c",
        buttonImageWidth: "32px",
        buttonImageHeight: "32px",
    },
};

export const EditableTextStyle = createStyleStore(EditableTextStyleConfig);

//////////     E X P A N D A B L E     B U T T O N     //////////

const ExpandableButtonStyleConfig: ComponentStyles = {
    dark: {
        modalWidth: "250px",
        modalHeight: "fit-content",
        modalBackgroundColor: "#1e242b",
        modalBorderColor: "#2c343d",
        modalBorderRadius: "10px",
        openBackgroundColor: "rgba(255, 255, 255, 0.05)",
        openHoverBackgroundColor: "rgba(255, 255, 255, 0.1)",
        openStrokeColor: "#cccccc",
        openHoverStrokeColor: "#eeeeee",
        closeBackgroundColor: "rgba(255, 255, 255, 0.1)",
        closeHoverBackgroundColor: "rgba(255, 255, 255, 0.2)",
        closeStrokeColor: "white",
        closeHoverStrokeColor: "#eeeeee",
        badFormatBackgroundColor: "rgba(255, 255, 255, 0.05)",
        badFormatHoverBackgroundColor: "rgba(255, 255, 255, 0.05)",
        badFormatStrokeColor: "#e74c3c",
        badFormatHoverStrokeColor: "#c0392b",
    },
};

export const ExpandableButtonStyle = createStyleStore(ExpandableButtonStyleConfig);

//////////     H I N T     I N F O     //////////

const HintInfoStyleConfig: ComponentStyles = {
    dark: {
        hintWidth: "300px",
        hintHeight: "fit-content",
        textColor: "#f5f5f5",
        hintBackgroundColor: "#1e242b",
        hintBorderColor: "#2c343d",
        hintBorderRadius: "10px",
        openBackgroundColor: "rgba(255, 255, 255, 0.05)",
        openHoverBackgroundColor: "rgba(255, 255, 255, 0.1)",
        openStrokeColor: "#cccccc",
        openHoverStrokeColor: "#eeeeee",
        closeBackgroundColor: "rgba(255, 255, 255, 0.1)",
        closeHoverBackgroundColor: "rgba(255, 255, 255, 0.2)",
        closeStrokeColor: "white",
        closeHoverStrokeColor: "#eeeeee",
    },
};

export const HintInfoStyle = createStyleStore(HintInfoStyleConfig);

//////////     I N P U T     F I E L D     //////////

const InputFieldStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#252b33",
        borderColor: "#323a45",
        disabledBackgroundColor: "#252b33",
        disabledBorderColor: "#323a45",
        selectedBackgroundColor: "#252b33",
        selectedBorderColor: "#2F80ED",
        badFormatBackgroundColor: "#252b33",
        badFormatBorderColor: "#e74c3c",
        paddingLeft: "10px",
        fontSize: "1rem",
        fontColor: "#f5f5f5",
        fontWeight: "400",
        textAlign: "center",
        infoTextColor: "#f5f5f5",
        infoTextSize: "0.9rem",
        infoTextWeight: "400",
        unitTextColor: "rgb(170,170,170)",
        placeHolderTextColor: "rgb(170,170,170)",
        placeHolderTextWeight: "400",
    },
};

export const InputFieldStyle = createStyleStore(InputFieldStyleConfig);

//////////     D A N G E R     I N P U T     F I E L D     //////////

const DangerInputFieldStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#23272f",
        borderColor: "#323a45",
        disabledBackgroundColor: "#23272f",
        disabledBorderColor: "#323a45",
        selectedBackgroundColor: "#252b33",
        selectedBorderColor: "#e74c3c",
        badFormatBackgroundColor: "#252b33",
        badFormatBorderColor: "#e74c3c",
        paddingLeft: "10px",
        fontSize: "1rem",
        fontColor: "#f5f5f5",
        fontWeight: "400",
        textAlign: "center",
        infoTextColor: "rgb(170, 170, 170)",
        infoTextSize: "0.95rem",
        infoTextWeight: "400",
        unitTextColor: "rgb(170,170,170)",
        placeHolderTextColor: "rgb(170,170,170)",
        placeHolderTextWeight: "400",
    },
};

export const DangerInputFieldStyle = createStyleStore(DangerInputFieldStyleConfig);

//////////     I N P U T     D A T E     /     T I M E     F I E L D     //////////

const InputDateTimeFieldStyleConfig: ComponentStyles = {
    dark: {
        width: "fit-content",
        height: "40px",
        borderRadius: "0px",
        backgroundColor: "none",
        borderColor: "none",
        disabledBackgroundColor: "none",
        disabledBorderColor: "none",
        selectedBackgroundColor: "none",
        selectedBorderColor: "none",
        badFormatBackgroundColor: "none",
        badFormatBorderColor: "none",
        paddingLeft: "5px",
        fontSize: "1rem",
        fontColor: "#f5f5f5",
        fontWeight: "400",
        textAlign: "center",
        infoTextColor: "#f5f5f5",
        infoTextSize: "0.9rem",
        infoTextWeight: "400",
        unitTextColor: "rgb(170,170,170)",
        placeHolderTextColor: "rgb(170,170,170)",
        placeHolderTextWeight: "400",
    },
};

export const InputDateTimeFieldStyle = createStyleStore(InputDateTimeFieldStyleConfig);

//////////     T I M E     /     D A T E     F I E L D     //////////

const TimeDateFieldStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        height: "fit-content",
        borderRadius: "5px",
        backgroundColor: "#252b33",
        selectedBackgroundColor: "#252b33",
        badFormatBackgroundColor: "#252b33",
        border: "1px solid #323a45",
        selectedBorder: "1px solid #2F80ED",
        badFormatBorder: "1px solid #e74c3c",
        textSize: "1rem",
        textColor: "#f5f5f5",
        textWeight: "500",
    },
};

export const TimeDateFieldStyle = createStyleStore(TimeDateFieldStyleConfig);

//////////     L A N G U A G E     S E L E C T O R     //////////

const LangSelectorStyleConfig: ComponentStyles = {
    dark: {
        backgroundColor: "#1e242b",
        borderColor: "#323a45",
        selectedColor: "#00796b",
        optionsBackgroundColor: "#1e242b",
        optionsBorderColor: "#323a45",
        selectedOptionTextColor: "#eeeeee",
        optionsTextColor: "#b0bec5",
        optionsSelectedTextColor: "#eeeeee",
    },
};

export const LangSelectorStyle = createStyleStore(LangSelectorStyleConfig);

//////////     M E N U     B U T T O N     //////////

const MenuButtonStyleConfig: ComponentStyles = {
    dark: {
        backgroundColor: "transparent",
        hoverColor: "#323a45",
        hamburgerLinesColor: "white",
    },
};

export const MenuButtonStyle = createStyleStore(MenuButtonStyleConfig);

//////////     M O D A L     W I N D O W     //////////

const ModalWindowStyleConfig: ComponentStyles = {
    dark: {
        width: "80%",
        height: "fit-content",
        borderRadius: "10px",
        contentPadding: "20px",
        backgroundColor: "#14161c",
        borderColor: "#2a2e3a",
        titleSize: "1rem",
        titleColor: "#f5f5f5",
        titleWeight: "400",
    },
};

export const ModalWindowStyle = createStyleStore(ModalWindowStyleConfig);

//////////     N O T I F I C A T I O N     //////////

const NotificationStyleConfig: ComponentStyles = {
    dark: {
        width: "40px",
        height: "40px",
        borderRadius: "20px",
        backgroundColor: "#14161c",
        hoverColor: "#2A2E3A",
        borderColor: "#2a2e3a",
        imageWidth: "32px",
        imageHeight: "32px",
        numberBackgroundColor: "#e53935",
        numberTextColor: "#eee",
        showToolTipDelay: 300,
    },
};

export const NotificationStyle = createStyleStore(NotificationStyleConfig);

//////////     S E L E C T O R     //////////

const SelectorStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#252b33",
        borderColor: "#323a45",
        disabledBackgroundColor: "#252b33",
        disabledBorderColor: "#252b33",
        selectedColor: "#14566b",
        badFormatBackgroundColor: "#252b33",
        badFormatBorderColor: "#e74c3c",
        optionsBackgroundColor: "#1e242b",
        optionsBorderColor: "#323a45",
        optionsInnerBorderColor: "transparent",
        optionHeight: "40px",
        fontSize: "1rem",
        letterSpacing: "0.5px",
        wordSpacing: "1px",
        arrowWidth: "24px",
        arrowHeight: "24px",
        arrowRightPos: "10px",
    },
};

export const SelectorStyle = createStyleStore(SelectorStyleConfig);

//////////     P I C K E R     S E L E C T O R     //////////

const PickerSelectorStyleConfig: ComponentStyles = {
    dark: {
        width: "150px",
        height: "35px",
        borderRadius: "5px",
        backgroundColor: "#12171e",
        borderColor: "#30363d",
        disabledBackgroundColor: "#12171e",
        disabledBorderColor: "#30363d",
        selectedColor: "#0066ff",
        badFormatBackgroundColor: "#12171e",
        badFormatBorderColor: "#e74c3c",
        optionsBackgroundColor: "#0f1419",
        optionsBorderColor: "#30363d",
        optionsInnerBorderColor: "#30363d",
        optionHeight: "35px",
        fontSize: "14px",
        letterSpacing: "0.5px",
        wordSpacing: "1px",
        arrowWidth: "24px",
        arrowHeight: "24px",
        arrowRightPos: "10px",
    },
};

export const PickerSelectorStyle = createStyleStore(PickerSelectorStyleConfig);

//////////     S E L E C T O R     B U T T O N     //////////

const SelectorButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "75px",
        height: "20px",
        knobWidth: "32px",
        knobHeight: "32px",
        borderRadius: "10px",
        backgroundColor: "#3a3a3a",
        selectedBackgroundColor: "#4a4a4a",
        knobBackgroundColor: "#e0e0e0",
        knobSelectedBackgroundColor: "#2f80ed",
    },
};

export const SelectorButtonStyle = createStyleStore(SelectorButtonStyleConfig);

//////////     U P L O A D     I M A G E     //////////

const UploadImageStyleConfig: ComponentStyles = {
    dark: {
        width: "200px",
        height: "200px",
        borderRadius: "50%",
        imageWidth: "auto",
        imageHeight: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        hoverColor: "rgba(255, 255, 255, 0.13)",
    },
};

export const UploadImageStyle = createStyleStore(UploadImageStyleConfig);

//////////     C I R C U L A R     L O A D E R     //////////

const CircularLoaderStyleConfig: ComponentStyles = {
    dark: {
        width: "64px",
        height: "64px",
        loaderTopPos: "0px",
        wrapperTopPos: "0px",
        wrapperBackgroundColor: "rgba(20, 22, 28, 0.8)",
        wrapperOpacity: "1",
        wrapperTopLeftRadius: "0px",
        wrapperTopRightRadius: "0px",
        wrapperBottomLeftRadius: "20px",
        wrapperBottomRightRadius: "20px",
        border: "4px solid rgba(255, 255, 255, 0.2)",
        loaderColor: "#fff",
    },
};

export const CircularLoaderStyle = createStyleStore(CircularLoaderStyleConfig);

//////////     C I R C U L A R     L O A D E R     F U L L     S C R E E N     //////////

const CircularLoaderFullScreenStyleConfig: ComponentStyles = {
    dark: {
        width: "128px",
        height: "128px",
        border: "4px solid rgba(255, 255, 255, 0.2)",
        loaderColor: "#fff",
    },
};

export const CircularLoaderFullScreenStyle = createStyleStore(CircularLoaderFullScreenStyleConfig);

//////////     C O N T E N T     C A R D     //////////

const ContentCardStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        height: "100%",
        minHeight: "auto",
        maxHeight: "auto",
        backgroundColor: "#14161c",
        borderColor: "rgba(255,255,255,0.07)",
        shadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
        borderRadius: "20px",
        leftContentPaddingRight: "10px",
        leftContentRightBorder: "none",
        titleSize: "17px",
        titleColor: "#f5f5f5",
        titleWeight: "500",
        titlePaddingLeft: "10px",
        titlePaddingRight: "10px",
        headerWidth: "calc(100% - 40px)",
        headerHeight: "40px",
        headerBorder: "1px solid rgba(255,255,255,0.1)",
        headerPaddingTop: "10px",
        headerPaddingBottom: "10px",
        contentPaddingTop: "10px",
        contentPaddingBottom: "30px",
        contentPaddingHorizontal: "20px",
        scrollbarTrackColor: "#1a1c22",
        scrollbarThumbColor: "#4a5059",
    },
};

export const ContentCardStyle = createStyleStore(ContentCardStyleConfig);

//////////     R I G H T     P A N E L     S H E E T     //////////

const RightPanelSheetStyleConfig: ComponentStyles = {
    dark: {
        maskBlurFilter: "8px",
        maskBackground: "rgba(24, 29, 35, 0.25)",
        width: "100%",
        minWidth: "350px",
        maxWidth: "420px",
        paddingTop: "5px",
        paddingBottom: "10px",
        paddingHorizontal: "10px",
        backgroundColor: "#1c2026",
        borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
        shadow: "-4px 0 12px rgba(0, 0, 0, 0.6)",
        titlePaddingLeft: "0px",
        titlePaddingRight: "20px",
        titlePaddingBottom: "5px",
        borderBottomTitle: "1px solid rgba(255, 255, 255, 0.1)",
        headerPaddingHorizontal: "10px",
        headerPaddingTop: "15px",
        headerPaddingBottom: "15px",
        borderBottomHeader: "1px solid rgba(255, 255, 255, 0.08)",
        closeButtonWidth: "40px",
        closeButtonHeight: "40px",
        closeButtonImageWidth: 32,
        closeButtonImageHeight: 32,
        closeButtonColor: "rgba(255, 255, 255, 0.7)",
        closeButtonHoverColor: "rgba(255, 255, 255, 0.9)",
        contentMarginTop: "20px",
        contentMarginBottom: "0px",
        contentPaddingHorizontal: "0px",
        scrollbarTrackColor: "#323a45",
        scrollbarThumbColor: "#1e242b",
    },
};

export const RightPanelSheetStyle = createStyleStore(RightPanelSheetStyleConfig);

//////////     E X P A N D A B L E     S E C T I O N     //////////

const ExpandableSectionStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        paddingTop: "5px",
        paddingBottom: "5px",
        headerHeight: "fit-content",
        headerBorderBottom: "1px solid rgba(255, 255, 255, 0.07)",
        headerPaddingBottom: "5px",
        contentPaddingTop: "10px",
        titleSize: "13px",
        titleColor: "#9CA3AF",
        titleWeight: "400",
        titleSpacing: "0.5px",
        titleTextTransform: "uppercase",
        titleMarginLeft: "10px",
        expandButtonWidth: "40px",
        expandButtonHeight: "40px",
        expandButtonHoverColor: "#1c1f26",
        expandButtonMarginRight: "0px",
        expandButtonArrowWidth: "24px",
        expandButtonArrowHeight: "24px",
    },
};

export const ExpandableSectionStyle = createStyleStore(ExpandableSectionStyleConfig);

//////////     B A R     //////////

const BarStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        height: "100%",
        backgroundColor: "#1f2937",
        border: "1px solid #374151",
        borderRadius: "0px",
        fillWidth: "100%",
        fillHeight: "100%",
        fillColor: "#10b981",
        fillMinAlarmColor: "#ef4444",
        fillMaxAlarmColor: "#ef4444",
        fillMinWarningColor: "#f59e0b",
        fillMaxWarningColor: "#f59e0b",
        arrowWidth: "5px",
        arrowHeight: "6px",
        arrowColor: "#9ca3af",
        arrowMinAlarmColor: "#ef4444",
        arrowMaxAlarmColor: "#ef4444",
        arrowMinWarningColor: "#f59e0b",
        arrowMaxWarningColor: "#f59e0b",
    },
};

export const BarStyle = createStyleStore(BarStyleConfig);

//////////     I N L I N E     L O A D E R     //////////

const InlineLoaderStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
        border: "none",
        shadow: "none",
        waveBackground: "linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)",
        waveAnimationTime: "1.6s",
    },
};

export const InlineLoaderStyle = createStyleStore(InlineLoaderStyleConfig);

//////////     I N F O     L A B E L     //////////

const InfoLabelStyleConfig: ComponentStyles = {
    dark: {
        width: "250px",
        borderBottomPos: "-2px",
        fontColor: "#f5f5f5",
        fontWeight: "400",
        fontSize: "1rem",
        fontLineHeight: "1.5",
        fontRightMargin: "20px",
        helpIconSize: "24px",
        borderBottom: "1px solid transparent",
        hoverFontColor: "#ffffffd0",
        hoverFontWeight: "400",
        hoverBorderBottom: "1px solid #ffffff33",
        transitionTime: "0.2s",
        showToolTipDelay: 300,
    },
};

export const InfoLabelStyle = createStyleStore(InfoLabelStyleConfig);

//////////     T O O L     T I P     //////////

const ToolTipStyleConfig: ComponentStyles = {
    dark: {
        width: "fit-content",
        minWidth: "auto",
        maxWidth: "300px",
        height: "fit-content",
        minHeight: "auto",
        maxHeight: "300px",
        offsetPx: "10px",
        border: "1px solid #3a4149",
        borderRadius: "10px",
        backgroundColor: "#0a0c0f",
        paddingHorizontal: "10px",
        paddingVertical: "10px",
        animationTime: 200,
    },
};

export const ToolTipStyle = createStyleStore(ToolTipStyleConfig);

//////////     T O O L     T I P     D A T E     P I C K E R     //////////

const ToolTipDatePickerStyleConfig: ComponentStyles = {
    dark: {
        width: "50vw",
        minWidth: "300px",
        maxWidth: "375px",
        height: "fit-content",
        minHeight: "auto",
        maxHeight: "auto",
        offsetPx: "10px",
        border: "1px solid #3a4149",
        borderRadius: "10px",
        backgroundColor: "#0a0c0f",
        paddingHorizontal: "0px",
        paddingVertical: "0px",
        animationTime: 200,
    },
};

export const ToolTipDatePickerStyle = createStyleStore(ToolTipDatePickerStyleConfig);

//////////     T O O L     T I P     D A T E     C H E C K E R     //////////

const ToolTipDateCheckerStyleConfig: ComponentStyles = {
    dark: {
        width: "300px",
        minWidth: "auto",
        maxWidth: "auto",
        height: "fit-content",
        minHeight: "auto",
        maxHeight: "auto",
        offsetPx: "10px",
        border: "1px solid #3a4149",
        borderRadius: "10px",
        backgroundColor: "#0a0c0f",
        paddingHorizontal: "0px",
        paddingVertical: "0px",
        animationTime: 200,
    },
};

export const ToolTipDateCheckerStyle = createStyleStore(ToolTipDateCheckerStyleConfig);

//////////     D A T E     R A N G E     P I C K E R     //////////

const DateRangePickerStyleConfig: ComponentStyles = {
    dark: {
        paddingHorizontal: "20px",
        paddingTop: "20px",
        paddingBottom: "20px",
        labelSize: "15px",
        labelColor: "#eeee",
        labelWeight: "400",
        labelPaddingLeft: "5px",
        contentGap: "20px",
        fieldGap: "10px",
        rowGap: "10px",
        buttonsPaddingTop: "10px",
        buttonsGap: "20px",
    },
};

export const DateRangePickerStyle = createStyleStore(DateRangePickerStyleConfig);

//////////     D A T E     R A N G E     C H E C K E R     //////////

const DateRangeCheckerStyleConfig: ComponentStyles = {
    dark: {
        paddingHorizontal: "20px",
        paddingTop: "20px",
        paddingBottom: "20px",
        fsTextSize: "1rem",
        textSize: "14px",
        labelWidth: "50px",
        fsLabelWidth: "75px",
        labelColor: "#9CA3AF",
        labelWeight: "400",
        valueColor: "#eeee",
        valueWeight: "500",
        rowGap: "20px",
        fsRowPaddingHorizontal: "30px",
        fsBorderRight: "1px solid rgba(255, 255, 255, 0.12)",
    },
};

export const DateRangeCheckerStyle = createStyleStore(DateRangeCheckerStyleConfig);

//////////     P I C K E R     T O O L     T I P     //////////

const PickerToolTipStyleConfig: ComponentStyles = {
    dark: {
        width: "fit-content",
        minWidth: "auto",
        maxWidth: "auto",
        height: "fit-content",
        minHeight: "auto",
        maxHeight: "300px",
        offsetPx: "10px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "10px",
        backgroundColor: "#1a1e24",
        paddingHorizontal: "10px",
        paddingVertical: "10px",
        animationTime: 200,
    },
};

export const PickerToolTipStyle = createStyleStore(PickerToolTipStyleConfig);

//////////     P I C K E R     T O O L     T I P     B U T T O N     //////////

const PickerToolTipButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "40px",
        minWidth: "auto",
        maxWidth: "auto",
        height: "40px",
        borderRadius: "20px",
        backgroundColor: "#0d1117",
        disabledBackgroundColor: "#0d1117",
        selectedBackgroundColor: "rgba(255, 255, 255, 0.08)",
        borderColor: "#30363d",
        disabledBorderColor: "#30363d",
        selectedBorderColor: "rgba(255, 255, 255, 0.2)",
        hoverColor: "#010203",
        disabledHoverColor: "#010203",
        selectedHoverColor: "rgba(255, 255, 255, 0.12)",
        fontColor: "#eee",
        disabledFontColor: "#eee",
        selectedFontColor: "#eee",
        fontSize: "14px",
        subFontSize: "0.875rem",
        fontWeight: "400",
        subFontWeight: "400",
        imageWidth: "32px",
        imageHeight: "32px",
        imageRightPos: "auto",
        imageLeftPos: "auto",
        showToolTipDelay: 300,
    },
};

export const PickerToolTipButtonStyle = createStyleStore(PickerToolTipButtonStyleConfig);

//////////     P I C K E R     B U T T O N     //////////

const PickerButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "40px",
        minWidth: "40px",
        maxWidth: "40px",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#0d1117",
        disabledBackgroundColor: "#161b22",
        selectedBackgroundColor: "#0066ff",
        borderColor: "#30363d",
        disabledBorderColor: "#21262d",
        selectedBorderColor: "#30363d",
        hoverColor: "#010203",
        disabledHoverColor: "#070a0f",
        selectedHoverColor: "#0052cc",
        fontColor: "#f0f6fc",
        disabledFontColor: "#484f58",
        selectedFontColor: "#f0f6fc",
        fontSize: "1rem",
        subFontSize: "0.875rem",
        fontWeight: "400",
        subFontWeight: "400",
        imageWidth: "32px",
        imageHeight: "32px",
        showToolTipDelay: 300,
    },
};

export const PickerButtonStyle = createStyleStore(PickerButtonStyleConfig);

//////////     C U S T O M     D A T E     B U T T O N     //////////

const CustomDateButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "40px",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#0d1117",
        disabledBackgroundColor: "#161b22",
        selectedBackgroundColor: "#30363d",
        borderColor: "#30363d",
        disabledBorderColor: "#21262d",
        selectedBorderColor: "#484f58",
        hoverColor: "#010203",
        disabledHoverColor: "#070a0f",
        selectedHoverColor: "#21262d",
        fontColor: "#f0f6fc",
        disabledFontColor: "#484f58",
        selectedFontColor: "#f0f6fc",
        fontSize: "1rem",
        subFontSize: "0.875rem",
        fontWeight: "400",
        subFontWeight: "400",
        imageWidth: "32px",
        imageHeight: "32px",
        showToolTipDelay: 300,
    },
};

export const CustomDateButtonStyle = createStyleStore(CustomDateButtonStyleConfig);

//////////     S E L E C T E D     C U S T O M     D A T E     B U T T O N     //////////

const SelectedCustomDateButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "40px",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#0066ff",
        disabledBackgroundColor: "#161b22",
        selectedBackgroundColor: "#0061e6",
        borderColor: "#30363d",
        disabledBorderColor: "#21262d",
        selectedBorderColor: "#30363d",
        hoverColor: "#0052cc",
        disabledHoverColor: "#070a0f",
        selectedHoverColor: "#004db3",
        fontColor: "#f0f6fc",
        disabledFontColor: "#484f58",
        selectedFontColor: "#f0f6fc",
        fontSize: "1rem",
        subFontSize: "0.875rem",
        fontWeight: "400",
        subFontWeight: "400",
        imageWidth: "32px",
        imageHeight: "32px",
        showToolTipDelay: 300,
    },
};

export const SelectedCustomDateButtonStyle = createStyleStore(SelectedCustomDateButtonStyleConfig);

//////////     E N E R G Y     P I C K E R S     //////////

const EnergyPickersStyleConfig: ComponentStyles = {
    dark: {
        labelSize: "14px",
        labelWeight: "500",
        labelColor: "#b0bec5",
        labelHeight: "35px",
    },
};

export const EnergyPickersStyle = createStyleStore(EnergyPickersStyleConfig);

//////////     T O O L     T I P     T E X T     //////////

const ToolTipTexStyleConfig: ComponentStyles = {
    dark: {
        textColor: "#eeee",
        textWeight: "300",
        textSize: "14px",
        textLineHeight: "1.0",
    },
};

export const ToolTipTextStyle = createStyleStore(ToolTipTexStyleConfig);

//////////     T O O L     T I P     W R A P     T E X T     //////////

const ToolTipWrapTexStyleConfig: ComponentStyles = {
    dark: {
        textColor: "#eeee",
        textWeight: "300",
        textSize: "14px",
        textLineHeight: "1.5",
    },
};

export const ToolTipWrapTexStyle = createStyleStore(ToolTipWrapTexStyleConfig);
