import { createLangStore } from "$lib/stores/lang/definition";
import type { TextsObject } from "$lib/stores/lang/definition";

//////////     T Y P E     T E X T S     //////////

const textsObjectsOpcUaNodeType: TextsObject = {
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

export const opcUaNodeTypeTexts = createLangStore(textsObjectsOpcUaNodeType);

