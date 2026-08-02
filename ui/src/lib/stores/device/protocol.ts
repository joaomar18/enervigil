import { writable, type Readable } from "svelte/store";
import { Protocol } from "$lib/types/device/base";
import type { BaseCommunicationConfig, EditableBaseCommunicationConfig } from "$lib/types/device/base";
import type { DeviceOPCUAConfig, EditableDeviceOPCUAConfig } from "$lib/types/device/opcUa";
import type { DeviceModbusRTUConfig, EditableDeviceModbusRTUConfig } from "$lib/types/device/modbusRtu";
import {
    defaultModbusRTUNodeOptions,
    type EditableModbusRTUNodeOptions,
    ModbusRTUFunction,
    type ModbusRTUNodeOptions,
    type ModbusRTUNodeOptionsValidation,
    ModbusRTUNodeType,
} from "$lib/types/nodes/protocol/modbusRtu";
import { defaultOPCUANodeOptions, type EditableOPCUANodeOptions, type OPCUANodeOptions, type OPCUANodeOptionsValidation, OPCUANodeType } from "$lib/types/nodes/protocol/opcUa";
import {
    defaultMQTTNodeOptions,
    type EditableMQTTNodeOptions,
    MQTTNodeMode,
    type MQTTNodeOptions,
    type MQTTNodeOptionsValidation,
    MQTTNodeType,
} from "$lib/types/nodes/protocol/mqtt";
import type { SvelteComponent } from "svelte";
import { defaultModbusRTUOptions } from "$lib/types/device/modbusRtu";
import { defaultOPCUAOptions } from "$lib/types/device/opcUa";
import { defaultMQTTOptions, MQTTBrokerMode, type DeviceMQTTConfig, type EditableDeviceMQTTConfig } from "$lib/types/device/mqtt";
import { defaultNoProtocolNodeOptions } from "$lib/types/nodes/config";
import ModbusRtuConfig from "../../../components/Devices/ModbusRTUConfig.svelte";
import OpcuaConfig from "../../../components/Devices/OPCUAConfig.svelte";
import MqttConfig from "../../../components/Devices/MQTTConfig.svelte";
import ModbusRtuNodeCommConfig from "../../../components/Devices/Nodes/Protocol/ModbusRtu/ModbusRtuNodeCommConfig.svelte";
import OPCUANodeCommConfig from "../../../components/Devices/Nodes/Protocol/OpcUa/OpcUaNodeCommConfig.svelte";
import MqttNodeCommConfig from "../../../components/Devices/Nodes/Protocol/Mqtt/MqttNodeCommConfig.svelte";
import { NodeType } from "$lib/types/nodes/base";
import type {
    BaseNodeProtocolOptions,
    BaseNodeProtocolOptionsValidation,
    EditableBaseNodeProtocolOptions,
    EditableNodeNoProtocolOptions,
    EditableNodeRecord,
    NodeNoProtocolOptions,
    NodeRecordEditingState,
    NoProtocolNodeOptionsValidation,
} from "$lib/types/nodes/config";
import {
    validateModbusAddress,
    validateModbusBitIndex,
    validateModbusEndianMode,
    validateModbusFunction,
} from "$lib/logic/validation/nodes/protocol/modbusRtu";
import { validateOpcUaNodeId } from "$lib/logic/validation/nodes/protocol/opcUa";
import { validateMqttTopic, validateMqttJsonPath, validateMqttQos } from "$lib/logic/validation/nodes/protocol/mqtt";
import { noProtocolNodeTypeTexts } from "../lang/protocolPlugin";
import { modbusNodeTypeTexts } from "../lang/modbusRtuTexts";
import { opcUaNodeTypeTexts } from "../lang/opcUaTexts";
import { mqttNodeTypeTexts } from "../lang/mqttTexts";
import { nodeTypeChange } from "$lib/logic/handlers/nodes/base";
import { modbusNodeTypeChange } from "$lib/logic/handlers/nodes/protocol/modbusRtu";

