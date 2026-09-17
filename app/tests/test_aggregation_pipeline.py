"""Exercise the real aggregation pipeline with scripted InfluxDB responses.

Scripted responses represent rows already returned by InfluxQL. These tests verify
the generated queries, bucket merging, gap filling, metadata and global metrics;
they do not pretend to implement or test the InfluxDB query engine itself.
"""

from collections import deque
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from itertools import permutations
from unittest.mock import create_autospec
from zoneinfo import ZoneInfo

import pytest
from influxdb.resultset import ResultSet

from controller.node.node import Node
from controller.meter.device import EnergyMeter
from controller.meter.extraction import get_meter_energy_consumption, get_meter_peak_power
from controller.meter.nodes import EnergyMeterNodes
from db.timedb import TimeDBClient
from model.controller.node import BaseNodeProtocolOptions, NodeConfig, NodeType, NodePhase, NodeDirection
from model.controller.device import PowerFactorDirection
from model.date import FormattedTimeStep as Step, TimeSpanParameters

START = datetime(2024, 1, 1, tzinfo=timezone.utc)


def make_node(
    name: str = "power",
    unit: str | None = "W",
    counter: bool = False,
    decimals: int | None = 6,
    node_type: NodeType = NodeType.FLOAT,
) -> Node:
    return Node(
        NodeConfig(name=name, type=node_type, unit=unit, is_counter=counter, decimal_places=decimals),
        BaseNodeProtocolOptions(),
    )


def make_span(hours=3, step=Step._1h, formatted=True):
    return TimeSpanParameters(
        start_time=START,
        end_time=START + timedelta(hours=hours),
        formatted=formatted,
        time_step=step,
        time_zone=ZoneInfo("UTC"),
    )


def counter_row(value, minute=0, duration=15):
    return {
        "time": "internal-influx-time",
        "start_time": (START + timedelta(minutes=minute)).isoformat(),
        "end_time": (START + timedelta(minutes=minute + duration)).isoformat(),
        "value": value,
    }


def measurement_row(total, count, minimum, maximum, minute=0, duration=15, factor=1):
    row = counter_row(None, minute, duration)
    del row["value"]
    return {
        **row,
        "mean_sum": total,
        "mean_count": count,
        "average_value": total / count / factor if count else None,
        "min_value": minimum / factor if minimum is not None else None,
        "max_value": maximum / factor if maximum is not None else None,
    }


def result_set(rows):
    if not rows:
        return ResultSet({})
    columns = list(rows[0])
    return ResultSet(
        {
            "series": [
                {"name": "variable", "columns": columns, "values": [[row.get(column) for column in columns] for row in rows]}
            ]
        }
    )


class ScriptedInflux:
    def __init__(self, batches):
        self.batches = deque(deepcopy(batches))
        self.queries = []
        self.database = None
        self.closed = False

    def switch_database(self, name):
        self.database = name

    def query(self, query):
        self.queries.append(query)
        assert self.batches, f"Unexpected additional query: {query}"
        batch = self.batches.popleft()
        if isinstance(batch, Exception):
            raise batch
        if isinstance(batch, ResultSet) or (batch and isinstance(batch[0], ResultSet)):
            return batch
        return result_set(batch)

    def close(self):
        self.closed = True


@pytest.fixture
def database(monkeypatch):
    db = TimeDBClient()
    pending, connections = deque(), []

    def queue(*batches):
        client = ScriptedInflux(batches)
        pending.append(client)
        connections.append(client)
        return client

    def connect():
        assert pending, "Unexpected database connection"
        return pending.popleft()

    monkeypatch.setattr(db, "_TimeDBClient__get_new_client", connect)
    yield db, queue
    db.api_executor.shutdown(wait=True)
    assert not pending, "An expected database request was never made"
    assert all(client.closed for client in connections), "A query leaked its connection"


@pytest.mark.parametrize("counter", [False, True])
@pytest.mark.parametrize("formatted", [False, True])
@pytest.mark.parametrize("unit,factor", [(None, 1.0), ("W", 1.0), ("kW", 1000.0), ("MW", 1000000.0), ("mA", 0.001)])
def test_query_selects_correct_aggregation_and_unit_conversion(database, counter, formatted, unit, factor):
    db, queue = database
    client = queue([])
    node = make_node(unit=unit, counter=counter)
    logs = db.get_variable_logs(42, node, make_span(formatted=formatted))
    query = client.queries[0]
    assert client.database == "device_42"
    assert 'FROM "power"' in query
    assert "time >= '2024-01-01T00:00:00Z'" in query
    assert "time < '2024-01-01T03:00:00Z'" in query
    assert "tz('UTC')" in query
    if counter:
        value = 'SUM("value")' if formatted else '"value"'
        assert f"{value} / {factor} AS value" in query
        assert '"mean_count" > 0' not in query
    else:
        assert '"mean_count" > 0' in query
        average = '(SUM("mean_sum") / SUM("mean_count"))' if formatted else '("mean_sum" / "mean_count")'
        assert f"{average} / {factor} AS average_value" in query
        for field, aggregate in [("min_value", "MIN"), ("max_value", "MAX")]:
            expression = f'{aggregate}("{field}")' if formatted else f'"{field}"'
            assert f"{expression} / {factor} AS {field}" in query
    assert ("GROUP BY time(60m)" in query) is formatted
    assert ("FILL(null)" in query) is formatted
    assert logs.unit == unit
    assert logs.is_counter is counter
    assert len(logs.points) == (3 if formatted else 0)


