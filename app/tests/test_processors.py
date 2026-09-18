########### EXTERNAL IMPORTS ############

import pytest
from typing import Any, Dict
from datetime import datetime, timezone, timedelta

#########################################

############# LOCAL IMPORTS #############

from controller.node.node import Node
from model.controller.node import NodeType, NodeConfig, CounterMode, BaseNodeProtocolOptions
from controller.node.processor.float_processor import FloatNodeProcessor
from controller.node.processor.int_processor import IntNodeProcessor
from controller.node.processor.bool_processor import BoolNodeProcessor
from controller.node.processor.string_processor import StringNodeProcessor

#########################################


def make_node(**kwargs: Any) -> Node:
    defaults: Dict[str, Any] = dict(name="value", type=NodeType.FLOAT, unit="V")
    defaults.update(kwargs)
    return Node(NodeConfig(**defaults), BaseNodeProtocolOptions())


###############     B A S E   P R O C E S S O R     ###############


def test_disabled_node_ignores_set_value():
    node = make_node(enabled=False)
    node.processor.set_value(10)
    assert node.processor.value is None


def test_set_value_none_clears_value():
    node = make_node()
    node.processor.set_value(10)
    node.processor.set_value(None)
    assert node.processor.value is None


def test_is_healthy_true_only_without_value_or_alarms():
    node = make_node()
    assert node.processor.is_healthy() is False  # no value yet

    node.processor.set_value(10)
    assert node.processor.is_healthy() is True

    node.processor.min_alarm_state = True
    assert node.processor.is_healthy() is False
    assert node.processor.in_alarm() is True
    assert node.processor.in_warning() is False


def test_reset_alarms_clears_all_flags():
    node = make_node()
    node.processor.min_alarm_state = True
    node.processor.max_warning_state = True
    node.processor.reset_alarms()
    assert node.processor.min_alarm_state is False
    assert node.processor.max_alarm_state is False
    assert node.processor.min_warning_state is False
    assert node.processor.max_warning_state is False


def test_elapsed_time_tracked_between_updates():
    node = make_node()
    assert node.processor.elapsed_time is None
    node.processor.set_value(1)
    assert node.processor.elapsed_time == 0.0
    node.processor.set_value(2)
    assert node.processor.elapsed_time is not None
    assert node.processor.elapsed_time >= 0.0


def test_create_extended_info_includes_alarm_thresholds():
    node = make_node(min_alarm=True, min_alarm_value=1.0, max_alarm=True, max_alarm_value=99.0)
    info = node.get_extended_info()
    assert info["min_alarm_value"] == 1.0
    assert info["max_alarm_value"] == 99.0
    assert "min_warning_value" not in info


def test_submit_log_sets_name_time_span_and_last_log_datetime():
    node = make_node(logging=True, logging_period=15)
    node.processor.set_value(10)
    now = datetime.now(timezone.utc)
    log = node.processor.submit_log(now)
    assert log["name"] == "value"
    assert log["end_time"] == now
    assert log["start_time"] == now - timedelta(minutes=15)
    assert node.processor.last_log_datetime == now


###############     N U M E R I C   P R O C E S S O R S     ###############


def test_float_processor_tracks_min_max_and_direction():
    node = make_node(decimal_places=2)
    assert isinstance(node.processor, FloatNodeProcessor)
    node.processor.set_value(10)
    node.processor.set_value(15)
    assert node.processor.value == 15
    assert node.processor.min_value == 10
    assert node.processor.max_value == 15
    assert node.processor.positive_direction is True
    assert node.processor.negative_direction is False

    node.processor.set_value(5)
    assert node.processor.min_value == 5
    assert node.processor.max_value == 15
    assert node.processor.positive_direction is False
    assert node.processor.negative_direction is True


def test_int_processor_basic_value_type():
    node = make_node(type=NodeType.INT, decimal_places=None)
    assert isinstance(node.processor, IntNodeProcessor)
    node.processor.set_value(3)
    assert node.processor.value == 3


