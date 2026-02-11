import type { ComponentStyles } from "./components";
import { createStyleStore } from "./components";

//////////     A D D     N O D E     //////////

const AddNodeStyleConfig: ComponentStyles = {
    dark: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
};

export const AddNodeStyle = createStyleStore(AddNodeStyleConfig);

//////////     A D D     N O D E     B U T T O N     //////////

const AddNodeButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        borderRadius: "0px",
        backgroundColor: "#1a2027",
        disabledBackgroundColor: "#1a2027",
        borderColor: "#1a2027",
        disabledBorderColor: "#1a2027",
        hoverColor: "#1f242b",
        disabledHoverColor: "#1f242b",
        fontColor: "#f5f5f5",
        disabledFontColor: "#f5f5f5",
        fontSize: "0.9rem",
        subFontSize: "0.875rem",
        fontWeight: "400",
        subFontWeight: "400",
    },
};

export const AddNodeButtonStyle = createStyleStore(AddNodeButtonStyleConfig);

//////////     N O D E     R O W     //////////

const NodeRowStyleConfig: ComponentStyles = {
    dark: {
        leftStateNotValidBorder: "1px solid #e74c3c",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        notValidBackgroundColor: "rgba(120, 40, 40, 0.14)",
        hoverColor: "rgba(255, 255, 255, 0.09)",
        notValidHoverColor: "rgba(160, 50, 50, 0.20)",
        disabledBackgroundColor: "rgba(255, 255, 255, 0.22)",
        disabledHoverColor: "rgba(255, 255, 255, 0.28)",
        svgButtonsColor: "rgb(192, 192, 192)",
    },
};

export const NodeRowStyle = createStyleStore(NodeRowStyleConfig);

//////////     N O D E     I N P U T     F I E L D     //////////

const NodeInputFieldStyleConfig: ComponentStyles = {
    dark: {
        width: "90%",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#1a2027",
        borderColor: "#1a2027",
        disabledBackgroundColor: "#42505f",
        disabledBorderColor: "#42505f",
        selectedBackgroundColor: "#1a2027",
        selectedBorderColor: "#2F80ED",
        badFormatBackgroundColor: "#1a2027",
        badFormatBorderColor: "#e74c3c",
        paddingLeft: "10px",
        fontSize: "0.9rem",
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

export const NodeInputFieldStyle = createStyleStore(NodeInputFieldStyleConfig);

//////////     N O D E     S E L E C T O R     //////////

const NodeSelectorStyleConfig: ComponentStyles = {
    dark: {
        width: "90%",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#1a2027",
        borderColor: "#1a2027",
        disabledBackgroundColor: "#42505f",
        disabledBorderColor: "#42505f",
        selectedColor: "#14566b",
        badFormatBackgroundColor: "#1a2027",
        badFormatBorderColor: "#e74c3c",
        optionsBackgroundColor: "#14181d",
        optionsBorderColor: "#3f4a55",
        optionsInnerBorderColor: "#2a323a",
        optionHeight: "40px",
        fontSize: "0.9rem",
        letterSpacing: "normal",
        wordSpacing: "normal",
        arrowWidth: "20x",
        arrowHeight: "20px",
        arrowRightPos: "4px",
    },
};

export const NodeSelectorStyle = createStyleStore(NodeSelectorStyleConfig);

//////////     N O D E     C O N F I G     S H E E T     I N P U T     F I E L D     //////////

const NodeConfigSheetInputFieldStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#14181d",
        borderColor: "#14181d",
        disabledBackgroundColor: "#303944",
        disabledBorderColor: "#303944",
        selectedBackgroundColor: "#14181d",
        selectedBorderColor: "#2F80ED",
        badFormatBackgroundColor: "#14181d",
        badFormatBorderColor: "#e74c3c",
        paddingLeft: "10px",
        fontSize: "1rem",
        fontColor: "#f5f5f5",
        fontWeight: "400",
        textAlign: "center",
        infoTextColor: "#f5f5f5",
        infoTextSize: "1rem",
        infoTextWeight: "400",
        unitTextColor: "rgb(170,170,170)",
        placeHolderTextColor: "rgb(170,170,170)",
        placeHolderTextWeight: "400",
    },
};

export const NodeConfigSheetInputFieldStyle = createStyleStore(NodeConfigSheetInputFieldStyleConfig);

//////////     N O D E     C O N F I G     S H E E T     S E L E C T O R     //////////

const NodeConfigSheetSelectorStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        height: "40px",
        borderRadius: "5px",
        backgroundColor: "#14181d",
        borderColor: "#14181d",
        disabledBackgroundColor: "#303944",
        disabledBorderColor: "#303944",
        selectedColor: "#0f4757",
        badFormatBackgroundColor: "#14181d",
        badFormatBorderColor: "#e74c3c",
        optionsBackgroundColor: "#181d22",
        optionsBorderColor: "#262d35",
        optionsInnerBorderColor: "#262d35",
        optionHeight: "40px",
        fontSize: "1rem",
        letterSpacing: "normal",
        wordSpacing: "normal",
        arrowWidth: "24x",
        arrowHeight: "24px",
        arrowRightPos: "10px",
    },
};

export const NodeConfigSheetSelectorStyle = createStyleStore(NodeConfigSheetSelectorStyleConfig);

//////////     N O D E     C O N F I G     S H E E T     I N F O     L A B E L     //////////

const NodeConfigSheetInfoLabelStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        borderBottomPos: "-2px",
        fontColor: "rgba(255,255,255, 0.6)",
        fontWeight: "400",
        fontSize: "1rem",
        fontLineHeight: "1.5",
        fontRightMargin: "20px",
        helpIconSize: "24px",
        borderBottom: "1px solid transparent",
        hoverFontColor: "rgba(255,255,255, 0.7)",
        hoverFontWeight: "400",
        hoverBorderBottom: "1px solid #ffffff33",
        transitionTime: "0.2s",
        showToolTipDelay: 300,
    },
};

export const NodeConfigSheetInfoLabelStyle = createStyleStore(NodeConfigSheetInfoLabelStyleConfig);

//////////     N O D E S     G R I D     //////////

const NodesGridStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        maxWidth: "1500px",
        height: "fit-content",
        borderRadius: "10px",
        backgroundColor: "#252b33",
        containerBorder: "1px solid #323a45",
        headerBorder: "1px solid #323a45",
        headerHeight: "35px",
        headerBackgroundColor: "#1A2128",
        headerTextColor: "#f5f5f5",
        subSectionBackgroundColor: "#1f2a31",
        subSectionTextColor: "#cbd5e1",
        subSectionBorder: "1px solid transparent",
    },
};

export const NodesGridStyle = createStyleStore(NodesGridStyleConfig);

//////////     N O D E S     B A S E     D I S P L A Y     //////////

const NodesBaseDisplayStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        maxWidth: "300px",
        paddingHorizontal: "0px",
        paddingVertical: "10px",
        labelPaddingTop: "0px",
        labelPaddingBottom: "8px",
        labelPaddingRight: "20px",
        labelSize: "1rem",
        labelColor: "#D4D4D8",
        labelWeight: "500",
        displayHeight: "40px",
        displayBorder: "1px solid #52525B",
        displayHoverBorder: "1px solid #6B7280",
        displayDisconnectedBorder: "1px solid #52525B",
        displayDisconnectedHoverBorder: "1px solid #6B7280",
        displayBackgroundColor: "rgba(107, 114, 128, 0.15)",
        displayHoverBackgroundColor: "rgba(107, 114, 128, 0.22)",
        displayDisconnectedBackgroundColor: "rgba(107, 114, 128, 0.15)",
        displayDisconnectedHoverBackgroundColor: "rgba(107, 114, 128, 0.22)",
        displayHoverShadow: "0 1px 4px rgba(0, 0, 0, 0.25)",
        displayDisconnectedHoverShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
        displayRadius: "20px",
        displayPaddingHorizontal: "20px",
        alertsDivItemGap: "10px",
        stateCircleDiameter: "10px",
        stateCircleAlarmColor: "#ef4444",
        stateCircleAlarmHoverColor: "#ef4444",
        stateCircleAlarmHoverShadow: "0 0 3px rgba(239, 68, 68, 0.4)",
        stateCircleWarningColor: "#f59e0b",
        stateCircleWarningHoverColor: "#f59e0b",
        stateCircleWarningHoverShadow: "0 0 3px rgba(245, 158, 11, 0.4)",
        disconnectedImageWidth: "25px",
        disconnectedImageHeight: "25px",
        animationDuration: "0.2s",
    },
};

export const NodesBaseDisplayStyle = createStyleStore(NodesBaseDisplayStyleConfig);

//////////     N O D E S     B A S E     D I S P L A Y     D E T A I L     //////////

const NodesBaseDisplayDetailStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        maxWidth: "300px",
        paddingHorizontal: "0px",
        paddingVertical: "0px",
        labelPaddingTop: "0px",
        labelPaddingBottom: "0px",
        labelPaddingRight: "20px",
        labelSize: "1rem",
        labelColor: "#D4D4D8",
        labelWeight: "500",
        displayHeight: "40px",
        displayBorder: "1px solid #52525B",
        displayHoverBorder: "1px solid #6B7280",
        displayDisconnectedBorder: "1px solid #52525B",
        displayDisconnectedHoverBorder: "1px solid #6B7280",
        displayBackgroundColor: "rgba(107, 114, 128, 0.15)",
        displayHoverBackgroundColor: "rgba(107, 114, 128, 0.22)",
        displayDisconnectedBackgroundColor: "rgba(107, 114, 128, 0.15)",
        displayDisconnectedHoverBackgroundColor: "rgba(107, 114, 128, 0.22)",
        displayHoverShadow: "0 1px 4px rgba(0, 0, 0, 0.25)",
        displayDisconnectedHoverShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
        displayRadius: "20px",
        displayPaddingHorizontal: "20px",
        alertsDivItemGap: "10px",
        stateCircleDiameter: "10px",
        stateCircleAlarmColor: "#ef4444",
        stateCircleAlarmHoverColor: "#ef4444",
        stateCircleAlarmHoverShadow: "0 0 3px rgba(239, 68, 68, 0.4)",
        stateCircleWarningColor: "#f59e0b",
        stateCircleWarningHoverColor: "#f59e0b",
        stateCircleWarningHoverShadow: "0 0 3px rgba(245, 158, 11, 0.4)",
        disconnectedImageWidth: "25px",
        disconnectedImageHeight: "25px",
        animationDuration: "0.2s",
    },
};

export const NodesBaseDisplayDetailStyle = createStyleStore(NodesBaseDisplayDetailStyleConfig);

//////////     M E A S U R E M E N T     D I S P L A Y     //////////

const MeasurementDisplayStyleConfig: ComponentStyles = {
    dark: {
        valueTextSize: "1.0625rem",
        valueTextColor: "#E4E4E7",
        valueTextSpacing: "0.25px",
        valueTextWeight: "600",
        valueTextPaddingRight: "20px",
        unitWidth: "75px",
        unitTextSize: "1.0625rem",
        unitTextColor: "#A1A1AA",
        unitTextWeight: "400",
        unitTextPaddingLeft: "20px",
        barWidth: "100%",
        barHeight: "3px",
    },
};

export const MeasurementDisplayStyle = createStyleStore(MeasurementDisplayStyleConfig);

//////////     T E X T     D I S P L A Y     //////////

const TextDisplayStyleConfig: ComponentStyles = {
    dark: {
        valueTextSize: "1.0625rem",
        valueTextColor: "#E4E4E7",
        valueTextSpacing: "0.25px",
        valueTextWeight: "600",
        valueTextPaddingRight: "20px",
    },
};

export const TextDisplayStyle = createStyleStore(TextDisplayStyleConfig);

//////////     S T A T E     D I S P L A Y     //////////

const StateDisplayStyleConfig: ComponentStyles = {
    dark: {
        valueTextSize: "1.0625rem",
        falseValueTextColor: "#9CA3AF",
        trueValueTextColor: "#E4E4E7",
        valueTextSpacing: "0.25px",
        valueTextWeight: "600",
    },
};

export const StateDisplayStyle = createStyleStore(StateDisplayStyleConfig);

//////////     C O U N T E R     D I S P L A Y     //////////

const CounterDisplayStyleConfig: ComponentStyles = {
    dark: {
        valueTextSize: "1.0625rem",
        valueTextColor: "#E4E4E7",
        valueTextSpacing: "0.25px",
        valueTextWeight: "600",
        valueTextPaddingRight: "20px",
        unitWidth: "75px",
        unitTextSize: "1.0625rem",
        unitTextColor: "#A1A1AA",
        unitTextWeight: "400",
        unitTextPaddingLeft: "20px",
        barWidth: "100%",
        barHeight: "3px",
    },
};

export const CounterDisplayStyle = createStyleStore(CounterDisplayStyleConfig);

//////////     N O D E     D E T A I L     S H E E T     //////////