def test_query_converts_explicit_offsets_to_utc(database):
    db, queue = database
    client = queue([])
    zone = ZoneInfo("Asia/Kathmandu")
    span = TimeSpanParameters(
        start_time=datetime(2024, 7, 1, tzinfo=zone),
        end_time=datetime(2024, 7, 2, tzinfo=zone),
        formatted=False,
        time_zone=zone,
    )
    db.get_variable_logs(1, make_node(), span)
    assert "time >= '2024-06-30T18:15:00Z'" in client.queries[0]
    assert "time < '2024-07-01T18:15:00Z'" in client.queries[0]
    assert "tz('Asia/Kathmandu')" in client.queries[0]


@pytest.mark.parametrize("counter", [False, True])
def test_unbounded_raw_query_has_no_time_filter(database, counter):
    db, queue = database
    client = queue([])
    db.get_variable_logs(1, make_node(counter=counter), TimeSpanParameters())
    assert "time >=" not in client.queries[0]
    assert "time <" not in client.queries[0]
    assert "GROUP BY" not in client.queries[0]


@pytest.mark.parametrize("zone_name", ["UTC", "Europe/Lisbon", "America/New_York"])
def test_monthly_queries_use_calendar_ranges_and_correct_month_lengths(database, zone_name):
    db, queue = database
    client = queue([], [], [], [])
    zone = ZoneInfo(zone_name)
    span = TimeSpanParameters(
        start_time=datetime(2024, 1, 1, tzinfo=zone),
        end_time=datetime(2024, 5, 1, tzinfo=zone),
        formatted=True,
        time_step=Step._1M,
        time_zone=zone,
    )
    logs = db.get_variable_logs(1, make_node(counter=True), span)
    assert len(logs.points) == len(client.queries) == 4
    for month, (query, days) in enumerate(zip(client.queries, [31, 29, 31, 30]), 1):
        left = datetime(2024, month, 1, tzinfo=zone).astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        right = datetime(2024, month + 1, 1, tzinfo=zone).astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        assert f"time >= '{left}'" in query
        assert f"time < '{right}'" in query
        assert f"GROUP BY time({days}d)" in query


def test_yearly_queries_split_leap_and_common_years(database):
    db, queue = database
    client = queue([], [])
    span = TimeSpanParameters(
        start_time=START.replace(year=2023),
        end_time=START.replace(year=2025),
        formatted=True,
        time_step=Step._1Y,
        time_zone=ZoneInfo("UTC"),
    )
    db.get_variable_logs(1, make_node(counter=True), span)
    assert "GROUP BY time(365d)" in client.queries[0]
    assert "GROUP BY time(366d)" in client.queries[1]


@pytest.mark.parametrize("values", [[2, 3, 5], [0, 0, 0], [-3, 2, -1], [0.125, 0.25, 0.5]])
def test_counter_merging_conserves_totals_and_fills_missing_buckets(database, values):
    db, queue = database
    queue([counter_row(value, i * 15) for i, value in enumerate(values)] + [counter_row(7, 120)])
    logs = db.get_variable_logs(1, make_node(counter=True), make_span())
    assert [point["value"] for point in logs.points] == [sum(values), None, 7]
    assert logs.global_metrics == {"value": sum(values) + 7}
    assert all("time" not in point for point in logs.points)


@pytest.mark.parametrize("counter", [False, True])
def test_rows_without_periods_are_ignored_and_missing_is_not_zero(database, counter):
    db, queue = database
    row = counter_row(0, 60) if counter else measurement_row(0, 2, 0, 0, 60)
    queue([{**row, "start_time": None}, row, {**row, "end_time": None}])
    logs = db.get_variable_logs(1, make_node(counter=counter), make_span())
    field = "value" if counter else "average_value"
    assert [point[field] for point in logs.points] == [None, 0, None]
    assert [point["start_time"] for point in logs.points] == [
        "2024-01-01T00:00+00:00",
        "2024-01-01T01:00+00:00",
        "2024-01-01T02:00+00:00",
    ]


@pytest.mark.parametrize("unit,factor", [("W", 1), ("kW", 1000), ("MW", 1000000)])
def test_global_measurements_use_sample_weights_not_average_of_averages(database, unit, factor):
    db, queue = database
    queue([measurement_row(3000, 3, 500, 1500, factor=factor), measurement_row(9000, 1, 9000, 9000, 120, factor=factor)])
    logs = db.get_variable_logs(1, make_node(unit=unit), make_span())
    assert logs.global_metrics["average_value"] == pytest.approx(3000 / factor)
    assert logs.global_metrics["min_value"] == pytest.approx(500 / factor)
    assert logs.global_metrics["max_value"] == pytest.approx(9000 / factor)
    assert logs.global_metrics["max_value_start_time"] == "2024-01-01T02:00+00:00"
    assert logs.global_metrics["min_value_end_time"] == "2024-01-01T01:00+00:00"
    assert all("mean_count" not in point and "mean_sum" not in point for point in logs.points)


