import type { ComponentStyles } from "./components";
import { createStyleStore } from "./components";

//////////     G R A P H     A C T I O N     //////////

const GraphActionStyleConfig: ComponentStyles = {
    dark: {
        width: "40px",
        height: "40px",
        borderRadius: "20px",
        backgroundColor: "#0d1117",
        borderColor: "#30363d",
        hoverColor: "#010203",
        imageWidth: "32px",
        imageHeight: "32px",
        showToolTipDelay: 300,
    },
};

export const GraphActionStyle = createStyleStore(GraphActionStyleConfig);

//////////     G R A P H     B U T T O N     //////////

const GraphButtonStyleConfig: ComponentStyles = {
    dark: {
        width: "40px",
        minWidth: "auto",
        maxWidth: "auto",
        height: "40px",
        borderRadius: "20px",
        backgroundColor: "#0d1117",
        disabledBackgroundColor: "#0d1117",
        selectedBackgroundColor: "#0d1117",
        borderColor: "#30363d",
        disabledBorderColor: "#30363d",
        selectedBorderColor: "#30363d",
        hoverColor: "#010203",
        disabledHoverColor: "#010203",
        selectedHoverColor: "#010203",
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

export const GraphButtonStyle = createStyleStore(GraphButtonStyleConfig);

//////////     B A S E     G R A P H     //////////

const BaseGraphStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        height: "fit-content",
        minHeight: "auto",
        headerHeight: "fit-content",
        headerButtonsGap: "20px",
        xAxisHeight: "50px",
        yAxisWidth: "50px",
        unitDivWidth: "20px",
        unitMaxWidth: "100px",
        yAxisTickSpacingPx: 40,
        borderRadius: "10px",
        paddingHorizontal: "15px",
        paddingTop: "15px",
        paddingBottom: "0px",
        backgroundColor: "rgba(20, 22, 28, 0.6)",
        borderColor: "rgba(255, 255, 255, 0.08)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        graphHeight: "450px",
        graphPaddingTop: "10px",
        graphPaddingLeft: "20px",
        graphPaddingRight: "20px",
        graphPaddingBottom: "0px",
        graphPeriodWidthPx: 70,
        graphPeriodWidthMaxPx: 70,
        graphGridWidthPx: 1,
        graphGridLineColor: "rgba(255, 255, 255, 0.06)",
        graphTextColor: "rgba(255, 255, 255, 0.9)",
        graphTextWeight: "500",
        subTextColor: "rgba(255, 255, 255, 0.5)",
        subTextWeight: "400",
        scrollbarTrackColor: "#323a45",
        scrollbarThumbColor: "#1e242b",
        loaderBackgroundBlur: "blur(8px)",
    },
};

export const BaseGraphStyle = createStyleStore(BaseGraphStyleConfig);

//////////     F U L L     S C R E E N     B A S E     G R A P H     //////////

const FullScreenBaseGraphStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        height: "100%",
        minHeight: "600px",
        headerHeight: "fit-content",
        headerButtonsGap: "20px",
        xAxisHeight: "50px",
        yAxisWidth: "50px",
        unitDivWidth: "20px",
        unitMaxWidth: "100px",
        yAxisTickSpacingPx: 40,
        borderRadius: "10px",
        paddingHorizontal: "15px",
        paddingTop: "15px",
        paddingBottom: "15px",
        backgroundColor: "rgba(20, 22, 28, 0.95)",
        borderColor: "rgba(255, 255, 255, 0.15)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        graphHeight: "100%",
        graphPaddingTop: "10px",
        graphPaddingLeft: "20px",
        graphPaddingRight: "20px",
        graphPaddingBottom: "0px",
        graphPeriodWidthPx: 100,
        graphPeriodWidthMaxPx: 100,
        graphGridWidthPx: 1,
        graphGridLineColor: "rgba(255, 255, 255, 0.06)",
        graphTextColor: "rgba(255, 255, 255, 0.9)",
        graphTextWeight: "500",
        subTextColor: "rgba(255, 255, 255, 0.5)",
        subTextWeight: "400",
        scrollbarTrackColor: "#323a45",
        scrollbarThumbColor: "#1e242b",
        loaderBackgroundBlur: "blur(8px)",
    },
};

export const FullScreenBaseGraphStyle = createStyleStore(FullScreenBaseGraphStyleConfig);

//////////     E N E R G Y     C O N S U M P T I O N     B A S E     G R A P H     //////////

