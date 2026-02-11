import { derived } from "svelte/store";
import type { Readable } from "svelte/store";
import { createLangStore } from "$lib/stores/lang/definition";
import type { TextsObject } from "$lib/stores/lang/definition";
import type { AlertTextList } from "../view/toast";
import { activeToastTextList } from "../view/toast";

//////////     G E N E R A L     A L E R T     T E X T S     //////////

const generalAlertTextsObject: TextsObject = {
    decimalPlacesError: {
        PT: "O número de casas decimais deve estar compreendido entre {minValue} e {maxValue}.",
        EN: "The number of decimal places must be between {minValue} and {maxValue}.",
    },
    loggingPeriodError: {
        PT: "O período de registo deve estar compreendido entre {minValue} e {maxValue}.",
        EN: "The logging period must be between {minValue} and {maxValue}.",
    },
    slaveIDError: {
        PT: "O ID do dispositivo deve estar compreendido entre {minValue} e {maxValue}.",
        EN: "The device ID must be between {minValue} and {maxValue}.",
    },
    readPeriodError: {
        PT: "O período de leitura deve estar compreendido entre {minValue} e {maxValue} segundos.",
        EN: "The read period must be between {minValue} and {maxValue} seconds.",
    },
    commTimeoutError: {
        PT: "O tempo limite de comunicação deve estar compreendido entre {minValue} e {maxValue} segundos.",
        EN: "The communication timeout must be between {minValue} and {maxValue} seconds.",
    },
    retriesError: {
        PT: "O número de tentativas de reenvio deve estar compreendido entre {minValue} e {maxValue}.",
        EN: "The number of retries must be between {minValue} and {maxValue}.",
    },
    invalidDeviceName: {
        PT: "O nome do dispositivo é inválido.",
        EN: "The device name is invalid.",
    },
    invalidProtocol: {
        PT: "O protocolo de comunicação selecionado é inválido ou não suportado.",
        EN: "The selected communication protocol is invalid or not supported.",
    },
    invalidCommunicationOptions: {
        PT: "As opções relacionadas com a comunicação do dispositivo são inválidas.",
        EN: "The options related to device communication are invalid.",
    },
    invalidMeterOptions: {
        PT: "As opções relacionadas com o tipo e gestão do dispositivo são inválidas.",
        EN: "The options related to device type and management are invalid.",
    },
    invalidDeviceNodes: {
        PT: "Existem variáveis do dispositivo com configurações inválidas.",
        EN: "There are device variables with invalid configurations.",
    },
    errorEditDeviceParams: {
        PT: "Não foram atribuídos o nome e/ou o id do dispositivo.",
        EN: "The name and/or the id of the device were not assigned.",
    },
    noChangesToDevice: {
        PT: "Não foram efetuadas alterações às configurações do dispositivo. Não é necessário guardar a edição.",
        EN: "No changes were made to the device configuration. There is no need to save the edit.",
    },
    initNodesError: {
        PT: "Não foi possível iniciar corretamente a configuração das variáveis: {error}.",
        EN: "Could not properly initialize the variables configuration: {error}.",
    },
    invalidStartDate: {
        PT: "A data inicial é inválida. Use o formato YY/MM/DD.",
        EN: "The start date is invalid. Use YY/MM/DD format.",
    },
    invalidStartTime: {
        PT: "A hora inicial é inválida. Use o formato HH:mm.",
        EN: "The start time is invalid. Use HH:mm format.",
    },
    invalidEndDate: {
        PT: "A data final é inválida. Use o formato YY/MM/AAAA.",
        EN: "The end date is invalid. Use YY/MM/DD format.",
    },
    invalidEndTime: {
        PT: "A hora final é inválida. Use o formato HH:mm.",
        EN: "The end time is invalid. Use HH:mm format.",
    },
    invalidPeriodRange: {
        PT: "A data final deve ser posterior à data final.",
        EN: "The end date must be later than the initial date.",
    },
    noKeyError: {
        PT: "Erro desconhecido.",
        EN: "Unknown error.",
    },
    unexpectedError: {
        PT: "Erro inesperado: {message}",
        EN: "Unexpected error: {message}",
    },
    timeoutError: {
        PT: "Tempo limite da comunicação excedido. Verifique a ligação e tente novamente.",
        EN: "Communication timeout. Please check the connection and try again.",
    },
    disconnectedError: {
        PT: "O servidor está inacessível. Verifique a ligação e tente novamente.",
        EN: "Server is unreachable. Please check the connection and try again.",
    }
};