def test_alarm_and_warning_thresholds():
    node = make_node(min_alarm=True, min_alarm_value=10.0, max_alarm=True, max_alarm_value=20.0, min_warning=True, min_warning_value=12.0, max_warning=True, max_warning_value=18.0)

    node.processor.set_value(5)  # below min_alarm and min_warning
    assert node.processor.min_alarm_state is True
    assert node.processor.min_warning_state is True
    assert node.processor.max_alarm_state is False
    assert node.processor.in_alarm() is True
    assert node.processor.in_warning() is True

    node.processor.set_value(15)  # within all thresholds
    assert node.processor.min_alarm_state is False
    assert node.processor.min_warning_state is False
    assert node.processor.max_alarm_state is False
    assert node.processor.max_warning_state is False

    node.processor.set_value(25)  # above max_alarm and max_warning
    assert node.processor.max_alarm_state is True
    assert node.processor.max_warning_state is True


def test_counter_direct_mode_passes_raw_value_through():
    node = make_node(is_counter=True, counter_mode=CounterMode.DIRECT)
    assert isinstance(node.processor, FloatNodeProcessor)
    node.processor.set_value(100)
    assert node.processor.value == 100
    node.processor.set_value(150)
    assert node.processor.value == 150
    assert node.processor.positive_direction is True
    assert node.processor.negative_direction is False


def test_counter_delta_mode_accumulates():
    node = make_node(is_counter=True, counter_mode=CounterMode.DELTA)
    assert isinstance(node.processor, FloatNodeProcessor)
    node.processor.set_value(5)
    assert node.processor.value == 5
    assert node.processor.positive_direction is True
    node.processor.set_value(3)
    assert node.processor.value == 8
    assert node.processor.positive_direction is True
    assert node.processor.negative_direction is False


def test_counter_cumulative_mode_tracks_delta_from_initial():
    node = make_node(is_counter=True, counter_mode=CounterMode.CUMULATIVE)
    assert isinstance(node.processor, FloatNodeProcessor)
    node.processor.set_value(100)
    assert node.processor.value == 0
    node.processor.set_value(150)
    assert node.processor.value == 50
    assert node.processor.positive_direction is True
    node.processor.set_value(140)
    assert node.processor.value == 40
    assert node.processor.negative_direction is True


@pytest.mark.parametrize("node_type", [NodeType.INT, NodeType.FLOAT])
@pytest.mark.parametrize("mode", [None, CounterMode.DIRECT, CounterMode.DELTA, CounterMode.CUMULATIVE])
def test_direction_tracks_changes_and_preserves_direction_when_unchanged(node_type, mode):
    node = make_node(type=node_type, is_counter=mode is not None, counter_mode=mode)
    readings = [0, 50, 10, 0, -20, 0] if mode is CounterMode.DELTA else [100, 150, 160, 160, 140, 140]
    directions = [(False, False), (True, False), (True, False), (True, False), (False, True), (False, True)]

    for reading, expected in zip(readings, directions):
        node.processor.set_value(reading)
        assert (node.processor.positive_direction, node.processor.negative_direction) == expected

    node.processor.set_value(None)
    assert node.processor.value is None
    assert node.processor.positive_direction is False
    assert node.processor.negative_direction is False


@pytest.mark.parametrize("reading,expected", [(150, (False, False)), (155, (True, False)), (145, (False, True))])
@pytest.mark.parametrize("disconnected", [False, True])
def test_cumulative_direction_uses_raw_readings_across_logging_reset(reading, expected, disconnected):
    node = make_node(is_counter=True, counter_mode=CounterMode.CUMULATIVE)
    node.processor.set_value(100)
    node.processor.set_value(150)
    node.processor.submit_log(datetime.now(timezone.utc))
    if disconnected:
        node.processor.set_value(None)

    node.processor.set_value(reading)
    assert node.processor.value == reading - 150
    assert (node.processor.positive_direction, node.processor.negative_direction) == expected


