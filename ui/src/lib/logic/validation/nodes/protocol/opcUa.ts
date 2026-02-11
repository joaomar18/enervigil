/**
 * Validates an OPC UA node ID string.
 * @param node_id Node ID string.
 * @returns True if valid.
 */
export function validateOpcUaNodeId(node_id: string): boolean {
    if (!node_id || typeof node_id !== "string") return false;

    const parts = node_id.split(";");
    if (parts.length !== 2) return false;

    const [nsPart, idPart] = parts;

    // Validate namespace: ns=<number>
    if (!/^ns=\d+$/.test(nsPart)) return false;

    // Numeric NodeId: i=<number>
    if (/^i=\d+$/.test(idPart)) return true;

    // String NodeId: s=<string>  (no semicolons allowed)
    if (/^s=[^;]+$/.test(idPart)) return true;

    // GUID NodeId: g=<uuid>
    if (/^g=[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(idPart)) {
        return true;
    }

    // ByteString NodeId: b=<base64>
    if (/^b=[A-Za-z0-9+/=]+$/.test(idPart)) return true;

    return false;
}
