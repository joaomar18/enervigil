########### EXTERNAL IMPORTS ############

import pytest
from typing import Optional
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

#########################################

############# LOCAL IMPORTS #############

import util.functions.meter as meter_util
from controller.node.node import Node
from model.controller.node import NodeType, NodeConfig, NodePhase, NodeDirection, BaseNodeProtocolOptions
from model.controller.device import EnergyMeterType
from model.date import TimeSpanParameters, FormattedTimeStep

#########################################


def make_node(name: str, type: NodeType = NodeType.FLOAT, unit: Optional[str] = "V") -> Node:
    return Node(NodeConfig(name=name, type=type, unit=unit), BaseNodeProtocolOptions())


###############     N O D E   N A M I N G     ###############


def test_get_node_prefix_from_node_name():
    node = make_node("l1_voltage")
    assert meter_util.get_node_prefix(node=node) == "l1_"


def test_get_node_prefix_from_node_name_line_to_line():
    # NodePrefix.L1 ("l1_") is declared before NodePrefix.L1_L2 ("l1_l2_"), and
    # get_node_prefix returns the first matching prefix in declaration order, so
    # a line-to-line name resolves to the shorter single-phase prefix here.
    node = make_node("l1_l2_voltage")
    assert meter_util.get_node_prefix(node=node) == "l1_"


def test_get_node_prefix_no_prefix_in_name():
    node = make_node("custom_metric")
    assert meter_util.get_node_prefix(node=node) == ""


def test_get_node_prefix_from_phase():
    assert meter_util.get_node_prefix(phase=NodePhase.TOTAL) == "total_"
    assert meter_util.get_node_prefix(phase=NodePhase.L2) == "l2_"


def test_get_node_prefix_no_args_returns_empty_string():
    assert meter_util.get_node_prefix() == ""


@pytest.mark.parametrize(
    "name,expected",
    [
        ("l1_voltage", "voltage"),
        ("l2_active_power", "active_power"),
        ("total_active_energy", "active_energy"),
        ("l1_l2_voltage", "voltage"),
        ("l3_l1_voltage", "voltage"),
        ("frequency", "frequency"),  # no prefix present
    ],
)
def test_remove_phase_string(name, expected):
    assert meter_util.remove_phase_string(name) == expected


def test_create_node_name_with_direction():
    name = meter_util.create_node_name("active_energy", NodePhase.L1, NodeDirection.FORWARD)
    assert name == "l1_forward_active_energy"


def test_create_node_name_without_direction():
    name = meter_util.create_node_name("power", NodePhase.TOTAL, None)
    assert name == "total_power"


###############     M E T E R   T Y P E   A T T R I B U T E S     ###############


def test_create_default_node_attributes_single_phase():
    attrs = meter_util.create_default_node_attributes(EnergyMeterType.SINGLE_PHASE)
    assert attrs.phase == NodePhase.SINGLEPHASE


def test_create_default_node_attributes_three_phase():
    attrs = meter_util.create_default_node_attributes(EnergyMeterType.THREE_PHASE)
    assert attrs.phase == NodePhase.GENERAL


def test_create_default_node_attributes_invalid_type_raises():
    with pytest.raises(ValueError):
        meter_util.create_default_node_attributes("NOT_A_TYPE")  # type: ignore[arg-type]


###############     N O D E   L O O K U P     ###############


def test_find_node_returns_none_when_missing():
    assert meter_util.find_node("missing", {}) is None


def test_find_node_returns_existing_node():
    node = make_node("voltage")
    assert meter_util.find_node("voltage", {"voltage": node}) is node


def test_get_node_raises_key_error_when_missing():
    with pytest.raises(KeyError):
        meter_util.get_node("missing", {})


def test_get_numeric_value_none_when_node_missing():
    assert meter_util.get_numeric_value(None) is None


def test_get_numeric_value_none_for_non_numeric_processor():
    node = make_node("status", type=NodeType.STRING, unit=None)
    node.processor.set_value("ok")
    assert meter_util.get_numeric_value(node) is None


def test_get_numeric_value_returns_value_for_numeric_processor():
    node = make_node("voltage")
    node.processor.set_value(230.0)
    assert meter_util.get_numeric_value(node) == 230.0


def test_get_numeric_node_with_value():
    node = make_node("voltage")
    node.processor.set_value(230.0)
    nodes = {"voltage": node}
    result_node, value = meter_util.get_numeric_node_with_value("voltage", nodes)
    assert result_node is node
    assert value == 230.0


###############     E M P T Y   L O G   H E L P E R S     ###############


def make_time_span(formatted=True) -> TimeSpanParameters:
    return TimeSpanParameters(
        start_time=datetime(2024, 1, 1, tzinfo=timezone.utc),
        end_time=datetime(2024, 1, 1, 2, tzinfo=timezone.utc),
        time_step=FormattedTimeStep._1h,
        formatted=formatted,
        time_zone=ZoneInfo("UTC"),
    )


def test_get_empty_log_points_returns_empty_when_not_formatted():
    span = make_time_span(formatted=False)
    assert meter_util.get_empty_log_points(numeric=True, incremental=True, time_span=span) == []


def test_get_empty_log_points_numeric_incremental():
    span = make_time_span()
    points = meter_util.get_empty_log_points(numeric=True, incremental=True, time_span=span)
    assert len(points) == 2
    assert points[0] == {"start_time": "2024-01-01T00:00+00:00", "end_time": "2024-01-01T01:00+00:00", "value": None}


def test_get_empty_log_points_numeric_non_incremental():
    span = make_time_span()
    points = meter_util.get_empty_log_points(numeric=True, incremental=False, time_span=span)
    assert points[0] == {
        "start_time": "2024-01-01T00:00+00:00",
        "end_time": "2024-01-01T01:00+00:00",
        "average_value": None,
        "min_value": None,
        "max_value": None,
    }


def test_get_empty_log_points_non_numeric():
    span = make_time_span()
    points = meter_util.get_empty_log_points(numeric=False, incremental=False, time_span=span)
    assert points[0] == {"start_time": "2024-01-01T00:00+00:00", "end_time": "2024-01-01T01:00+00:00", "value": None}


def test_get_empty_log_global_metrics_numeric_incremental():
    assert meter_util.get_empty_log_global_metrics(numeric=True, incremental=True) == {"value": None}


def test_get_empty_log_global_metrics_numeric_non_incremental():
    metrics = meter_util.get_empty_log_global_metrics(numeric=True, incremental=False)
    assert metrics == {
        "average_value": None,
        "min_value": None,
        "max_value": None,
        "min_value_start_time": None,
        "min_value_end_time": None,
        "max_value_start_time": None,
        "max_value_end_time": None,
    }


def test_get_empty_log_global_metrics_non_numeric():
    assert meter_util.get_empty_log_global_metrics(numeric=False, incremental=False) == {"value": None}