const EnergyConsBaseGraphStyleConfig: ComponentStyles = {
    dark: {
        width: "100%",
        height: "100%",
        minHeight: "auto",
        headerHeight: "fit-content",
        headerButtonsGap: "20px",
        xAxisHeight: "50px",
        yAxisWidth: "50px",
        unitDivWidth: "20px",
        unitMaxWidth: "100px",
        yAxisTickSpacingPx: 40,
        borderRadius: "0px",
        paddingHorizontal: "20px",
        paddingTop: "5px",
        paddingBottom: "0px",
        backgroundColor: "none",
        borderColor: "none",
        boxShadow: "none",
        graphHeight: "100%",
        graphPaddingTop: "10px",
        graphPaddingLeft: "20px",
        graphPaddingRight: "20px",
        graphPaddingBottom: "0px",
        graphPeriodWidthPx: 70,
        graphPeriodWidthMaxPx: 70,
        graphGridWidthPx: 1,
        graphGridLineColor: "rgba(255, 255, 255, 0.06)",
        graphTextColor: "rgba(255, 255, 255, 0.9)",
        graphTextWeight: "500",
        subTextColor: "rgba(255, 255, 255, 0.5)",
        subTextWeight: "400",
        scrollbarTrackColor: "#323a45",
        scrollbarThumbColor: "#1e242b",
        loaderBackgroundBlur: "blur(8px)",
    },
};

export const EnergyConsBaseGraphStyle = createStyleStore(EnergyConsBaseGraphStyleConfig);

//////////     M E A S U R E M E N T     G R A P H     //////////

const MeasurementGraphStyleConfig: ComponentStyles = {
    dark: {
        lineWidthPx: 1.5,
        lineColor: "rgba(74, 144, 226, 0.85)",
        bandColor: "rgba(74, 144, 226, 0.15)",
        bandBorderWidthPx: 1,
        bandBorderColor: "transparent",
        lineHoverColor: "rgba(74, 144, 226, 1.0)",
        bandHoverColor: "rgba(74, 144, 226, 0.25)",
        bandBorderHoverColor: "rgba(74, 144, 226, 0.3)",
    },
};

export const MeasurementGraphStyle = createStyleStore(MeasurementGraphStyleConfig);

//////////     C O U N T E R     G R A P H     //////////

const CounterGraphStyleConfig: ComponentStyles = {
    dark: {
        barColor: "rgba(74, 144, 226, 0.15)",
        barBorderWidthPx: 1,
        barBorderColor: "transparent",
        barHoverColor: "rgba(74, 144, 226, 0.25)",
        barBorderHoverColor: "rgba(74, 144, 226, 0.3)",
    },
};

export const CounterGraphStyle = createStyleStore(CounterGraphStyleConfig);

//////////     E N E R G Y     C O N S U M P T I O N     G R A P H     //////////

const EnergyConsGraphStyleConfig: ComponentStyles = {
    dark: {
        activeEnergybarColor: "rgba(59, 130, 246, 0.30)",
        reactiveEnergybarColor: "rgba(245, 158, 11, 0.30)",
        barBorderWidthPx: 1,
        activeEnergybarBorderColor: "transparent",
        reactiveEnergybarBorderColor: "transparent",
        activeEnergybarHoverColor: "rgba(59, 130, 246, 0.45)",
        reactiveEnergybarHoverColor: "rgba(245, 158, 11, 0.45)",
        activeEnergybarBorderHoverColor: "rgba(59, 130, 246, 0.55)",
        reactiveEnergybarBorderHoverColor: "rgba(245, 158, 11, 0.55)",
    },
};

export const EnergyConsGraphStyle = createStyleStore(EnergyConsGraphStyleConfig);

//////////     G R A P H     M E T R I C     //////////

const GraphMetricStyleConfig: ComponentStyles = {
    dark: {
        forceCollapse: "TRUE",
        iconSize: "26px",
        textSize: "14px",
        rowWidth: "300px",
        rowPaddingLeft: "30px",
        rowPaddingRight: "30px",
        rowBorderRight: "1px solid rgba(255, 255, 255, 0.12)",
        labelWidth: "75px",
        labelPaddingLeft: "5px",
        labelColor: "rgba(255, 255, 255, 0.55)",
        labelWeight: "400",
        valueRightPadding: "5px",
        valueColor: "rgba(255, 255, 255, 0.95)",
        valueWeight: "500",
        unitMaxWidth: "50px",
        unitColor: "rgba(255, 255, 255, 0.55)",
        unitWeight: "400",
        noDataLabelColor: "rgba(255, 255, 255, 0.4)",
        noDataLabelWeight: "400",
    },
};

export const GraphMetricStyle = createStyleStore(GraphMetricStyleConfig);

//////////     F U L L     S C R E E N     G R A P H     M E T R I C     //////////

const FullScreenGraphMetricStyleConfig: ComponentStyles = {
    dark: {
        forceCollapse: "FALSE",
        iconSize: "32px",
        textSize: "1rem",
        rowWidth: "350px",
        rowPaddingLeft: "30px",
        rowPaddingRight: "30px",
        rowBorderRight: "1px solid rgba(255, 255, 255, 0.12)",
        labelWidth: "75px",
        labelPaddingLeft: "10px",
        labelColor: "rgba(255, 255, 255, 0.55)",
        labelWeight: "400",
        valueRightPadding: "5px",
        valueColor: "rgba(255, 255, 255, 0.95)",
        valueWeight: "500",
        unitMaxWidth: "50px",
        unitColor: "rgba(255, 255, 255, 0.55)",
        unitWeight: "400",
        noDataLabelColor: "rgba(255, 255, 255, 0.4)",
        noDataLabelWeight: "400",
    },
};

