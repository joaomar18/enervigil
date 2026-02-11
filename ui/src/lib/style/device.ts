import type { ComponentStyles } from "./components";
import { createStyleStore } from "./components";

//////////     A D D     D E V I C E     //////////

const AddDeviceStyleConfig: ComponentStyles = {
    dark: {
        width: "300px",
        height: "400px",
        borderRadius: "20px",
        backgroundColor: "#14161c",
        borderColor: "rgba(255,255,255,0.07)",
        imageBackgroundColor: "rgba(255, 255, 255, 0.1)",
        imageContainerWidth: "200px",
        imageContainerHeight: "200px",
        imageContainerBorderRadius: "50%",
        strokeColor: "#9E9E9E",
        strokeSelectedColor: "#e0e0e0",
        shadowColor: "rgba(0, 0, 0, 0.1)",
        titleColor: "#f5f5f5",
    },
};

export const AddDeviceStyle = createStyleStore(AddDeviceStyleConfig);

//////////     D E V I C E     C A R D     //////////

const DeviceCardStyleConfig: ComponentStyles = {
    dark: {
        stateDimColor: "#374151",
        stateAlarmColor: "#ef4444",
        stateWarningColor: "#f59e0b",
        stateConnectedColor: "#22c55e",
        stateDisconnectedColor: "#6b7280",
        width: "300px",
        height: "400px",
        borderRadius: "20px",
        backgroundColor: "#14161c",
        borderColor: "rgba(255,255,255,0.07)",
        imageBackgroundColor: "rgba(255, 255, 255, 0.1)",
        imageContainerWidth: "200px",
        imageContainerHeight: "200px",
        imageContainerBorderRadius: "50%",
        imageWidth: "auto",
        imageHeight: "100%",
        textColor: "#e0e0e0",
        imageHoverBackgroundColor: "rgba(50, 50, 50, 0.4)",
        shadowColor: "rgba(0, 0, 0, 0.1)",
        titleColor: "#f5f5f5",
    },
};

export const DeviceCardStyle = createStyleStore(DeviceCardStyleConfig);

//////////     D E V I C E     I N F O     H E A D E R     //////////

const DeviceInfoHeaderStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        maxWidth: "375px",
        mainTextWidth: "200px",
        mainTextColor: "#c9c9c9",
        mainTextWeight: "300",
        subTextColor: "#9a9a9a",
        subTextWeight: "300",
        imageWidth: "40px",
        imageHeight: "40px",
        imageBackgroundColor: "rgba(255, 255, 255, 0.1)",
        imageBorderRadius: "50%",
    },
};

export const DeviceInfoHeaderStyle = createStyleStore(DeviceInfoHeaderStyleConfig);

//////////     M O B I L E     D E V I C E     I N F O     H E A D E R     //////////

const MobileDeviceInfoHeaderStyleConfig: ComponentStyles = {
    dark: {
        mainTextColor: "#c9c9c9",
        mainTextWeight: "300",
        subTextColor: "#9a9a9a",
        subTextWeight: "300",
        imageWidth: "32px",
        imageHeight: "32px",
        arrowWidth: "24px",
        arrowHeight: "24px",
    },
};

export const MobileDeviceInfoHeaderStyle = createStyleStore(MobileDeviceInfoHeaderStyleConfig);

//////////     D E V I C E     A C T I O N     //////////

const DeviceActionStyleConfig: ComponentStyles = {
    dark: {
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderColor: "transparent",
        hoverColor: "rgba(255, 255, 255, 0.2)",
        imageWidth: "32px",
        imageHeight: "32px",
        showToolTipDelay: 300,
    },
};

export const DeviceActionStyle = createStyleStore(DeviceActionStyleConfig);

//////////     D E V I C E     E X P A N D E D     A C T I O N     //////////

const DeviceExpandedActionStyleConfig: ComponentStyles = {
    dark: {
        width: "58px",
        height: "58px",
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderColor: "transparent",
        hoverColor: "rgba(255, 255, 255, 0.2)",
        imageWidth: "34px",
        imageHeight: "34px",
        showToolTipDelay: 300,
    },
};

export const DeviceExpandedActionStyle = createStyleStore(DeviceExpandedActionStyleConfig);

//////////     D E V I C E     N O T I F I C A T I O N     //////////

const DeviceNotificationStyleConfig: ComponentStyles = {
    dark: {
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        hoverColor: "rgba(255, 255, 255, 0.2)",
        borderColor: "transparent",
        imageWidth: "32px",
        imageHeight: "32px",
        numberBackgroundColor: "#e53935",
        numberTextColor: "#eee",
    },
};

export const DeviceNotificationStyle = createStyleStore(DeviceNotificationStyleConfig);

//////////     D E V I C E     R E A L     T I M E     C A R D     A C T I O N     //////////

const RealTimeCardActionStyleConfig: ComponentStyles = {
    dark: {
        width: "40px",
        height: "40px",
        borderRadius: "20px",
        backgroundColor: "#1b1e26",
        borderColor: "#3b4250",
        hoverColor: "#3b4250",
        imageWidth: "32px",
        imageHeight: "32px",
        showToolTipDelay: 300,
    },
};

export const RealTimeCardActionStyle = createStyleStore(RealTimeCardActionStyleConfig);

//////////     D E V I C E     R E A L     T I M E     C A R D     B U T T O N     //////////

const RealTimeCardPeriodButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "40px",
        minWidth: "auto",
        maxWidth: "auto",
        height: "40px",
        borderRadius: "20px",
        backgroundColor: "#1b1e26",
        disabledBackgroundColor: "#1b1e26",
        selectedBackgroundColor: "#3b4250",
        borderColor: "#3b4250",
        disabledBorderColor: "#3b4250",
        selectedBorderColor: "#6b7280",
        hoverColor: "#3b4250",
        disabledHoverColor: "#3b4250",
        selectedHoverColor: "#4b5563",
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

export const RealTimeCardButtonStyle = createStyleStore(RealTimeCardPeriodButtonStyleConfig);

//////////     D E V I C E     R E A L     T I M E     C A R D     A C T I O N     T O O L     T I P     //////////

const RealTimeCardActionToolTipStyleConfig: ComponentStyles = {
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

export const RealTimeCardActionToolTipStyle = createStyleStore(RealTimeCardActionToolTipStyleConfig);

//////////     D E V I C E     D E T A I L     S H E E T     //////////

const DeviceDetailSheetStyleConfig: ComponentStyles = {
    dark: {
        stateDimColor: "#374151",
        stateAlarmColor: "#ef4444",
        stateWarningColor: "#f59e0b",
        stateConnectedColor: "#22c55e",
        stateDisconnectedColor: "#6b7280",
        titleSize: "1.25rem",
        titleColor: "rgba(255, 255, 255, 0.8)",
        titleWeight: "500",
        titleItemGap: "10px",
        titleImageWidth: "36px",
        titleImageHeight: "36px",
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
        headerSubValueSize: "0.9rem",
        headerSubValueColor: "rgb(170, 170, 170)",
        headerSubValueWeight: "300",
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
        imageBackgroundColor: "rgba(255, 255, 255, 0.1)",
        imageContainerWidth: "200px",
        imageContainerHeight: "200px",
        imageContainerBorderRadius: "50%",
        imageWidth: "auto",
        imageHeight: "100%",
    },
};

export const DeviceDetailSheetStyle = createStyleStore(DeviceDetailSheetStyleConfig);
