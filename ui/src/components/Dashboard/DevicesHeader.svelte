<script lang="ts">
    import { onMount } from "svelte";
    import { getDeviceID } from "$lib/logic/view/navigation";
    import { logoutUserAPI } from "$lib/logic/api/auth";
    import { getDeviceIdentificationWithImageAPI } from "$lib/logic/api/device";
    import { APIRetrier } from "$lib/logic/api/retrier";
    import Notification from "../General/Notification.svelte";
    import Logout from "./Logout.svelte";
    import DeviceInfoHeader from "../Devices/DeviceInfoHeader.svelte";
    import MobileDeviceInfoHeader from "../Devices/MobileDeviceInfoHeader.svelte";
    import InlineLoader from "../General/InlineLoader.svelte";
    import ToolTipText from "../General/ToolTipText.svelte";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Variables
    let deviceId: number;
    let deviceName: string;
    let deviceImageUrl: string;
    let dataFetched: boolean = false;

    onMount(() => {
        let deviceIdRequest = getDeviceID();
        let deviceDataRetrier: APIRetrier<{ deviceId: number; deviceName: string; deviceImageUrl: string } | null> | null = null;
        if (deviceIdRequest) {
            deviceDataRetrier = new APIRetrier(
                getDeviceIdentificationWithImageAPI(deviceIdRequest),
                (result) => {
                    if (result === null) return;
                    deviceId = result.deviceId;
                    deviceName = result.deviceName;
                    deviceImageUrl = result.deviceImageUrl;
                    dataFetched = true;
                },
                5000,
            );
        }

        //Clean-up logic
        return () => {
            deviceDataRetrier?.stop();
            deviceDataRetrier = null;
        };
    });
</script>

<!--
    Devices header: sticky top bar for the dashboard device view.
    Shows device info (desktop and mobile layouts), notifications, and logout button.
    Uses DeviceInfoHeader and MobileDeviceInfoHeader for responsive device display.
    Notification and logout actions are always visible on the right.
-->
<div class="header-div">
    <div class="main-header-div">
        <div class="center-div">
            <div class="center-content-div">
                <InlineLoader loaded={!!deviceName && !!deviceId}>
                    <div class="desktop-device-info-div">
                        <DeviceInfoHeader {dataFetched} {deviceId} {deviceName} {deviceImageUrl} />
                    </div>
                    <div class="mobile-device-info-div">
                        <MobileDeviceInfoHeader {dataFetched} {deviceId} />
                    </div>
                </InlineLoader>
            </div>
        </div>
        <div class="right-div">
            <Notification notificationsNumber={"1"} />
            <Logout
                buttonText={$texts.logout}
                imageUrl="/img/logout.svg"
                enableToolTip={true}
                onClick={async () => {
                    await logoutUserAPI().call({ timeout: 5000 });
                }}
            >
                <div slot="tooltip"><ToolTipText text={$texts.logout} /></div>
            </Logout>
        </div>
    </div>
</div>

<style>
    /* Sticky header bar for devices dashboard */
    .header-div {
        position: sticky;
        top: 0;
        background-color: #181d23;
        flex-shrink: 0;
        width: 100%;
        height: 74px;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }

    /* Main header content container */
    .header-div .main-header-div {
        margin: 0;
        padding: 0;
        margin-left: 46px;
        width: 100%;
        min-width: 0;
        height: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        z-index: 99;
    }

    /* Centered device info section */
    .center-div {
        flex: 1;
        height: 100%;
        min-width: 0;
        margin: 0;
        padding: 0;
        padding-left: 20px;
        padding-right: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Centered device info content section */
    .center-content-div {
        width: 100%;
        max-width: 375px;
        height: 40px;
    }

    /* Right section: notifications and logout */
    .right-div {
        padding-right: 20px;
        width: fit-content;
        height: fit-content;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        gap: 20px;
    }

    /* Device info for desktop layout */
    .desktop-device-info-div {
        display: none;
        justify-content: center;
        align-items: center;
        position: relative;
        margin: 0;
        padding: 0;
        width: 100%;
        min-width: 0;
        height: 100%;
    }

    /* Device info for mobile layout */
    .mobile-device-info-div {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        margin: 0;
        padding: 0;
        width: 100%;
        min-width: 0;
        height: 100%;
    }

    /* Responsive layout adjustments */
    @media (min-width: 880px) {
        .header-div .main-header-div {
            justify-content: space-between;
        }
    }

    @media (min-width: 520px) {
        .desktop-device-info-div {
            display: flex;
        }
        .mobile-device-info-div {
            display: none;
        }
    }

    @media (min-width: 880px) {
        .header-div .main-header-div {
            margin-left: 250px;
        }
    }
</style>