//////////     A P I     G E N E R A L     A L E R T     T E X T S     //////////

const apiGeneralAlertTextsObject: TextsObject = {
    INVALID_JSON: {
        PT: "Pedido inválido. Os dados enviados não estão no formato correto.",
        EN: "Invalid request. The submitted data is not in the correct format.",
    },
    INVALID_FORM_DATA: {
        PT: "Dados inválidos. Verifique os campos do formulário.",
        EN: "Invalid data. Please check the form fields.",
    },
    MISSING_IP: {
        PT: "Endereço IP em falta. Introduza um endereço IP válido.",
        EN: "Missing IP address. Please enter a valid IP address.",
    },
    INTERNAL_SERVER_ERROR: {
        PT: "Erro interno do sistema: {message}",
        EN: "Internal system error: {message}",
    },
};

//////////     A P I     A U T H O R I Z A T I O N     A L E R T     T E X T S     //////////

const apiAuthorizationAlertTextsObject: TextsObject = {
    MISSING_USERNAME: {
        PT: "Nome de utilizador em falta.",
        EN: "Username is missing.",
    },
    MISSING_PASSWORD: {
        PT: "Palavra-passe em falta.",
        EN: "Password is missing.",
    },
    MISSING_OLD_PASSWORD: {
        PT: "Palavra-passe atual em falta.",
        EN: "Current password is missing.",
    },
    MISSING_NEW_PASSWORD: {
        PT: "Nova palavra-passe em falta.",
        EN: "New password is missing.",
    },
    MISSING_NEW_PASSWORD_CONFIRM: {
        PT: "Confirmação da nova palavra-passe em falta.",
        EN: "New password confirmation is missing.",
    },
    INVALID_AUTO_LOGIN: {
        PT: "Sessão automática inválida. Inicie sessão novamente.",
        EN: "Invalid automatic session. Please log in again.",
    },
    INVALID_PASSWORD: {
        PT: "Palavra-passe inválida.",
        EN: "Invalid password.",
    },
    INVALID_NEW_PASSWORD: {
        PT: "A nova palavra-passe não cumpre os requisitos.",
        EN: "The new password does not meet the requirements.",
    },
    PASSWORD_MISMATCH: {
        PT: "As palavras-passe não coincidem.",
        EN: "Passwords do not match.",
    },
    USER_CONFIG_EXISTS: {
        PT: "Configuração de utilizador já existente.",
        EN: "User configuration already exists.",
    },
    USER_CONFIG_NOT_FOUND: {
        PT: "Configuração de utilizador não encontrada.",
        EN: "User configuration not found.",
    },
    USER_CONFIG_CORRUPT: {
        PT: "Configuração de utilizador inválida ou corrompida.",
        EN: "User configuration is invalid or corrupted.",
    },
    INVALID_CREDENTIALS: {
        PT: "Nome de utilizador ou palavra-passe incorretos. Tentativas restantes: {remaining_attempts}.",
        EN: "Incorrect username or password. Remaining attempts: {remaining_attempts}.",
    },
    INVALID_TOKEN: {
        PT: "Sessão inválida ou expirada. Inicie sessão novamente.",
        EN: "Invalid or expired session. Please log in again.",
    },
    TOKEN_MISSING: {
        PT: "Sessão em falta. Inicie sessão.",
        EN: "Missing session. Please log in.",
    },
    BLOCKED_CLIENT: {
        PT: "Acesso temporariamente bloqueado por motivos de segurança. Tente novamente às {unlocked_date}.",
        EN: "Access temporarily blocked for security reasons. Try again at {unlocked_date}.",
    },
    USER_CONFIG_SUCESS: {
        PT: "Configuração criada com sucesso.",
        EN: "Configuration created successfully.",
    },
};

