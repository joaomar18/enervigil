########### EXTERNAL IMPORTS ############

import pytest
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

#########################################

############# LOCAL IMPORTS #############

import util.functions.date as date
from model.date import FormattedTimeStep, TimeSpanParameters

#########################################

UTC = ZoneInfo("UTC")


def dt(*args, **kwargs) -> datetime:
    return datetime(*args, tzinfo=timezone.utc, **kwargs)


###############     B A S I C   C O N V E R S I O N S     ###############


def test_min_to_ms():
    assert date.min_to_ms(1) == 60_000
    assert date.min_to_ms(15) == 900_000
    assert date.min_to_ms(0) == 0


def test_timestamp_roundtrip():
    d = dt(2024, 6, 1, 12, 30, 0)
    ts = date.get_timestamp(d)
    assert ts == int(d.timestamp() * 1000)
    restored = date.get_date_from_timestamp(ts)
    assert restored.timestamp() == pytest.approx(d.timestamp())
    assert restored == d
    assert restored.tzinfo == timezone.utc


@pytest.mark.parametrize("server_timezone", ["UTC", "Europe/Lisbon", "America/New_York"])
@pytest.mark.parametrize("month", [1, 7])
def test_node_update_timestamp_serialization_preserves_instant(monkeypatch, server_timezone, month):
    local_zone = ZoneInfo(server_timezone)

    class ServerDatetime(datetime):
        @classmethod
        def fromtimestamp(cls, timestamp, tz=None):
            # Simulate a server's local timezone without changing the system clock.
            result = super().fromtimestamp(timestamp, tz=tz if tz is not None else local_zone)
            return result if tz is not None else result.replace(tzinfo=None)

    monkeypatch.setattr(date, "datetime", ServerDatetime)
    updated_at = dt(2026, month, 17, 12, 30, 0, 123000)
    timestamp = date.get_timestamp(updated_at)

    # Same conversion used by NodeProcessor.create_extended_info().
    serialized = date.to_iso(date.get_date_from_timestamp(timestamp))
    assert serialized == updated_at.isoformat()
    assert datetime.fromisoformat(serialized).timestamp() * 1000 == timestamp


def test_convert_isostr_to_date_defaults_to_utc_when_missing_tz():
    parsed = date.convert_isostr_to_date("2024-01-01T00:00:00")
    assert parsed.tzinfo == timezone.utc


def test_convert_isostr_to_date_preserves_explicit_tz():
    parsed = date.convert_isostr_to_date("2024-01-01T00:00:00+02:00")
    offset = parsed.utcoffset()
    assert offset is not None
    assert offset.total_seconds() == 2 * 3600


def test_convert_isostr_to_utc_date_normalizes_offset():
    parsed = date.convert_isostr_to_utc_date("2024-01-01T02:00:00+02:00")
    assert parsed.tzinfo == timezone.utc
    # Note: this only relabels the tzinfo, it does not convert the wall-clock time.
    assert parsed.hour == 2


def test_remove_sec_precision():
    d = dt(2024, 1, 1, 10, 30, 45, 123456)
    truncated = date.remove_sec_precision(d)
    assert truncated.second == 0
    assert truncated.microsecond == 0
    assert truncated.minute == 30


def test_to_iso_adds_utc_when_missing():
    naive = datetime(2024, 1, 1, 10, 0, 0)
    iso = date.to_iso(naive)
    assert iso.endswith("+00:00")


def test_to_iso_minutes_strips_seconds():
    d = dt(2024, 1, 1, 10, 30, 45)
    iso = date.to_iso_minutes(d)
    assert iso == "2024-01-01T10:30+00:00"


def test_subtract_datetime_mins_ignores_seconds():
    dt1 = dt(2024, 1, 1, 10, 0, 10)
    dt2 = dt(2024, 1, 1, 10, 15, 59)
    assert date.subtract_datetime_mins(dt1, dt2) == 15


