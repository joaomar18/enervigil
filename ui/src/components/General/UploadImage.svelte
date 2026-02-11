<script lang="ts">
    // Styles
    import { mergeStyle } from "$lib/style/components";
    import { UploadImageStyle } from "$lib/style/general";

    //Props
    export let imageFile: File | undefined;
    export let imageUrl: string;
    export let defaultImageUrl: string | undefined = undefined;

    // Style object (from theme)
    export let style: { [property: string]: string | number } | null = null;
    $: effectiveStyle = style ?? $UploadImageStyle;

    // Layout / styling props
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let borderRadius: string | undefined = undefined;
    export let imageWidth: string | undefined = undefined;
    export let imageHeight: string | undefined = undefined;
    export let backgroundColor: string | undefined = undefined;
    export let hoverColor: string | undefined = undefined;

    $: localOverrides = {
        width,
        height,
        borderRadius,
        imageWidth,
        imageHeight,
        backgroundColor,
        hoverColor,
    };

    // Merged style
    $: mergedStyle = mergeStyle(effectiveStyle, localOverrides);

    // Variables
    let fileInput: HTMLInputElement;
    let currentImageUrl: string;

    $: currentImageUrl = imageUrl;

    // Functions
    function openPicker() {
        fileInput.click();
    }

    function onFileChange() {
        const file = fileInput.files?.[0];
        if (!file) return;
        imageFile = file;
        imageUrl = URL.createObjectURL(imageFile);
    }

    function handleImageError() {
        if (defaultImageUrl && currentImageUrl !== defaultImageUrl) {
            currentImageUrl = defaultImageUrl;
        }
    }
</script>

<!-- Image upload wrapper: shows the current image with a pencil overlay and lets users click to pick a new file -->
<div
    style="
        --width: {mergedStyle.width};
        --height: {mergedStyle.height};
        --border-radius: {mergedStyle.borderRadius};
        --image-width: {mergedStyle.imageWidth};
        --image-height: {mergedStyle.imageHeight};
        --background-color: {mergedStyle.backgroundColor};
        --hover-color: {mergedStyle.hoverColor};
    "
    class="container"
>
    <div class="content" style="background-image: url('{currentImageUrl}')">
        <img src={currentImageUrl} alt="Url Checker" style="display:none" on:error={handleImageError} />
        <img class="edit-pencil-img" src="/img/edit_pencil.svg" alt="Edit Pencil" />

        <input type="file" accept="image/*" bind:this={fileInput} on:change={onFileChange} style="display:none" />

        <button class="upload-image-btn" aria-label="Upload Image Button" on:click={openPicker}></button>
    </div>
</div>

<style>
    /* Wrapper: sets size, shape, and background color with smooth hover transition */
    .container {
        width: var(--width);
        height: var(--height);
        border-radius: var(--border-radius);
        background-color: var(--background-color);
        transition: background-color 0.2s ease;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Hover state: slightly lighten background */
    .container:hover {
        background-color: var(--hover-color);
    }

    /* Hover state: increase pencil icon opacity */
    .container:hover .content .edit-pencil-img {
        opacity: 0.75;
    }

    /* Content area: positions image background and centers children */
    .content {
        margin: 0;
        padding: 0;
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: var(--border-radius);
        display: flex;
        justify-content: center;
        align-items: center;
        background-position: center;
        background-repeat: no-repeat;
        background-size: var(--image-width) var(--image-height);
        -webkit-tap-highlight-color: transparent;
    }

    /* Pencil overlay: centered, semi-transparent, transitions on hover */
    .content .edit-pencil-img {
        width: 75%;
        height: 75%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.25;
        transition: opacity 0.2s ease;
    }

    /* Invisible button overlay: captures clicks for file picker */
    .content button {
        position: absolute;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        border-radius: var(--border-radius);
        background: transparent;
        border: none;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }
</style>
