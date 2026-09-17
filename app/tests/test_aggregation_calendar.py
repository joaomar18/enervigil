"""Calendar expectations independent of the aggregation implementation.

Use UTC timestamps when comparing instants: datetime equality can hide differences
between the two occurrences of a repeated local hour during the autumn DST change.
"""

import calendar
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import pytest

from model.date import FormattedTimeStep as Step, TimeSpanParameters
import util.functions.date as date

ZONES = ["UTC", "Europe/Lisbon", "America/New_York", "Asia/Kathmandu"]


def next_month(year, month, zone):
    return datetime(year + (month == 12), month % 12 + 1, 1, tzinfo=zone)


@pytest.mark.parametrize("zone_name", ZONES)
@pytest.mark.parametrize("year", [2023, 2024])
@pytest.mark.parametrize("month", range(1, 13))
def test_daily_buckets_cover_every_calendar_day(zone_name, year, month):
    zone = ZoneInfo(zone_name)
    start = datetime(year, month, 1, tzinfo=zone)
    end = next_month(year, month, zone)
    days = calendar.monthrange(year, month)[1]
    expected_edges = [datetime(year, month, day, tzinfo=zone) for day in range(1, days + 1)] + [end]
    buckets = date.get_aligned_time_buckets(start, end, Step._1d, zone)

    assert len(buckets) == days
    for (left, right), expected_left, expected_right in zip(buckets, expected_edges, expected_edges[1:]):
        assert left.isoformat() == expected_left.isoformat()
        assert right.isoformat() == expected_right.isoformat()
        assert right.timestamp() > left.timestamp()
    assert sum(right.timestamp() - left.timestamp() for left, right in buckets) == end.timestamp() - start.timestamp()


@pytest.mark.parametrize("zone_name", ZONES)
@pytest.mark.parametrize("year", [2023, 2024])
def test_monthly_buckets_and_query_periods_cover_a_year(zone_name, year):
    zone = ZoneInfo(zone_name)
    start, end = datetime(year, 1, 1, tzinfo=zone), datetime(year + 1, 1, 1, tzinfo=zone)
    buckets = date.get_aligned_time_buckets(start, end, Step._1M, zone)
    periods_iterator = date.iterate_time_periods(start, end, Step._1M, zone)
    assert periods_iterator is not None
    periods = list(periods_iterator)
    assert len(buckets) == len(periods) == 12
    for month, ((left, right), (query_start, grouping)) in enumerate(zip(buckets, periods), 1):
        assert left.isoformat() == datetime(year, month, 1, tzinfo=zone).isoformat()
        assert right.isoformat() == next_month(year, month, zone).isoformat()
        assert query_start.timestamp() == left.timestamp()
        assert grouping == f"{calendar.monthrange(year, month)[1]}d"


@pytest.mark.parametrize("zone_name", ZONES)
def test_yearly_buckets_include_leap_year_and_stop_at_exclusive_end(zone_name):
    zone = ZoneInfo(zone_name)
    start, end = datetime(2023, 1, 1, tzinfo=zone), datetime(2026, 1, 1, tzinfo=zone)
    buckets = date.get_aligned_time_buckets(start, end, Step._1Y, zone)
    periods_iterator = date.iterate_time_periods(start, end, Step._1Y, zone)
    assert periods_iterator is not None
    periods = list(periods_iterator)
    assert [group for _, group in periods] == ["365d", "366d", "365d"]
    assert [(left.year, right.year) for left, right in buckets] == [(2023, 2024), (2024, 2025), (2025, 2026)]


@pytest.mark.parametrize(
    "zone_name,month,day,hours",
    [
        ("Europe/Lisbon", 3, 31, 23),
        ("Europe/Lisbon", 10, 27, 25),
        ("America/New_York", 3, 10, 23),
        ("America/New_York", 11, 3, 25),
    ],
)
@pytest.mark.parametrize("step,minutes", [(Step._1h, 60), (Step._15m, 15), (Step._1m, 1)])
def test_subdaily_buckets_preserve_every_instant_across_dst(zone_name, month, day, hours, step, minutes):
    zone = ZoneInfo(zone_name)
    start = datetime(2024, month, day, tzinfo=zone)
    end = start + timedelta(days=1)
    buckets = date.get_aligned_time_buckets(start, end, step, zone)
    expected_count = hours * 60 // minutes
    assert len(buckets) == expected_count
    expected_edges = [start.timestamp() + i * minutes * 60 for i in range(expected_count + 1)]
    assert [(left.timestamp(), right.timestamp()) for left, right in buckets] == list(
        zip(expected_edges, expected_edges[1:])
    )