export const FullScreenGraphMetricStyle = createStyleStore(FullScreenGraphMetricStyleConfig);

//////////     E N E R G Y     C O N S U M P T I O N     G R A P H     M E T R I C     //////////

const EnergyConsMetricStyleConfig: ComponentStyles = {
    dark: {
        forceCollapse: "TRUE",
        desktopView: "FALSE",
        desktopContentPaddingTop: "5px",
        desktopRowPaddingTop: "25px",
        iconSize: "26px",
        textSize: "14px",
        rowWidth: "350px",
        rowPaddingLeft: "30px",
        rowPaddingRight: "30px",
        rowBorderRight: "1px solid rgba(255, 255, 255, 0.12)",
        rowBorderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        labelWidth: "150px",
        labelPaddingLeft: "5px",
        labelColor: "rgba(255, 255, 255, 0.55)",
        labelWeight: "400",
        valueRightPadding: "5px",
        valueColor: "rgba(255, 255, 255, 0.95)",
        valueWeight: "500",
        unitMaxWidth: "50px",
        unitColor: "rgba(255, 255, 255, 0.55)",
        unitWeight: "400",
        noDataLabelColor: "rgba(255, 255, 255, 0.4)",
        noDataLabelWeight: "400",
    },
};

export const EnergyConsMetricStyle = createStyleStore(EnergyConsMetricStyleConfig);

//////////     F U L L     S C R E E N     E N E R G Y     C O N S U M P T I O N     G R A P H     M E T R I C     //////////

const FullScreenEnergyConsMetricStyleConfig: ComponentStyles = {
    dark: {
        forceCollapse: "FALSE",
        desktopView: "FALSE",
        desktopContentPaddingTop: "5px",
        desktopRowPaddingTop: "25px",
        iconSize: "32px",
        textSize: "1rem",
        rowWidth: "400px",
        rowPaddingLeft: "30px",
        rowPaddingRight: "30px",
        rowBorderRight: "1px solid rgba(255, 255, 255, 0.12)",
        rowBorderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        labelWidth: "200px",
        labelPaddingLeft: "10px",
        labelColor: "rgba(255, 255, 255, 0.55)",
        labelWeight: "400",
        valueRightPadding: "10px",
        valueColor: "rgba(255, 255, 255, 0.95)",
        valueWeight: "500",
        unitMaxWidth: "50px",
        unitColor: "rgba(255, 255, 255, 0.55)",
        unitWeight: "400",
        noDataLabelColor: "rgba(255, 255, 255, 0.4)",
        noDataLabelWeight: "400",
    },
};

export const FullScreenEnergyConsMetricStyle = createStyleStore(FullScreenEnergyConsMetricStyleConfig);

//////////     D E S K T O P     E N E R G Y     C O N S U M P T I O N     G R A P H     M E T R I C     //////////

const DesktopEnergyConsMetricStyleConfig: ComponentStyles = {
    dark: {
        forceCollapse: "TRUE",
        desktopView: "TRUE",
        desktopContentPaddingTop: "5px",
        desktopRowPaddingTop: "25px",
        iconSize: "26px",
        textSize: "14px",
        rowWidth: "350px",
        rowPaddingLeft: "30px",
        rowPaddingRight: "30px",
        rowBorderRight: "1px solid rgba(255, 255, 255, 0.12)",
        rowBorderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        labelWidth: "75px",
        labelPaddingLeft: "5px",
        labelColor: "rgba(255, 255, 255, 0.55)",
        labelWeight: "400",
        valueRightPadding: "5px",
        valueColor: "rgba(255, 255, 255, 0.95)",
        valueWeight: "500",
        unitMaxWidth: "50px",
        unitColor: "rgba(255, 255, 255, 0.55)",
        unitWeight: "400",
        noDataLabelColor: "rgba(255, 255, 255, 0.4)",
        noDataLabelWeight: "400",
    },
};

export const DesktopEnergyConsMetricStyle = createStyleStore(DesktopEnergyConsMetricStyleConfig);

//////////     G R A P H     T O O L     T I P     //////////

const GraphToolTipStyleConfig: ComponentStyles = {
    dark: {
        width: "150px",
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
    },
};

export const GraphToolTipStyle = createStyleStore(GraphToolTipStyleConfig);

//////////     G R A P H     D A T A     T O O L     T I P     //////////

const GraphDataToolTipStyleConfig: ComponentStyles = {
    dark: {
        rowGap: "4px",
        textSize: "13px",
        labelWidth: "30px",
        labelColor: "rgba(255, 255, 255, 0.7)",
        labelWeight: "400",
        valueRightPadding: "5px",
        valueColor: "rgba(255, 255, 255, 0.95)",
        valueWeight: "500",
        unitMaxWidth: "35px",
        unitColor: "rgba(255, 255, 255, 0.6)",
        unitWeight: "400",
        noDataLabelColor: "rgba(255, 255, 255, 0.5)",
        noDataLabelWeight: "400",
    },
};

export const GraphDataToolTipStyle = createStyleStore(GraphDataToolTipStyleConfig);
