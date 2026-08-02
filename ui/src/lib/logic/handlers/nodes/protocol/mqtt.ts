import { MQTTNodeMode, type EditableMQTTNodeOptions } from "$lib/types/nodes/protocol/mqtt";

/**
 * Handles UI-side state updates when the MQTT payload mode changes.
 *
 * The `json_path` field only applies to JSON mode: it is initialized to an
 * empty (invalid) string when switching into JSON mode so the user is
 * prompted to fill it in, and cleared back to null when switching to RAW
 * mode, where it does not apply.
 *
 * @param {EditableMQTTNodeOptions} commOptions - Editable MQTT communication options.
 * @param {MQTTNodeMode} mode - Newly selected payload mode.
 */
export function mqttNodeModeChange(commOptions: EditableMQTTNodeOptions, mode: MQTTNodeMode): void {
    if (mode === MQTTNodeMode.JSON) {
        if (commOptions.json_path === null) {
            commOptions.json_path = "";
        }
    } else {
        commOptions.json_path = null;
    }
}