@pytest.mark.parametrize("order", list(permutations(range(3))))
@pytest.mark.parametrize("unit,factor", [("W", 1), ("kW", 1000)])
def test_three_measurement_groups_merge_without_losing_weights(database, order, unit, factor):
    db, queue = database
    rows = [
        measurement_row(2000, 2, 500, 1500, 0, factor=factor),
        measurement_row(6000, 3, 1000, 3000, 15, factor=factor),
        measurement_row(9000, 1, 9000, 9000, 30, factor=factor),
    ]
    queue([rows[index] for index in order])
    logs = db.get_variable_logs(1, make_node(unit=unit), make_span())
    expected = 17000 / 6 / factor
    assert logs.points[0]["average_value"] == pytest.approx(expected)
    assert logs.global_metrics["average_value"] == pytest.approx(expected)
    assert logs.points[0]["min_value"] == pytest.approx(500 / factor)
    assert logs.points[0]["max_value"] == pytest.approx(9000 / factor)


def test_two_measurement_groups_preserve_global_weights(database):
    db, queue = database
    queue([measurement_row(20, 2, 5, 15), measurement_row(90, 3, 20, 40, 15)])
    logs = db.get_variable_logs(1, make_node(), make_span())
    assert logs.points[0]["average_value"] == 22
    assert logs.global_metrics["average_value"] == 22


@pytest.mark.parametrize("decimals,expected", [(None, 1 / 3), (0, 0), (2, 0.33), (4, 0.3333)])
def test_measurement_precision_is_applied_after_weighted_average(database, decimals, expected):
    db, queue = database
    queue([measurement_row(1, 3, 0, 1)])
    node_type = NodeType.INT if decimals is None else NodeType.FLOAT
    logs = db.get_variable_logs(1, make_node(decimals=decimals, node_type=node_type), make_span())
    assert logs.points[0]["average_value"] == pytest.approx(expected)
    assert logs.global_metrics["average_value"] == pytest.approx(expected)


def test_extrema_ties_keep_first_period_and_negative_values(database):
    db, queue = database
    queue([measurement_row(-10, 1, -12, -8), measurement_row(-10, 1, -12, -8, 60)])
    logs = db.get_variable_logs(1, make_node(), make_span())
    assert logs.global_metrics["min_value"] == -12
    assert logs.global_metrics["max_value"] == -8
    assert logs.global_metrics["max_value_start_time"] == "2024-01-01T00:00+00:00"
    assert logs.global_metrics["min_value_start_time"] == "2024-01-01T00:00+00:00"


@pytest.mark.parametrize("counter", [False, True])
def test_remove_points_preserves_global_metrics(database, counter):
    db, queue = database
    rows = [counter_row(12)] if counter else [measurement_row(36, 3, 10, 14)]
    queue(rows)
    logs = db.get_variable_logs(1, make_node(counter=counter), make_span(), remove_points=True)
    assert logs.points == []
    assert logs.global_metrics["value" if counter else "average_value"] == 12


def test_coarser_source_intervals_promote_requested_step(database):
    db, queue = database
    queue([counter_row(24, duration=24 * 60)])
    logs = db.get_variable_logs(1, make_node(counter=True), make_span(hours=48))
    assert logs.time_step == Step._1d
    assert [point["value"] for point in logs.points] == [24, None]


def test_forced_aggregation_uses_one_query_without_bucket_grouping(database):
    db, queue = database
    client = queue([counter_row(42, duration=180)])
    span = make_span(formatted=False)
    span.force_aggregation = True
    logs = db.get_variable_logs(1, make_node(counter=True), span)
    assert 'SUM("value")' in client.queries[0]
    assert "GROUP BY" not in client.queries[0]
    assert logs.global_metrics == {"value": 42}


@pytest.mark.parametrize("node_type,value", [(NodeType.BOOL, False), (NodeType.STRING, "on")])
def test_non_numeric_raw_logs_preserve_values(database, node_type, value):
    db, queue = database
    queue([counter_row(value)])
    logs = db.get_variable_logs(1, make_node(unit=None, node_type=node_type), make_span(formatted=False))
    assert logs.points[0]["value"] == value
    assert logs.global_metrics is None


def test_non_numeric_formatted_logs_are_rejected_and_connection_closes(database):
    db, queue = database
    queue()
    with pytest.raises(NotImplementedError):
        db.get_variable_logs(1, make_node(unit=None, node_type=NodeType.STRING), make_span())


@pytest.mark.parametrize("start,end", [(START, None), (None, START), (START, START), (START, START - timedelta(hours=1))])
def test_invalid_range_is_rejected_before_query_and_connection_closes(database, start, end):
    db, queue = database
    client = queue()
    with pytest.raises(ValueError):
        db.get_variable_logs(1, make_node(), TimeSpanParameters(start_time=start, end_time=end))
    assert client.queries == []


