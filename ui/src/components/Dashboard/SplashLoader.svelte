<script lang="ts">
</script>

<!-- 
  Splash Loader:
    • Full-screen loading overlay displayed during app initialization.
    • Features animated spinner ring around centered company logo.
    • Bottom footer displays "ENERVIGIL EDGE" branding with fade-in effect.
    • Covers entire viewport with dark background until app is ready.
-->
<div class="splash-container">
    <div class="loader-wrapper">
        <div class="spinner"></div>
        <div class="image-div"></div>
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

    /* Wrapper to center spinner + logo */
    .splash-container .loader-wrapper {
        position: relative;
        width: 280px;
        height: 280px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Circular loading animation ring */
    .loader-wrapper .spinner {
        position: absolute;
        width: 280px;
        height: 280px;
        border: 6px solid transparent;
        border-top: 6px solid #00c78b;
        border-radius: 50%;
        animation: spin 1.2s linear infinite;
        z-index: 0;
        box-shadow: 0px 0px 15px rgba(0, 199, 139, 0.2);
    }

    /* Circular logo background in center */
    .loader-wrapper .image-div {
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

    /* Fade-in animation for brand and product text */
    .splash-container .footer span.fade-in {
        opacity: 0;
        transform: translateY(10px);
        animation: fadeIn 1s ease-out forwards;
        animation-delay: 0.5s;
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

    /* Spinner keyframe animation (continuous rotation) */
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    /* Text entrance animation (fade + slide up) */
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Mobile splash adjustments */
    @media (max-width: 415px) {
        .splash-container .loader-wrapper {
            width: 200px;
            height: 200px;
        }

        .loader-wrapper .spinner {
            width: 200px;
            height: 200px;
            border-width: 5px;
        }

        .loader-wrapper .image-div {
            width: 180px;
            height: 180px;
            background-size: 50%;
        }

        .splash-container .footer span {
            font-size: 24px;
        }
    }
</style>
