/**
 * Validates an OPC UA endpoint URL.
 * @param url - Endpoint URL.
 * @returns True if valid.
 */
export function validateOpcUaUrl(url: string): boolean {
    if (typeof url !== "string" || url.trim().length === 0) return false;
    const trimmed = url.trim();
    const protoMatch = trimmed.match(/^(opc\.(tcp|http):\/\/)/i);
    if (!protoMatch) return false;
    const rest = trimmed.slice(protoMatch[0].length);
    const hostPortPath = rest.match(/^([^\/\:?#]+)(:(\d+))?(\/.*)?$/);
    if (!hostPortPath) return false;
    const host = hostPortPath[1];
    const port = hostPortPath[3];
    const hostnamePattern = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$/;
    const ipv4Pattern = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    const ipv6Pattern = /^\[[0-9a-fA-F:]+\]$/;
    let isValidHost = false;
    if (host.length > 0) {
        if (ipv4Pattern.test(host)) {
            const octets = host.split(".").map(Number);
            isValidHost = octets.length === 4 && octets.every((o) => o >= 0 && o <= 255);
        } else if (ipv6Pattern.test(host)) {
            isValidHost = true;
        } else {
            const labels = host.split(".");
            isValidHost = labels.every((part) => hostnamePattern.test(part));
            if (isValidHost) {
                const allNumeric = labels.every((part) => /^\d+$/.test(part));
                const hasAlpha = labels.some((part) => /[a-zA-Z]/.test(part));
                if (allNumeric && !hasAlpha) {
                    isValidHost = false;
                }
            }
        }
    }
    if (!isValidHost) return false;
    if (port !== undefined) {
        const portNum = Number(port);
        if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) return false;
    }
    return true;
}