export interface ProtocolPlugin {
    textKey: string;
    typeTextKey: string;
    infoTypeTextKey: string;
    shortTextKey: string;
    infoTextKey: string;
    nodeTypeTexts: Readable<Record<string, string>>;
    defaultOptions: EditableBaseCommunicationConfig;
    defaultNodeProtocolOptions: EditableBaseNodeProtocolOptions;
    ConfigComponent: typeof SvelteComponent<any> | null;
    NodeCommConfigComponent: typeof SvelteComponent<any> | null;
    isNumeric: (nodeProtocolOptions: BaseNodeProtocolOptions | EditableBaseNodeProtocolOptions) => boolean;
    convertTypeToGeneric: (nodeProtocolOptions: BaseNodeProtocolOptions | EditableBaseNodeProtocolOptions) => NodeType;
    setProtocolType: (node: EditableNodeRecord, type: string, nodeState: NodeRecordEditingState) => void;
    getProtocolType: (nodeProtocolOptions: BaseNodeProtocolOptions | EditableBaseNodeProtocolOptions) => string;
    convertCommOptionsToEditable: (communicationOptions: BaseCommunicationConfig) => EditableBaseCommunicationConfig;
    convertCommOptionsToNormal: (editableCommunicationOptions: EditableBaseCommunicationConfig) => BaseCommunicationConfig;
    convertNodeProtocolOptionsToEditable: (protocolOptions: BaseNodeProtocolOptions) => EditableBaseNodeProtocolOptions;
    convertNodeProtocolOptionsToNormal: (editableProtocolOptions: EditableBaseNodeProtocolOptions) => BaseNodeProtocolOptions;
    validateNodeType: (editableProtocolOptions: EditableBaseNodeProtocolOptions) => boolean;
    validateNodeProtocolOptions: (editableProtocolOptions: EditableBaseNodeProtocolOptions) => BaseNodeProtocolOptionsValidation;
}

/*     N O     P R O T O C O L     P L U G I N     */

const noProtocolPlugin: ProtocolPlugin = {
    textKey: "noProtocol",
    infoTextKey: "noProtocolInfo",
    typeTextKey: "noProtocolType",
    infoTypeTextKey: "noProtocolTypeInfo",
    shortTextKey: "address",
    nodeTypeTexts: noProtocolNodeTypeTexts,
    defaultOptions: { valid: false },
    defaultNodeProtocolOptions: defaultNoProtocolNodeOptions,
    ConfigComponent: null,
    NodeCommConfigComponent: null,
    isNumeric(nodeProtocolOptions) {
        let type = (nodeProtocolOptions as NodeNoProtocolOptions).type;
        return type === NodeType.FLOAT || type === NodeType.INT;
    },
    convertTypeToGeneric: (nodeProtocolOptions) => {
        return (nodeProtocolOptions as NodeNoProtocolOptions).type;
    },
    setProtocolType: (node, type, nodeState) => {
        let protocolOptions = node.protocol_options as EditableNodeNoProtocolOptions;
        protocolOptions.type = type as NodeType;
        nodeTypeChange(node, nodeState);
    },
    getProtocolType: (nodeProtocolOptions) => {
        return (nodeProtocolOptions as NodeNoProtocolOptions).type;
    },
    convertCommOptionsToEditable: (communicationOptions) => {
        throw new Error("Unsupported Protocol");
    },
    convertCommOptionsToNormal: (editableCommunicationOptions) => {
        throw new Error("Unsupported Protocol");
    },
    convertNodeProtocolOptionsToEditable: (nodeProtocolOptions) => {
        return nodeProtocolOptions as EditableNodeNoProtocolOptions;
    },
    convertNodeProtocolOptionsToNormal: (editableProtocolOptions) => {
        return editableProtocolOptions as NodeNoProtocolOptions;
    },
    validateNodeType: (editableProtocolOptions) => {
        let protocolOptions = editableProtocolOptions as EditableNodeNoProtocolOptions;

        if (!Object.values(NodeType).includes(protocolOptions.type)) return false;
        return true;
    },
    validateNodeProtocolOptions: (editableProtocolOptions) => {
        let protocolOptions = editableProtocolOptions as EditableNodeNoProtocolOptions;

        let validType = Object.values(NodeType).includes(protocolOptions.type)

        return {
            type: validType,
            isValid() {
                return validType;
            },
        } as NoProtocolNodeOptionsValidation;
    },
};

