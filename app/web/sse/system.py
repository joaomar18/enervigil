###########EXTERNAL IMPORTS############

from fastapi import APIRouter, Request, Depends

#######################################

#############LOCAL IMPORTS#############

from web.sse.decorator import auth_sse, SSECallerReturn
from web.safety import HTTPSafety
from web.broadcast import BroadcastService
from analytics.system import SystemMonitor
from web.dependencies import services

#######################################

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/get_realtime_metrics")
@auth_sse(protected=True)
async def get_system_metrics(
    request: Request,
    safety: HTTPSafety = Depends(services.get_safety),
    broadcast_service: BroadcastService = Depends(services.get_broadcast_service),
    system_monitor: SystemMonitor = Depends(services.get_system_monitor),
) -> SSECallerReturn:
    """Retrieves the system real time performance metrics."""

    def get_data():
        return system_monitor.get_realtime_data().get_data()

    return SSECallerReturn("system", get_data)


@router.get("/get_cpu_usage_history")
@auth_sse(protected=True)
async def get_cpu_usage_history(
    request: Request,
    safety: HTTPSafety = Depends(services.get_safety),
    broadcast_service: BroadcastService = Depends(services.get_broadcast_service),
    system_monitor: SystemMonitor = Depends(services.get_system_monitor),
) -> SSECallerReturn:
    """Retrieves historical CPU usage data."""

    return SSECallerReturn("system", system_monitor.get_cpu_usage_history)


@router.get("/get_ram_usage_history")
@auth_sse(protected=True)
async def get_ram_usage_history(
    request: Request,
    safety: HTTPSafety = Depends(services.get_safety),
    broadcast_service: BroadcastService = Depends(services.get_broadcast_service),
    system_monitor: SystemMonitor = Depends(services.get_system_monitor),
) -> SSECallerReturn:
    """Retrieves historical RAM usage data."""

    return SSECallerReturn("system", system_monitor.get_ram_usage_history)


@router.get("/get_disk_read_speed_history")
@auth_sse(protected=True)
async def get_disk_read_speed_history(
    request: Request,
    safety: HTTPSafety = Depends(services.get_safety),
    broadcast_service: BroadcastService = Depends(services.get_broadcast_service),
    system_monitor: SystemMonitor = Depends(services.get_system_monitor),
) -> SSECallerReturn:
    """Retrieves historical disk read speed data."""

    return SSECallerReturn("system", system_monitor.get_disk_read_speed_history)


@router.get("/get_disk_write_speed_history")
@auth_sse(protected=True)
async def get_disk_write_speed_history(
    request: Request,
    safety: HTTPSafety = Depends(services.get_safety),
    broadcast_service: BroadcastService = Depends(services.get_broadcast_service),
    system_monitor: SystemMonitor = Depends(services.get_system_monitor),
) -> SSECallerReturn:
    """Retrieves historical disk write speed data."""

    return SSECallerReturn("system", system_monitor.get_disk_write_speed_history)