def test_query_failure_propagates_and_connection_closes(database):
    db, queue = database
    queue(RuntimeError("database unavailable"))
    with pytest.raises(RuntimeError, match="database unavailable"):
        db.get_variable_logs(1, make_node(), make_span())


def make_meter(nodes: dict[str, Node]) -> EnergyMeter:
    meter: EnergyMeter = create_autospec(EnergyMeter, instance=True)
    meter.id = 1
    meter.meter_nodes = create_autospec(EnergyMeterNodes, instance=True)
    meter.meter_nodes.nodes = nodes
    return meter


def energy_device(active_unit="Wh", reactive_unit="VArh", missing=()) -> EnergyMeter:
    nodes = {
        "active_energy": make_node("active_energy", active_unit, counter=True),
        "reactive_energy": make_node("reactive_energy", reactive_unit, counter=True),
        "power_factor": make_node("power_factor", "", decimals=3),
    }
    for node in nodes.values():
        EnergyMeterNodes.validate_node(node)
    return make_meter({key: node for key, node in nodes.items() if key not in missing})


@pytest.mark.parametrize(
    "active,reactive,pf,direction",
    [
        (3, 4, 0.6, PowerFactorDirection.LAGGING),
        (3, -4, 0.6, PowerFactorDirection.LEADING),
        (-3, 4, 0.6, PowerFactorDirection.LAGGING),
        (-3, -4, 0.6, PowerFactorDirection.LEADING),
        (-3, 0, 1, PowerFactorDirection.UNITARY),
        (3, 0, 1, PowerFactorDirection.UNITARY),
        (0, 4, 0, PowerFactorDirection.LAGGING),
        (0, 0, None, PowerFactorDirection.UNKNOWN),
    ],
)
@pytest.mark.parametrize("formatted", [False, True])
def test_energy_power_factor_and_direction_follow_bucket_totals(database, active, reactive, pf, direction, formatted):
    db, queue = database
    queue([counter_row(active)])
    queue([counter_row(reactive)])
    output = get_meter_energy_consumption(
        energy_device(), NodePhase.SINGLEPHASE, NodeDirection.TOTAL, db, make_span(formatted=formatted)
    )
    assert output["power_factor"]["global_metrics"]["value"] == pf
    assert output["power_factor_direction"]["global_metrics"]["value"] == direction
    if formatted:
        assert output["power_factor"]["points"][0]["value"] == pf
        assert output["power_factor_direction"]["points"][0]["value"] == direction
        assert output["power_factor"]["points"][1]["value"] is None


@pytest.mark.parametrize("active,reactive", [(3, None), (None, 4), (None, None), (0, None), (None, 0)])
@pytest.mark.parametrize("formatted", [False, True])
def test_global_power_factor_requires_samples_from_both_energy_channels(database, active, reactive, formatted):
    db, queue = database
    queue([] if active is None else [counter_row(active)])
    queue([] if reactive is None else [counter_row(reactive)])
    output = get_meter_energy_consumption(
        energy_device(), NodePhase.SINGLEPHASE, NodeDirection.TOTAL, db, make_span(formatted=formatted)
    )
    assert output["active_energy"]["global_metrics"]["value"] == (active if active is not None else 0)
    assert output["reactive_energy"]["global_metrics"]["value"] == (reactive if reactive is not None else 0)
    assert output["power_factor"]["global_metrics"]["value"] is None
    assert output["power_factor_direction"]["global_metrics"]["value"] is None


def test_global_power_factor_uses_energy_totals_instead_of_mean_of_bucket_factors(database):
    db, queue = database
    queue([counter_row(3), counter_row(12, 60)])
    queue([counter_row(4), counter_row(0, 60)])
    output = get_meter_energy_consumption(energy_device(), NodePhase.SINGLEPHASE, NodeDirection.TOTAL, db, make_span())
    assert output["active_energy"]["global_metrics"]["value"] == 15
    assert output["reactive_energy"]["global_metrics"]["value"] == 4
    assert output["power_factor"]["global_metrics"]["value"] == pytest.approx(15 / (15**2 + 4**2) ** 0.5)


@pytest.mark.parametrize(
    "active_unit,reactive_unit,active,reactive",
    [
        ("kWh", "VArh", 3, 4000),
        ("Wh", "kVArh", 3000, 4),
        ("kWh", "kVArh", 3, 4),
    ],
)
@pytest.mark.parametrize("metric", ["bucket", "total"])
def test_energy_power_factor_normalizes_different_unit_prefixes(
    database, active_unit, reactive_unit, active, reactive, metric
):
    db, queue = database
    queue([counter_row(active)])
    queue([counter_row(reactive)])
    output = get_meter_energy_consumption(
        energy_device(active_unit, reactive_unit), NodePhase.SINGLEPHASE, NodeDirection.TOTAL, db, make_span()
    )
    actual = (
        output["power_factor"]["points"][0]["value"]
        if metric == "bucket"
        else output["power_factor"]["global_metrics"]["value"]
    )
    assert actual == pytest.approx(0.6)


