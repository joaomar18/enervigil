###########EXTERNAL IMPORTS############

import asyncio
import logging
from typing import Optional
from fastapi import FastAPI, APIRouter
from uvicorn import Config, Server

#######################################

#############LOCAL IMPORTS#############

from web.safety import HTTPSafety
from web.dependencies import services
from controller.manager import DeviceManager
from db.db import SQLiteDBClient
from db.timedb import TimeDBClient
from web.broadcast import BroadcastService
from analytics.system import SystemMonitor
import web.api.auth as auth_api
import web.api.device as device_api
import web.api.nodes as nodes_api
import web.api.system as system_api
import web.sse.system as system_sse
from conf.env import HTTP_HOSTNAME, HTTP_PORT

#######################################


class HTTPServer:
    """
    Asynchronous HTTP server built with FastAPI for comprehensive energy meter device management and monitoring.

    This server orchestrates multiple API modules to expose a secure REST interface for managing energy meter devices,
    retrieving real-time and historical data, and handling user authentication and authorization. It is designed
    for edge deployment scenarios, prioritizing clear separation of concerns, predictable lifecycle behavior, and
    secure communication.

    Architecture:
        - Built on FastAPI with asynchronous request handling
        - Modular design with feature-specific routers composed under a common `/api` namespace
        - Clear separation between API endpoints and user interface routing
        - Designed to operate behind a reverse proxy that terminates HTTPS
        - Development and deployment concerns explicitly separated

    Core Responsibilities:
        - API Orchestration: Registers and exposes all backend functionality under the `/api` prefix
        - Component Integration: Connects the DeviceManager, databases, and security services
        - Server Lifecycle: Manages startup, execution, and graceful shutdown of the HTTP server
        - Middleware Management: Enables development-only middleware such as CORS when required

    Components:
        - device_manager (DeviceManager): Manages device lifecycle, validation, and real-time data acquisition
        - db (SQLiteDBClient): Handles persistent storage of device configuration
        - timedb (TimeDBClient): Manages time-series data storage and queries
        - safety (HTTPSafety): Implements authentication, authorization, and request security policies
        - system_monitor (SystemMonitor): Monitors and provides system performance metrics
        - broadcast_service (BroadcastService): Manages real-time data broadcast with SSE
        - server (FastAPI): Core web application composed of modular API routers

    API Structure:
        - All backend endpoints are exposed under the `/api` namespace
        - auth_api: Authentication and authorization endpoints (`/api/auth/*`)
        - device_api: Device lifecycle management endpoints (`/api/device/*`)
        - nodes_api: Node data and state endpoints (`/api/nodes/*`)
        - performance_api: Performance metrics endpoints (`/api/performance/*`)

    Security Features:
        - Token-based authentication with session management
        - IP-based request blocking for brute-force attack mitigation
        - Password policy enforcement
        - Automatic session expiration
        - Centralized security checks applied across API routers

    Configuration:
        - CORS enabled only in development to allow a decoupled frontend during local development
        - Intended deployment behind a reverse proxy providing HTTPS termination
        - Uvicorn-based ASGI server with configurable host and port
        - Asynchronous execution using the asyncio event loop
        - Structured logging via LoggerManager

    Usage:
        The server is intended for local or edge deployments where a single administrator manages
        energy meter infrastructure. Core data acquisition and logging services operate independently
        of user interface access, ensuring that UI activity does not interfere with system operation.

    Notes:
        - Authentication and configuration endpoints are isolated under the `/api` boundary
        - CORS is disabled in deployment environments where a single-origin reverse proxy is used
        - The design favors explicit configuration over implicit environment detection
        - Modular API structure supports maintainability and future extension
    """

    def __init__(
        self,
        device_manager: DeviceManager,
        db: SQLiteDBClient,
        timedb: TimeDBClient,
        system_monitor: SystemMonitor,
    ) -> None:
        services.set_dependencies(
            HTTPSafety(), device_manager, db, timedb, system_monitor, BroadcastService()
        )  # Set dependencies for routers endpoints
        self.server = FastAPI()
        api_router = APIRouter(prefix="/api")
        sse_router = APIRouter(prefix="/sse")
        api_router.include_router(auth_api.router)  # Authorization router (handles authorization endpoints)
        api_router.include_router(device_api.router)  # Device router (handles device endpoints)
        api_router.include_router(nodes_api.router)  # Nodes router (handles nodes endpoints)
        api_router.include_router(system_api.router)  # Performance router (handles performance metrics endpoints)
        sse_router.include_router(system_sse.router)  # Performance router (handles performance metrics server events)
        self.server.include_router(api_router)
        self.server.include_router(sse_router)
        self.run_task: Optional[asyncio.Task] = None

    async def start(self) -> None:
        """
        Starts the HTTP server asynchronously using the current event loop.

        This method creates a background task that runs the FastAPI server using `asyncio.create_task`.
        It should be called once during initialization or startup of the HTTP server component.
        """

        if self.run_task is not None:
            raise RuntimeError("Run task is already instantiated")

        loop = asyncio.get_event_loop()
        await self.init_broadcasters()
        await services.get_safety().start_cleanup_task()
        self.run_task = loop.create_task(self.run_server())

    async def init_broadcasters(self):
        """
        Initializes broadcasters for real-time data with SSE.
        """

        await services.get_broadcast_service().register_broadcaster("system", services.get_system_monitor().data_updated)

    async def stop(self) -> None:
        """
        Stops the HTTP Server by cancelling the run task.
        """

        try:
            if self.run_task:
                self.run_task.cancel()
                await self.run_task
        except asyncio.CancelledError:
            pass
        self.run_task = None
        await services.get_safety().stop_cleanup_task()
        await services.get_broadcast_service().shutdown()

    async def run_server(self):
        """
        Asynchronously starts the FastAPI HTTP server using Uvicorn.

        This method builds a Uvicorn `Server` with the provided configuration:
            - Binds the server to the specified host and port.
            - Disables live reload.
            - Suppresses default logging output.

        It runs the server within the asyncio event loop.
        """

        if HTTP_PORT is None:
            raise ValueError("HTTP Port was not specified in the environment.")

        print(f"HTTP_PORT: {HTTP_PORT}, HTTP_HOSTNAME: {HTTP_HOSTNAME}")

        config = Config(
            app=self.server,
            host=HTTP_HOSTNAME,
            port=HTTP_PORT,
            reload=False,
            log_level=logging.CRITICAL + 1,
        )
        server = Server(config)
        await server.serve()
