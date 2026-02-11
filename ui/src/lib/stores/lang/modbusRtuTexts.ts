import { createLangStore } from "$lib/stores/lang/definition";
import type { TextsObject } from "$lib/stores/lang/definition";

//////////     B A U D R A T E     T E X T S     //////////

const textsObjectsBaudrates: TextsObject = {
    "1200": {
        PT: "1200",
        EN: "1200",
    },
    "2400": {
        PT: "2400",
        EN: "2400",
    },
    "4800": {
        PT: "4800",
        EN: "4800",
    },
    "9600": {
        PT: "9600",
        EN: "9600",
    },
    "19200": {
        PT: "19200",
        EN: "19200",
    },
    "38400": {
        PT: "38400",
        EN: "38400",
    },
    "57600": {
        PT: "57600",
        EN: "57600",
    },
    "115200": {
        PT: "115200",
        EN: "115200",
    },
};

//////////     P A R I T Y     T E X T S     //////////

const textsObjectsParities: TextsObject = {
    N: {
        PT: "Nenhuma",
        EN: "None",
    },
    E: {
        PT: "Par",
        EN: "Even",
    },
    O: {
        PT: "Impar",
        EN: "Odd",
    },
};

//////////     B Y T E     S I Z E     T E X T S     //////////

const textsObjectsBytesizes: TextsObject = {
    "7": {
        PT: "7",
        EN: "7",
    },
    "8": {
        PT: "8",
        EN: "8",
    },
};

//////////     S T O P     B I T S     T E X T S     //////////

const textsObjectsStopbits: TextsObject = {
    "1": {
        PT: "1",
        EN: "1",
    },
    "2": {
        PT: "2",
        EN: "2",
    },
};

//////////     T Y P E     T E X T S     //////////

const textsObjectsModbusNodeType: TextsObject = {
    BOOL: {
        PT: "BOOLEAN",
        EN: "BOOLEAN",
    },
    INT_16: {
        PT: "INT_16",
        EN: "INT_16",
    },
    UINT_16: {
        PT: "UINT_16",
        EN: "UINT_16",
    },
    INT_32: {
        PT: "INT_32",
        EN: "INT_32",
    },
    UINT_32: {
        PT: "UINT_32",
        EN: "UINT_32",
    },
    FLOAT_32: {
        PT: "FLOAT_32",
        EN: "FLOAT_32",
    },
    INT_64: {
        PT: "INT_64",
        EN: "INT_64",
    },
    UINT_64: {
        PT: "UINT_64",
        EN: "UINT_64",
    },
    FLOAT_64: {
        PT: "FLOAT_64",
        EN: "FLOAT_64",
    },
};

//////////     F U N C T I O N     T E X T S     //////////

const textsObjectsModbusNodeFunction: TextsObject = {
    READ_COILS: {
        PT: "READ_OUT_COILS (01)",
        EN: "READ_OUT_COILS (01)",
    },
    READ_DISCRETE_INPUTS: {
        PT: "READ_IN_COILS (02)",
        EN: "READ_IN_COILS (02)",
    },
    READ_HOLDING_REGISTERS: {
        PT: "READ_HOLD_REGS (03)",
        EN: "READ_HOLD_REGS (03)",
    },
    READ_INPUT_REGISTERS: {
        PT: "READ_IN_REGS (04)",
        EN: "READ_IN_REGS (04)",
    },
};

//////////     E N D I A N     M O D E     T E X T S     //////////

const textsObjectsModbusNodeEndianMode: TextsObject = {
    BIG_ENDIAN: {
        PT: "BIG_ENDIAN",
        EN: "BIG_ENDIAN",
    },
    WORD_SWAP: {
        PT: "WORD_SWAP",
        EN: "WORD_SWAP",
    },
    BYTE_SWAP: {
        PT: "BYTE_SWAP",
        EN: "BYTE_SWAP",
    },
    WORD_BYTE_SWAP: {
        PT: "WORD_BYTE_SWAP",
        EN: "WORD_BYTE_SWAP",
    },
};

export const baudrateTexts = createLangStore(textsObjectsBaudrates);
export const parityTexts = createLangStore(textsObjectsParities);
export const bytesizeTexts = createLangStore(textsObjectsBytesizes);
export const stopbitsTexts = createLangStore(textsObjectsStopbits);
export const modbusNodeTypeTexts = createLangStore(textsObjectsModbusNodeType);
export const modbusNodeFunctionTexts = createLangStore(textsObjectsModbusNodeFunction);
export const modbusNodeEndianModeTexts = createLangStore(textsObjectsModbusNodeEndianMode);