@pytest.mark.parametrize("missing", [("active_energy",), ("reactive_energy",), ("active_energy", "reactive_energy")])
def test_missing_energy_channels_produce_null_aligned_points(database, missing):
    db, queue = database
    for name in ("active_energy", "reactive_energy"):
        if name not in missing:
            queue([counter_row(5)])
    output = get_meter_energy_consumption(
        energy_device(missing=missing), NodePhase.SINGLEPHASE, NodeDirection.TOTAL, db, make_span()
    )
    assert len(output["power_factor"]["points"]) == 3
    assert all(point["value"] is None for point in output["power_factor"]["points"])
    for name in missing:
        assert output[name]["unit"] is None
        assert all(point["value"] is None for point in output[name]["points"])
        assert output[name]["global_metrics"]["value"] is None


def test_energy_channels_with_different_source_steps_align_before_power_factor(database):
    db, queue = database
    queue([counter_row(24, duration=24 * 60)])
    queue([counter_row(1, hour * 60, duration=60) for hour in range(24)])
    output = get_meter_energy_consumption(
        energy_device(), NodePhase.SINGLEPHASE, NodeDirection.TOTAL, db, make_span(hours=24)
    )
    assert output["active_energy"]["time_step"] == output["reactive_energy"]["time_step"] == Step._1d
    assert output["power_factor"]["points"][0]["value"] == pytest.approx(2**-0.5)


def test_energy_channels_also_align_when_reactive_source_is_coarser(database):
    db, queue = database
    queue([counter_row(1, hour * 60, duration=60) for hour in range(24)])
    queue([counter_row(24, duration=24 * 60)])
    output = get_meter_energy_consumption(
        energy_device(), NodePhase.SINGLEPHASE, NodeDirection.TOTAL, db, make_span(hours=24)
    )
    assert output["active_energy"]["time_step"] == output["reactive_energy"]["time_step"]
    assert output["power_factor"]["points"][0]["value"] == pytest.approx(2**-0.5)


def test_peak_power_keeps_global_statistics_but_omits_points(database):
    db, queue = database
    nodes = {name: make_node(name) for name in ("active_power", "reactive_power", "apparent_power")}
    device = make_meter(nodes)
    for _ in nodes:
        queue([measurement_row(30, 3, 5, 15)])
    output = get_meter_peak_power(device, NodePhase.SINGLEPHASE, db, make_span())
    for logs in output.values():
        assert logs["points"] == []
        assert logs["global_metrics"]["average_value"] == 10
        assert logs["global_metrics"]["max_value"] == 15


@pytest.mark.parametrize(
    "missing",
    [(), ("active_power",), ("reactive_power", "apparent_power"), ("active_power", "reactive_power", "apparent_power")],
)
def test_peak_power_missing_channels_keep_consistent_response_shape(database, missing):
    db, queue = database
    names = ("active_power", "reactive_power", "apparent_power")
    nodes = {name: make_node(name) for name in names if name not in missing}
    for _ in nodes:
        queue([measurement_row(20, 2, 5, 15)])
    output = get_meter_peak_power(make_meter(nodes), NodePhase.SINGLEPHASE, db, make_span())
    assert set(output) == set(names)
    for name in names:
        assert output[name]["points"] == []
        assert output[name]["global_metrics"]["max_value"] == (None if name in missing else 15)


@pytest.mark.parametrize("zone_name", ["UTC", "Europe/Lisbon", "America/New_York"])
@pytest.mark.parametrize("year", [2023, 2024])
def test_monthly_counter_data_conserves_energy_across_database_group_splits(database, zone_name, year):
    db, queue = database
    zone = ZoneInfo(zone_name)
    batches = []
    for month in range(1, 13):
        left = datetime(year, month, 1, tzinfo=zone)
        middle = datetime(year, month, 15, tzinfo=zone)
        right = datetime(year + (month == 12), month % 12 + 1, 1, tzinfo=zone)
        # Fixed InfluxQL groups can split a calendar month. Post-processing must merge them.
        batches.append(
            [
                {"start_time": left.isoformat(), "end_time": middle.isoformat(), "value": month * 100},
                {"start_time": middle.isoformat(), "end_time": right.isoformat(), "value": month * 10},
            ]
        )
    client = queue(*batches)
    span = TimeSpanParameters(
        start_time=datetime(year, 1, 1, tzinfo=zone),
        end_time=datetime(year + 1, 1, 1, tzinfo=zone),
        formatted=True,
        time_step=Step._1M,
        time_zone=zone,
    )
    logs = db.get_variable_logs(1, make_node(counter=True, unit="Wh"), span)
    assert [point["value"] for point in logs.points] == [month * 110 for month in range(1, 13)]
    assert logs.global_metrics["value"] == 8580
    assert len(client.queries) == 12
    for month, point in enumerate(logs.points, 1):
        expected = datetime(year, month, 1, tzinfo=zone)
        assert datetime.fromisoformat(point["start_time"]).timestamp() == expected.timestamp()


