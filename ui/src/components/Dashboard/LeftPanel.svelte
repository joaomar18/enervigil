<script lang="ts">
    import { getDeviceID } from "$lib/logic/view/navigation";
    import { isDeviceViewPage, navigateTo } from "$lib/logic/view/navigation";
    import { isDeviceSubPage } from "$lib/logic/view/navigation";
    import { MainSection } from "$lib/types/view/navigation";
    import Link from "./Link.svelte";
    import LangSelector from "../General/LangSelector.svelte";
    import Logo from "../General/Logo.svelte";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { LeftPanelStyle } from "$lib/style/dashboard";
    import { SubLinkStyle } from "$lib/style/dashboard";

    // Stores
    import { currentPage } from "$lib/stores/view/navigation";
    import { currentDeviceID } from "$lib/stores/device/current";

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $LeftPanelStyle;

    // Props
    export let leftPanelOpen: boolean;
    export let activeSection: string;

    // Layout / styling props
    export let overlayMaskBackgroundColor: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let borderRightColor: string | undefined = undefined;
    export let scrollbarTrackColor: string | undefined = undefined;
    export let scrollbarThumbColor: string | undefined = undefined;
    export let sectionTextColor: string | undefined = undefined;
    export let sectionTextWeight: string | undefined = undefined;
    export let sectionBorderBottomColor: string | undefined = undefined;
    export let textColor: string | undefined = undefined;
    export let textWeight: string | undefined = undefined;

    $: localOverrides = {
        overlayMaskBackgroundColor,
        backgroundColor,
        borderRightColor,
        scrollbarTrackColor,
        scrollbarThumbColor,
        sectionTextColor,
        sectionTextWeight,
        sectionBorderBottomColor,
        textColor,
        textWeight,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let devicesSubSection: boolean = false;
    let devicesViewPage: boolean = false;
    let expandedSection: MainSection | undefined;

    // Reactive Statements
    $: devicesSubSection = isDeviceSubPage($currentPage);
    $: devicesViewPage = isDeviceViewPage($currentPage);
    $: expandedSection = updateExpandedSection($currentPage);

    // Functions
    async function browseTo(path: string, params: Record<string, string> = {}) {
        await navigateTo(path, params);
    }

    function closePanel(): void {
        leftPanelOpen = false;
    }

    function updateExpandedSection(currentPage: string): MainSection | undefined {
        for (let section of Object.values(MainSection)) {
            if (currentPage.includes(section)) return section;
        }
        return undefined;
    }

    function expandSection(section: MainSection): void {
        if (expandedSection === section) {
            expandedSection = undefined;
            return;
        }
        expandedSection = section;
    }
</script>

<!--
    LeftPanel: main navigation sidebar for the dashboard.
    Contains navigation links for devices, diagnostics, system, and language selector.
    Responsive: overlays as a drawer on small screens, fixed on desktop.
    Uses Link, Logo, and LangSelector components for modularity and theme support.
    Handles open/close state and disables device-specific links when no device is selected.
-->
<div
    class="mask"
    style="
        --overlay-mask-background-color: {mergedStyle.overlayMaskBackgroundColor};
    "
    class:close={!leftPanelOpen}
>
    <button on:click={closePanel} aria-label="Close Panel"></button>
</div>
<div
    class="container"
    style="
        --background-color: {mergedStyle.backgroundColor};
        --border-right-color: {mergedStyle.borderRightColor};
        --scrollbar-track-color: {mergedStyle.scrollbarTrackColor};
        --scrollbar-thumb-color: {mergedStyle.scrollbarThumbColor};
        --section-text-color: {mergedStyle.sectionTextColor};
        --section-text-weight: {mergedStyle.sectionTextWeight};
        --section-border-bottom-color: {mergedStyle.sectionBorderBottomColor};
        --text-color: {mergedStyle.textColor};
        --text-weight: {mergedStyle.textWeight};
    "
    class:open={leftPanelOpen}
>
    <!--Only show logo div when logo div of header is disabled-->
    <div class="logo-div" class:management-page={!devicesViewPage} class:device-view-page={devicesViewPage}>
        <Logo />
    </div>
    <div class="content">
        <nav class="nav-section">
            <!-- Devices Section -->
            <div class="section">
                <span class="section-label">{$texts.general}</span>
                <div class="section-links-div">
                    <Link
                        selected={activeSection.includes("/devices")}
                        mainLink={true}
                        expanded={expandedSection === MainSection.DEVICES}
                        buttonText={$texts.devices}
                        imageURL="/img/devices.svg"
                        onToogleExpand={() => expandSection(MainSection.DEVICES)}
                    >
                        <Link
                            style={$SubLinkStyle}
                            selected={activeSection.includes("/devices/dashboard")}
                            buttonText={$texts.dashboard}
                            imageURL="/img/dashboard.svg"
                            onClick={() => {
                                browseTo("/devices/dashboard");
                            }}
                        />
                        <Link
                            style={$SubLinkStyle}
                            selected={activeSection.includes("/devices/add")}
                            buttonText={$texts.addNew}
                            imageURL="/img/plus-simple.svg"
                            onClick={() => {
                                browseTo("/devices/add");
                            }}
                        />
                        <Link
                            style={$SubLinkStyle}
                            disabled={!$currentDeviceID}
                            selected={activeSection.includes("/devices/edit")}
                            buttonText={$texts.editConfig}
                            imageURL="/img/edit_pencil.svg"
                            disabledImageURL="/img/edit_pencil_muted.svg"
                            onClick={() => {
                                browseTo("/devices/edit", { deviceId: String(getDeviceID()) });
                            }}
                        />
                        <Link
                            style={$SubLinkStyle}
                            lastLink={true}
                            disabled={!$currentDeviceID}
                            selected={activeSection.includes("/devices/general_view")}
                            buttonText={$texts.generalView}
                            imageURL="/img/general_view.svg"
                            disabledImageURL="/img/general_view_muted.svg"
                            onClick={() => {
                                browseTo("/devices/general_view", { deviceId: String(getDeviceID()) });
                            }}
                        />
                    </Link>

                    <Link
                        selected={activeSection.includes("/connectivity")}
                        mainLink={true}
                        enableExpand={false}
                        expanded={expandedSection === MainSection.CONNECTIVITY}
                        buttonText={$texts.connectivity}
                        imageURL="/img/connectivity.svg"
                        onToogleExpand={() => expandSection(MainSection.CONNECTIVITY)}
                    ></Link>
                </div>
            </div>
            <!-- Diagnostics Section -->
            <div class="section">
                <span class="section-label">{$texts.diagnostics}</span>
                <div class="section-links-div">
                    <Link
                        selected={activeSection.includes("/health")}
                        mainLink={true}
                        expanded={expandedSection === MainSection.HEALTH}
                        buttonText={$texts.health}
                        imageURL="/img/health.svg"
                        onToogleExpand={() => expandSection(MainSection.HEALTH)}
                    >
                        <Link
                            style={$SubLinkStyle}
                            lastLink={true}
                            selected={activeSection.includes("/health/system")}
                            buttonText={$texts.system}
                            imageURL="/img/drive.svg"
                            onClick={() => {
                                browseTo("/health/system");
                            }}
                        />
                    </Link>
                    <Link
                        selected={activeSection.includes("/logs")}
                        mainLink={true}
                        enableExpand={false}
                        expanded={expandedSection === MainSection.LOGS}
                        buttonText={$texts.logs}
                        imageURL="/img/logs.svg"
                        onToogleExpand={() => expandSection(MainSection.LOGS)}
                    ></Link>
                </div>
            </div>
            <!-- System Section -->
            <div class="section">
                <span class="section-label">{$texts.system}</span>
                <div class="section-links-div">
                    <Link
                        selected={activeSection.includes("/settings")}
                        mainLink={true}
                        enableExpand={false}
                        expanded={expandedSection === MainSection.SETTINGS}
                        buttonText={$texts.settings}
                        imageURL="/img/settings.svg"
                        onToogleExpand={() => expandSection(MainSection.SETTINGS)}
                    ></Link>
                    <Link
                        selected={activeSection.includes("/backup")}
                        mainLink={true}
                        enableExpand={false}
                        expanded={expandedSection === MainSection.BACKUP}
                        buttonText={$texts.backup}
                        imageURL="/img/backup.svg"
                        onToogleExpand={() => expandSection(MainSection.BACKUP)}
                    ></Link>
                </div>
            </div>
        </nav>
        <div class="language-selector-div">
            <LangSelector invertOptions={true} />
            <span class="language-text">{$texts.language}</span>
        </div>
    </div>
</div>

<style>
    /* Overlay mask for panel on small screens */
    .mask {
        background-color: var(--overlay-mask-background-color);
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 120;
        display: block;
    }

    /* Hide mask when panel is closed */
    .mask.close {
        display: none;
    }

    /* Full-area button for closing panel */
    .mask button {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background: transparent;
        border: none;
    }

    /* Main sidebar container */
    .container {
        position: fixed;
        top: 0;
        left: 0;
        width: 250px;
        height: calc(100vh - 74px);
        padding-top: 74px;
        background: var(--background-color);
        border-right: 1px solid var(--border-right-color);
        display: flex;
        flex-direction: column;
        transform: translateX(-100%);
        transition: transform 0.2s ease-in-out;
        z-index: 101;
    }

    /* Slide in when open */
    .container.open {
        transform: translateX(0);
        z-index: 121;
    }

    /* Logo area at top of sidebar */
    .container .logo-div {
        box-sizing: border-box;
        position: absolute;
        top: 0px;
        height: 74px;
        left: 56px;
        width: calc(250px - 56px);
        display: flex;
        justify-content: start;
        align-items: center;
        padding-left: 25px;
    }

    /* Main content area with nav and language selector */
    .content {
        display: flex;
        flex: 1 1 auto;
        overflow-y: auto;
        overflow-x: hidden;
        flex-direction: column;
        justify-content: space-between;
        scrollbar-width: thin;
        scrollbar-color: var(--scrollbar-track-color) var(--scrollbar-thumb-color);
        scrollbar-gutter: stable;
    }

    /* Navigation section */
    .nav-section {
        padding: 16px 0;
        display: flex;
        flex-direction: column;
    }

    /* Section group (devices, diagnostics, system) */
    .section {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;
    }

    /* Section label styling */
    .section-label {
        box-sizing: content-box;
        display: block;
        margin: 0;
        margin-bottom: 2px;
        padding: 10px;
        padding-bottom: 5px;
        padding-right: 0px;
        font-size: 0.75rem;
        font-weight: var(--section-text-weight);
        color: var(--section-text-color);
        text-transform: uppercase;
        letter-spacing: 1px;
        border-bottom: 2px solid var(--section-border-bottom-color);
        width: calc(100% - 40px);
    }

    /* Links container for each section */
    .section .section-links-div {
        margin: 0;
        padding: 0;
        width: calc(100% - 30px);
        height: fit-content;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        gap: 5px;
    }

    /* Language selector at bottom */
    .language-selector-div {
        box-sizing: border-box;
        width: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;
        padding: 30px;
    }

    /* Language label styling */
    .language-text {
        color: var(--text-color);
        font-weight: var(--text-weight);
        font-size: 18px;
        padding-top: 10px;
    }

    /* Hide logo on management page (desktop) */
    @media (min-width: 470px) {
        .container .logo-div.management-page {
            display: none;
        }
    }

    /* Hide mask and logo on device view (desktop) */
    @media (min-width: 880px) {
        .mask {
            display: none;
        }
        .container .logo-div.device-view-page {
            display: none;
        }
    }
</style>
