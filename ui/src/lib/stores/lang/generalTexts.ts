import { page } from "$app/state";
import { createLangStore } from "$lib/stores/lang/definition";
import type { TextsObject } from "$lib/stores/lang/definition";

const textsObject: TextsObject = {
    pageNotFound: {
        PT: "A página solicitada não foi encontrada.",
        EN: "The requested page was not found.",
    },
    notFound: {
        PT: "Não encontrado",
        EN: "Not found",
    },
    title: {
        PT: "Bem-vindo",
        EN: "Welcome",
    },
    initialSetup: {
        PT: "Configuração inicial",
        EN: "Initial setup",
    },
    selectLanguage: {
        PT: "Selecione o seu idioma:",
        EN: "Select your language:",
    },
    infoMainMessage: {
        PT: "Monitorização de energia de código aberto\npara todos os dispositivos",
        EN: "Open-source energy monitoring\nfor every device",
    },
    infoSubMessage: {
        PT: "Criado para desenvolvedores, empresas e entusiastas",
        EN: "Built for developers, enterprises, and enthusiasts",
    },
    disabled: {
        PT: "Desabilitado",
        EN: "Disabled",
    },
    created: {
        PT: "Criado",
        EN: "Created",
    },
    name: {
        PT: "Nome",
        EN: "Name",
    },
    username: {
        PT: "Utilizador",
        EN: "Username",
    },
    password: {
        PT: "Palavra-passe",
        EN: "Password",
    },
    confirmPassword: {
        PT: "Repita a palavra-passe",
        EN: "Repeat password",
    },
    login: {
        PT: "Entrar",
        EN: "Login",
    },
    register: {
        PT: "Registar",
        EN: "Register",
    },
    state: {
        PT: "Estado",
        EN: "State",
    },
    userInvalid: {
        PT: "Nome de utilizador inválido.",
        EN: "Invalid username.",
    },
    userInfo: {
        PT: "O nome de utilizador deve conter pelo menos 3 caracteres sem espaços.",
        EN: "The username must contain at least 3 characters without spaces.",
    },
    passwordInvalid: {
        PT: "Palavra-passe inválida.",
        EN: "Invalid password.",
    },
    passwordInfo: {
        PT: "A palavra-passe deve conter pelo menos 5 caracteres sem espaços.",
        EN: "The password must contain at least 5 characters without spaces.",
    },
    passwordNoMatch: {
        PT: "As palavras-passe não coincidem.",
        EN: "Passwords do not match.",
    },
    passwordConfirmInfo: {
        PT: "Repita a palavra-passe para confirmação.",
        EN: "Repeat the password for confirmation.",
    },
    keepSessionLogged: {
        PT: "Manter sessão iniciada",
        EN: "Stay logged in",
    },
    language: {
        PT: "Idioma",
        EN: "Language",
    },
    aboutUs: {
        PT: "Sobre Nós",
        EN: "About us",
    },
    help: {
        PT: "Ajuda",
        EN: "Help",
    },
    contacts: {
        PT: "Contactos",
        EN: "Contacts",
    },
    devices: {
        PT: "Dispositivos",
        EN: "Devices",
    },
    device: {
        PT: "Dispositivo",
        EN: "Device",
    },
    dashboard: {
        PT: "Painel de Controlo",
        EN: "Dashboard",
    },
    general: {
        PT: "Geral",
        EN: "General",
    },
    diagnostics: {
        PT: "Diagnóstico",
        EN: "Diagnostics",
    },
    health: {
        PT: "Estado",
        EN: "Health",
    },
    logs: {
        PT: "Registros",
        EN: "Logs",
    },
    system: {
        PT: "Sistema",
        EN: "System",
    },
    settings: {
        PT: "Definições",
        EN: "Settings",
    },
    backup: {
        PT: "Backup",
        EN: "Backup",
    },
    logout: {
        PT: "Sair",
        EN: "Logout",
    },
    searchDevice: {
        PT: "Pesquisar dispositivo",
        EN: "Search device",
    },
    connected: {
        PT: "conectado",
        EN: "connected",
    },
    disconnected: {
        PT: "desconectado",
        EN: "disconnected",
    },
    addDevice: {
        PT: "Adicionar dispositivo",
        EN: "Add device",
    },
    errorDevicesState: {
        PT: "Não foi possível obter o estado dos dispositivos do servidor: {error}",
        EN: "Could not obtain devices status from the server: {error}",
    },
    errorDeviceConfig: {
        PT: "Não foi possível obter a configuração para o dispositivo do servidor: {error}",
        EN: "Could not obtain device configuration from the server: {error}",
    },
    errorDeviceNodesConfig: {
        PT: "Não foi possível obter a configuração das variáveis para o dispositivo do servidor: {error}",
        EN: "Could not obtain device variables configuration from the server: {error}",
    },
    errorDefaultImage: {
        PT: "Não foi possível obter a imagem padrão para o dispositivo: {error}",
        EN: "Could not obtain the default image for the device: {error}",
    },
    deviceCommunication: {
        PT: "Comunicação do Dispositivo",
        EN: "Device Communication",
    },
    deviceCommunicationSub: {
        PT: "Opções relacionadas com a comunicação do dispositivo",
        EN: "Options related to device communication",
    },
    deviceOptions: {
        PT: "Opções do Dispositivo",
        EN: "Device Options",
    },
    deviceOptionsSub: {
        PT: "Opções relacionadas com o tipo e gestão do dispositivo",
        EN: "Options related to device type and management",
    },
    communicationProtocol: {
        PT: "Protocolo de Comunicação",
        EN: "Communication Protocol",
    },
    communicationProtocolInfo: {
        PT: "Protocolo de comunicação utilizado para obter dados do dispositivo.",
        EN: "Communication protocol used to obtain data from the device.",
    },
    connectionType: {
        PT: "Tipo de Conexão",
        EN: "Connection Type",
    },
    connectionTypeInfo: {
        PT: "Tipo de conexão elétrica para medição e análise de energia.",
        EN: "Electrical connection type for energy metering and analysis.",
    },
    readEnergyFromMeter: {
        PT: "Obter leitura de energia do dispositivo",
        EN: "Get energy reading from device",
    },
    readEnergyFromMeterInfo: {
        PT: "Opção para valores de energia serem obtidos a partir do dispositivo.",
        EN: "Option for energy readings to be obtained from the device.",
    },
    readForwardReverseEnergySeparate: {
        PT: "Leitura de energia direta e inversa separada",
        EN: "Separate forward and reverse energy reading",
    },
    readForwardReverseEnergySeparateInfo: {
        PT: "Opção para definir se o dispositivo comunica os valores de energia diretos e inversos separados.",
        EN: "Option to define whether the device sends separate forward and reverse energy values.",
    },
    negativeReactivePower: {
        PT: "Potência reativa negativa",
        EN: "Negative reactive power",
    },
    negativeReactivePowerInfo: {
        PT: "Opção para definir se o dispositivo define valores de potência reativa negativos para fatores de potência adiantados.",
        EN: "Option to define whether the device sets negative reactive power values ​​for leading power factors.",
    },
    frequencyReading: {
        PT: "Leitura de frequência",
        EN: "Frequency reading",
    },
    frequencyReadingInfo: {
        PT: "Opção para definir se o dispotivo permite a leitura de valores de frequência.",
        EN: "Option to define whether the device allows reading frequency values.",
    },
    deviceNodes: {
        PT: "Variáveis do Dispositivo",
        EN: "Device Variables",
    },
    deviceNodesSub: {
        PT: "Configuração dos valores de medição do dispositivo",
        EN: "Measurement values configuration on the device",
    },
    confirm: {
        PT: "Confirmar",
        EN: "Confirm",
    },
    edit: {
        PT: "Editar",
        EN: "Edit",
    },
    save: {
        PT: "Guardar",
        EN: "Save",
    },
    delete: {
        PT: "Eliminar",
        EN: "Delete",
    },
    cancel: {
        PT: "Cancelar",
        EN: "Cancel",
    },
    deviceDetails: {
        PT: "Detalhes do Dispositivo",
        EN: "Device Details",
    },
    deleteDevice: {
        PT: "Eliminar o dispositivo",
        EN: "Delete device",
    },
    deleteDeviceInfo: {
        PT: "Eliminar o dispositivo irá remover permanentemente todos os dados associados. Tem a certeza que pretende continuar?",
        EN: "Deleting the device will permanently remove all associated data. Are you sure you want to continue?",
    },
    confirmDeleteDevice: {
        PT: "Digite o nome do dispositivo para confirmar",
        EN: "Type the device name to confirm",
    },
    saveDevice: {
        PT: "Aplicar as alterações ao dispositivo",
        EN: "Apply changes to the device",
    },
    saveDeviceInfo: {
        PT: "Aplicar as alterações irá atualizar as configurações do dispositivo. Tem a certeza que pretende continuar?",
        EN: "Applying changes will update the device settings. Are you sure you want to continue?",
    },
    networkAddress: {
        PT: "Endereço de Rede",
        EN: "Network Address",
    },
    networkAddressInfo: {
        PT: "O endereço de rede utilizado para estabelecer comunicação com o dispositivo.",
        EN: "Network address used to establish communication with the device.",
    },
    readPeriod: {
        PT: "Período de Leitura",
        EN: "Read Period",
    },
    interval: {
        PT: "Intervalo",
        EN: "Interval",
    },
    readPeriodInfo: {
        PT: "Intervalo de tempo (em segundos) entre as leituras de dados do dispositivo.",
        EN: "Time interval (in seconds) between data readings from the device.",
    },
    commTimeout: {
        PT: "Tempo Limite de Comunicação",
        EN: "Communication Timeout",
    },
    commTimeoutInfo: {
        PT: "Tempo máximo (em segundos) que o sistema aguarda por uma resposta do dispositivo antes de considerar que a comunicação falhou.",
        EN: "Maximum time (in seconds) that the system waits for a response from the device before considering that communication failed.",
    },

    authenticationOptional: {
        PT: "Autenticação (opcional)",
        EN: "Authentication (optional)",
    },
    commUsernameInfo: {
        PT: "Nome de utilizador para autenticação em dispositivos que requerem credenciais. Deixe em branco se o dispositivo não necessitar de autenticação.",
        EN: "Username for authentication on devices that require credentials. Leave blank if the device does not require authentication.",
    },
    commPasswordInfo: {
        PT: "Palavra-passe para autenticação em dispositivos que requerem credenciais. Deixe em branco se o dispositivo não necessitar de autenticação.",
        EN: "Password for authentication on devices that require credentials. Leave blank if the device does not require authentication.",
    },
    secondsUnit: {
        PT: "seg.",
        EN: "sec.",
    },
    communicationPort: {
        PT: "Porta de Comunicação",
        EN: "Communication Port",
    },
    communicationPortInfo: {
        PT: "A porta de comunicação utilizada para estabelecer a ligação com o dispositivo.",
        EN: "The communication port used to establish the connection with the device.",
    },
    slaveID: {
        PT: "ID do Dispositivo",
        EN: "Device ID",
    },
    slaveIDInfo: {
        PT: "Identificador único do dispositivo na rede Modbus. Deve ser um número entre 1 e 247.",
        EN: "Unique identifier of the device on the Modbus network. Must be a number between 1 and 247.",
    },
    baudrate: {
        PT: "Baudrate",
        EN: "Baudrate",
    },
    baudrateInfo: {
        PT: "A taxa de transmissão de dados utilizada na comunicação com o dispositivo.",
        EN: "The data transmission rate used in communication with the device.",
    },
    parity: {
        PT: "Paridade",
        EN: "Parity",
    },
    parityInfo: {
        PT: "O método de verificação de erros utilizado na comunicação com o dispositivo.",
        EN: "The error checking method used in communication with the device.",
    },
    bytesize: {
        PT: "Tamanho do Byte (bits)",
        EN: "Byte Size (bits)",
    },
    bytesizeInfo: {
        PT: "O tamanho do byte (em bits) utilizado na comunicação com o dispositivo.",
        EN: "The byte size (in bits) used in communication with the device.",
    },
    stopbits: {
        PT: "Bits de Paragem",
        EN: "Stop Bits",
    },
    stopbitsInfo: {
        PT: "O número de bits de paragem utilizados na comunicação com o dispositivo.",
        EN: "The number of stop bits used in communication with the device.",
    },
    retries: {
        PT: "Tentativas de Reenvio",
        EN: "Retries Number",
    },
    retriesInfo: {
        PT: "O número de tentativas de reenvio em caso de falha na comunicação com o dispositivo.",
        EN: "The number of retries in case of communication failure with the device.",
    },
    variable: {
        PT: "Variável",
        EN: "Variable",
    },
    type: {
        PT: "Tipo",
        EN: "Type",
    },
    unit: {
        PT: "Unidade",
        EN: "Unit",
    },
    custom: {
        PT: "Próprio",
        EN: "Custom",
    },
    publish: {
        PT: "Publicar",
        EN: "Publish",
    },
    loggingPeriod: {
        PT: "Período de Registo",
        EN: "Logging Period",
    },
    virtual: {
        PT: "Virtual",
        EN: "Virtual",
    },
    logging: {
        PT: "Registo",
        EN: "Logging",
    },
    minAlarm: {
        PT: "Minimo",
        EN: "Minimum",
    },
    maxAlarm: {
        PT: "Máximo",
        EN: "Maximum",
    },
    enabled: {
        PT: "Ativar",
        EN: "Enabled",
    },
    l1Phase: {
        PT: "Fase L1",
        EN: "L1 Phase",
    },
    l2Phase: {
        PT: "Fase L2",
        EN: "L2 Phase",
    },
    l3Phase: {
        PT: "Fase L3",
        EN: "L3 Phase",
    },
    phase: {
        PT: "Fase",
        EN: "Phase",
    },

    phaseShort: {
        PT: "L",
        EN: "L",
    },
    total: {
        PT: "Total",
        EN: "Total",
    },
    metrics: {
        PT: "Indicadores",
        EN: "Metrics",
    },
    metricsShort: {
        PT: "Indicadores",
        EN: "Metrics",
    },
    energyConsumption: {
        PT: "Consumo de Energia",
        EN: "Energy Consumption",
    },
    energyConsumptionShort: {
        PT: "Consumo",
        EN: "Consumption",
    },
    addNode: {
        PT: "Adicionar Variável",
        EN: "Add Variable",
    },
    actions: {
        PT: "Ações",
        EN: "Actions",
    },
    value: {
        PT: "Valor",
        EN: "Value",
    },
    minValue: {
        PT: "Valor Mínimo",
        EN: "Minimum Value",
    },
    maxValue: {
        PT: "Valor Máximo",
        EN: "Maximum Value",
    },
    averageValue: {
        PT: "Valor Médio",
        EN: "Average Value",
    },
    minValueShort: {
        PT: "Mín",
        EN: "Min",
    },
    maxValueShort: {
        PT: "Máx",
        EN: "Max",
    },
    averageValueShort: {
        PT: "Méd",
        EN: "Avg",
    },
    section: {
        PT: "Secção",
        EN: "Section",
    },
    protocol: {
        PT: "Protocolo",
        EN: "Protocol",
    },
    l1: {
        PT: "L1",
        EN: "L1",
    },
    l2: {
        PT: "L2",
        EN: "L2",
    },
    l3: {
        PT: "L3",
        EN: "L3",
    },
    totalShort: {
        PT: "T",
        EN: "T",
    },
    singlephase: {
        PT: "Monofásico",
        EN: "Single-phase",
    },
    counterNode: {
        PT: "Contador",
        EN: "Counter",
    },
    counterMode: {
        PT: "Modo de Contagem",
        EN: "Counter Mode",
    },
    variableInfo: {
        PT: "Selecione a variável que pretende medir ou monitorizar. Cada variável representa um tipo de dado elétrico, como tensão, corrente, potência, energia, etc.",
        EN: "Select the variable you want to measure or monitor. Each variable represents a type of electrical data, such as voltage, current, power, energy, etc.",
    },
    variableCustomInfo: {
        PT: "Defina um nome personalizado para a variável. Use esta opção para variáveis que não se enquadram nas categorias pré-definidas.",
        EN: "Set a custom name for the variable. Use this option for variables that do not fit into the predefined categories.",
    },
    unitInfo: {
        PT: "Indique a unidade de medida associada à variável (por exemplo: V, A, kWh, %). Certifique-se de que a unidade corresponde ao tipo de dado selecionado.",
        EN: "Specify the measurement unit associated with the variable (e.g., V, A, kWh, %). Make sure the unit matches the selected data type.",
    },
    unitCustomInfo: {
        PT: "Indique a unidade de medida para esta variável personalizada (ex: rpm, %, m³, etc.).",
        EN: "Specify the measurement unit for this custom variable (e.g., rpm, %, m³, etc.).",
    },
    nocommInfo: {
        PT: "Esta variável é virtual e não possui registo de comunicação ou identificador associado.",
        EN: "This variable is virtual and does not have a communication register or identifier.",
    },
    loggingInfo: {
        PT: "Defina o período de registo (em minutos) para guardar periodicamente os dados desta variável. Ative ou desative o registo utilizando a caixa de seleção.",
        EN: "Set the logging period (in minutes) to store this variable's data periodically. Enable or disable logging using the checkbox.",
    },
    minAlarmValueInfo: {
        PT: "Defina o valor mínimo de alarme permitido para esta variável. O sistema irá sinalizar se o valor medido for inferior a este limite. Ative ou desative esta função utilizando a caixa de seleção.",
        EN: "Set the minimum allowed alarm value for this variable. The system will alert if the measured value falls below this limit. Enable or disable this function using the checkbox.",
    },
    maxAlarmValueInfo: {
        PT: "Defina o valor máximo de alarme permitido para esta variável. O sistema irá sinalizar se o valor medido exceder este limite. Ative ou desative esta função utilizando a caixa de seleção.",
        EN: "Set the maximum allowed alarm value for this variable. The system will alert if the measured value exceeds this limit. Enable or disable this function using the checkbox.",
    },
    minWarningValueInfo: {
        PT: "Defina o valor mínimo de aviso permitido para esta variável. O sistema irá sinalizar se o valor medido for inferior a este limite. Ative ou desative esta função utilizando a caixa de seleção.",
        EN: "Set the minimum allowed warning value for this variable. The system will alert if the measured value falls below this limit. Enable or disable this function using the checkbox.",
    },
    maxWarningValueInfo: {
        PT: "Defina o valor máximo de aviso permitido para esta variável. O sistema irá sinalizar se o valor medido exceder este limite. Ative ou desative esta função utilizando a caixa de seleção.",
        EN: "Set the maximum allowed warning value for this variable. The system will alert if the measured value exceeds this limit. Enable or disable this function using the checkbox.",
    },
    customInfo: {
        PT: "Ative esta opção para definir a variável como personalizada (definida pelo utilizador) em vez de uma variável padrão do sistema.",
        EN: "Enable this option to set the variable as custom (user-defined) instead of a system default variable.",
    },
    publishInfo: {
        PT: "Ative esta opção para permitir que a variável seja acedida externamente (por outras aplicações ou sistemas).",
        EN: "Enable this option to allow the variable to be accessed externally (by other applications or systems).",
    },
    virtualInfo: {
        PT: "Esta opção indica que a variável é calculada internamente pelo sistema e não está disponível para variáveis personalizadas.",
        EN: "This option indicates that the variable is calculated internally by the system and is not available for custom variables.",
    },
    counterNodeInfo: {
        PT: "Indica que a variável funciona como um contador, acumulando o valor ao longo do tempo. O valor acumulado é atualizado com base no modo selecionado. Exemplo: variáveis de energia.",
        EN: "Indicates that the variable behaves as a counter, accumulating its value over time. The accumulated value is updated according to the selected mode. Example: energy variables.",
    },
    counterModeInfo: {
        PT:
            "Define como o valor da variável é calculado ao longo do tempo:\n\n" +
            "• DIRETO — O valor recebido é utilizado diretamente, sem qualquer processamento adicional.\n" +
            "• DELTA — O valor representa a variação desde a última leitura (incremento). O sistema soma estes incrementos para obter o total.\n" +
            "• CUMULATIVO — O valor é cumulativo. O sistema calcula o incremento com base na diferença entre leituras consecutivas.",
        EN:
            "Defines how the variable's value is processed over time:\n\n" +
            "• DIRECT — The incoming value is used as-is, with no additional processing.\n" +
            "• DELTA — The value represents the change since the previous reading (increment). The system adds these increments to compute the total.\n" +
            "• CUMULATIVE — The value is cumulative. The system calculates increments based on the difference between successive readings.",
    },
    enabledInfo: {
        PT: "Ative para que a variável seja gerida. Se desativada, a variável apenas existe na configuração e não é processada.",
        EN: "Enable for the variable to be managed. If disabled, the variable only exists in the configuration and is not processed.",
    },
    decimalPlaces: {
        PT: "Número de casas decimais",
        EN: "Number of decimal places",
    },
    decimalPlacesInfo: {
        PT: "Defina o número de casas decimais para apresentar os valores desta variável. Use para ajustar a precisão da visualização.",
        EN: "Set the number of decimal places to display for this variable's values. Use to adjust the precision of visualization",
    },
    deviceName: {
        PT: "Nome do dispositivo",
        EN: "Device name",
    },
    add: {
        PT: "Adicionar",
        EN: "Add",
    },
    addNewDevice: {
        PT: "Adicionar novo dispositivo",
        EN: "Add new device",
    },
    addNewDeviceInfo: {
        PT: "Confirmar a adição irá criar um novo dispositivo. Tem a certeza que pretende continuar?",
        EN: "Confirming will create a new device. Are you sure you want to continue?",
    },
    cancelDeviceEdit: {
        PT: "Cancelar edição do dispositivo",
        EN: "Cancel device edit",
    },
    cancelDeviceEditInfo: {
        PT: "Foram efetuadas alterações às configurações do dispositivo que não foram guardadas. Cancelar a edição irá descartar todas as alterações. Tem a certeza que pretende continuar?",
        EN: "Changes have been made to the device configuration that have not been saved. Canceling the edit will discard all changes. Are you sure you want to continue?",
    },
    addDeviceRequestError: {
        PT: "O servidor não respondeu ao pedido de adição do dispositivo: {error}",
        EN: "The server did not respond to the device add request: {error}",
    },
    editDeviceRequestError: {
        PT: "O servidor não respondeu ao pedido de alteração às configurações do dispositivo: {error}",
        EN: "The server did not respond to the device configuration change request: {error}",
    },
    deleteDeviceRequestError: {
        PT: "O servidor não respondeu ao pedido de remoção do dispositivo: {error}",
        EN: "The server did not respond to the device delete request: {error}",
    },
    configuration: {
        PT: "Configuração",
        EN: "Configuration",
    },
    connectivity: {
        PT: "Conectividade",
        EN: "Connectivity",
    },
    editDeviceConfig: {
        PT: "Editar configuração do dispositivo",
        EN: "Edit device configuration",
    },
    addNew: {
        PT: "Adicionar novo",
        EN: "Add new",
    },
    editConfig: {
        PT: "Editar configuração",
        EN: "Edit configuration",
    },
    generalView: {
        PT: "Vista geral",
        EN: "General view",
    },
    dataAnalytics: {
        PT: "Análise de dados",
        EN: "Data analytics",
    },
    since: {
        PT: "Desde",
        EN: "Since",
    },
    lastUpdate: {
        PT: "Última atualização",
        EN: "Last update",
    },
    lastSeen: {
        PT: "Visto em",
        EN: "Last seen",
    },
    okNodes: {
        PT: "Nós OK",
        EN: "OK Nodes",
    },
    variables: {
        PT: "Variáveis",
        EN: "Variables",
    },
    measurements: {
        PT: "Medições",
        EN: "Measurements",
    },
    counters: {
        PT: "Contadores",
        EN: "Counters",
    },
    states: {
        PT: "Estados",
        EN: "States",
    },
    texts: {
        PT: "Textos",
        EN: "Texts",
    },
    other: {
        PT: "Outros",
        EN: "Other",
    },
    collapseAll: {
        PT: "Colapsar Tudo",
        EN: "Collapse All",
    },
    expandAll: {
        PT: "Expandir Tudo",
        EN: "Expand All",
    },
    devicesList: {
        PT: "Lista de Dispositivos",
        EN: "Devices List",
    },
    notifications: {
        PT: "Notificações",
        EN: "Notifications",
    },
    goBack: {
        PT: "Voltar Atrás",
        EN: "Go Back",
    },
    _1h: {
        PT: "1H",
        EN: "1H",
    },
    currentHour: {
        PT: "hora atual",
        EN: "current hour",
    },
    _1d: {
        PT: "1D",
        EN: "1D",
    },
    currentDay: {
        PT: "dia atual",
        EN: "current day",
    },
    _7d: {
        PT: "7D",
        EN: "7D",
    },
    currentWeek: {
        PT: "semana atual",
        EN: "current week",
    },
    _1M: {
        PT: "1M",
        EN: "1M",
    },
    currentMonth: {
        PT: "mês atual",
        EN: "current month",
    },
    _1Y: {
        PT: "1A",
        EN: "1Y",
    },
    currentYear: {
        PT: "ano atual",
        EN: "current year",
    },
    customPeriod: {
        PT: "definir período",
        EN: "choose period",
    },
    variableDetails: {
        PT: "Detalhes da Variável",
        EN: "Variable Details",
    },
    variableConfig: {
        PT: "Configuração da Variável",
        EN: "Variable Configuration",
    },
    currentState: {
        PT: "Estado Atual",
        EN: "Current State",
    },
    updated: {
        PT: "Atualizado",
        EN: "Updated",
    },
    restarted: {
        PT: "Reiniciado",
        EN: "Restarted",
    },
    alarms: {
        PT: "Alarmes",
        EN: "Alarms",
    },
    warnings: {
        PT: "Avisos",
        EN: "Warnings",
    },
    upperLimit: {
        PT: "Limite Sup.",
        EN: "Upper Limit",
    },
    lowerLimit: {
        PT: "Limite Inf.",
        EN: "Lower Limit",
    },
    history: {
        PT: "Histórico",
        EN: "History",
    },
    technicalData: {
        PT: "Dados Técnicos",
        EN: "Technical Data",
    },
    alarmState: {
        PT: "em alarme",
        EN: "in alarm",
    },
    warningState: {
        PT: "em aviso",
        EN: "in warning",
    },
    okState: {
        PT: "OK",
        EN: "OK",
    },
    connectedState: {
        PT: "conectado",
        EN: "connected",
    },
    disconnectedState: {
        PT: "desconectado",
        EN: "disconnected",
    },
    fromDate: {
        PT: "De",
        EN: "From",
    },
    toDate: {
        PT: "Até",
        EN: "To",
    },
    noDataAvailable: {
        PT: "Sem dados disponíveis",
        EN: "No data available",
    },
    noDataAvailableShort: {
        PT: "Sem dados",
        EN: "No data",
    },
    fullscreen: {
        PT: "Ecrã Inteiro",
        EN: "Full screen",
    },
    selectedPeriod: {
        PT: "Período selecionado",
        EN: "Selected period",
    },
    now: {
        PT: "agora",
        EN: "now",
    },
    never: {
        PT: "Nunca",
        EN: "Never",
    },
    periodSelection: {
        PT: "Selecionar período",
        EN: "Select period",
    },
    phaseSelection: {
        PT: "Selecionar fase elétrica",
        EN: "Select electrical phase",
    },
    forwardEnergy: {
        PT: "Energia Direta",
        EN: "Forward Energy",
    },
    forwardEnergyShort: {
        PT: "D",
        EN: "F",
    },
    subForwardEnergyShort: {
        PT: "I",
        EN: "W",
    },
    reverseEnergy: {
        PT: "Energia Inversa",
        EN: "Reverse Energy",
    },
    reverseEnergyShort: {
        PT: "I",
        EN: "R",
    },
    subReverseEnergyShort: {
        PT: "N",
        EN: "V",
    },
    totalEnergy: {
        PT: "Energia Total",
        EN: "Total Energy",
    },
    totalEnergyShort: {
        PT: "T",
        EN: "T",
    },
    subTotalEnergyShort: {
        PT: "T",
        EN: "T",
    },
    energyDirection: {
        PT: "Selecionar direção da energia",
        EN: "Select energy direction",
    },
    energyDirectionShort: {
        PT: "Direção",
        EN: "Direction",
    },
    activeEnergyValue: {
        PT: "Energia Ativa",
        EN: "Active Energy",
    },
    activeEnergyValueShort: {
        PT: "Ea",
        EN: "Ea",
    },
    reactiveEnergyValue: {
        PT: "Energia Reativa",
        EN: "Reactive Energy",
    },
    reactiveEnergyValueShort: {
        PT: "Er",
        EN: "Er",
    },
    powerFactorValue: {
        PT: "Fator Potência",
        EN: "Power Factor",
    },
    powerFactorValueShort: {
        PT: "Fp",
        EN: "Pf",
    },
    invalid: {
        PT: "Inválido",
        EN: "Not valid",
    },
    filters: {
        PT: "Filtros",
        EN: "Filters",
    },
    timePeriod: {
        PT: "Período de Tempo",
        EN: "Time Period",
    },
    peakPower: {
        PT: "Potência Máxima",
        EN: "Peak Power",
    },
    phaseBalance: {
        PT: "Equílibrio de Fases",
        EN: "Phase Balance",
    },
    registeredDate: {
        PT: "registrado entre",
        EN: "registered between",
    },
    and: {
        PT: "e",
        EN: "and",
    },
    communication: {
        PT: "Comunicação",
        EN: "Communication",
    },
    internal: {
        PT: "Interno",
        EN: "Internal",
    },
    byteOrder: {
        PT: "Ordem dos Bytes",
        EN: "Byte Order",
    },
    functionCode: {
        PT: "Função",
        EN: "Function",
    },
    functionCodeInfo: {
        PT:
            "Define o tipo de operação Modbus utilizada para comunicar com o dispositivo, indicando que tipo de dados são lidos:\n\n" +
            "• READ_OUT_COILS (01) — Lê bobinas (Coils). Utilizado para estados digitais de saída, tipicamente ON/OFF.\n" +
            "• READ_IN_COILS (02) — Lê entradas discretas. Utilizado para estados digitais de entrada.\n" +
            "• READ_HOLD_REGS (03) — Lê registos de retenção (Holding Registers). Utilizado para valores analógicos ou parâmetros configuráveis.\n" +
            "• READ_IN_REGS (04) — Lê registos de entrada (Input Registers). Utilizado para valores analógicos apenas de leitura.",
        EN:
            "Defines the Modbus operation used to communicate with the device, indicating which type of data is read:\n\n" +
            "• READ_OUT_COILS (01) — Reads Coils. Used for digital output states, typically ON/OFF values.\n" +
            "• READ_IN_COILS (02) — Reads Discrete Inputs. Used for digital input states.\n" +
            "• READ_HOLD_REGS (03) — Reads Holding Registers. Used for analog values or configurable parameters.\n" +
            "• READ_IN_REGS (04) — Reads Input Registers. Used for read-only analog values.",
    },
    byteOrderInfo: {
        PT:
            "Define a ordem dos bytes e das palavras (16 bits) utilizada para interpretar valores com mais de um registo Modbus:\n\n" +
            "• BIG_ENDIAN — Ordem padrão Modbus. Os bytes e palavras são interpretados na ordem original.\n" +
            "• WORD_SWAP — As palavras de 16 bits são trocadas entre si, mantendo a ordem dos bytes dentro de cada palavra.\n" +
            "• BYTE_SWAP — Os bytes dentro de cada palavra de 16 bits são trocados, mantendo a ordem das palavras.\n" +
            "• WORD_BYTE_SWAP — Troca simultaneamente a ordem das palavras de 16 bits e a ordem dos bytes dentro de cada palavra.",
        EN:
            "Defines the byte and word (16-bit) order used to interpret values spanning multiple Modbus registers:\n\n" +
            "• BIG_ENDIAN — Standard Modbus order. Bytes and words are interpreted in their original order.\n" +
            "• WORD_SWAP — The 16-bit words are swapped, while the byte order within each word is preserved.\n" +
            "• BYTE_SWAP — The bytes within each 16-bit word are swapped, while the word order is preserved.\n" +
            "• WORD_BYTE_SWAP — Both the 16-bit word order and the byte order within each word are swapped.",
    },
};

export const texts = createLangStore(textsObject);
