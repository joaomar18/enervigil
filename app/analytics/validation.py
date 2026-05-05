# This file is related to the acquisition of metrics and should be removed when is no longer needed.
###########EXTERNAL IMPORTS############

import asyncio
import json
import os
from pathlib import Path
from typing import Optional, Dict, Any
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

    def get_metrics(self) -> Dict[str, Any]:
        return {
            "minimum": str(f"{round(self.minimum, 3)} %") if self.minimum is not None else None,
            "average": str(f"{round(self.average, 3)} %") if self.average is not None else None,
            "maximum": str(f"{round(self.maximum, 3)} %") if self.maximum is not None else None,
        }


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

    def success_rate(self) -> Optional[float]:
        if self.executed_cycles <= 0:
            return None
        return ((self.executed_cycles - (self.failed_cycles + self.partially_failed_cycles)) / self.executed_cycles) * 100


@dataclass
class DeviceLoggingValidation:

    name: str
    id: int
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

    VALIDATION_ROOT_PATH = Path(APP_DATA_PATH) / "validation"
    COMMUNICATION_FILE = VALIDATION_ROOT_PATH / "communication.json"
    LOGS_FILE = VALIDATION_ROOT_PATH / "logs.json"
    LOAD_FILE = VALIDATION_ROOT_PATH / "load.json"

    def __init__(self):
        self.devices_comm: Dict[int, DeviceCommunicationValidation] = {}
        self.devices_logs: Dict[int, DeviceLoggingValidation] = {}
        self.load = LoadValidation()
        self.writer_task: Optional[asyncio.Task] = None
        self.writer_lock = asyncio.Lock()

    async def start(self) -> None:

        if self.writer_task is not None:
            raise RuntimeError("Writer task is already instantiated")

        loop = asyncio.get_event_loop()
        self.writer_task = loop.create_task(self.write_validation())

    async def stop(self) -> None:

        try:
            if self.writer_task:
                self.writer_task.cancel()
                await self.writer_task
                self.writer_task = None
        except asyncio.CancelledError:
            pass

    async def write_validation(self) -> None:
        try:
            while True:
                await asyncio.sleep(60)
                await self.write_all()

        except asyncio.CancelledError:
            # Final write before stopping
            await self.write_all()
            raise

    async def write_all(self) -> None:
        async with self.writer_lock:
            await asyncio.gather(self.write_devices_comm(), self.write_logs(), self.write_load())

    async def write_devices_comm(self) -> None:
        data = {
            str(device_id): {
                "id": device.id,
                "name": device.name,
                "expected_cycles": device.expected_cycles,
                "executed_cycles": device.executed_cycles,
                "failed_cycles": device.failed_cycles,
                "partially_failed_cycles": device.partially_failed_cycles,
                "success_rate": device.success_rate(),
                "comm_metrics": device.comm_metrics.get_metrics(),
            }
            for device_id, device in self.devices_comm.items()
        }

        await self.write_json_file(self.COMMUNICATION_FILE, data)

    async def write_logs(self) -> None:
        data = {
            str(device_id): {
                "id": device_logs.id,
                "name": device_logs.name,
                "expected_inst_logs": device_logs.expected_inst_logs,
                "expected_counter_logs": device_logs.expected_counter_logs,
                "expected_total_logs": device_logs.expected_total_logs,
                "executed_inst_logs": device_logs.executed_inst_logs,
                "executed_counter_logs": device_logs.executed_counter_logs,
                "executed_total_logs": device_logs.executed_total_logs,
            }
            for device_id, device_logs in self.devices_logs.items()
        }

        await self.write_json_file(self.LOGS_FILE, data)

    async def write_load(self) -> None:
        data = {
            "cpu_metrics": self.load.cpu_metrics.get_metrics(),
            "ram_metrics": self.load.ram_metrics.get_metrics(),
        }

        await self.write_json_file(self.LOAD_FILE, data)

    async def write_json_file(self, file_path: Path, data: Any) -> None:
        await asyncio.to_thread(self.write_json_file_sync, file_path, data)

    def write_json_file_sync(self, file_path: Path, data: Any) -> None:
        self.VALIDATION_ROOT_PATH.mkdir(parents=True, exist_ok=True)
        temp_file_path = file_path.with_suffix(file_path.suffix + ".tmp")

        with open(temp_file_path, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4, ensure_ascii=False, allow_nan=False)

        os.replace(temp_file_path, file_path)


validation_metrics = ValidationMetrics()
