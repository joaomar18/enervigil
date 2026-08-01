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
    # NOTE: for DIRECT/DELTA modes, update_direction() is invoked with the delta
    # rather than the new total (unlike __set_value_normal), so direction here
    # reflects delta-vs-previous-total, not whether the counter is rising overall.
    assert node.processor.negative_direction is True


def test_counter_delta_mode_accumulates():
    node = make_node(is_counter=True, counter_mode=CounterMode.DELTA)
    assert isinstance(node.processor, FloatNodeProcessor)
    node.processor.set_value(5)
    assert node.processor.value == 5
    assert node.processor.positive_direction is True
    node.processor.set_value(3)
    assert node.processor.value == 8
    # See note above: direction compares the incoming delta (3) against the
    # previous running total (5), not against the previous delta or zero.
    assert node.processor.negative_direction is True


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
