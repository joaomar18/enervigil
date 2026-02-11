import type { SvelteComponent } from "svelte";
import { NodeType, NodePhase } from "./base";
import { Protocol } from "../device/base";
import { GraphType } from "$lib/logic/view/graph/base";

/*****     C O N S T A N T S     *****/

/*****     E N U M S     *****/

/*****     I N T E R F A C E S     *****/

/**
 * Represents the current runtime state of a node with its value, configuration, and alarm/warning states.
 * Used for real-time monitoring and display of node data in the energy monitoring system.
 *
 * @property {number | string | boolean | null} value - Current measured or calculated value
 * @property {NodeType} type - Data type of the value (FLOAT, STRING, INT, BOOLEAN)
 * @property {boolean} is_counter - Whether this node is of counter type
 * @property {string} unit - Measurement unit (e.g., "V", "A", "kW")
 * @property {NodePhase} phase - Electrical phase this node belongs to
 * @property {number} [decimal_places] - Number of decimal places for display formatting
 * @property {number} [min_value_range] - Minimum expected value range
 * @property {number} [max_value_range] - Maximum expected value range
 * @property {boolean} [min_alarm_state] - Whether minimum threshold alarm is currently active
 * @property {boolean} [max_alarm_state] - Whether maximum threshold alarm is currently active
 * @property {boolean} [min_warning_state] - Whether minimum threshold warning is currently active
 * @property {boolean} [max_warning_state] - Whether maximum threshold warning is currently active
 */
export interface NodeState {
    value: number | string | boolean | null;
    type: NodeType;
    is_counter: boolean;
    unit: string;
    phase: NodePhase;
    decimal_places?: number;
    min_value_range?: number;
    max_value_range?: number;
    min_alarm_state?: boolean;
    max_alarm_state?: boolean;
    min_warning_state?: boolean;
    max_warning_state?: boolean;
}

/**
 * Enhanced node state with UI-ready properties for display in the energy monitoring system.
 * Extends NodeState with display name and associated Svelte component for rendering.
 *
 * @property {string} name - Display name of the node
 * @property {typeof SvelteComponent<any>} displayComponent - Svelte component for rendering this node
 * @property {GraphType | null} graphType - Graph visualization type identifier for rendering the appropriate chart component
 * @property {number | string | boolean | null} value - Current measured or calculated value
 * @property {NodeType} type - Data type of the value (FLOAT, STRING, INT, BOOLEAN)
 * @property {boolean} is_counter - Whether this node is of counter type
 * @property {string} unit - Measurement unit (e.g., "V", "A", "kW")
 * @property {NodePhase} phase - Electrical phase this node belongs to
 * @property {number} [decimal_places] - Number of decimal places for display formatting
 * @property {number} [min_value_range] - Minimum expected value range
 * @property {number} [max_value_range] - Maximum expected value range
 * @property {boolean} [min_alarm_state] - Whether minimum threshold alarm is currently active
 * @property {boolean} [max_alarm_state] - Whether maximum threshold alarm is currently active
 * @property {boolean} [min_warning_state] - Whether minimum threshold warning is currently active
 * @property {boolean} [max_warning_state] - Whether maximum threshold warning is currently active
 */
export interface ProcessedNodeState {
    name: string;
    displayComponent: typeof SvelteComponent<any>;
    graphType: GraphType | null;
    value: number | string | boolean | null;
    type: NodeType;
    is_counter: boolean;
    unit: string;
    phase: NodePhase;
    decimal_places?: number;
    min_value_range?: number;
    max_value_range?: number;
    min_alarm_state?: boolean;
    max_alarm_state?: boolean;
    min_warning_state?: boolean;
    max_warning_state?: boolean;
}

/**
 * Extended operational information and metadata for a node.
 * Contains runtime data, alarm/warning thresholds, and communication settings.
 *
 * @property {string | null} [last_update_date] - ISO timestamp of the last value update
 * @property {string | null} [last_reset_date] - ISO timestamp of the last counter reset (for incremental nodes)
 * @property {number} [min_alarm_value] - Minimum threshold value that triggers alarms
 * @property {number} [max_alarm_value] - Maximum threshold value that triggers alarms
 * @property {number} [min_warning_value] - Minimum threshold value that triggers warnings
 * @property {number} [max_warning_value] - Maximum threshold value that triggers warnings
 * @property {NodeType} type - Internal Data type of the node value
 * @property {string} protocol_type - Protocol Type of the node value
 * @property {Protocol} protocol - Communication protocol used by this node
 * @property {number} logging_period - How often the node value is logged (in minutes)
 */
export interface BaseNodeExtendedInfo {
    last_update_date: string | null;
    last_reset_date: string | null;
    min_alarm_value?: number;
    max_alarm_value?: number;
    min_warning_value?: number;
    max_warning_value?: number;
    type: NodeType;
    protocol_type: string;
    protocol: Protocol;
    logging_period: number;
}

/*****     O B J E C T S     *****/