@pytest.mark.parametrize(
    "zone_name,utc_start",
    [
        ("Europe/Lisbon", "2024-10-27T00:00:00+00:00"),
        ("America/New_York", "2024-11-03T05:00:00+00:00"),
    ],
)
@pytest.mark.parametrize("fold", [0, 1])
def test_repeated_local_hour_maps_to_the_correct_bucket(zone_name, utc_start, fold):
    zone = ZoneInfo(zone_name)
    start = datetime.fromisoformat(utc_start)
    edges = [(start + timedelta(hours=i)).astimezone(zone) for i in range(3)]
    buckets = list(zip(edges, edges[1:]))
    sample = (start + timedelta(hours=fold, minutes=30)).astimezone(zone)
    result = date.find_bucket_for_time(sample, buckets)
    assert result.timestamp() == edges[fold].timestamp()


@pytest.mark.parametrize("zone_name", ZONES)
@pytest.mark.parametrize("month", [1, 7])
@pytest.mark.parametrize("step", [Step._1d, Step._1M])
def test_alignment_uses_requested_timezone_regardless_of_input_offset(zone_name, month, step):
    zone = ZoneInfo(zone_name)
    local_start = datetime(2024, month, 15, 12, 17, tzinfo=zone)
    local_end = datetime(2024, month, 16, 13, 42, tzinfo=zone)
    span = TimeSpanParameters(
        start_time=local_start.astimezone(timezone.utc),
        end_time=local_end.astimezone(timezone.utc),
        formatted=True,
        time_step=step,
        time_zone=zone,
    )
    date.process_time_span(span)
    if step == Step._1d:
        expected_start, expected_end = datetime(2024, month, 15, tzinfo=zone), datetime(2024, month, 17, tzinfo=zone)
    else:
        expected_start, expected_end = datetime(2024, month, 1, tzinfo=zone), next_month(2024, month, zone)
    assert span.start_time is not None
    assert span.end_time is not None
    assert span.start_time.timestamp() == expected_start.timestamp()
    assert span.end_time.timestamp() == expected_end.timestamp()


@pytest.mark.parametrize(
    "step,exact_end,smaller",
    [
        (Step._15m, "2024-01-01T00:15:00+00:00", Step._1m),
        (Step._1h, "2024-01-01T01:00:00+00:00", Step._15m),
        (Step._1d, "2024-01-02T00:00:00+00:00", Step._1h),
        (Step._1M, "2024-02-01T00:00:00+00:00", Step._1d),
        (Step._1Y, "2025-01-01T00:00:00+00:00", Step._1M),
    ],
)
def test_step_selection_at_exact_boundaries(step, exact_end, smaller):
    start = datetime(2024, 1, 1, tzinfo=timezone.utc)
    end = datetime.fromisoformat(exact_end)
    assert date.get_formatted_time_step(start, end, inclusive=True) == step
    assert date.get_formatted_time_step(start, end, inclusive=False) == smaller
    assert date.get_formatted_time_step(start, end - timedelta(microseconds=1), inclusive=True) == smaller
    assert date.get_formatted_time_step(start, end + timedelta(microseconds=1)) == step