/*     M O D B U S     R T U     P L U G I N     */

const modbusRtuPlugin: ProtocolPlugin = {
    textKey: "modbusAddress",
    infoTextKey: "modbusAddressInfo",
    typeTextKey: "modbusType",
    infoTypeTextKey: "modbusTypeInfo",
    shortTextKey: "address",
    nodeTypeTexts: modbusNodeTypeTexts,
    defaultOptions: defaultModbusRTUOptions,
    defaultNodeProtocolOptions: defaultModbusRTUNodeOptions,
    ConfigComponent: ModbusRtuConfig,
    NodeCommConfigComponent: ModbusRtuNodeCommConfig,
    isNumeric(nodeProtocolOptions) {
        let type = (nodeProtocolOptions as ModbusRTUNodeOptions).type;
        return (
            type === ModbusRTUNodeType.INT_16 ||
            type === ModbusRTUNodeType.UINT_16 ||
            type === ModbusRTUNodeType.INT_32 ||
            type === ModbusRTUNodeType.UINT_32 ||
            type === ModbusRTUNodeType.INT_64 ||
            type === ModbusRTUNodeType.UINT_64 ||
            type === ModbusRTUNodeType.FLOAT_32 ||
            type === ModbusRTUNodeType.FLOAT_64
        );
    },
    convertTypeToGeneric: (nodeProtocolOptions) => {
        let type = (nodeProtocolOptions as ModbusRTUNodeOptions).type;
        switch (type) {
            case ModbusRTUNodeType.BOOL:
                return NodeType.BOOL;

            case ModbusRTUNodeType.INT_16:
            case ModbusRTUNodeType.INT_32:
            case ModbusRTUNodeType.INT_64:
            case ModbusRTUNodeType.UINT_16:
            case ModbusRTUNodeType.UINT_32:
            case ModbusRTUNodeType.UINT_64:
                return NodeType.INT;

            case ModbusRTUNodeType.FLOAT_32:
            case ModbusRTUNodeType.FLOAT_64:
                return NodeType.FLOAT;
            default:
                throw new Error(`Unsupported Modbus RTU Node Type ${type}`);
        }
    },
    setProtocolType: (node, type, nodeState) => {
        let protocolOptions = node.protocol_options as EditableModbusRTUNodeOptions;
        protocolOptions.type = type as ModbusRTUNodeType;
        modbusNodeTypeChange(protocolOptions, protocolOptions.type, nodeState);
        nodeTypeChange(node, nodeState);
    },
    getProtocolType: (nodeProtocolOptions) => {
        return (nodeProtocolOptions as ModbusRTUNodeOptions).type;
    },
    convertCommOptionsToEditable: (communicationOptions) => {
        let modbusCommOptions = communicationOptions as DeviceModbusRTUConfig;
        return {
            baudrate: modbusCommOptions.baudrate.toString(),
            bytesize: modbusCommOptions.bytesize.toString(),
            parity: modbusCommOptions.parity,
            port: modbusCommOptions.port,
            read_period: modbusCommOptions.read_period.toString(),
            retries: modbusCommOptions.retries.toString(),
            slave_id: modbusCommOptions.slave_id.toString(),
            stopbits: modbusCommOptions.stopbits.toString(),
            timeout: modbusCommOptions.timeout.toString(),
            valid: false,
        } as EditableDeviceModbusRTUConfig;
    },
    convertCommOptionsToNormal: (editableCommunicationOptions) => {
        let modbusRtuEditableCommOptions = editableCommunicationOptions as EditableDeviceModbusRTUConfig;
        return {
            baudrate: parseInt(modbusRtuEditableCommOptions.baudrate),
            bytesize: parseInt(modbusRtuEditableCommOptions.bytesize),
            parity: modbusRtuEditableCommOptions.parity,
            port: modbusRtuEditableCommOptions.port,
            read_period: parseInt(modbusRtuEditableCommOptions.read_period),
            retries: parseInt(modbusRtuEditableCommOptions.retries),
            slave_id: parseInt(modbusRtuEditableCommOptions.slave_id),
            stopbits: parseInt(modbusRtuEditableCommOptions.stopbits),
            timeout: parseInt(modbusRtuEditableCommOptions.timeout),
        } as DeviceModbusRTUConfig;
    },

    convertNodeProtocolOptionsToEditable: (nodeProtocolOptions) => {
        let protocolOptions = nodeProtocolOptions as ModbusRTUNodeOptions;
        return {
            ...protocolOptions,
            address: String(protocolOptions.address),
            bit: protocolOptions.bit === null ? null : String(protocolOptions.bit),
        } as EditableModbusRTUNodeOptions;
    },
    convertNodeProtocolOptionsToNormal: (editableProtocolOptions) => {
        let protocolOptions = editableProtocolOptions as EditableModbusRTUNodeOptions;
        return {
            ...protocolOptions,
            address: Number(protocolOptions.address),
            bit: protocolOptions.bit === null ? null : Number(protocolOptions.bit),
        } as ModbusRTUNodeOptions;
    },
    validateNodeType: (editableProtocolOptions) => {
        let protocolOptions = editableProtocolOptions as EditableModbusRTUNodeOptions;

        if (!Object.values(ModbusRTUNodeType).includes(protocolOptions.type)) return false;
        return true;
    },
    validateNodeProtocolOptions(editableProtocolOptions) {
        let protocolOptions = editableProtocolOptions as EditableModbusRTUNodeOptions;

        let validType = Object.values(ModbusRTUNodeType).includes(protocolOptions.type)
        let validFunction = Object.values(ModbusRTUFunction).includes(protocolOptions.function) && validateModbusFunction(protocolOptions.function, protocolOptions.type);
        let validAddress = validateModbusAddress(protocolOptions.address);
        let validEndianMode = validateModbusEndianMode(protocolOptions.type, protocolOptions.endian_mode);
        let validBit = validateModbusBitIndex(protocolOptions.type, protocolOptions.function, protocolOptions.bit);

        return {
            type: validType,
            function: validFunction,
            address: validAddress,
            endian_mode: validEndianMode,
            bit: validBit,
            isValid() {
                return validType && validFunction && validAddress && validEndianMode && validBit;
            },
        } as ModbusRTUNodeOptionsValidation;
    },
};

