# This file is related to the acquisition of metrics and should be removed when is no longer needed.
###########EXTERNAL IMPORTS############

from typing import Optional, Dict
import math
from dataclasses import dataclass, field

#######################################

#############LOCAL IMPORTS#############

from conf.env import APP_DATA_PATH

#######################################


@dataclass
class PerformanceMetrics:
    minimum: Optional[float] = None
    average: Optional[float] = None
    maximum: Optional[float] = None
    count: int = 0
    _average_sum: float = 0.0

    def update_metrics(self, value: float) -> None:
        if math.isnan(value):
            return

        if self.minimum is None or value < self.minimum:
            self.minimum = value
        if self.maximum is None or value > self.maximum:
            self.maximum = value
        self.count += 1
        self._average_sum += value
        self.average = self._average_sum / self.count

    def reset(self) -> None:
        self.minimum = None
        self.average = None
        self.maximum = None
        self.count = 0
        self._average_sum = 0.0


@dataclass
class DeviceCommunicationValidation:

    name: str
    id: int
    expected_cycles: int = 0
    executed_cycles: int = 0
    failed_cycles: int = 0
    partially_failed_cycles: int = 0
    comm_metrics: PerformanceMetrics = field(default_factory=PerformanceMetrics)

    def add_expected_cycle(self) -> None:
        self.expected_cycles += 1

    def add_executed_cycle(self, failed_cycle: bool, partially_failed_cycle: bool) -> None:
        self.executed_cycles += 1
        if failed_cycle:
            self.failed_cycles += 1
        if partially_failed_cycle:
            self.partially_failed_cycles += 1

    def success_rate(self) -> float:
        if self.executed_cycles <= 0:
            return math.nan
        return ((self.executed_cycles - (self.failed_cycles + self.partially_failed_cycles)) / self.executed_cycles) * 100


@dataclass
class LoggingValidation:

    expected_inst_logs: int = 0
    expected_counter_logs: int = 0
    expected_total_logs: int = 0
    executed_inst_logs: int = 0
    executed_counter_logs: int = 0
    executed_total_logs: int = 0

    def add_expected_log(self, is_counter: bool) -> None:
        if is_counter:
            self.expected_counter_logs += 1
        else:
            self.expected_inst_logs += 1
        self.expected_total_logs += 1

    def add_executed_log(self, is_counter: bool) -> None:
        if is_counter:
            self.executed_counter_logs += 1
        else:
            self.executed_inst_logs += 1
        self.executed_total_logs += 1


@dataclass
class LoadValidation:
    cpu_metrics: PerformanceMetrics = field(default_factory=PerformanceMetrics)
    ram_metrics: PerformanceMetrics = field(default_factory=PerformanceMetrics)


class ValidationMetrics:

    VALIDATION_ROOT_PATH = str(f"{APP_DATA_PATH}/validation")
    COMMUNICATION_FILE = f"{VALIDATION_ROOT_PATH}/communication.json"
    LOGS_FILE = f"{VALIDATION_ROOT_PATH}/logs.json"
    LOAD_FILE = f"{VALIDATION_ROOT_PATH}/load.json"

    def __init__(self):
        self.devices_comm: Dict[str, DeviceCommunicationValidation] = {}
        self.logs = LoggingValidation()
        self.load = LoadValidation()
