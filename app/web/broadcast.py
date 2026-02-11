###########EXTERNAL IMPORTS############

import asyncio
from typing import Optional, Set, Dict

#######################################

#############LOCAL IMPORTS#############

#######################################


class Broadcaster:
    """
    Fan-out helper that broadcasts update signals to multiple subscribers.

    A Broadcaster listens to a shared asyncio.Event (`signal`) and propagates
    notifications to per-subscriber asyncio.Events. It guarantees deterministic
    wake-up semantics without buffering or polling, making it suitable for
    state-based streaming (e.g. SSE).
    """

    def __init__(self, signal: asyncio.Event):
        self.events: Set[asyncio.Event] = set()
        self.signal = signal
        self.signal_task: Optional[asyncio.Task] = None
        self.lock = asyncio.Lock()

    async def shutdown(self):
        """
        Stop the broadcaster and cancel the internal fan-out task.

        Clears all subscriber events and ensures the background task
        terminates cleanly. Safe to call multiple times.
        """

        task_to_cancel: Optional[asyncio.Task] = None
        async with self.lock:
            self.events.clear()
            task_to_cancel = self.signal_task
            self.signal_task = None

        if task_to_cancel:
            try:
                task_to_cancel.cancel()
                await task_to_cancel
            except asyncio.CancelledError:
                pass

    async def subscribe(self) -> asyncio.Event:
        """
        Register a new subscriber.

        Returns:
            A per-subscriber asyncio.Event that will be set whenever
            new data is available. The event is initially set to force
            an immediate first update.
        """

        event = asyncio.Event()
        event.set()  # Forces the first event to be sent
        async with self.lock:
            self.events.add(event)
            if self.signal_task is None:
                self.signal_task = asyncio.create_task(self.wait_for_signal())
        return event

    async def unsubscribe(self, event: asyncio.Event):
        """
        Unregister a subscriber.

        If this was the last subscriber, the internal fan-out task is
        cancelled automatically.
        """

        task_to_cancel: Optional[asyncio.Task] = None
        async with self.lock:
            self.events.discard(event)
            if len(self.events) == 0 and self.signal_task:
                task_to_cancel = self.signal_task
                self.signal_task = None

        if task_to_cancel:
            try:
                task_to_cancel.cancel()
                await task_to_cancel
            except asyncio.CancelledError:
                pass

    async def wait_for_signal(self) -> None:
        """
        Background fan-out loop.

        Waits for the shared signal to be set and propagates the
        notification to all active subscriber events.
        """

        while True:
            await self.signal.wait()
            self.signal.clear()

            async with self.lock:
                for event in self.events:
                    event.set()


class BroadcastService:
    """
    Registry and lifecycle manager for named Broadcaster instances.

    This service allows multiple independent broadcasters to coexist
    (e.g. one per SSE endpoint) and provides safe registration, lookup,
    and shutdown semantics.
    """

    def __init__(self):
        self.broadcasters: Dict[str, Broadcaster] = {}
        self.lock = asyncio.Lock()

    async def get_broadcaster(self, name: str) -> Optional[Broadcaster]:
        """
        Retrieve a broadcaster by name.

        Args:
            name: Broadcaster identifier.

        Returns:
            The Broadcaster instance if present, otherwise None.
        """

        async with self.lock:
            return self.broadcasters.get(name)

    async def register_broadcaster(self, name: str, signal: asyncio.Event) -> None:
        """
        Register a new broadcaster.

        Args:
            name: Unique broadcaster identifier.
            signal: Shared update signal driving this broadcaster.

        Raises:
            RuntimeError: If a broadcaster with the same name already exists.
        """

        async with self.lock:
            if name in self.broadcasters:
                raise RuntimeError(f"Broadcaster with name {name} already registered")
            self.broadcasters[name] = Broadcaster(signal)

    async def unregister_broadcaster(self, name: str) -> None:
        """
        Unregister and shut down a broadcaster.

        If the broadcaster exists, it is shut down cleanly before removal.
        """

        broadcaster: Optional[Broadcaster] = None
        async with self.lock:
            broadcaster = self.broadcasters.pop(name, None)
        if broadcaster:
            await broadcaster.shutdown()

    async def shutdown(self) -> None:
        """
        Shut down all registered broadcasters.

        Cancels all internal fan-out tasks and clears the registry.
        Intended for application shutdown.
        """

        async with self.lock:
            broadcasters = list(self.broadcasters.values())
            self.broadcasters.clear()

        for broadcaster in broadcasters:
            await broadcaster.shutdown()
