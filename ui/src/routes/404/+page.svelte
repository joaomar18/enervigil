<script lang="ts">
    import { onMount } from "svelte";

    // Stores
    import { loadedDone } from "$lib/stores/view/navigation";

    // Texts
    import { texts } from "$lib/stores/lang/generalTexts";

    // Mount function
    onMount(() => {
        loadedDone.set(true);
    });
</script>

<!-- 
  Not Found Page:
    • Full-screen logo and not found message displayed.
    • Bottom footer displays "ENERVIGIL EDGE" branding.
    • Covers entire viewport with dark background.
-->
<div class="splash-container">
    <div class="wrapper">
        <h3>404 NOT FOUND</h3>
        <div class="image-div"></div>
        <span>{$texts.pageNotFound}</span>
    </div>
    <footer class="footer">
        <span class="brand fade-in">ENERVIGIL</span>
        <span class="product fade-in">EDGE</span>
    </footer>
</div>

<style>
    /* Splash screen full-viewport backdrop */
    .splash-container {
        position: relative;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100vh;
        min-width: 350px;
        min-height: 600px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #181d23;
    }

    /* Wrapper to center logo and message */
    .splash-container .wrapper {
        position: relative;
        width: fit-content;
        height: fit-content;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    /* Title text */
    .wrapper h3 {
        position: absolute;
        margin: 0;
        padding: 0;
        top: -20px;
        transform: translateY(-100%);
        font-family: "MontserratCustom", Tahoma, Geneva, Verdana, sans-serif;
        font-size: 32px;
        font-weight: 600;
        color: #e5e7eb;
        white-space: nowrap;
    }

    /* Circular logo background in center */
    .wrapper .image-div {
        padding: 0;
        margin: 0;
        width: 256px;
        height: 256px;
        background-color: #202731;
        border-radius: 50%;
        background-repeat: no-repeat;
        background-position: center;
        background-image: url("/img/logo.png");
        box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.2);
        background-size: auto;
    }

    /* Not found detailed message */
    .wrapper span {
        position: absolute;
        font-size: 16px;
        text-align: center;
        transform: translateY(100%);
        line-height: 1.5;
        bottom: -20px;
        font-weight: 500;
        color: #aaa;
    }

    /* Footer container for brand name */
    .splash-container .footer {
        position: absolute;
        bottom: 40px;
        width: 100%;
        text-align: center;
    }

    /* Base style for both ENERVIGIL and EDGE text */
    .splash-container .footer span {
        font-family: "MontserratCustom", Tahoma, Geneva, Verdana, sans-serif;
        font-size: 32px;
        text-align: center;
        font-weight: 500;
    }

    /* Gradient brand styling for "ENERVIGIL" */
    .splash-container .footer span.brand {
        background: linear-gradient(90deg, #4caf50, #2196f3);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    /* Lighter color for "EDGE" product label */
    .splash-container .footer span.product {
        padding-left: 10px;
        color: #aaa;
    }

    /* Mobile splash adjustments */
    @media (max-width: 415px) {
        .wrapper h3 {
            font-size: 24px;
        }

        .wrapper .image-div {
            width: 180px;
            height: 180px;
            background-size: 50%;
        }

        .wrapper span {
            font-size: 14px;
        }

        .splash-container .footer span {
            font-size: 24px;
        }
    }
</style>
