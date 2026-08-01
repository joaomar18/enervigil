########### EXTERNAL IMPORTS ############

import pytest

#########################################

############# LOCAL IMPORTS #############

import controller.meter.validation as meter_validation
from controller.node.node import Node
from model.controller.node import NodeType, NodeConfig, CounterMode, NodeDirection, BaseNodeProtocolOptions
from model.controller.device import EnergyMeterType, EnergyMeterOptions
from controller.exceptions import UnitError, NodeUnknownError, NodeMissingError, LoggingPeriodError, NodeInvalidOptionError

#########################################


def make_node(name: str, unit="V", **kwargs) -> Node:
    return Node(NodeConfig(name=name, type=NodeType.FLOAT, unit=unit, **kwargs), BaseNodeProtocolOptions())


###############     V A L I D A T E   N O D E     ###############


def test_validate_node_custom_bypasses_all_checks():
    node = make_node("anything_goes", unit="banana", custom=True)
    meter_validation.validate_node(node, valid_nodes=set(), valid_units=set())


def test_validate_node_unknown_base_name_raises():
    node = make_node("l1_unknown_metric")
    with pytest.raises(NodeUnknownError):
        meter_validation.validate_node(node, valid_nodes={"voltage"}, valid_units={"V"})


def test_validate_node_no_valid_units_raises_unit_error():
    node = make_node("l1_voltage")
    with pytest.raises(UnitError):
        meter_validation.validate_node(node, valid_nodes={"voltage"}, valid_units=None)


def test_validate_node_invalid_unit_raises_unit_error():
    node = make_node("l1_voltage", unit="furlongs")
    with pytest.raises(UnitError):
        meter_validation.validate_node(node, valid_nodes={"voltage"}, valid_units={"V"})


def test_validate_node_passes_for_known_name_and_unit():
    node = make_node("l1_voltage", unit="V")
    meter_validation.validate_node(node, valid_nodes={"voltage"}, valid_units={"V"})


###############     L O G G I N G   C O N S I S T E N C Y     ###############


def test_logging_consistency_raises_when_periods_mismatch():
    n1 = make_node("l1_voltage", logging=True, logging_period=15)
    n2 = make_node("l2_voltage", logging=True, logging_period=30)
    with pytest.raises(LoggingPeriodError):
        meter_validation.validate_logging_consistency({"l1_voltage": n1, "l2_voltage": n2})


def test_logging_consistency_passes_when_periods_match():
    n1 = make_node("l1_voltage", logging=True, logging_period=15)
    n2 = make_node("l2_voltage", logging=True, logging_period=15)
    meter_validation.validate_logging_consistency({"l1_voltage": n1, "l2_voltage": n2})


def test_logging_consistency_ignores_custom_nodes():
    n1 = make_node("l1_voltage", logging=True, logging_period=15)
    n2 = make_node("weird_voltage_thing", logging=True, logging_period=30, custom=True)
    meter_validation.validate_logging_consistency({"l1_voltage": n1, "weird_voltage_thing": n2})


def test_logging_consistency_node_to_check_not_logging_returns_early():
    n1 = make_node("l1_voltage", logging=True, logging_period=15)
    n2 = make_node("l2_voltage", logging=False, logging_period=30)
    # n2 isn't logging-enabled, so checking it should be a no-op regardless of n1's period.
    meter_validation.validate_logging_consistency({"l1_voltage": n1, "l2_voltage": n2}, node_to_check=n2)


def test_logging_consistency_node_to_check_detects_mismatch_in_its_category():
    n1 = make_node("l1_voltage", logging=True, logging_period=15)
    n2 = make_node("l2_voltage", logging=True, logging_period=30)
    with pytest.raises(LoggingPeriodError):
        meter_validation.validate_logging_consistency({"l1_voltage": n1, "l2_voltage": n2}, node_to_check=n2)


###############     E N E R G Y   N O D E   V A L I D A T I O N     ###############


def test_validate_energy_nodes_absent_node_is_noop():
    meter_validation.validate_energy_nodes("l1_", "active", NodeDirection.TOTAL, {}, EnergyMeterType.THREE_PHASE, EnergyMeterOptions())


