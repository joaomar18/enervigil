/**
 * Real-time system monitoring data interface.
 * Represents live hardware and operating system metrics collected from the host
 * running the ENERVIGIL Edge application. These values provide visibility into
 * system health, resource usage, and runtime conditions, which can be used for
 * diagnostics, dashboards, or alerting mechanisms.
 *
 * All fields may be null if the metric cannot be retrieved on the current
 * platform or if monitoring is temporarily unavailable.
 *
 * @interface RealTimeSystemData
 * @property {number | null} cpu_use_perc - Current CPU usage percentage (0–100)
 * @property {number | null} ram_use_perc - Current RAM usage percentage (0–100)
 * @property {number | null} ram_usage - Amount of RAM currently in use (bytes)
 * @property {number | null} total_ram - Total available system RAM (bytes)
 * @property {number | null} disk_usage - Amount of disk space currently in use (bytes)
 * @property {number | null} disk_total - Total available disk space (bytes)
 * @property {number | null} cpu_temp - CPU temperature in degrees Celsius
 * @property {string | null} boot_date - System boot timestamp in ISO format
 */
export interface RealTimeSystemData {
    cpu_use_perc: number | null;
    ram_use_perc: number | null;
    ram_usage: number | null;
    total_ram: number | null;
    disk_usage: number | null;
    disk_total: number | null;
    cpu_temp: number | null;
    boot_date: string | null;
}