/*     O P C     U A     P L U G I N     */

const opcUaPlugin: ProtocolPlugin = {
    textKey: "opcuaID",
    infoTextKey: "opcuaIDInfo",
    typeTextKey: "opcuaType",
    infoTypeTextKey: "opcuaTypeInfo",
    shortTextKey: "opcuaID",
    nodeTypeTexts: opcUaNodeTypeTexts,
    defaultOptions: defaultOPCUAOptions,
    defaultNodeProtocolOptions: defaultOPCUANodeOptions,
    ConfigComponent: OpcuaConfig,
    NodeCommConfigComponent: OPCUANodeCommConfig,
    isNumeric(nodeProtocolOptions) {
        let type = (nodeProtocolOptions as OPCUANodeOptions).type;
        return type === OPCUANodeType.INT || type === OPCUANodeType.FLOAT;
    },
    convertTypeToGeneric: (nodeProtocolOptions) => {
        let type = (nodeProtocolOptions as OPCUANodeOptions).type;
        switch (type) {
            case OPCUANodeType.BOOL:
                return NodeType.BOOL;
            case OPCUANodeType.INT:
                return NodeType.INT;
            case OPCUANodeType.FLOAT:
                return NodeType.FLOAT;
            case OPCUANodeType.STRING:
                return NodeType.STRING;
            default:
                throw new Error(`Unsupported OPC UA Node Type ${type}`);
        }
    },
    setProtocolType: (node, type: string, nodeState) => {
        let protocolOptions = node.protocol_options as EditableOPCUANodeOptions;
        protocolOptions.type = type as OPCUANodeType;
        nodeTypeChange(node, nodeState);
    },
    getProtocolType: (nodeProtocolOptions) => {
        return (nodeProtocolOptions as OPCUANodeOptions).type;
    },
    convertCommOptionsToEditable(communicationOptions) {
        let opcUaCommOptions = communicationOptions as DeviceOPCUAConfig;
        return {
            username: opcUaCommOptions.username || "",
            password: opcUaCommOptions.password || "",
            read_period: opcUaCommOptions.read_period.toString(),
            timeout: opcUaCommOptions.timeout.toString(),
            url: opcUaCommOptions.url,
            valid: false,
        } as EditableDeviceOPCUAConfig;
    },
    convertCommOptionsToNormal: (editableCommunicationOptions) => {
        let opcUaEditableCommOptions = editableCommunicationOptions as EditableDeviceOPCUAConfig;
        return {
            username: opcUaEditableCommOptions.username || null,
            password: opcUaEditableCommOptions.password || null,
            read_period: parseInt(opcUaEditableCommOptions.read_period),
            timeout: parseInt(opcUaEditableCommOptions.timeout),
            url: opcUaEditableCommOptions.url,
        } as DeviceOPCUAConfig;
    },
    convertNodeProtocolOptionsToEditable: (nodeProtocolOptions) => {
        let protocolOptions = nodeProtocolOptions as OPCUANodeOptions;
        return {
            ...protocolOptions,
            node_id: String(protocolOptions.node_id),
        } as EditableOPCUANodeOptions;
    },
    convertNodeProtocolOptionsToNormal: (editableProtocolOptions) => {
        let protocolOptions = editableProtocolOptions as EditableOPCUANodeOptions;
        return {
            ...protocolOptions,
            node_id: String(protocolOptions.node_id),
        } as OPCUANodeOptions;
    },
    validateNodeType: (editableProtocolOptions) => {
        let protocolOptions = editableProtocolOptions as EditableOPCUANodeOptions;

        if (!Object.values(OPCUANodeType).includes(protocolOptions.type)) return false;
        return true;
    },
    validateNodeProtocolOptions(editableProtocolOptions) {
        let protocolOptions = editableProtocolOptions as EditableOPCUANodeOptions;

        let validType = Object.values(OPCUANodeType).includes(protocolOptions.type)
        let validNodeId = validateOpcUaNodeId(protocolOptions.node_id);

        return {
            type: validType,
            node_id: validNodeId,
            isValid() {
                return validType && validNodeId;
            },
        } as OPCUANodeOptionsValidation;
    },
};

