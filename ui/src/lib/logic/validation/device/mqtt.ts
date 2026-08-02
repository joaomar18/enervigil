/**
 * Validates an MQTT broker hostname or IPv4 address.
 * @param hostname - Broker hostname or IP address.
 * @returns True if valid.
 */
export function validateMqttHostname(hostname: string): boolean {
    if (typeof hostname !== "string" || hostname.trim().length === 0) return false;
    const trimmed = hostname.trim();
    if (/\s/.test(trimmed) || /[^\x20-\x7E]/.test(trimmed)) return false;

    const ipv4Pattern = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    if (ipv4Pattern.test(trimmed)) {
        const octets = trimmed.split(".").map(Number);
        return octets.every((o) => o >= 0 && o <= 255);
    }

    const hostnamePattern = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$/;
    const labels = trimmed.split(".");
    return labels.every((label) => hostnamePattern.test(label));
}