@pytest.mark.parametrize("order", list(permutations(range(3))))
def test_merging_preserves_extrema_independently_of_row_order(database, order):
    db, queue = database
    rows = [measurement_row(-10, 1, -10, -10), measurement_row(0, 1, 0, 0, 15), measurement_row(20, 1, 20, 20, 30)]
    queue([rows[index] for index in order])
    logs = db.get_variable_logs(1, make_node(), make_span())
    assert logs.points[0]["min_value"] == logs.global_metrics["min_value"] == -10
    assert logs.points[0]["max_value"] == logs.global_metrics["max_value"] == 20


@pytest.mark.parametrize("counter", [False, True])
def test_all_empty_month_retains_full_buckets_and_empty_metrics(database, counter):
    db, queue = database
    queue([])
    span = TimeSpanParameters(
        start_time=datetime(2024, 2, 1, tzinfo=timezone.utc),
        end_time=datetime(2024, 3, 1, tzinfo=timezone.utc),
        formatted=True,
        time_step=Step._1d,
        time_zone=ZoneInfo("UTC"),
    )
    logs = db.get_variable_logs(1, make_node(counter=counter), span)
    assert len(logs.points) == 29
    field = "value" if counter else "average_value"
    assert all(point[field] is None for point in logs.points)
    # Current API contract: counter totals are zero when no rows are available.
    assert logs.global_metrics[field] == (0 if counter else None)
    if not counter:
        assert all(value is None for value in logs.global_metrics.values())


@pytest.mark.parametrize("chunked", [False, True])
def test_single_and_chunked_influx_results_are_both_consumed(database, chunked):
    db, queue = database
    rows = [counter_row(2), counter_row(3, 60)]
    response = [result_set([rows[0]]), result_set([rows[1]])] if chunked else result_set(rows)
    queue(response)
    logs = db.get_variable_logs(1, make_node(counter=True), make_span())
    assert [point["value"] for point in logs.points] == [2, 3, None]
    assert logs.global_metrics == {"value": 5}


def test_invalid_result_chunk_reports_error_and_closes_connection(database, monkeypatch):
    db, queue = database
    client = queue()
    monkeypatch.setattr(client, "query", lambda query: [object()])
    with pytest.raises(TypeError, match="Items must be ResultSet"):
        db.get_variable_logs(1, make_node(counter=True), make_span())


@pytest.mark.parametrize(
    "direction,prefix", [(NodeDirection.TOTAL, ""), (NodeDirection.FORWARD, "forward_"), (NodeDirection.REVERSE, "reverse_")]
)
@pytest.mark.parametrize(
    "phase,phase_prefix", [(NodePhase.SINGLEPHASE, ""), (NodePhase.TOTAL, "total_"), (NodePhase.L2, "l2_")]
)
def test_energy_phase_and_direction_select_correct_measurements(database, direction, prefix, phase, phase_prefix):
    db, queue = database
    names = [f"{phase_prefix}{prefix}{energy}_energy" for energy in ("active", "reactive")]
    nodes = {name: make_node(name, unit="Wh" if index == 0 else "VArh", counter=True) for index, name in enumerate(names)}
    device = make_meter(nodes)
    active_client, reactive_client = queue([counter_row(3)]), queue([counter_row(4)])
    output = get_meter_energy_consumption(device, phase, direction, db, make_span())
    assert f'FROM "{names[0]}"' in active_client.queries[0]
    assert f'FROM "{names[1]}"' in reactive_client.queries[0]
    assert output["power_factor"]["global_metrics"]["value"] == 0.6
    assert output["power_factor"]["decimal_places"] == 2  # no configured PF node


def test_raw_energy_request_has_totals_without_fabricated_bucket_power_factors(database):
    db, queue = database
    queue([counter_row(3)])
    queue([counter_row(4)])
    output = get_meter_energy_consumption(
        energy_device(), NodePhase.SINGLEPHASE, NodeDirection.TOTAL, db, make_span(formatted=False)
    )
    assert output["power_factor"]["points"] == []
    assert output["power_factor_direction"]["points"] == []
    assert output["power_factor"]["global_metrics"]["value"] == 0.6


@pytest.mark.parametrize("value", [0, -2, 3.125, False, "ON"])
def test_storage_uses_period_start_and_preserves_zero_false_and_fractional_values(value):
    start = datetime(2024, 2, 29, 23, 45, 32, tzinfo=timezone.utc)
    end = datetime(2024, 3, 1, 0, 0, 32, tzinfo=timezone.utc)
    records = TimeDBClient.to_db_format([{"name": "sample", "start_time": start, "end_time": end, "value": value}])
    assert records is not None
    assert len(records) == 1
    stored = records[0]
    assert stored["time"] == start.replace(second=0)
    assert stored["fields"] == {"start_time": "2024-02-29T23:45+00:00", "end_time": "2024-03-01T00:00+00:00", "value": value}