def test_counter_missing_mode_raises_value_error():
    node = make_node(is_counter=True)  # counter_mode left as None
    with pytest.raises(ValueError):
        node.processor.set_value(10)


def test_reset_value_clears_statistics_and_direction_but_keeps_last_value():
    # NumericNodeProcessor.reset_value() intentionally retains the last known
    # value (used for display) while clearing period-scoped statistics.
    node = make_node()
    assert isinstance(node.processor, FloatNodeProcessor)
    node.processor.set_value(10)
    node.processor.set_value(20)
    node.processor.reset_value()
    assert node.processor.value == 20
    assert node.processor.min_value is None
    assert node.processor.max_value is None
    assert node.processor.mean_sum == 0.0
    assert node.processor.mean_count == 0
    assert node.processor.positive_direction is False
    assert node.processor.negative_direction is False


def test_publish_format_rounds_and_reports_int_without_decimal_places():
    node = make_node(type=NodeType.INT, decimal_places=None)
    node.processor.set_value(7)
    publish = node.get_publish_format()
    assert publish["value"] == 7
    assert "decimal_places" not in publish

    float_node = make_node(decimal_places=1)
    float_node.processor.set_value(3.14159)
    publish = float_node.get_publish_format()
    assert publish["value"] == 3.1
    assert publish["decimal_places"] == 1


def test_publish_format_reports_none_when_no_value():
    node = make_node()
    publish = node.get_publish_format()
    assert publish["value"] is None


def test_submit_log_non_counter_includes_mean_min_max_scaled_by_unit():
    node = make_node(unit="kW", decimal_places=2, logging=True)
    node.processor.set_value(1.0)
    node.processor.set_value(3.0)
    log = node.processor.submit_log(datetime.now(timezone.utc))
    # values are scaled to base unit (kW -> *1e3)
    assert log["mean_sum"] == pytest.approx(4000.0)
    assert log["mean_count"] == 2
    assert log["min_value"] == pytest.approx(1000.0)
    assert log["max_value"] == pytest.approx(3000.0)


def test_submit_log_counter_includes_scaled_value():
    node = make_node(unit="kWh", is_counter=True, counter_mode=CounterMode.DELTA)
    node.processor.set_value(2.0)
    log = node.processor.submit_log(datetime.now(timezone.utc))
    assert log["value"] == pytest.approx(2000.0)


@pytest.mark.parametrize(
    "node_type,unit,readings,expected_logs",
    [
        (NodeType.INT, "Wh", [100, 110, 115, 125, 125, 125], [10, 15, 0]),
        (NodeType.FLOAT, "Wh", [100.1, 110.2, 115.4, 125.6, 125.6, 125.6], [10.1, 15.4, 0]),
        (NodeType.FLOAT, "kWh", [0.1, 0.11, 0.115, 0.125, 0.125, 0.125], [10, 15, 0]),
    ],
)
def test_cumulative_counter_preserves_consumption_across_logging_periods(node_type, unit, readings, expected_logs):
    node = make_node(type=node_type, unit=unit, is_counter=True, counter_mode=CounterMode.CUMULATIVE)
    start = datetime(2026, 1, 1, tzinfo=timezone.utc)
    logged_values = []

    for period in range(3):
        node.processor.set_value(readings[period * 2])
        node.processor.set_value(readings[period * 2 + 1])
        log = node.processor.submit_log(start + timedelta(minutes=15 * (period + 1)))
        logged_values.append(log["value"])

    assert logged_values == pytest.approx(expected_logs)
    assert sum(logged_values) == pytest.approx(sum(expected_logs))


