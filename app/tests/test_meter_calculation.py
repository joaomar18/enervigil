########### EXTERNAL IMPORTS ############

import pytest
import math

#########################################

############# LOCAL IMPORTS #############

import controller.meter.calculation as meter_calc
from controller.node.node import Node
from model.controller.node import NodeType, NodeConfig, CounterMode, BaseNodeProtocolOptions
from model.controller.device import EnergyMeterOptions, PowerFactorDirection

#########################################


def make_node(name: str, unit="W", **kwargs) -> Node:
    return Node(NodeConfig(name=name, type=NodeType.FLOAT, unit=unit, **kwargs), BaseNodeProtocolOptions())


###############     P O W E R     ###############


def test_apparent_power_from_active_reactive():
    p = make_node("l1_active_power")
    p.processor.set_value(3000)
    q = make_node("l1_reactive_power")
    q.processor.set_value(4000)
    target = make_node("l1_apparent_power")

    meter_calc.calculate_power("l1_", "apparent", target, {"l1_active_power": p, "l1_reactive_power": q})
    assert target.processor.value == pytest.approx(5000.0)


def test_apparent_power_from_voltage_current():
    v = make_node("l1_voltage")
    v.processor.set_value(230)
    i = make_node("l1_current", unit="A")
    i.processor.set_value(10)
    target = make_node("l1_apparent_power")

    meter_calc.calculate_power("l1_", "apparent", target, {"l1_voltage": v, "l1_current": i})
    assert target.processor.value == pytest.approx(2300.0)


def test_active_power_from_apparent_reactive():
    s = make_node("l1_apparent_power")
    s.processor.set_value(5000)
    q = make_node("l1_reactive_power")
    q.processor.set_value(4000)
    target = make_node("l1_active_power")

    meter_calc.calculate_power("l1_", "active", target, {"l1_apparent_power": s, "l1_reactive_power": q})
    assert target.processor.value == pytest.approx(3000.0)


def test_active_power_from_voltage_current_power_factor():
    v = make_node("l1_voltage")
    v.processor.set_value(230)
    i = make_node("l1_current", unit="A")
    i.processor.set_value(10)
    pf = make_node("l1_power_factor", unit="")
    pf.processor.set_value(0.9)
    target = make_node("l1_active_power")

    meter_calc.calculate_power("l1_", "active", target, {"l1_voltage": v, "l1_current": i, "l1_power_factor": pf})
    assert target.processor.value == pytest.approx(2070.0)


def test_reactive_power_from_apparent_active():
    s = make_node("l1_apparent_power")
    s.processor.set_value(5000)
    p = make_node("l1_active_power")
    p.processor.set_value(3000)
    target = make_node("l1_reactive_power")

    meter_calc.calculate_power("l1_", "reactive", target, {"l1_apparent_power": s, "l1_active_power": p})
    assert target.processor.value == pytest.approx(4000.0)


def test_reactive_power_from_voltage_current_power_factor():
    v = make_node("l1_voltage")
    v.processor.set_value(230)
    i = make_node("l1_current", unit="A")
    i.processor.set_value(10)
    pf = make_node("l1_power_factor", unit="")
    pf.processor.set_value(0.8)
    target = make_node("l1_reactive_power")

    meter_calc.calculate_power("l1_", "reactive", target, {"l1_voltage": v, "l1_current": i, "l1_power_factor": pf})
    assert target.processor.value == pytest.approx(2300 * 0.6, rel=1e-3)


