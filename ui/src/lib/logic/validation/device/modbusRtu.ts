/**
 * Validates a Modbus RTU serial port name.
 * @param port - Serial port name.
 * @returns True if valid.
 */
export function validateModbusRtuPort(port: string): boolean {
    if (typeof port !== "string" || port.trim().length === 0) return false;
    const trimmed = port.trim();
    const windowsPattern = /^COM([1-9]|[1-9]\d|1\d{2}|2([0-4]\d|5[0-6]))$/i;
    const unixPattern = /^\/dev\/(tty(S|USB|ACM|AMA|XRUSB)[0-9]+)$/i;
    if (/\s/.test(trimmed) || /[^\x20-\x7E]/.test(trimmed)) return false;
    return windowsPattern.test(trimmed) || unixPattern.test(trimmed);
}
