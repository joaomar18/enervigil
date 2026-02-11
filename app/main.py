###########EXTERNAL IMPORTS############

import asyncio
import logging

#######################################

#############LOCAL IMPORTS#############

from db.timedb import TimeDBClient
from db.db import SQLiteDBClient
from mqtt.client import MQTTClient
from controller.manager import DeviceManager
from web.server import HTTPServer
from util.debug import LoggerManager
from analytics.system import SystemMonitor

#######################################


async def async_main() -> None:
    """
    Main asynchronous entry point for the application.

    Responsibilities:
        - Initializes logging, database, MQTT, and HTTP server components.
        - Creates and registers energy meter devices.
        - Keeps the event loop alive to support background tasks (e.g., MQTT, HTTP, write queues).
    """

    # Initialize global logger
    LoggerManager.init()
    logger = LoggerManager.get_logger(__name__, level=logging.DEBUG)
    timedb_client = TimeDBClient()
    sqlitedb_client = SQLiteDBClient()
    mqtt_client = MQTTClient()
    device_manager = DeviceManager(
        enable_publish=mqtt_client.enable_publish,
        publish_queue=mqtt_client.publish_queue,
        measurements_queue=timedb_client.write_queue,
        devices_db=sqlitedb_client,
    )
    system_monitor = SystemMonitor()
    http_server = HTTPServer(
        device_manager=device_manager,
        db=sqlitedb_client,
        timedb=timedb_client,
        system_monitor=system_monitor,
    )

    try:
        # Create core infrastructure
        await timedb_client.init_connection()
        await sqlitedb_client.init_connection()
        await device_manager.start()
        await mqtt_client.start()
        await http_server.start()
        system_monitor.start()
        # Keep main loop alive to support background tasks
        while True:
            await asyncio.sleep(2)
    except asyncio.CancelledError:
        logger.info("Application is being shutdown by the user.")
    except Exception as e:
        logger.exception(f"Application failed to start: {e}")
    finally:
        logger.debug("Shutting down InfluxDB client...")
        await timedb_client.close_connection()
        logger.debug("Shutting down SQLiteDB client...")
        await sqlitedb_client.close_connection()
        logger.debug("Shutting down MQTT client...")
        await mqtt_client.stop()
        logger.debug("Shutting down Device Manager...")
        await device_manager.stop()
        logger.debug("Shutting down System Monitor...")
        system_monitor.stop()
        logger.debug("Shutting down HTTP server...")
        await http_server.stop()
        logger.info("Application shutdown complete.")


if __name__ == "__main__":
    asyncio.run(async_main())
