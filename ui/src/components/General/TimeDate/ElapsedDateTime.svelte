<script lang="ts">
    import { getElegantElapsedTimeFromIsoDate } from "$lib/logic/util/date";

    // Texts
    import { selectedLang } from "$lib/stores/lang/definition";
    import { dateTexts } from "$lib/stores/lang/dateTexts";

    // Props
    export let dateFetched: boolean;
    export let isoDateString: string | null;

    // Variables
    let elapsedStringParam: { key: string; variables: Record<string, string | number> };
    let elapsedString: string;

    // Reactive Statements 
    $: if(dateFetched) elapsedStringParam = getElegantElapsedTimeFromIsoDate(isoDateString);

    $: if (elapsedStringParam && $selectedLang) {
        elapsedString = $dateTexts[elapsedStringParam.key];
        Object.entries(elapsedStringParam.variables).forEach(([key, value]) => {
            elapsedString = elapsedString.replace(`{${key}}`, String(value));
        });
    }
</script>

<!--
    ElapsedDateTime Component
    
    Displays localized elapsed time from an ISO date string (e.g., "5 minutes ago", "2 days and 3 hours ago").
-->
{#if elapsedString}
    {elapsedString}
{/if}