const NodeDetailSheetStyleConfig: ComponentStyles = {
    dark: {
        stateDimColor: "#374151",
        stateAlarmColor: "#ef4444",
        stateWarningColor: "#f59e0b",
        stateOKColor: "#22c55e",
        stateDisconnectedColor: "#6b7280",
        titleSize: "1.25rem",
        titleColor: "rgba(255, 255, 255, 0.8)",
        titleWeight: "500",
        titleItemGap: "10px",
        titleImageWidth: "32px",
        titleImageHeight: "32px",
        headerRowHeigth: "25px",
        headerStateDivWidth: "25px",
        headerRowGap: "10px",
        headerColGap: "10px",
        headerLabelWidth: "100px",
        headerLabelSize: "1rem",
        headerLabelColor: "rgba(255, 255, 255, 0.6)",
        headerLabelWeight: "400",
        headerValueSize: "1rem",
        headerValueColor: "rgba(255, 255, 255, 0.8)",
        headerValueWeight: "600",
        contentTitleSize: "13px",
        contentTitleColor: "rgba(255, 255, 255, 0.4)",
        contentTitleWeight: "500",
        contentTitlePaddingLeft: "5px",
        contentTitlePaddingBottom: "8px",
        contentTitleBorderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        contentTitleSpacing: "1px",
        contentTitleTransform: "uppercase",
        contentInnerPaddingTop: "20px",
        contentInnerPaddingBottom: "20px",
        contentInnerPaddingHorizontal: "10px",
        contentRowHeight: "25px",
        contentStateDivWidth: "25px",
        contentRowGap: "10px",
        contentColGap: "10px",
        contentLabelWidth: "100px",
        contentLabelSize: "1rem",
        contentLabelColor: "rgba(255,255,255, 0.6)",
        contentLabelWeight: "400",
        contentValueSize: "1rem",
        contentValueColor: "rgba(255,255,255, 0.8)",
        contentValueWeight: "600",
    },
};

export const NodeDetailSheetStyle = createStyleStore(NodeDetailSheetStyleConfig);

//////////     N O D E     C O N F I G     S H E E T     //////////

const NodeConfigSheetStyleConfig: ComponentStyles = {
    dark: {
        titleSize: "1.25rem",
        titleColor: "rgba(255, 255, 255, 0.8)",
        titleWeight: "500",
        titleItemGap: "10px",
        titleImageWidth: "32px",
        titleImageHeight: "32px",
        headerRowHeigth: "25px",
        headerRowGap: "15px",
        headerColGap: "5px",
        headerLabelWidth: "75px",
        headerLabelSize: "1rem",
        headerLabelColor: "rgba(255, 255, 255, 0.6)",
        headerLabelWeight: "400",
        headerValueSize: "1rem",
        headerValueColor: "rgba(255, 255, 255, 0.8)",
        headerValueWeight: "600",
        contentTitleSize: "13px",
        contentTitleColor: "rgba(255, 255, 255, 0.4)",
        contentTitleWeight: "500",
        contentTitlePaddingLeft: "5px",
        contentTitlePaddingBottom: "8px",
        contentTitleBorderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        contentTitleSpacing: "1px",
        contentTitleTransform: "uppercase",
        contentInnerPaddingTop: "20px",
        contentInnerPaddingBottom: "20px",
        contentInnerPaddingHorizontal: "10px",
        contentRowHeight: "auto",
        contentRowGap: "15px",
        contentColGap: "10px",
        contentLabelSize: "1rem",
        contentLabelColor: "rgba(255,255,255, 0.6)",
        contentLabelWeight: "400",
        contentValueSize: "1rem",
        contentValueColor: "rgba(255,255,255, 0.8)",
        contentValueWeight: "600",
    },
};

export const NodeConfigSheetStyle = createStyleStore(NodeConfigSheetStyleConfig);

//////////     P E A K     P O W E R     M E T R I C S     //////////

const PeakPowerMetricsStyleConfig: ComponentStyles = {
    dark: {
        paddingTop: "5px",
        paddingBottom: "15px",
        paddingHorizontal: "20px",
        rowPaddingTop: "15px",
        rowPaddingBottom: "5px",
        rowBorderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        rowBorderBottomHover: "1px solid rgba(255, 255, 255, 0.18)",
        labelColor: "#D4D4D8",
        labelWeight: "500",
        labelSize: "1rem",
        labelPaddingBottom: "5px",
        labelBorderBottom: "none",
        iconSize: "24px",
        valuePaddingTop: "10px",
        valuePaddingRight: "5px",
        valueColor: "#E4E4E7",
        valueWeight: "600",
        valueSize: "1.0625rem",
        valueTextSpacing: "0.25px",
        unitMaxWidth: "150px",
        unitColor: "#A1A1AA",
        unitWeight: "400",
        unitSize: "1.0625rem",
        noDataLabelColor: "rgba(255, 255, 255, 0.4)",
        noDataLabelWeight: "400",
        dateMarginTop: "8px",
        dateMarginBottom: "8px",
        datePaddingTop: "8px",
        datePaddingBottom: "8px",
        datePaddingHorizontal: "10px",
        dateLineHeight: "2.0",
        dateBorderRadius: "8px",
        dateBackgroundColor: "#0a0c0f",
        dateBorder: "1px solid #3a4149",
        dateSize: "0.875rem",
        dateMainColor: "#E4E4E7",
        dateSubColor: "#9CA3AF",
        dateMainWeight: "600",
        dateSubWeight: "400",
    },
};

export const PeakPowerMetricsStyle = createStyleStore(PeakPowerMetricsStyleConfig);