@pytest.mark.parametrize(
    "power_type,unit,preferred,primary_value,fallback_value",
    [
        ("apparent", "kVA", ("active_power", "reactive_power"), 5, 2.3),
        ("active", "kW", ("apparent_power", "reactive_power"), 3, 1.84),
        ("reactive", "kVAr", ("apparent_power", "active_power"), 4, 1.38),
    ],
)
@pytest.mark.parametrize("missing_indices", [(0,), (1,), (0, 1)])
def test_power_falls_back_when_configured_power_readings_are_missing(
    power_type, unit, preferred, primary_value, fallback_value, missing_indices
):
    readings = {
        "voltage": ("kV", 0.23),
        "current": ("A", 10),
        "power_factor": ("", 0.8),
        "active_power": ("kW", 3),
        "reactive_power": ("kVAr", 4),
        "apparent_power": ("kVA", 5),
    }
    nodes = {}
    for name, (source_unit, value) in readings.items():
        source = make_node(f"l1_{name}", unit=source_unit)
        source.processor.set_value(value)
        nodes[f"l1_{name}"] = source
    target = make_node(f"l1_{power_type}_power", unit=unit)

    meter_calc.calculate_power("l1_", power_type, target, nodes)
    assert target.processor.value == pytest.approx(primary_value)

    for index in missing_indices:
        nodes[f"l1_{preferred[index]}"].processor.set_value(None)
    meter_calc.calculate_power("l1_", power_type, target, nodes)
    assert target.processor.value == pytest.approx(fallback_value)

    nodes["l1_current"].processor.set_value(None)
    meter_calc.calculate_power("l1_", power_type, target, nodes)
    assert target.processor.value is None

    for name in preferred:
        nodes[f"l1_{name}"].processor.set_value(readings[name][1])
    meter_calc.calculate_power("l1_", power_type, target, nodes)
    assert target.processor.value == pytest.approx(primary_value)

    nodes["l1_current"].processor.set_value(10)
    for name in preferred:
        nodes[f"l1_{name}"].processor.set_value(0)
    meter_calc.calculate_power("l1_", power_type, target, nodes)
    assert target.processor.value == 0


@pytest.mark.parametrize(
    "power_type,unit,source_name,source_unit,fallback_value",
    [
        ("active", "kW", "reactive_power", "VAr", 1.84),
        ("reactive", "kVAr", "active_power", "W", 1.38),
    ],
)
@pytest.mark.parametrize(
    "source_value,primary_value",
    [
        (600, 0.8), (-600, 0.8), (1000, 0), (-1000, 0),
        (1000.000001, None), (-1000.000001, None), (1500, None), (-1500, None),
    ],
)
@pytest.mark.parametrize("with_fallback", [False, True])
def test_power_handles_inconsistent_apparent_power_without_stale_values(
    power_type, unit, source_name, source_unit, fallback_value, source_value, primary_value, with_fallback
):
    apparent = make_node("l1_apparent_power", unit="kVA")
    apparent.processor.set_value(1)
    source = make_node(f"l1_{source_name}", unit=source_unit)
    source.processor.set_value(source_value)
    nodes = {"l1_apparent_power": apparent, f"l1_{source_name}": source}
    if with_fallback:
        for name, source_unit, value in [("voltage", "kV", 0.23), ("current", "A", 10), ("power_factor", "", 0.8)]:
            fallback_node = make_node(f"l1_{name}", unit=source_unit)
            fallback_node.processor.set_value(value)
            nodes[f"l1_{name}"] = fallback_node
    target = make_node(f"l1_{power_type}_power", unit=unit)
    target.processor.set_value(123)

    meter_calc.calculate_power("l1_", power_type, target, nodes)

    expected = fallback_value if primary_value is None and with_fallback else primary_value
    if expected is None:
        assert target.processor.value is None
    else:
        assert target.processor.value == pytest.approx(expected)

    source.processor.set_value(600)
    meter_calc.calculate_power("l1_", power_type, target, nodes)
    assert target.processor.value == pytest.approx(0.8)


@pytest.mark.parametrize("power_type,unit", [("active", "kW"), ("reactive", "kVAr")])
@pytest.mark.parametrize(
    "power_factor,active_value,reactive_value",
    [
        (0, 0, 2.3), (0.8, 1.84, 1.38), (1, 2.3, 0),
        (-1, None, None), (-0.8, None, None), (-0.000001, None, None),
        (-1.000001, None, None), (1.000001, None, None), (-1.2, None, None), (1.2, None, None),
    ],
)
def test_voltage_current_power_requires_valid_power_factor(power_type, unit, power_factor, active_value, reactive_value):
    nodes = {}
    for name, source_unit, value in [("voltage", "kV", 0.23), ("current", "A", 10), ("power_factor", "", power_factor)]:
        source = make_node(f"l1_{name}", unit=source_unit)
        source.processor.set_value(value)
        nodes[f"l1_{name}"] = source
    target = make_node(f"l1_{power_type}_power", unit=unit)
    target.processor.set_value(123)

    meter_calc.calculate_power("l1_", power_type, target, nodes)

    expected = active_value if power_type == "active" else reactive_value
    if expected is None:
        assert target.processor.value is None
    else:
        assert target.processor.value == pytest.approx(expected)