def test_storage_preserves_measurement_weights_for_future_aggregation():
    record = {
        "name": "power",
        "start_time": START,
        "end_time": START + timedelta(minutes=15),
        "mean_sum": 9000,
        "mean_count": 3,
        "min_value": 1000,
        "max_value": 5000,
        "optional": None,
    }
    records = TimeDBClient.to_db_format([record])
    assert records is not None
    assert len(records) == 1
    stored = records[0]
    assert stored["fields"]["mean_sum"] == 9000
    assert stored["fields"]["mean_count"] == 3
    assert stored["fields"]["min_value"] == 1000
    assert stored["fields"]["max_value"] == 5000
    assert "optional" not in stored["fields"]


@pytest.mark.parametrize("missing", ["name", "start_time", "end_time"])
def test_storage_rejects_missing_period_identifiers(missing):
    record = {"name": "sample", "start_time": START, "end_time": START + timedelta(minutes=15), "value": 1}
    del record[missing]
    with pytest.raises(ValueError, match="Missing required fields"):
        TimeDBClient.to_db_format([record])


@pytest.mark.parametrize(
    "fields", [{"value": None}, {"min_value": None, "max_value": 2}, {"min_value": 1, "max_value": None}]
)
def test_storage_rejects_disconnected_samples(fields):
    assert (
        TimeDBClient.to_db_format(
            [{"name": "sample", "start_time": START, "end_time": START + timedelta(minutes=15), **fields}]
        )
        is None
    )


def test_later_minimum_updates_its_period_without_changing_the_peak_period(database):
    db, queue = database
    queue([measurement_row(10, 1, 5, 15), measurement_row(-10, 1, -20, 0, 120)])
    logs = db.get_variable_logs(1, make_node(), make_span())
    assert logs.global_metrics["min_value"] == -20
    assert logs.global_metrics["min_value_start_time"] == "2024-01-01T02:00+00:00"
    assert logs.global_metrics["min_value_end_time"] == "2024-01-01T03:00+00:00"
    assert logs.global_metrics["max_value_start_time"] == "2024-01-01T00:00+00:00"


@pytest.mark.parametrize(
    "step,minutes,grouping", [(Step._1m, 1, "1m"), (Step._15m, 15, "15m"), (Step._1h, 60, "60m"), (Step._1d, 1440, "1d")]
)
def test_fixed_intervals_keep_points_on_boundaries_and_use_one_query(database, step, minutes, grouping):
    db, queue = database
    client = queue([counter_row(2, duration=minutes), counter_row(3, minute=minutes, duration=minutes)])
    span = TimeSpanParameters(
        start_time=START,
        end_time=START + timedelta(minutes=3 * minutes),
        formatted=True,
        time_step=step,
        time_zone=ZoneInfo("UTC"),
    )
    logs = db.get_variable_logs(1, make_node(counter=True), span)
    assert len(client.queries) == 1
    assert f"GROUP BY time({grouping})" in client.queries[0]
    assert [point["value"] for point in logs.points] == [2, 3, None]
    assert logs.global_metrics == {"value": 5}


def test_disjoint_energy_samples_do_not_produce_bucket_power_factor(database):
    db, queue = database
    queue([counter_row(3, minute=0)])
    queue([counter_row(4, minute=60)])
    output = get_meter_energy_consumption(energy_device(), NodePhase.SINGLEPHASE, NodeDirection.TOTAL, db, make_span())
    assert all(point["value"] is None for point in output["power_factor"]["points"])
    assert output["active_energy"]["global_metrics"] == {"value": 3}
    assert output["reactive_energy"]["global_metrics"] == {"value": 4}


def test_small_values_are_not_rounded_before_accumulating_global_average(database):
    db, queue = database
    queue(
        [
            measurement_row(0.004, 1, 0.004, 0.004),
            measurement_row(0.004, 1, 0.004, 0.004, 60),
            measurement_row(0.008, 1, 0.008, 0.008, 120),
        ]
    )
    logs = db.get_variable_logs(1, make_node(decimals=2), make_span())
    assert [point["average_value"] for point in logs.points] == [0, 0, 0.01]
    assert logs.global_metrics["average_value"] == 0.01  # Rounding the displayed values first would give 0.00.


