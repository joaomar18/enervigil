###########EXTERNAL IMPORTS############

import asyncio
from dataclasses import dataclass
from functools import wraps
from enum import Enum
import json
import inspect
from typing import Callable, Awaitable, Any, Optional
from fastapi import Request
from fastapi.responses import StreamingResponse

#######################################

#############LOCAL IMPORTS#############

from web.broadcast import Broadcaster
from web.broadcast import BroadcastService
from web.safety import HTTPSafety
from util.debug import LoggerManager

#######################################


class SSEEvent(str, Enum):
    """
    Enumerates semantic SSE event types.

    These values are emitted as SSE `event` fields to communicate
    application-level events to the client without using HTTP
    status codes after the stream is established.
    """

    HEARTBEAT = "heartbeat"
    INTERNAL_ERROR = "internal_error"
    AUTH_ERROR = "auth_error"


@dataclass
class SSECallerReturn:
    """
    Descriptor returned by an SSE endpoint factory.

    Specifies the broadcaster to subscribe to and the callable
    used to retrieve the latest data snapshot for streaming.
    """

    broadcaster_name: str
    get_data_func: Callable[[], Any]


SSECaller = Callable[[Request, HTTPSafety, BroadcastService], Awaitable[SSECallerReturn]]


def _sse_event(event: Optional[SSEEvent] = None, data: Optional[Any] = None) -> str:
    """
    Format a Server-Sent Events (SSE) message.

    Constructs a properly formatted SSE payload using an optional event
    type and data payload. When neither is provided, a comment-based
    heartbeat message is returned to keep the connection alive.

    Args:
        event: Optional SSE event type.
        data: Optional JSON-serializable payload.

    Returns:
        A string formatted according to the SSE protocol.
    """

    if event and data:
        return f"event: {event.value}\ndata: {json.dumps(data)}\n\n"
    elif event:
        return f"event: {event.value}\n\n"
    elif data:
        return f"data: {json.dumps(data)}\n\n"

    return f"event: {SSEEvent.HEARTBEAT.value}\ndata: {{}}\n\n"


async def _resolve_data_func(data: Any) -> Any:
    """
    Resolve a value that may be synchronous or awaitable.

    If the value is awaitable, it is awaited; otherwise, it is returned
    directly. This allows uniform handling of sync and async data sources.
    """

    if inspect.isawaitable(data):
        return await data
    return data


async def sse_generator(
    protected: bool,
    request: Request,
    safety: HTTPSafety,
    broadcaster: Optional[Broadcaster],
    get_data_func: Callable[[], Any],
    heartbeat_interval: float = 3.0,
):
    """
    Generic event-driven Server-Sent Events (SSE) generator with heartbeat support.

    Subscribes to a broadcaster and streams JSON-encoded data to the client
    whenever an update signal is received. If no update occurs within
    `heartbeat_interval`, a heartbeat message is emitted to maintain
    connection liveness.

    Data is obtained from `get_data_func`, which may be synchronous or
    asynchronous.

    When `protected` is True, the generator performs lightweight, per-event
    session validation and terminates the stream with an authentication
    error event if the session becomes inactive.

    Ensures proper subscription cleanup on client disconnect, authorization
    failure, or generator termination.
    """

    logger = LoggerManager.get_logger(__name__)

    if broadcaster is None:
        logger.warning("Broadcaster is None.")
        yield _sse_event(SSEEvent.INTERNAL_ERROR, {"message": "Broadcaster not found"})
        return

    subscription = await broadcaster.subscribe()
    try:
        while not await request.is_disconnected():
            try:
                await asyncio.wait_for(subscription.wait(), timeout=heartbeat_interval)
                subscription.clear()
                has_update = True

            except asyncio.TimeoutError:
                has_update = False

            if protected and not safety.is_session_active(request):
                yield _sse_event(SSEEvent.AUTH_ERROR, {"message": "Unauthorized"})
                break

            if has_update:
                data = await _resolve_data_func(get_data_func())
                yield _sse_event(data=data)
            else:
                yield _sse_event()

    finally:
        await broadcaster.unsubscribe(subscription)


def auth_sse(protected: bool = True):
    """
    Decorator for defining authenticated Server-Sent Events (SSE) endpoints.

    Wraps an SSE endpoint factory and returns a StreamingResponse that
    subscribes to the specified broadcaster and streams data using a
    shared SSE generator.

    When `protected` is True, session validity is enforced during
    streaming via lightweight per-event checks.
    """

    def decorator(caller: SSECaller) -> Callable:
        """
        Wraps an SSE endpoint factory function.

        The wrapped function resolves the broadcaster name and data
        provider used to initialize the SSE stream.
        """

        @wraps(caller)
        async def wrapper(
            request: Request,
            safety: HTTPSafety,
            broadcast_service: BroadcastService,
            **kwargs,
        ) -> StreamingResponse:
            """
            Initializes and returns an SSE streaming response for the request.
            """

            options = await caller(request, safety, broadcast_service, **kwargs)
            broadcaster = await broadcast_service.get_broadcaster(options.broadcaster_name)
            generator = sse_generator(protected, request, safety, broadcaster, options.get_data_func)
            return StreamingResponse(generator, media_type="text/event-stream")

        return wrapper

    return decorator