def test_power_missing_dependencies_leaves_value_none():
    target = make_node("l1_active_power")
    meter_calc.calculate_power("l1_", "active", target, {})
    assert target.processor.value is None


def test_total_power_sums_phases_with_output_scaling():
    nodes = {}
    for phase in ("l1_", "l2_", "l3_"):
        n = make_node(f"{phase}active_power")
        n.processor.set_value(1000)
        nodes[f"{phase}active_power"] = n
    target = make_node("total_active_power", unit="kW")

    meter_calc.calculate_power("total_", "active", target, nodes)
    assert target.processor.value == pytest.approx(3.0)  # 3000 W -> 3 kW


def test_total_power_missing_phase_sets_none():
    # All three phase nodes must exist (get_node() raises KeyError for a name
    # that was never configured at all); a phase with no reading yet (value is
    # still None) is what triggers the graceful "None" result.
    nodes = {
        "l1_active_power": make_node("l1_active_power"),
        "l2_active_power": make_node("l2_active_power"),
        "l3_active_power": make_node("l3_active_power"),
    }
    nodes["l1_active_power"].processor.set_value(1000)
    nodes["l2_active_power"].processor.set_value(1000)
    target = make_node("total_active_power")

    meter_calc.calculate_power("total_", "active", target, nodes)
    assert target.processor.value is None


def test_total_power_unconfigured_phase_raises_key_error():
    nodes = {
        "l1_active_power": make_node("l1_active_power"),
        "l2_active_power": make_node("l2_active_power"),
    }
    nodes["l1_active_power"].processor.set_value(1000)
    nodes["l2_active_power"].processor.set_value(1000)
    target = make_node("total_active_power")

    with pytest.raises(KeyError):
        meter_calc.calculate_power("total_", "active", target, nodes)


###############     E N E R G Y     ###############


def test_total_energy_sums_phases_with_output_scaling():
    nodes = {}
    for phase in ("l1_", "l2_", "l3_"):
        n = make_node(f"{phase}active_energy", unit="Wh")
        n.processor.set_value(1000)
        nodes[f"{phase}active_energy"] = n
    target = make_node("total_active_energy", unit="kWh")

    meter_calc.calculate_energy("total_", "active", target, nodes, EnergyMeterOptions())
    assert target.processor.value == pytest.approx(3.0)


def test_total_energy_missing_phase_sets_none():
    nodes = {f"{p}active_energy": make_node(f"{p}active_energy", unit="Wh") for p in ("l1_", "l2_", "l3_")}
    nodes["l1_active_energy"].processor.set_value(1000)
    target = make_node("total_active_energy", unit="kWh")

    meter_calc.calculate_energy("total_", "active", target, nodes, EnergyMeterOptions())
    assert target.processor.value is None


