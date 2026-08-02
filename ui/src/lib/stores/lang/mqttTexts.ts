import { createLangStore } from "$lib/stores/lang/definition";
import type { TextsObject } from "$lib/stores/lang/definition";

//////////     B R O K E R     M O D E     T E X T S     //////////

const textsObjectsMqttBrokerMode: TextsObject = {
    INTERNAL: {
        PT: "Interno",
        EN: "Internal",
    },
    EXTERNAL: {
        PT: "Externo",
        EN: "External",
    },
};

//////////     M O D E     T E X T S     //////////

const textsObjectsMqttNodeMode: TextsObject = {
    RAW: {
        PT: "RAW",
        EN: "RAW",
    },
    JSON: {
        PT: "JSON",
        EN: "JSON",
    },
};

//////////     T Y P E     T E X T S     //////////

const textsObjectsMqttNodeType: TextsObject = {
    FLOAT: {
        PT: "FLOAT",
        EN: "FLOAT",
    },
    STRING: {
        PT: "STRING",
        EN: "STRING",
    },
    INT: {
        PT: "INT",
        EN: "INT",
    },
    BOOL: {
        PT: "BOOLEAN",
        EN: "BOOLEAN",
    },
};

//////////     Q O S     T E X T S     //////////

const textsObjectsMqttQos: TextsObject = {
    "0": {
        PT: "0",
        EN: "0",
    },
    "1": {
        PT: "1",
        EN: "1",
    },
    "2": {
        PT: "2",
        EN: "2",
    },
};

export const mqttBrokerModeTexts = createLangStore(textsObjectsMqttBrokerMode);
export const mqttNodeModeTexts = createLangStore(textsObjectsMqttNodeMode);
export const mqttNodeTypeTexts = createLangStore(textsObjectsMqttNodeType);
export const mqttQosTexts = createLangStore(textsObjectsMqttQos);
