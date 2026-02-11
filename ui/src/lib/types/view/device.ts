import { NodeCategory } from "../nodes/base";
import type { SvelteComponent } from "svelte";
import Measurement from "../../../components/Devices/Nodes/RealTimeDisplay/Measurement.svelte";
import Counter from "../../../components/Devices/Nodes/RealTimeDisplay/Counter.svelte";
import State from "../../../components/Devices/Nodes/RealTimeDisplay/State.svelte";
import Text from "../../../components/Devices/Nodes/RealTimeDisplay/Text.svelte";
import { GraphType } from "$lib/logic/view/graph/base";

/** Configuration for which real-time card categories are active/visible */
export type RealTimeCardCategoriesState = Record<NodeCategory, boolean>;

/** Default state with all real-time card categories disabled */
export const defaultRealTimeCardCategoriesState = {
    [NodeCategory.Measurements]: false,
    [NodeCategory.Counters]: false,
    [NodeCategory.States]: false,
    [NodeCategory.Texts]: false,
    [NodeCategory.Other]: false,
} as RealTimeCardCategoriesState;

/** Initial expanded state with all real-time card categories expanded by default */
export const initialRealTimeCardCategoriesExpandState = {
    [NodeCategory.Measurements]: true,
    [NodeCategory.Counters]: true,
    [NodeCategory.States]: true,
    [NodeCategory.Texts]: true,
    [NodeCategory.Other]: true,
} as RealTimeCardCategoriesState;

/** Maps node categories to their corresponding Svelte display components for real-time cards */
export const realTimeDisplayComponentMap: Record<NodeCategory, typeof SvelteComponent<any> | null> = {
    [NodeCategory.Measurements]: Measurement,
    [NodeCategory.Counters]: Counter,
    [NodeCategory.States]: State,
    [NodeCategory.Texts]: Text,
    [NodeCategory.Other]: null, // Not implemented yet
};

/** Maps node categories to their corresponding graph type for log data visualization */
export const logsDisplayGraphTypeMap: Record<NodeCategory, GraphType | null> = {
    [NodeCategory.Measurements]: GraphType.Measurement,
    [NodeCategory.Counters]: GraphType.Counter,
    [NodeCategory.States]: null, // Not implemented yet
    [NodeCategory.Texts]: null, // Not implemented yet
    [NodeCategory.Other]: null, // Not implemented yet
};