@pytest.mark.parametrize(
    "zone_name,month,day,hours",
    [
        ("Europe/Lisbon", 3, 31, 23),
        ("Europe/Lisbon", 10, 27, 25),
        ("America/New_York", 3, 10, 23),
        ("America/New_York", 11, 3, 25),
    ],
)
@pytest.mark.parametrize("step,minutes", [(Step._1h, 60), (Step._15m, 15)])
@pytest.mark.parametrize("counter", [False, True])
def test_dst_pipeline_preserves_distinct_intervals_values_and_totals(
    database, zone_name, month, day, hours, step, minutes, counter
):
    db, queue = database
    zone = ZoneInfo(zone_name)
    start = datetime(2024, month, day, tzinfo=zone)
    end = start + timedelta(days=1)
    count = hours * 60 // minutes
    rows, values, weights = [], [], []
    for index in range(count):
        value, weight = index + 1, index % 3 + 1
        left = start.astimezone(timezone.utc) + timedelta(minutes=index * minutes)
        right = left + timedelta(minutes=minutes)
        row = counter_row(value) if counter else measurement_row(value * weight, weight, value, value)
        row.update(start_time=left.isoformat(), end_time=right.isoformat())
        rows.append(row)
        values.append(value)
        weights.append(weight)
    queue(rows)
    logs = db.get_variable_logs(1, make_node(counter=counter), TimeSpanParameters(start, end, step, True, zone))
    field = "value" if counter else "average_value"
    assert len(logs.points) == count
    assert [point[field] for point in logs.points] == values
    expected_total = sum(values) if counter else sum(value * weight for value, weight in zip(values, weights)) / sum(weights)
    assert logs.global_metrics[field] == pytest.approx(expected_total)
    for index, point in enumerate(logs.points):
        assert datetime.fromisoformat(point["start_time"]).timestamp() == start.timestamp() + index * minutes * 60
        assert datetime.fromisoformat(point["end_time"]).timestamp() == start.timestamp() + (index + 1) * minutes * 60


@pytest.mark.parametrize("older_channel", ["active_energy", "reactive_energy"])
def test_historical_logging_change_aligns_both_channels_when_one_has_a_gap(database, older_channel):
    db, queue = database
    for name in ("active_energy", "reactive_energy"):
        rows = [counter_row(24, duration=1440)] if name == older_channel else []
        rows += [counter_row(1, hour * 60, duration=60) for hour in range(24, 48)]
        queue(rows)
    device = energy_device()
    for node in device.meter_nodes.nodes.values():
        node.config.logging = True
        node.config.logging_period = 60
    EnergyMeterNodes.validate_logging_consistency(device.meter_nodes.nodes)
    output = get_meter_energy_consumption(device, NodePhase.SINGLEPHASE, NodeDirection.TOTAL, db, make_span(hours=48))
    for logs in output.values():
        assert logs["time_step"] == Step._1d
        assert [point["start_time"] for point in logs["points"]] == ["2024-01-01T00:00+00:00", "2024-01-02T00:00+00:00"]
        assert [point["end_time"] for point in logs["points"]] == ["2024-01-02T00:00+00:00", "2024-01-03T00:00+00:00"]
    for name in ("active_energy", "reactive_energy"):
        assert [point["value"] for point in output[name]["points"]] == [24 if name == older_channel else None, 24]
        assert output[name]["global_metrics"]["value"] == (48 if name == older_channel else 24)
    assert output["power_factor"]["points"][0]["value"] is None
    assert output["power_factor"]["points"][1]["value"] == pytest.approx(2**-0.5)


@pytest.mark.parametrize("missing", ["active_energy", "reactive_energy"])
def test_missing_channel_uses_the_step_selected_by_the_available_data(database, missing):
    db, queue = database
    queue([counter_row(24, duration=1440)])
    output = get_meter_energy_consumption(
        energy_device(missing=(missing,)), NodePhase.SINGLEPHASE, NodeDirection.TOTAL, db, make_span(hours=48)
    )
    for logs in output.values():
        assert logs["time_step"] == Step._1d
        assert len(logs["points"]) == 2
    assert all(point["value"] is None for point in output[missing]["points"])
    assert output[missing]["global_metrics"]["value"] is None
    assert all(point["value"] is None for point in output["power_factor"]["points"])


def test_monthly_measurement_fragments_keep_global_sample_weights(database):
    db, queue = database
    middle, end = START.replace(day=18), START.replace(month=2)
    rows = [measurement_row(20, 2, 5, 15), measurement_row(90, 3, 20, 40)]
    rows[0].update(start_time=START.isoformat(), end_time=middle.isoformat())
    rows[1].update(start_time=middle.isoformat(), end_time=end.isoformat())
    queue(rows)
    logs = db.get_variable_logs(1, make_node(), TimeSpanParameters(START, end, Step._1M, True, ZoneInfo("UTC")))
    assert len(logs.points) == 1
    assert logs.points[0]["average_value"] == logs.global_metrics["average_value"] == 22


@pytest.mark.parametrize("zone_name,month,day", [("Europe/Lisbon", 10, 27), ("America/New_York", 11, 3)])
def test_query_accepts_range_ending_at_an_earlier_clock_time_in_the_repeated_hour(database, zone_name, month, day):
    db, queue = database
    zone = ZoneInfo(zone_name)
    start = datetime(2024, month, day, 1, 45, tzinfo=zone, fold=0)
    end = datetime(2024, month, day, 1, 15, tzinfo=zone, fold=1)
    rows = []
    for index in range(2):
        left = start.astimezone(timezone.utc) + timedelta(minutes=15 * index)
        rows.append(
            {"start_time": left.isoformat(), "end_time": (left + timedelta(minutes=15)).isoformat(), "value": index + 1}
        )
    queue(rows)
    logs = db.get_variable_logs(1, make_node(counter=True), TimeSpanParameters(start, end, Step._15m, True, zone))
    assert [point["value"] for point in logs.points] == [1, 2]
    assert logs.global_metrics == {"value": 3}
