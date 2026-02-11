<script lang="ts">
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";
    import DeviceCard from "../../../components/Devices/DeviceCard.svelte";
    import AddDevice from "../../../components/Devices/AddDevice.svelte";
    import { navigateTo, resetDashboardLoader } from "$lib/logic/view/navigation";
    import { getAllDevicesStatusAPI, getAllDevicesStatusWithImageAPI } from "$lib/logic/api/device";
    import { filterDevicesStatus } from "$lib/logic/util/device";
    import { APIPoller } from "$lib/logic/api/poller";

    // Stores
    import { searchQuery } from "$lib/stores/view/navigation";

    //Types
    import type { DeviceStatus } from "$lib/types/device/base";
    import DeviceDetailSheet from "../../../components/Devices/DeviceDetailSheet.svelte";

    // Variables
    let devicesStatus: Record<number, DeviceStatus>;
    let sortedDevices: Array<DeviceStatus> = [];
    let devicesImages: Record<number, string> = {};
    let showDetailDeviceWindow: boolean = false;
    let detailDeviceId: number | undefined = undefined;
    let detailDeviceImage: string;
    let detailDeviceStatus: DeviceStatus;

    // Sorted devices
    $: if (devicesStatus) {
        if (detailDeviceId) {
            detailDeviceStatus = devicesStatus[detailDeviceId];
            detailDeviceImage = devicesImages[detailDeviceId];
        }
        sortedDevices = filterDevicesStatus(devicesStatus, $searchQuery);
    }

    // Go to edit device page
    async function editDevice(deviceId: number): Promise<void> {
        await navigateTo("/devices/edit", {
            deviceId: String(deviceId),
        });
    }

    // Go to device main configured page (right now enters general view)
    async function enterDevice(deviceId: number): Promise<void> {
        await navigateTo("/devices/general_view", {
            deviceId: String(deviceId),
        });
    }

    // Go to add device page
    async function addDevice(): Promise<void> {
        await navigateTo("/devices/add");
    }

    // Mount function to poll devices status
    onMount(() => {
        resetDashboardLoader();
        let devicesStatusPoller: APIPoller<{ devicesStatus: Record<number, DeviceStatus> } | null> | null = null;

        let devicesStatusWithImagesPoller: APIPoller<{
            devicesStatus: Record<number, DeviceStatus>;
            devicesImages: Record<number, string>;
        } | null> | null = new APIPoller(
            getAllDevicesStatusWithImageAPI(),
            (result) => {
                if (result === null) return;
                devicesStatus = result.devicesStatus;
                devicesImages = result.devicesImages;
                devicesStatusWithImagesPoller?.stop();
                devicesStatusWithImagesPoller = null;
                devicesStatusPoller = new APIPoller(
                    getAllDevicesStatusAPI(),
                    (result) => {
                        if (result === null) return;
                        devicesStatus = result.devicesStatus;
                    },
                    5000,
                    undefined,
                    false,
                );
            },
            5000,
        );

        //Clean-up logic
        return () => {
            devicesStatusPoller?.stop();
            devicesStatusWithImagesPoller?.stop();
            devicesStatusPoller = null;
            devicesStatusWithImagesPoller = null;
        };
    });
</script>

<!--
  Devices Page: renders a loading spinner until `loaded` is true,
  then displays a grid of DeviceCard components followed by the AddDevice button.
-->
<div class="content" in:fade={{ duration: 300 }}>
    {#each sortedDevices as device (device.id)}
        <DeviceCard
            deviceID={device.id}
            deviceName={device.name}
            connected={device.connected}
            alarm={device.alarm}
            warning={device.warning}
            imageURL={devicesImages[device.id]}
            onEdit={() => editDevice(device.id)}
            onInfo={() => {
                detailDeviceId = device.id;
                detailDeviceStatus = devicesStatus[device.id];
                detailDeviceImage = devicesImages[device.id];
                showDetailDeviceWindow = true;
            }}
            onEnter={() => enterDevice(device.id)}
        />
    {/each}
    <AddDevice onClick={() => addDevice()} />
    <!----------     N O D E     C O N F I G U R A T I O N     S H E E T     ---------->
    <DeviceDetailSheet bind:showPanel={showDetailDeviceWindow} deviceStatus={detailDeviceStatus} deviceImage={detailDeviceImage} />
</div>

<style>
    /* Main content grid for device cards and AddDevice button */
    .content {
        padding: 0;
        margin: 0;
        height: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fill, 300px);
        gap: 20px;
        justify-content: center;
    }
</style>