@pytest.mark.parametrize("disconnected", [False, True])
def test_cumulative_counter_empty_periods_do_not_repeat_consumption(disconnected):
    node = make_node(unit="Wh", is_counter=True, counter_mode=CounterMode.CUMULATIVE)
    start = datetime(2026, 1, 1, tzinfo=timezone.utc)
    assert node.processor.submit_log(start)["value"] is None

    node.processor.set_value(100)
    node.processor.set_value(110)
    assert node.processor.submit_log(start + timedelta(minutes=15))["value"] == 10
    assert node.processor.value == 10  # Keep the last value available for display.
    if disconnected:
        node.processor.set_value(None)

    assert node.processor.submit_log(start + timedelta(minutes=30))["value"] is None
    assert node.processor.submit_log(start + timedelta(minutes=45))["value"] is None

    node.processor.set_value(125)
    assert node.processor.submit_log(start + timedelta(minutes=60))["value"] == 15


def test_cumulative_counter_keeps_baseline_when_parent_resets_unlogged_node():
    node = make_node(unit="Wh", is_counter=True, counter_mode=CounterMode.CUMULATIVE)
    node.processor.set_value(100)
    node.processor.set_value(110)

    # Logging a total also resets its phase/directional nodes without submitting their own logs.
    node.processor.reset_value()
    node.processor.reset_value()
    node.processor.set_value(115)
    assert node.processor.value == 5
    node.processor.set_value(125)
    assert node.processor.value == 15


@pytest.mark.parametrize("mode,expected_logs", [(CounterMode.DELTA, [25, 13]), (CounterMode.DIRECT, [15, 8])])
def test_other_counter_modes_keep_their_logging_behavior(mode, expected_logs):
    node = make_node(unit="Wh", is_counter=True, counter_mode=mode)
    start = datetime(2026, 1, 1, tzinfo=timezone.utc)
    node.processor.set_value(10)
    node.processor.set_value(15)
    first = node.processor.submit_log(start)
    assert node.processor.submit_log(start + timedelta(minutes=15))["value"] is None

    node.processor.set_value(5)
    node.processor.set_value(8)
    second = node.processor.submit_log(start + timedelta(minutes=30))
    assert [first["value"], second["value"]] == expected_logs


def test_submit_log_non_counter_resets_stats_but_keeps_last_value():
    node = make_node(decimal_places=2, logging=True)
    assert isinstance(node.processor, FloatNodeProcessor)
    node.processor.set_value(1.0)
    node.processor.set_value(3.0)
    node.processor.submit_log(datetime.now(timezone.utc))
    assert node.processor.value == 3.0
    assert node.processor.min_value is None
    assert node.processor.max_value is None
    assert node.processor.mean_sum == 0.0
    assert node.processor.mean_count == 0


###############     B O O L   /   S T R I N G   P R O C E S S O R S     ###############


def test_bool_processor_set_and_publish():
    node = make_node(type=NodeType.BOOL, unit=None)
    assert isinstance(node.processor, BoolNodeProcessor)
    node.processor.set_value(True)
    assert node.processor.value is True
    publish = node.get_publish_format()
    assert publish["value"] is True


def test_bool_processor_check_alarms_not_implemented():
    node = make_node(type=NodeType.BOOL, unit=None)
    with pytest.raises(NotImplementedError):
        node.processor.check_alarms(True)


def test_string_processor_set_and_publish():
    node = make_node(type=NodeType.STRING, unit=None)
    assert isinstance(node.processor, StringNodeProcessor)
    node.processor.set_value("hello")
    assert node.processor.value == "hello"
    publish = node.get_publish_format()
    assert publish["value"] == "hello"


def test_string_processor_check_alarms_not_implemented():
    node = make_node(type=NodeType.STRING, unit=None)
    with pytest.raises(NotImplementedError):
        node.processor.check_alarms("x")


def test_string_processor_submit_log_includes_value():
    node = make_node(type=NodeType.STRING, unit=None, logging=True)
    node.processor.set_value("status_ok")
    log = node.processor.submit_log(datetime.now(timezone.utc))
    assert log["value"] == "status_ok"
    assert node.processor.last_log_datetime is not None
    # Base NodeProcessor.reset_value() is a no-op, so bool/string values persist across logs.
    assert node.processor.value == "status_ok"
