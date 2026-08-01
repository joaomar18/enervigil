########### EXTERNAL IMPORTS ############

import pytest
from typing import Any, Dict

#########################################

############# LOCAL IMPORTS #############

from model.controller.node import NodeType, NodeConfig
from model.controller.general import Protocol

#########################################


def make_config(**kwargs: Any) -> NodeConfig:
    defaults: Dict[str, Any] = dict(name="value", type=NodeType.FLOAT, unit="V")
    defaults.update(kwargs)
    return NodeConfig(**defaults)


def test_invalid_protocol_raises_value_error():
    config = make_config(protocol="NOT_A_PROTOCOL")
    with pytest.raises(ValueError):
        config.validate()


def test_valid_protocol_passes():
    config = make_config(protocol=Protocol.MODBUS_RTU)
    config.validate()


def test_bool_type_auto_fixes_incompatible_settings_instead_of_raising():
    # NOTE: for BOOL/STRING types, validate() resets is_counter/alarms/unit to
    # their default "off" state *before* checking them, so the subsequent
    # "not applicable to BOOL/STRING nodes" checks can never actually raise.
    config = make_config(
        type=NodeType.BOOL,
        unit="V",
        is_counter=True,
        min_alarm=True,
        min_alarm_value=1.0,
    )
    config.validate()
    assert config.is_counter is False
    assert config.min_alarm is False
    assert config.min_alarm_value is None
    assert config.unit is None


def test_string_type_auto_fixes_unit_to_none():
    config = make_config(type=NodeType.STRING, unit="text-unit")
    config.validate()
    assert config.unit is None


def test_counter_node_with_alarms_raises():
    config = make_config(is_counter=True, counter_mode=None, min_alarm=True, min_alarm_value=1.0)
    with pytest.raises(ValueError):
        config.validate()


@pytest.mark.parametrize(
    "kwargs",
    [
        dict(min_alarm=True, min_alarm_value=None),
        dict(max_alarm=True, max_alarm_value=None),
        dict(min_warning=True, min_warning_value=None),
        dict(max_warning=True, max_warning_value=None),
    ],
)
def test_alarm_or_warning_enabled_without_threshold_raises(kwargs):
    config = make_config(**kwargs)
    with pytest.raises(ValueError):
        config.validate()


def test_alarm_with_threshold_passes():
    config = make_config(min_alarm=True, min_alarm_value=1.0, max_alarm=True, max_alarm_value=99.0)
    config.validate()


def test_logging_with_non_positive_period_raises():
    config = make_config(logging=True, logging_period=0)
    with pytest.raises(ValueError):
        config.validate()


def test_logging_with_non_int_period_raises():
    config = make_config(logging=True, logging_period=1.5)
    with pytest.raises(ValueError):
        config.validate()


def test_logging_with_positive_int_period_passes():
    config = make_config(logging=True, logging_period=15)
    config.validate()


def test_non_float_type_auto_resets_decimal_places():
    config = make_config(type=NodeType.INT, unit=None, decimal_places=5)
    config.validate()
    assert config.decimal_places is None


def test_float_type_requires_int_decimal_places():
    config = make_config(decimal_places=None)
    with pytest.raises(ValueError):
        config.validate()


def test_float_type_rejects_non_int_decimal_places():
    config = make_config(decimal_places=2.5)
    with pytest.raises(ValueError):
        config.validate()


def test_float_type_with_valid_decimal_places_passes():
    config = make_config(decimal_places=2)
    config.validate()
