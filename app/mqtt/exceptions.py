###########EXTERNAL IMPORTS############

#######################################

#############LOCAL IMPORTS#############

#######################################


class PortInvalidError(Exception):
    """Raised when the MQTT port is invalid."""

    pass


class AuthInvalidError(Exception):
    """Raised when the MQTT authentication is invalid."""

    pass