/*     M Q T T     P L U G I N     */

const mqttPlugin: ProtocolPlugin = {
    textKey: "mqttTopic",
    infoTextKey: "mqttTopicInfo",
    typeTextKey: "mqttType",
    infoTypeTextKey: "mqttTypeInfo",
    shortTextKey: "mqttTopic",
    nodeTypeTexts: mqttNodeTypeTexts,
    defaultOptions: defaultMQTTOptions,
    defaultNodeProtocolOptions: defaultMQTTNodeOptions,
    ConfigComponent: MqttConfig,
    NodeCommConfigComponent: MqttNodeCommConfig,
    isNumeric(nodeProtocolOptions) {
        let type = (nodeProtocolOptions as MQTTNodeOptions).type;
        return type === MQTTNodeType.INT || type === MQTTNodeType.FLOAT;
    },
    convertTypeToGeneric: (nodeProtocolOptions) => {
        let type = (nodeProtocolOptions as MQTTNodeOptions).type;
        switch (type) {
            case MQTTNodeType.BOOL:
                return NodeType.BOOL;
            case MQTTNodeType.INT:
                return NodeType.INT;
            case MQTTNodeType.FLOAT:
                return NodeType.FLOAT;
            case MQTTNodeType.STRING:
                return NodeType.STRING;
            default:
                throw new Error(`Unsupported MQTT Node Type ${type}`);
        }
    },
    setProtocolType: (node, type, nodeState) => {
        let protocolOptions = node.protocol_options as EditableMQTTNodeOptions;
        protocolOptions.type = type as MQTTNodeType;
        nodeTypeChange(node, nodeState);
    },
    getProtocolType: (nodeProtocolOptions) => {
        return (nodeProtocolOptions as MQTTNodeOptions).type;
    },
    convertCommOptionsToEditable: (communicationOptions) => {
        let mqttCommOptions = communicationOptions as DeviceMQTTConfig;
        return {
            broker_mode: mqttCommOptions.broker_mode,
            stale_after: mqttCommOptions.stale_after.toString(),
            hostname: mqttCommOptions.hostname || "",
            port: mqttCommOptions.port !== null ? mqttCommOptions.port.toString() : "",
            use_tls: mqttCommOptions.use_tls,
            authentication: mqttCommOptions.authentication,
            username: mqttCommOptions.username || "",
            password: mqttCommOptions.password || "",
            valid: false,
        } as EditableDeviceMQTTConfig;
    },
    convertCommOptionsToNormal: (editableCommunicationOptions) => {
        let mqttEditableCommOptions = editableCommunicationOptions as EditableDeviceMQTTConfig;
        let isExternal = mqttEditableCommOptions.broker_mode === MQTTBrokerMode.EXTERNAL;
        return {
            broker_mode: mqttEditableCommOptions.broker_mode,
            stale_after: parseInt(mqttEditableCommOptions.stale_after),
            hostname: isExternal ? mqttEditableCommOptions.hostname : null,
            port: isExternal ? parseInt(mqttEditableCommOptions.port) : null,
            use_tls: isExternal ? mqttEditableCommOptions.use_tls : false,
            authentication: isExternal ? mqttEditableCommOptions.authentication : false,
            username: isExternal && mqttEditableCommOptions.authentication ? mqttEditableCommOptions.username || null : null,
            password: isExternal && mqttEditableCommOptions.authentication ? mqttEditableCommOptions.password || null : null,
        } as DeviceMQTTConfig;
    },
    convertNodeProtocolOptionsToEditable: (nodeProtocolOptions) => {
        let protocolOptions = nodeProtocolOptions as MQTTNodeOptions;
        return {
            ...protocolOptions,
            qos: String(protocolOptions.qos),
        } as EditableMQTTNodeOptions;
    },
    convertNodeProtocolOptionsToNormal: (editableProtocolOptions) => {
        let protocolOptions = editableProtocolOptions as EditableMQTTNodeOptions;
        return {
            ...protocolOptions,
            qos: Number(protocolOptions.qos),
        } as MQTTNodeOptions;
    },
    validateNodeType: (editableProtocolOptions) => {
        let protocolOptions = editableProtocolOptions as EditableMQTTNodeOptions;

        if (!Object.values(MQTTNodeType).includes(protocolOptions.type)) return false;
        return true;
    },
    validateNodeProtocolOptions(editableProtocolOptions) {
        let protocolOptions = editableProtocolOptions as EditableMQTTNodeOptions;

        let validType = Object.values(MQTTNodeType).includes(protocolOptions.type);
        let validMode = Object.values(MQTTNodeMode).includes(protocolOptions.mode);
        let validTopic = validateMqttTopic(protocolOptions.topic);
        let validJsonPath = validateMqttJsonPath(protocolOptions.json_path, protocolOptions.mode === MQTTNodeMode.JSON);
        let validQos = validateMqttQos(protocolOptions.qos);

        return {
            type: validType,
            mode: validMode,
            topic: validTopic,
            json_path: validJsonPath,
            qos: validQos,
            isValid() {
                return validType && validMode && validTopic && validJsonPath && validQos;
            },
        } as MQTTNodeOptionsValidation;
    },
};

export const protocolPlugins = writable<Record<Protocol, ProtocolPlugin>>({
    [Protocol.NONE]: noProtocolPlugin,
    [Protocol.MODBUS_RTU]: modbusRtuPlugin,
    [Protocol.OPC_UA]: opcUaPlugin,
    [Protocol.MQTT]: mqttPlugin,
});
