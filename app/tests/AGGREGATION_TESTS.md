# Aggregation regression tests

Run from `app/` with the application's dependencies and `pytest` installed:

```sh
python -m pytest tests/test_aggregation_calendar.py tests/test_aggregation_pipeline.py tests/test_date_utils.py tests/test_processors.py tests/test_meter_calculation.py tests/test_meter_validation.py -q
```

The two aggregation files contain **324 parameterized cases**. Including 121
existing date, processor, meter calculation and validation cases, the latest run
produced **445 passed, 0 failed**. There are no skips or expected failures.

Pyright's standard check also reports zero errors and warnings for the two new
test files, `test_date_utils.py`, and the three modified production modules.

## Scope

- [Calendar tests](test_aggregation_calendar.py): all months in common and leap
  years; minute through yearly steps; UTC, Lisbon, New York and Kathmandu;
  spring/autumn DST transitions; repeated-hour membership; requested timezone
  alignment; local ISO offsets across DST; year rollover; exclusive end
  boundaries; empty ranges.
- [Pipeline tests](test_aggregation_pipeline.py): actual query generation and
  result processing; monthly query splits; counter total conservation; weighted
  measurement averages; order-independent merging; extrema and their timestamps;
  precision; unit conversion; missing data; source interval promotion; raw and
  formatted requests; chunked results; connection cleanup on errors; storage
  fields needed for later aggregation; energy channels, phases and directions;
  bucket/global power factor; peak power metrics; complete DST result processing;
  historical logging-period changes; missing channels at a coarser interval;
  valid ranges spanning a repeated hour.

Calendar expectations use standard-library calendar arithmetic and explicit UTC
instants. Measurement and energy expectations use independently calculated totals
and weights, rather than the production aggregation helpers.

The pipeline fixture replaces the InfluxDB connection with scripted responses.
It uses real `ResultSet`, node and time-span objects and runs the application's
query construction, merging, metrics and meter extraction code. It does **not**
execute queries against a live InfluxDB server, so server-side grouping and query
execution remain outside this suite's coverage.

## Corrected behavior

| Area | Behavior |
| --- | --- |
| Measurement weights | Merging accumulates both sums and sample counts. Groups with sums/counts `20/2` and `90/3` now yield 22 for both the bucket and global average. |
| DST intervals | Minute and hour steps use elapsed time. Days, months and years retain local calendar boundaries. Autumn DST days have 25 hourly buckets, with distinct values and conserved totals. |
| Repeated hours | Membership, step selection and range validation compare timestamps. Database post-processing uses UTC dictionary keys so the repeated hours cannot overwrite each other. |
| Timezone alignment | Input timestamps are converted to the requested timezone before rounding boundaries. |
| Energy unit prefixes | Bucket and global power factor use energy values converted to compatible base scales. Returned energy values retain their configured units. |
| Energy channel intervals | If later data increases the shared interval, earlier results are regrouped in memory before calculating power factor. Totals and missing values are preserved, with no additional database queries. |

Relevant implementation:
[date helpers](../util/functions/date.py),
[database post-processing](../db/timedb.py), and
[meter extraction](../controller/meter/extraction.py).

To isolate a regression group, add one of these filters to the command above:

```sh
-k "measurement_groups or monthly_measurement_fragments"
-k "dst or repeated_hour or repeated_local_hour"
-k "alignment"
-k "normalizes_different_unit_prefixes"
-k "historical_logging_change or missing_channel_uses_the_step"
```

The initial 379-case run had 36 failures, which also reproduced with the original
timestamp helper. Two initial power-factor cases used `MWh`, which meter
validation rejects; they now exercise supported `kWh`/`kVArh` inputs. The energy
fixture validates its node names and units. Additional regressions cover the
dictionary-key collision and historical-data cases found during investigation.

## Coverage collected

The final 445-case run measured these results with `pytest-cov --cov-branch`:

| Module | Statements exercised | Combined statement/branch coverage |
| --- | ---: | ---: |
| `util/functions/date.py` | 186 / 193 | 95% |
| `controller/meter/extraction.py` | 84 / 84 | 98% |
| `db/timedb.py` | 247 / 344 | 73% |

The database module also contains lifecycle, writer and deletion code outside
these aggregation tests. Coverage alone does not establish correctness or verify
InfluxDB's query engine.