@pytest.mark.parametrize(
    "step,expected_start,expected_end",
    [
        (Step._1m, (2024, 12, 31, 23, 59), (2025, 1, 1, 0, 0)),
        (Step._15m, (2024, 12, 31, 23, 45), (2025, 1, 1, 0, 0)),
        (Step._1h, (2024, 12, 31, 23, 0), (2025, 1, 1, 0, 0)),
        (Step._1d, (2024, 12, 31, 0, 0), (2025, 1, 1, 0, 0)),
        (Step._1M, (2024, 12, 1, 0, 0), (2025, 1, 1, 0, 0)),
        (Step._1Y, (2024, 1, 1, 0, 0), (2025, 1, 1, 0, 0)),
    ],
)
def test_alignment_rolls_into_next_year_and_is_idempotent(step, expected_start, expected_end):
    value = datetime(2024, 12, 31, 23, 59, 59, 999999, tzinfo=timezone.utc)
    left, right = date.align_start_time(value, step), date.align_end_time(value, step)
    assert left == datetime(*expected_start, tzinfo=timezone.utc)
    assert right == datetime(*expected_end, tzinfo=timezone.utc)
    assert date.align_start_time(left, step) == left
    assert date.align_end_time(right, step) == right


def test_bucket_membership_is_half_open_and_accepts_equivalent_offsets():
    start = datetime(2024, 1, 1, tzinfo=timezone.utc)
    edges = [start + timedelta(hours=i) for i in range(3)]
    buckets = list(zip(edges, edges[1:]))
    assert date.find_bucket_for_time(edges[0], buckets) == edges[0]
    assert date.find_bucket_for_time(edges[1], buckets) == edges[1]
    assert date.find_bucket_for_time(datetime.fromisoformat("2024-01-01T06:45:00+05:45"), buckets) == edges[1]
    for outside in [start - timedelta(microseconds=1), edges[-1]]:
        with pytest.raises(ValueError, match="Didn't find"):
            date.find_bucket_for_time(outside, buckets)


@pytest.mark.parametrize("step", list(Step))
def test_empty_bucket_range(step):
    start = datetime(2024, 1, 1, tzinfo=timezone.utc)
    assert date.get_aligned_time_buckets(start, start, step) == []


@pytest.mark.parametrize(
    "zone_name,month,day",
    [
        ("Europe/Lisbon", 3, 31),
        ("Europe/Lisbon", 10, 28),
        ("America/New_York", 3, 10),
        ("America/New_York", 11, 4),
    ],
)
def test_month_alignment_uses_boundary_offset_for_local_iso_input(zone_name, month, day):
    zone = ZoneInfo(zone_name)
    start = datetime.fromisoformat(datetime(2024, month, day, 12, 17, tzinfo=zone).isoformat())
    end = datetime.fromisoformat(datetime(2024, month, day, 15, 42, tzinfo=zone).isoformat())
    span = TimeSpanParameters(start, end, Step._1M, True, zone)
    date.process_time_span(span)
    assert span.start_time is not None
    assert span.end_time is not None
    assert span.start_time.isoformat() == datetime(2024, month, 1, tzinfo=zone).isoformat()
    assert span.end_time.isoformat() == next_month(2024, month, zone).isoformat()


@pytest.mark.parametrize("zone_name,month,day", [("Europe/Lisbon", 10, 27), ("America/New_York", 11, 3)])
def test_bucket_range_can_end_at_an_earlier_clock_time_in_the_repeated_hour(zone_name, month, day):
    zone = ZoneInfo(zone_name)
    start = datetime(2024, month, day, 1, 45, tzinfo=zone, fold=0)
    end = datetime(2024, month, day, 1, 15, tzinfo=zone, fold=1)
    buckets = date.get_aligned_time_buckets(start, end, Step._15m, zone)
    assert [(left.timestamp(), right.timestamp()) for left, right in buckets] == [
        (start.timestamp(), start.timestamp() + 900),
        (start.timestamp() + 900, end.timestamp()),
    ]


@pytest.mark.parametrize("zone_name,month,day", [("Europe/Lisbon", 10, 27), ("America/New_York", 11, 3)])
def test_step_selection_distinguishes_the_two_occurrences_of_an_hour(zone_name, month, day):
    zone = ZoneInfo(zone_name)
    start = datetime(2024, month, day, 1, 30, tzinfo=zone, fold=0)
    end = datetime(2024, month, day, 1, 30, tzinfo=zone, fold=1)
    assert date.get_formatted_time_step(start, end, zone, inclusive=True) == Step._1h
    assert date.get_formatted_time_step(start, end, zone, inclusive=False) == Step._15m
