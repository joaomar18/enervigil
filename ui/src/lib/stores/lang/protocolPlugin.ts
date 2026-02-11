import { createLangStore } from "$lib/stores/lang/definition";
import type { TextsObject } from "$lib/stores/lang/definition";
import { modbusNodeTypeTexts } from "./modbusRtuTexts";

const textsObjectsPlugin: TextsObject = {
    noProtocol: {
        PT: "Sem protocolo",
        EN: "No protocol",
    },
    address: {
        PT: "Endereço",
        EN: "Address",
    },
    noProtocolInfo: {
        PT: "Sem protocolo de comunicação selecionado.",
        EN: "No communication protocol selected.",
    },
    noProtocolType: {
        PT: "Tipo",
        EN: "Type",
    },
    noProtocolTypeInfo: {
        PT: "Selecione o tipo de dado da variável: FLOAT (número decimal), INT (número inteiro), STRING (texto) ou BOOLEAN (verdadeiro/falso).",
        EN: "Select the variable data type: FLOAT (decimal number), INT (integer number), STRING (text), or BOOLEAN (true/false).",
    },
    modbusAddress: {
        PT: "Endereço",
        EN: "Address",
    },
    modbusAdressBit: {
        PT: "Endereço / Bit",
        EN: "Address / Bit",
    },
    modbusAddressInfo: {
        PT: "Indique o endereço modbus utilizado para aceder à variável no dispositivo.",
        EN: "Specify the modbus address used to access the variable on the device.",
    },
    modbusAddressBitInfo: {
        PT: "Indique o endereço e o bit modbus utilizados para aceder à variável no dispositivo.",
        EN: "Specify the modbus address and bit used to access the variable on the device.",
    },
    modbusType: {
        PT: "Tipo",
        EN: "Type",
    },
    modbusTypeInfo: {
        PT: "Tipo da variável para comunicação Modbus.",
        EN: "Variable type for Modbus communication.",
    },
    opcuaID: {
        PT: "ID do Nó",
        EN: "Node ID",
    },
    opcuaIDInfo: {
        PT: "Indique o ID do nó OPC UA utilizado para aceder à variável no dispositivo.",
        EN: "Specify the OPC UA Node ID used to acess the variable on the device.",
    },
    opcuaType: {
        PT: "Tipo",
        EN: "Type",
    },
    opcuaTypeInfo: {
        PT: "Tipo da variável para comunicação OPC UA.",
        EN: "Variable type for OPC UA communication.",
    },
};

const textsObjectsNoProtocolNodeType: TextsObject = {
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
    BOOLEAN: {
        PT: "BOOLEAN",
        EN: "BOOLEAN",
    },
};

export const pluginTexts = createLangStore(textsObjectsPlugin);
export const noProtocolNodeTypeTexts = createLangStore(textsObjectsNoProtocolNodeType);