def test_get_time_zone_info_defaults_to_utc():
    tz = date.get_time_zone_info(None)
    assert str(tz) == "UTC"


def test_get_time_zone_info_valid_zone():
    tz = date.get_time_zone_info("Europe/Lisbon")
    assert str(tz) == "Europe/Lisbon"


def test_get_time_zone_info_invalid_zone_raises():
    with pytest.raises(ValueError):
        date.get_time_zone_info("Not/AZone")


###############     T I M E   S T E P   A L I G N M E N T     ###############


def test_align_start_time_for_each_step():
    d = dt(2024, 3, 17, 14, 37, 22, 500)
    assert date.align_start_time(d, FormattedTimeStep._1m) == dt(2024, 3, 17, 14, 37, 0)
    assert date.align_start_time(d, FormattedTimeStep._15m) == dt(2024, 3, 17, 14, 30, 0)
    assert date.align_start_time(d, FormattedTimeStep._1h) == dt(2024, 3, 17, 14, 0, 0)
    assert date.align_start_time(d, FormattedTimeStep._1d) == dt(2024, 3, 17, 0, 0, 0)
    assert date.align_start_time(d, FormattedTimeStep._1M) == dt(2024, 3, 1, 0, 0, 0)
    assert date.align_start_time(d, FormattedTimeStep._1Y) == dt(2024, 1, 1, 0, 0, 0)


def test_align_end_time_returns_unchanged_when_already_aligned():
    d = dt(2024, 3, 17, 14, 30, 0)
    assert date.align_end_time(d, FormattedTimeStep._15m) == d


def test_align_end_time_advances_to_next_boundary_when_unaligned():
    d = dt(2024, 3, 17, 14, 32, 0)
    aligned = date.align_end_time(d, FormattedTimeStep._15m)
    assert aligned == dt(2024, 3, 17, 14, 45, 0)


def test_align_end_time_month_boundary():
    d = dt(2024, 3, 17)
    aligned = date.align_end_time(d, FormattedTimeStep._1M)
    assert aligned == dt(2024, 4, 1)


def test_calculate_date_delta_handles_variable_length_periods():
    assert date.calculate_date_delta(dt(2024, 1, 31), FormattedTimeStep._1M) == dt(2024, 2, 29)  # leap year
    assert date.calculate_date_delta(dt(2023, 1, 1), FormattedTimeStep._1Y) == dt(2024, 1, 1)
    assert date.calculate_date_delta(dt(2024, 1, 1, 10, 0), FormattedTimeStep._1h) == dt(2024, 1, 1, 11, 0)


def test_calculate_date_delta_invalid_step_raises():
    with pytest.raises(ValueError):
        date.calculate_date_delta(dt(2024, 1, 1), "not_a_step")  # type: ignore[arg-type]


@pytest.mark.parametrize(
    "start,end,expected",
    [
        (dt(2024, 1, 1), dt(2025, 1, 2), FormattedTimeStep._1Y),
        (dt(2024, 1, 1), dt(2024, 2, 2), FormattedTimeStep._1M),
        (dt(2024, 1, 1), dt(2024, 1, 3), FormattedTimeStep._1d),
        (dt(2024, 1, 1, 0), dt(2024, 1, 1, 2), FormattedTimeStep._1h),
        (dt(2024, 1, 1, 0, 0), dt(2024, 1, 1, 0, 20), FormattedTimeStep._15m),
        (dt(2024, 1, 1, 0, 0), dt(2024, 1, 1, 0, 5), FormattedTimeStep._1m),
    ],
)
def test_get_formatted_time_step_picks_largest_fitting_step(start, end, expected):
    assert date.get_formatted_time_step(start, end) == expected


def test_time_step_grouping_fixed_intervals():
    assert date.time_step_grouping(dt(2024, 1, 1), FormattedTimeStep._1m) == "1m"
    assert date.time_step_grouping(dt(2024, 1, 1), FormattedTimeStep._15m) == "15m"
    assert date.time_step_grouping(dt(2024, 1, 1), FormattedTimeStep._1h) == "60m"
    assert date.time_step_grouping(dt(2024, 1, 1), FormattedTimeStep._1d) == "1d"