//////////     A P I     D E V I C E     A L E R T     T E X T S     //////////

const apiDeviceAlertTextsObject: TextsObject = {
    MISSING_DEVICE_DATA: {
        PT: "Dados do dispositivo em falta.",
        EN: "Missing device data.",
    },
    MISSING_NODES_DATA: {
        PT: "Dados das variáveis em falta.",
        EN: "Missing variables data.",
    },
    MISSING_UPLOADED_IMAGE: {
        PT: "Imagem não fornecida.",
        EN: "Image not provided.",
    },
    MISSING_DEVICE_NAME: {
        PT: "Nome do dispositivo em falta.",
        EN: "Missing device name.",
    },
    MISSING_DEVICE_ID: {
        PT: "ID do dispositivo em falta.",
        EN: "Missing device ID.",
    },
    MISSING_DEVICE_FIELDS: {
        PT: "Campos obrigatórios do dispositivo em falta.",
        EN: "Missing required device fields.",
    },
    MISSING_DEVICE_OPTIONS: {
        PT: "Opções do dispositivo em falta.",
        EN: "Missing device options.",
    },
    MISSING_DEVICE_COMMUNICATION: {
        PT: "Configuração de comunicação do dispositivo em falta.",
        EN: "Missing device communication configuration.",
    },
    MISSING_DEVICE_OPTIONS_FIELDS: {
        PT: "Campos obrigatórios das opções do dispositivo em falta.",
        EN: "Missing required device option fields.",
    },
    MISSING_DEVICE_COMMUNICATION_FIELDS: {
        PT: "Campos obrigatórios da comunicação do dispositivo em falta.",
        EN: "Missing required device communication fields.",
    },
    MISSING_PROTOCOL: {
        PT: "Protocolo em falta.",
        EN: "Missing protocol.",
    },
    MISSING_TYPE: {
        PT: "Tipo de dispositivo em falta.",
        EN: "Missing device type.",
    },
    INVALID_DEVICE_DATA_JSON: {
        PT: "Formato inválido dos dados do dispositivo.",
        EN: "Invalid device data format.",
    },
    INVALID_DEVICE_NODES_JSON: {
        PT: "Formato inválido dos dados dos nós.",
        EN: "Invalid node data format.",
    },
    INVALID_DEVICE_ID: {
        PT: "ID do dispositivo inválido.",
        EN: "Invalid device ID.",
    },
    INVALID_PROTOCOL: {
        PT: "Protocolo inválido.",
        EN: "Invalid protocol.",
    },
    INVALID_TYPE: {
        PT: "Tipo de dispositivo inválido.",
        EN: "Invalid device type.",
    },
    DEVICE_STORAGE_FAILED: {
        PT: "Falha ao guardar o dispositivo.",
        EN: "Failed to store device.",
    },
    UPDATE_STORAGE_FAILED: {
        PT: "Falha ao atualizar o dispositivo.",
        EN: "Failed to update device.",
    },
    DELETE_STORAGE_FAILED: {
        PT: "Falha ao remover o dispositivo.",
        EN: "Failed to delete device.",
    },
    SAVE_IMAGE_FAILED: {
        PT: "Falha ao guardar a imagem.",
        EN: "Failed to save image.",
    },
    NOT_FOUND: {
        PT: "Dispositivo não encontrado.",
        EN: "Device not found.",
    },
};

//////////     A P I     N O D E S     A L E R T     T E X T S     //////////

