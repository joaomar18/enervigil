########### EXTERNAL IMPORTS ############

import pytest

#########################################

############# LOCAL IMPORTS #############

import util.functions.calculation as calculation

#########################################


@pytest.mark.parametrize(
    "unit,expected_factor",
    [
        (None, 1.0),
        ("", 1.0),
        ("V", 1.0),
        ("W", 1.0),
        ("kW", 1e3),
        ("kWh", 1e3),
        ("MW", 1e6),
        ("GW", 1e9),
        ("mA", 1e-3),
    ],
)
def test_get_unit_factor(unit, expected_factor):
    assert calculation.get_unit_factor(unit) == expected_factor


def test_get_scaled_value_applies_prefix_factor():
    assert calculation.get_scaled_value(2, "kW") == pytest.approx(2000.0)
    assert calculation.get_scaled_value(2000, "mA") == pytest.approx(2.0)
    assert calculation.get_scaled_value(5, "V") == pytest.approx(5.0)
    assert calculation.get_scaled_value(5, None) == pytest.approx(5.0)


def test_apply_output_scaling_divides_by_prefix_factor():
    assert calculation.apply_output_scaling(2000.0, "kW") == pytest.approx(2.0)
    assert calculation.apply_output_scaling(2.0, "mA") == pytest.approx(2000.0)
    assert calculation.apply_output_scaling(5.0, "V") == pytest.approx(5.0)


def test_scaled_value_and_output_scaling_are_inverse_operations():
    original = 42.5
    scaled = calculation.get_scaled_value(original, "kWh")
    restored = calculation.apply_output_scaling(scaled, "kWh")
    assert restored == pytest.approx(original)