def test_time_step_grouping_month_and_year_variable_days():
    assert date.time_step_grouping(dt(2024, 2, 10), FormattedTimeStep._1M) == "29d"  # Feb 2024 is a leap month
    assert date.time_step_grouping(dt(2024, 1, 10), FormattedTimeStep._1Y) == "366d"  # 2024 is a leap year


def test_bigger_time_step_orders_by_granularity():
    assert date.bigger_time_step(FormattedTimeStep._1m, FormattedTimeStep._1h) == FormattedTimeStep._1h
    assert date.bigger_time_step(FormattedTimeStep._1Y, FormattedTimeStep._1d) == FormattedTimeStep._1Y
    assert date.bigger_time_step(FormattedTimeStep._1M, FormattedTimeStep._1M) == FormattedTimeStep._1M


def test_find_bucket_for_time():
    buckets = [(dt(2024, 1, 1), dt(2024, 1, 2)), (dt(2024, 1, 2), dt(2024, 1, 3))]
    assert date.find_bucket_for_time(dt(2024, 1, 1, 12), buckets) == dt(2024, 1, 1)
    assert date.find_bucket_for_time(dt(2024, 1, 2), buckets) == dt(2024, 1, 2)


def test_find_bucket_for_time_not_found_raises():
    buckets = [(dt(2024, 1, 1), dt(2024, 1, 2))]
    with pytest.raises(ValueError):
        date.find_bucket_for_time(dt(2025, 1, 1), buckets)


def test_get_aligned_time_buckets_covers_full_range():
    buckets = date.get_aligned_time_buckets(dt(2024, 1, 1), dt(2024, 1, 1, 3), FormattedTimeStep._1h)
    assert buckets == [
        (dt(2024, 1, 1, 0), dt(2024, 1, 1, 1)),
        (dt(2024, 1, 1, 1), dt(2024, 1, 1, 2)),
        (dt(2024, 1, 1, 2), dt(2024, 1, 1, 3)),
    ]


def test_iterate_time_periods_none_for_fixed_length_steps():
    assert date.iterate_time_periods(dt(2024, 1, 1), dt(2024, 1, 2), FormattedTimeStep._1h) is None


def test_iterate_time_periods_yields_months_with_group_by_strings():
    it = date.iterate_time_periods(dt(2024, 1, 1), dt(2024, 3, 1), FormattedTimeStep._1M)
    assert it is not None
    periods = list(it)
    assert [p[0] for p in periods] == [dt(2024, 1, 1), dt(2024, 2, 1)]
    assert periods[0][1] == "31d"  # January
    assert periods[1][1] == "29d"  # February 2024 (leap)


###############     P R O C E S S   T I M E   S P A N     ###############


def test_process_time_span_noop_when_not_formatted():
    span = TimeSpanParameters(start_time=dt(2024, 1, 1), end_time=dt(2024, 1, 2), formatted=False)
    date.process_time_span(span)
    assert span.start_time == dt(2024, 1, 1)
    assert span.end_time == dt(2024, 1, 2)
    assert span.time_step is None


def test_process_time_span_noop_when_missing_times():
    span = TimeSpanParameters(start_time=None, end_time=dt(2024, 1, 2), formatted=True)
    date.process_time_span(span)
    assert span.time_step is None


def test_process_time_span_aligns_and_infers_time_step():
    span = TimeSpanParameters(start_time=dt(2024, 1, 1, 0, 5), end_time=dt(2024, 1, 1, 2, 40), formatted=True, time_zone=UTC)
    date.process_time_span(span)
    assert span.time_step == FormattedTimeStep._1h
    assert span.start_time == dt(2024, 1, 1, 0, 0)
    assert span.end_time == dt(2024, 1, 1, 3, 0)