const apiNodesAlertTextsObject: TextsObject = {
    MISSING_START_TIME: {
        PT: "Data de início em falta.",
        EN: "Missing start date.",
    },
    MISSING_NODE_NAME: {
        PT: "Nome da variável em falta.",
        EN: "Missing variable name.",
    },
    MISSING_PHASE: {
        PT: "Fase em falta.",
        EN: "Missing phase.",
    },
    MISSING_PROTOCOL: {
        PT: "Protocolo em falta.",
        EN: "Missing protocol.",
    },
    MISSING_ENERGY_DIRECTION: {
        PT: "Direção de energia em falta.",
        EN: "Missing energy direction.",
    },
    MISSING_NODE_CONFIG: {
        PT: "Configuração da variável em falta.",
        EN: "Missing variable configuration.",
    },
    MISSING_NODE_PROTOCOL_OPTIONS: {
        PT: "Opções de protocolo da variável em falta.",
        EN: "Missing variable protocol options.",
    },
    MISSING_NODE_FIELDS: {
        PT: "Campos obrigatórios da variável em falta.",
        EN: "Missing required variable fields.",
    },
    MISSING_NODE_CONFIG_FIELDS: {
        PT: "Campos obrigatórios de configuração da variável em falta.",
        EN: "Missing required node configuration fields.",
    },
    MISSING_NODE_PROTOCOL_OPTIONS_FIELDS: {
        PT: "Campos obrigatórios das opções de protocolo da variável em falta.",
        EN: "Missing required variable protocol options fields.",
    },
    MISSING_NODE_ATTRIBUTES_FIELDS: {
        PT: "Campos obrigatórios dos atributos da variável em falta.",
        EN: "Missing required variable attribute fields.",
    },
    INVALID_NODE: {
        PT: "Variável inválida.",
        EN: "Invalid variable.",
    },
    INVALID_START_TIME: {
        PT: "Data de início inválida.",
        EN: "Invalid start date.",
    },
    INVALID_END_TIME: {
        PT: "Data de fim inválida.",
        EN: "Invalid end date.",
    },
    INVALID_PHASE: {
        PT: "Fase inválida.",
        EN: "Invalid phase.",
    },
    INVALID_PROTOCOL: {
        PT: "Protocolo inválido.",
        EN: "Invalid protocol.",
    },
    INVALID_ENERGY_DIRECTION: {
        PT: "Sentido de energia inválido.",
        EN: "Invalid energy direction.",
    },
    INVALID_TIME_ZONE: {
        PT: "Fuso horário inválido.",
        EN: "Invalid time zone.",
    },
    NOT_FOUND: {
        PT: "Variável não encontrada.",
        EN: "Variable not found.",
    },
    DELETE_LOGS_FAILED: {
        PT: "Falha ao eliminar os registos históricos da variável.",
        EN: "Failed to delete historical data of the variable.",
    },
    DELETE_ALL_LOGS_FAILED: {
        PT: "Falha ao eliminar todos os registos históricos da variável.",
        EN: "Failed to delete all historical data of the variable.",
    },
};

export const generalAlertTexts = createLangStore(generalAlertTextsObject);
export const apiGeneralAlertTexts = createLangStore(apiGeneralAlertTextsObject);
export const apiAuthorizationAlertTexts = createLangStore(apiAuthorizationAlertTextsObject);
export const apiDeviceAlertTexts = createLangStore(apiDeviceAlertTextsObject);
export const apiNodesAlertTexts = createLangStore(apiNodesAlertTextsObject);

const alertTextStores: Record<AlertTextList, Readable<Record<string, string>>> = {
    general: generalAlertTexts,
    apiGeneral: apiGeneralAlertTexts,
    apiAuthorization: apiAuthorizationAlertTexts,
    apiDevice: apiDeviceAlertTexts,
    apiNodes: apiNodesAlertTexts,
};

export const activeAlertTexts: Readable<Record<string, string>> = derived(activeToastTextList, ($group, set) => {
    const store = alertTextStores[$group];
    const unsubscribe = store.subscribe(set);
    return unsubscribe;
});
