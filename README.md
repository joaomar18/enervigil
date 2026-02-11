# Enervigil - Open Source Energy Monitoring System

Enervigil is an **open-source**, **actively developing** energy monitoring and management system designed for real-time data acquisition, analysis, and visualization of energy consumption across single-phase and three-phase electrical systems.

> **Note:** This project is in active development. Currently, **only basic functionality** is available. Features are being progressively implemented and refined.

## 🎯 Overview

Enervigil provides a comprehensive solution for:

- **Real-time energy monitoring** from multiple energy meters
- **Protocol support** for various communication standards (Modbus RTU, OPC UA, and extensible for others)
- **Data acquisition and analysis** with configurable measurement intervals
- **Time-series data storage** using InfluxDB for efficient querying and analytics
- **Web-based user interface** for configuration, visualization, and system management
- **Secure authentication** with session management and IP-based brute-force protection
- **Modular architecture** supporting future protocol additions and feature extensions

## 🚀 Quick Start

### Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 1.29 or higher
- **Optional**: Hardware with specific network interfaces (see [Hardware Setup](#hardware-setup))

### Installation with Docker Compose

1. **Clone or download the repository**

   ```bash
   git clone <repository-url>
   cd enervigil
   ```

2. **Configure environment variables**

   Copy the example environment file and customize it:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your settings (see [Environment Configuration](#environment-configuration) below).

3. **Start the system**

   ```bash
   docker-compose up -d
   ```

   This command will:
   - Initialize the database schema
   - Generate TLS certificates
   - Start all services (backend, frontend, InfluxDB, Nginx reverse proxy)

   > **Note:** If you need to expose hardware devices (e.g., serial ports), use the hardware configuration described in the [Hardware Setup](#hardware-setup) section.

4. **Access the system**

   Enervigil will be accessible via:

   - `https://<HOSTNAME>` (for example: `https://enervigil.local`) if mDNS is available
   - `https://<DEVICE-IP>` (for example: `https://192.168.1.10`) as a fallback

   If `<HOSTNAME>.local` does not resolve on your network, use the device IPv4 address instead.

5. **Check service status**

   ```bash
   docker-compose ps
   ```

6. **View logs**

   ```bash
   docker-compose logs -f backend
   docker-compose logs -f ui
   docker-compose logs -f influxdb
   ```

7. **Stop the system**

   ```bash
   docker-compose down
   ```

## 🔧 Environment Configuration

The `.env` file is used to configure system behavior and deployment parameters. Below is a comprehensive guide to all available variables:

### HTTP & HTTPS Configuration

```env
# Public HTTP port exposed by Nginx (typically redirects to HTTPS)
HTTP_PORT=80

# Public HTTPS port exposed by Nginx (main access point)
HTTPS_PORT=443

# Hostname or IPv4 address used for TLS certificate generation
# ENERVIGIL will be accessible via:
#   - https://<HOSTNAME> when using the default HTTPS port (443)
#   - https://<HOSTNAME>:<HTTPS_PORT> if a custom HTTPS port is configured
#   - https://<DEVICE-IP>:<HTTPS_PORT> as a fallback
# Examples: enervigil.local, rpi.local, 192.168.1.10
HOSTNAME=enervigil.local
```

**Configuration Details:**

- **HTTP_PORT**: Port for HTTP traffic (typically redirected to HTTPS). Default: `80`
- **HTTPS_PORT**: Port for secure HTTPS traffic (recommended: 443). Default: `443`
- **HOSTNAME**: The domain/hostname used for TLS certificate generation and system access. Examples: `enervigil.local`, `rpi.local`, or `192.168.1.10`

## 🖥️ Hardware Setup

For deployments with specific hardware requirements (e.g., direct serial port access, network interface binding), use the hardware-specific Docker Compose configuration.

### Using docker-compose.hardware.yml

If you need to expose hardware devices (for example, serial ports), use the hardware override file:

```bash
docker-compose \
  -f docker-compose.yml \
  -f docker-compose.hardware.yml \
  up -d
```

This configuration allows you to map serial ports from the host directly to the backend container:

```yaml
devices:
  - /dev/ttyUSB0:/dev/ttyUSB0  # USB serial adapter
  - /dev/ttyS0:/dev/ttyS0      # Native serial port
```

### Example docker-compose.hardware.yml

```yaml
version: '3.8'

services:
  backend:
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0  # Expose USB serial port
      - /dev/ttyUSB1:/dev/ttyUSB1  # Additional serial port

# ... other services ...
```

## 📋 System Architecture

### Components

- **Backend (FastAPI)**: REST API, device management, data processing
- **Frontend (SvelteKit)**: Web UI for configuration and monitoring
- **InfluxDB**: Time-series database for metrics and measurements
- **Nginx**: Reverse proxy with TLS termination and CORS handling
- **SQLite**: Configuration and user data persistence

### Data Flow

```
Physical Device (Modbus RTU/OPC UA)
    ↓
Backend (Device Manager) → Protocol Client
    ↓
Data Processing & Validation
    ↓
SQLite (Configuration) + InfluxDB (Time-Series)
    ↓
REST API + SSE (Real-time Updates)
    ↓
Web UI (SvelteKit)
```

## 🔌 Supported Protocols

### Modbus RTU (Serial)

- **Function Codes**: READ_COILS, READ_DISCRETE_INPUTS, READ_HOLDING_REGISTERS, READ_INPUT_REGISTERS
- **Data Types**: BOOL, INT_16, UINT_16, INT_32, UINT_32, FLOAT_32, INT_64, UINT_64, FLOAT_64
- **Features**: Endian mode support (BIG_ENDIAN, WORD_SWAP, BYTE_SWAP, WORD_BYTE_SWAP), batch read optimization, bit-level extraction

**⚠️ Current Limitation:** Due to the current architecture where devices own protocol clients, **only one device can use a serial port at a time**. Multiple devices cannot share the same Modbus RTU port. This limitation will be addressed in future versions by decoupling protocol clients from devices.

### OPC UA

- **Endpoint connections** with optional authentication
- **Node ID** discovery and configuration
- **Read period** and timeout settings

### Extensible Design

New protocols can be added by implementing the `ProtocolPlugin` interface and registering them in the protocol registry.

## 🎨 Configuration & Features

### Device Management

- Create, edit, and delete energy meters
- Configure protocol-specific communication parameters
- Manage device images for visual identification
- Monitor device connection status and history

### Node Configuration

- Define measurement variables (nodes) for each device
- Configure data types, units, and display precision
- Set up alarm thresholds and logging behavior
- Protocol-specific configuration (Modbus registers, OPC UA node IDs)

### Real-time Monitoring

- Live device status and connection states
- Real-time data updates via Server-Sent Events (currently used for system performance metrics)
- Historical data querying from InfluxDB
- System performance metrics

### Security

- Token-based authentication with JWT
- Session-based user management
- IP-based brute-force attack mitigation
- HTTPS/TLS encryption

## 🏗️ Project Structure

```
enervigil/
├── app/                          # Python backend (FastAPI)
│   ├── main.py                   # Application entry point
│   ├── pyproject.toml            # Python dependencies
│   ├── controller/               # Device and node management
│   ├── model/                    # Data models and schemas
│   ├── web/                      # REST API and HTTP handlers
│   ├── db/                       # Database clients
│   ├── analytics/                # System monitoring
│   └── tests/                    # Unit and integration tests
│
├── ui/                           # TypeScript/Svelte frontend
│   ├── src/
│   │   ├── routes/               # SvelteKit pages and layouts
│   │   ├── components/           # Reusable UI components
│   │   ├── lib/                  # Utilities, stores, and logic
│   │   └── app.html              # HTML entry point
│   ├── package.json              # Node.js dependencies
│   └── vite.config.ts            # Vite build configuration
│
├── conf/                         # Configuration files
│   ├── influxdb/                 # InfluxDB configuration
│   └── nginx/                    # Nginx reverse proxy config
│
├── scripts/                      # Initialization scripts
│   └── generate_cert.py          # TLS certificate generation
│
├── cert/                         # TLS certificates (generated)
├── data/                         # Persistent data (volumes)
├── logs/                         # Application logs
├── .env.example                  # Example environment variables
├── docker-compose.yml            # Standard Docker Compose setup
├── docker-compose.hardware.yml   # Hardware-specific setup
└── README.md                     # This file
```

## 🧪 Testing

Tests can be run locally using a Python virtual environment.

### Local Testing

Create a virtual environment and install the project with test dependencies:

```bash
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# or on Windows:
# .venv\Scripts\activate

pip install -e .[test]
```

Run all tests:

```bash
pytest
```

Run a specific test file:

```bash
pytest tests/test_nodes_api.py -v
```

Run tests with coverage:

```bash
pytest --cov=controller --cov=web
```

## 📝 API Documentation

### Primary Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/device/get_all_devices` - List all devices
- `POST /api/device/add_device` - Create new device
- `PUT /api/device/edit_device` - Update device configuration
- `DELETE /api/device/delete_device` - Remove device
- `GET /api/nodes/get_device_nodes` - List device nodes
- `GET /api/nodes/get_node_logs` - Retrieve node historical data
- `GET /api/performance/get_metrics` - System performance metrics

## 🤝 Contributing

Contributions are **welcome and encouraged**! Enervigil is currently maintained by a single developer, so responses and reviews may take some time — your patience is appreciated. This is an open-source project and community input helps drive development forward.

### How to Contribute

1. **Report Issues**: Found a bug or have a feature request? Open an issue with detailed information
2. **Submit Pull Requests**: Fix bugs or add features following the current code style
3. **Improve Documentation**: Help clarify or expand existing documentation
4. **Test Coverage**: Add tests for new functionality
5. **Code Review**: Review and provide feedback on pull requests

### Code Style Guidelines

Please follow the existing code conventions:

**Python Backend:**
- Use PEP 8 style guidelines
- Type hints for all function parameters and returns
- Docstrings for all classes and public methods
- Async/await for I/O operations
- Follow existing error handling patterns (see `web/exceptions.py`)

**TypeScript/Svelte Frontend:**
- Use TypeScript for type safety
- Follow the existing component structure and naming conventions
- Use Svelte stores (`svelte/store`) for state management
- Implement responsive design with CSS Grid/Flexbox
- Add JSDoc comments for complex logic

**General:**
- Meaningful commit messages
- Test your changes before submitting
- Keep PRs focused and reasonably sized
- Update documentation for new features

## 🗺️ Roadmap & Future Improvements

Planned enhancements:

- **Protocol Client Pooling**: Decouple protocol clients from devices to allow multiple devices sharing a single port
- **Advanced Analytics**: Energy trend analysis and predictive modeling
- **MQTT Support**: Integration with MQTT brokers for distributed architectures
- **Data Export**: CSV/JSON export functionality
- **Mobile App**: Native mobile applications for on-the-go monitoring
- **User Roles**: Enhanced access control with admin/operator/viewer roles
- **Alerts & Notifications**: Email/SMS alerts for anomalies and thresholds
- **Multi-language Support**: Expand UI internationalization (currently PT/EN)

## 📄 License

This project is open source. See the LICENSE file for details.

## 🐛 Known Issues & Limitations

### Current Limitations

1. **Modbus RTU Port Sharing**: Only one device can use a serial port at a time due to device-owned protocol clients. This will be addressed by implementing shared client pools.

2. **Basic Functionality**: The system currently provides core monitoring features. Advanced analytics and reporting are planned for future releases.

3. **Single Administrator**: Designed for single-user deployments where one administrator manages the infrastructure.

### Supported Languages

- Portuguese (PT)
- English (EN)

Additional language support may be added in future versions.

## 💬 Support & Discussion

For questions, discussions, or feature requests:

- Open an issue on the repository
- Check existing issues for similar topics
- Provide detailed information when reporting bugs:
  - Steps to reproduce
  - Expected vs. actual behavior
  - Backend and frontend logs
  - Environment details (OS, Docker version, etc.)

## 🚀 Performance Considerations

- **Read Period**: Minimum 5 seconds between device reads (see `READ_PERIOD_LIM` in configuration)
- **Batch Operations**: Protocol clients automatically groups reads for efficiency
- **InfluxDB**: Recommended for production deployments with retention policies configured
- **Scaling**: Currently designed for edge/local deployments; distributed architectures planned for future versions

## 📌 Version Information

- **Application**: Currently in active development
- **Python**: 3.11+
- **Node.js**: 20+
- **Docker**: 20.10+

---

**Last Updated**: 11 Feb 2026