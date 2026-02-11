<script lang="ts">
    // No script logic required
</script>

<!-- 
  Logo: Displays the logo and product name
-->
<div class="content">
    <img class="logo" alt="logo" src="/img/logo.png" />
    <span class="main-text">EDGE</span>
</div>

<style>
    /* Flex layout for logo + text */
    .content {
        padding: 0;
        margin: 0;
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: start;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
    }

    /* Logo image size */
    .logo {
        height: 40px;
        width: auto;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* Gradient styled product name */
    .main-text {
        padding-left: 10px;
        font-family: "MontserratCustom", Tahoma, Geneva, Verdana, sans-serif;
        font-size: 32px;
        text-align: center;
        font-weight: normal;
        background: linear-gradient(90deg, #4caf50, #2196f3);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }
</style>