def test_validate_energy_nodes_non_counter_raises():
    node = make_node("l1_active_energy", unit="Wh", is_counter=False)
    with pytest.raises(NodeInvalidOptionError):
        meter_validation.validate_energy_nodes(
            "l1_", "active", NodeDirection.TOTAL, {"l1_active_energy": node}, EnergyMeterType.THREE_PHASE, EnergyMeterOptions()
        )


def test_validate_energy_nodes_not_calculated_returns_early():
    node = make_node("l1_active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.CUMULATIVE, calculated=False)
    meter_validation.validate_energy_nodes(
        "l1_", "active", NodeDirection.TOTAL, {"l1_active_energy": node}, EnergyMeterType.THREE_PHASE, EnergyMeterOptions()
    )


def test_validate_energy_nodes_calculated_non_total_direction_raises():
    node = make_node(
        "l1_forward_active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.CUMULATIVE, calculated=True
    )
    with pytest.raises(NodeInvalidOptionError):
        meter_validation.validate_energy_nodes(
            "l1_",
            "active",
            NodeDirection.FORWARD,
            {"l1_forward_active_energy": node},
            EnergyMeterType.THREE_PHASE,
            EnergyMeterOptions(),
        )


def test_validate_energy_nodes_total_three_phase_missing_phases_raises():
    node = make_node("total_active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.CUMULATIVE, calculated=True)
    with pytest.raises(NodeMissingError):
        meter_validation.validate_energy_nodes(
            "total_", "active", NodeDirection.TOTAL, {"total_active_energy": node}, EnergyMeterType.THREE_PHASE, EnergyMeterOptions()
        )


def test_validate_energy_nodes_total_three_phase_complete_passes():
    total_node = make_node("total_active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.CUMULATIVE, calculated=True)
    nodes = {"total_active_energy": total_node}
    for p in ("l1_", "l2_", "l3_"):
        nodes[f"{p}active_energy"] = make_node(f"{p}active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.CUMULATIVE)
    meter_validation.validate_energy_nodes("total_", "active", NodeDirection.TOTAL, nodes, EnergyMeterType.THREE_PHASE, EnergyMeterOptions())


def test_validate_energy_nodes_cumulative_missing_forward_reverse_raises():
    node = make_node("active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.CUMULATIVE, calculated=True)
    with pytest.raises(NodeMissingError):
        meter_validation.validate_energy_nodes(
            "", "active", NodeDirection.TOTAL, {"active_energy": node}, EnergyMeterType.SINGLE_PHASE, EnergyMeterOptions()
        )


def test_validate_energy_nodes_cumulative_with_forward_reverse_passes():
    node = make_node("active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.CUMULATIVE, calculated=True)
    nodes = {
        "active_energy": node,
        "forward_active_energy": make_node("forward_active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.DIRECT),
        "reverse_active_energy": make_node("reverse_active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.DIRECT),
    }
    meter_validation.validate_energy_nodes("", "active", NodeDirection.TOTAL, nodes, EnergyMeterType.SINGLE_PHASE, EnergyMeterOptions())


def test_validate_energy_nodes_delta_missing_power_raises():
    node = make_node("active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.DELTA, calculated=True)
    with pytest.raises(NodeMissingError):
        meter_validation.validate_energy_nodes(
            "", "active", NodeDirection.TOTAL, {"active_energy": node}, EnergyMeterType.SINGLE_PHASE, EnergyMeterOptions()
        )


def test_validate_energy_nodes_delta_with_power_passes():
    node = make_node("active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.DELTA, calculated=True)
    nodes = {"active_energy": node, "active_power": make_node("active_power", unit="W")}
    meter_validation.validate_energy_nodes("", "active", NodeDirection.TOTAL, nodes, EnergyMeterType.SINGLE_PHASE, EnergyMeterOptions())


def test_validate_energy_nodes_direct_mode_calculated_raises_invalid_option():
    node = make_node("active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.DIRECT, calculated=True)
    with pytest.raises(NodeInvalidOptionError):
        meter_validation.validate_energy_nodes(
            "", "active", NodeDirection.TOTAL, {"active_energy": node}, EnergyMeterType.SINGLE_PHASE, EnergyMeterOptions()
        )


###############     P O W E R   N O D E   V A L I D A T I O N     ###############


def test_validate_power_nodes_absent_or_not_calculated_is_noop():
    meter_validation.validate_power_nodes("l1_", "active", {}, EnergyMeterType.THREE_PHASE)
    node = make_node("l1_active_power", calculated=False)
    meter_validation.validate_power_nodes("l1_", "active", {"l1_active_power": node}, EnergyMeterType.THREE_PHASE)


def test_validate_power_nodes_total_three_phase_missing_raises():
    node = make_node("total_active_power", calculated=True)
    with pytest.raises(NodeMissingError):
        meter_validation.validate_power_nodes("total_", "active", {"total_active_power": node}, EnergyMeterType.THREE_PHASE)


def test_validate_power_nodes_active_from_v_i_pf_passes():
    node = make_node("l1_active_power", calculated=True)
    nodes = {
        "l1_active_power": node,
        "l1_voltage": make_node("l1_voltage"),
        "l1_current": make_node("l1_current", unit="A"),
        "l1_power_factor": make_node("l1_power_factor", unit=""),
    }
    meter_validation.validate_power_nodes("l1_", "active", nodes, EnergyMeterType.THREE_PHASE)


def test_validate_power_nodes_active_from_apparent_reactive_passes():
    node = make_node("l1_active_power", calculated=True)
    nodes = {
        "l1_active_power": node,
        "l1_apparent_power": make_node("l1_apparent_power"),
        "l1_reactive_power": make_node("l1_reactive_power"),
    }
    meter_validation.validate_power_nodes("l1_", "active", nodes, EnergyMeterType.THREE_PHASE)


def test_validate_power_nodes_active_missing_dependencies_raises():
    node = make_node("l1_active_power", calculated=True)
    with pytest.raises(NodeMissingError):
        meter_validation.validate_power_nodes("l1_", "active", {"l1_active_power": node}, EnergyMeterType.THREE_PHASE)


def test_validate_power_nodes_apparent_from_v_i_passes():
    node = make_node("l1_apparent_power", calculated=True)
    nodes = {
        "l1_apparent_power": node,
        "l1_voltage": make_node("l1_voltage"),
        "l1_current": make_node("l1_current", unit="A"),
    }
    meter_validation.validate_power_nodes("l1_", "apparent", nodes, EnergyMeterType.THREE_PHASE)


###############     P O W E R   F A C T O R   N O D E   V A L I D A T I O N     ###############


def test_validate_pf_nodes_absent_or_not_calculated_is_noop():
    meter_validation.validate_pf_nodes("l1_", {}, EnergyMeterType.THREE_PHASE)
    node = make_node("l1_power_factor", unit="", calculated=False)
    meter_validation.validate_pf_nodes("l1_", {"l1_power_factor": node}, EnergyMeterType.THREE_PHASE)


def test_validate_pf_nodes_total_three_phase_missing_raises():
    node = make_node("total_power_factor", unit="", calculated=True)
    with pytest.raises(NodeMissingError):
        meter_validation.validate_pf_nodes("total_", {"total_power_factor": node}, EnergyMeterType.THREE_PHASE)


def test_validate_pf_nodes_per_phase_missing_raises():
    node = make_node("l1_power_factor", unit="", calculated=True)
    with pytest.raises(NodeMissingError):
        meter_validation.validate_pf_nodes("l1_", {"l1_power_factor": node}, EnergyMeterType.THREE_PHASE)


def test_validate_pf_nodes_per_phase_complete_passes():
    node = make_node("l1_power_factor", unit="", calculated=True)
    nodes = {
        "l1_power_factor": node,
        "l1_active_power": make_node("l1_active_power"),
        "l1_reactive_power": make_node("l1_reactive_power"),
    }
    meter_validation.validate_pf_nodes("l1_", nodes, EnergyMeterType.THREE_PHASE)