def test_cumulative_energy_tracks_delta_from_computed_baseline():
    # Target energy node uses CUMULATIVE mode: calculate_energy feeds the
    # forward-reverse difference through set_value(), so (matching plain
    # counter semantics) the *first* computed value becomes the node's own
    # baseline and subsequent values are deltas from it.
    forward = make_node("forward_active_energy", unit="Wh")
    reverse = make_node("reverse_active_energy", unit="Wh")
    target = make_node("active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.CUMULATIVE)
    nodes = {"forward_active_energy": forward, "reverse_active_energy": reverse}

    forward.processor.set_value(500)
    reverse.processor.set_value(200)
    meter_calc.calculate_energy("", "active", target, nodes, EnergyMeterOptions())
    assert target.processor.value == 0  # baseline call

    forward.processor.set_value(800)
    meter_calc.calculate_energy("", "active", target, nodes, EnergyMeterOptions())
    assert target.processor.value == pytest.approx(300.0)  # (800-200) - (500-200)


def test_cumulative_energy_missing_reverse_value_is_noop():
    forward = make_node("forward_active_energy", unit="Wh")
    forward.processor.set_value(500)
    reverse = make_node("reverse_active_energy", unit="Wh")  # present but never assigned a value
    target = make_node("active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.CUMULATIVE)

    meter_calc.calculate_energy(
        "", "active", target, {"forward_active_energy": forward, "reverse_active_energy": reverse}, EnergyMeterOptions()
    )
    assert target.processor.value is None


def test_delta_energy_integrates_power_over_elapsed_time():
    power = make_node("active_power", unit="W")
    power.processor.set_value(1000)
    # Simulate one elapsed hour since the processor's timestamp update; elapsed_time
    # is normally derived from wall-clock time between set_value() calls.
    power.processor.elapsed_time = 3600.0

    target = make_node("active_energy", unit="Wh", is_counter=True, counter_mode=CounterMode.DELTA)
    meter_calc.calculate_energy("", "active", target, {"active_power": power}, EnergyMeterOptions())
    assert target.processor.value == pytest.approx(1000.0)  # 1000 W for 1 hour = 1000 Wh


###############     P O W E R   F A C T O R     ###############


def test_pf_per_phase_from_active_reactive():
    p = make_node("l1_active_power")
    p.processor.set_value(3000)
    q = make_node("l1_reactive_power")
    q.processor.set_value(4000)
    target = make_node("l1_power_factor", unit="")

    meter_calc.calculate_pf("l1_", target, {"l1_active_power": p, "l1_reactive_power": q})
    assert target.processor.value == pytest.approx(0.6)


def test_pf_zero_active_power_returns_zero():
    p = make_node("l1_active_power")
    p.processor.set_value(0)
    q = make_node("l1_reactive_power")
    q.processor.set_value(500)
    target = make_node("l1_power_factor", unit="")

    meter_calc.calculate_pf("l1_", target, {"l1_active_power": p, "l1_reactive_power": q})
    assert target.processor.value == 0.0


def test_pf_missing_reactive_value_sets_none():
    p = make_node("l1_active_power")
    p.processor.set_value(3000)
    q = make_node("l1_reactive_power")  # never assigned a value
    target = make_node("l1_power_factor", unit="")

    meter_calc.calculate_pf("l1_", target, {"l1_active_power": p, "l1_reactive_power": q})
    assert target.processor.value is None


def test_pf_total_sums_phases():
    nodes = {}
    for phase in ("l1_", "l2_", "l3_"):
        p = make_node(f"{phase}active_power")
        p.processor.set_value(1000)
        q = make_node(f"{phase}reactive_power")
        q.processor.set_value(0)
        nodes[f"{phase}active_power"] = p
        nodes[f"{phase}reactive_power"] = q
    target = make_node("total_power_factor", unit="")

    meter_calc.calculate_pf("total_", target, nodes)
    assert target.processor.value == pytest.approx(1.0)


###############     P F   &   D I R E C T I O N   F R O M   E N E R G Y     ###############


def test_pf_and_direction_both_none_when_inputs_missing():
    pf, direction = meter_calc.calculate_pf_and_dir_with_energy(None, 10)
    assert pf is None
    assert direction is None


def test_pf_and_direction_unknown_when_both_zero():
    pf, direction = meter_calc.calculate_pf_and_dir_with_energy(0, 0)
    assert pf is None
    assert direction == PowerFactorDirection.UNKNOWN


def test_pf_and_direction_unitary_when_only_active():
    pf, direction = meter_calc.calculate_pf_and_dir_with_energy(100, 0)
    assert pf == pytest.approx(1.0)
    assert direction == PowerFactorDirection.UNITARY


def test_pf_and_direction_lagging_when_reactive_positive():
    pf, direction = meter_calc.calculate_pf_and_dir_with_energy(100, 100)
    assert pf == pytest.approx(1 / math.sqrt(2))
    assert direction == PowerFactorDirection.LAGGING


def test_pf_and_direction_leading_when_reactive_negative():
    pf, direction = meter_calc.calculate_pf_and_dir_with_energy(100, -100)
    assert pf == pytest.approx(1 / math.sqrt(2))
    assert direction == PowerFactorDirection.LEADING
