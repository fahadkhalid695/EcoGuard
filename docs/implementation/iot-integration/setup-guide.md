# IoT Sensor Setup Guide for EcoGuard Pro

## Quick Start Checklist

### 1. Choose Your Connection Method
- ✅ **WiFi** - Best for indoor sensors with power supply
- ✅ **LoRaWAN** - Best for remote, battery-powered sensors
- ✅ **Bluetooth** - Best for short-range, mobile sensors
- ✅ **REST API** - Best for custom applications and integrations

### 2. Prepare Your Environment
```bash
# Clone the integration examples
git clone https://github.com/your-repo/ecoguard-iot-examples.git
cd ecoguard-iot-examples

# Install dependencies (for Node.js examples)
npm install

# Install Python dependencies (for Python examples)
pip install requests websocket-client
```

### 3. Configure Environment Variables
Create a `.env` file:
```env
# EcoGuard Pro Configuration
ECOGUARD_API_URL=https://your-ecoguard-server.com
ECOGUARD_API_KEY=your-api-key-here

# WebSocket Configuration (optional)
WEBSOCKET_URL=ws://your-ecoguard-server.com:8080/sensors

# LoRaWAN Configuration (if using TTN)
TTN_APP_ID=your-ttn-app-id
TTN_API_KEY=your-ttn-api-key

# Sensor Configuration
SENSOR_LOCATION_LAT=40.7128
SENSOR_LOCATION_LNG=-74.0060
SENSOR_LOCATION_NAME=Your Location Name
```

## Supported Sensor Types

| Sensor Type | Unit | Example Values | Quality Thresholds |
|-------------|------|----------------|-------------------|
| `temperature` | °C | 18-30 | Good: 18-26°C |
| `humidity` | % | 30-80 | Good: 40-60% |
| `co2` | ppm | 400-1000 | Good: <600ppm |
| `voc` | ppb | 0-500 | Good: <150ppb |
| `pm25` | μg/m³ | 0-100 | Good: <12μg/m³ |
| `pm10` | μg/m³ | 0-150 | Good: <20μg/m³ |
| `light` | lux | 0-1000 | Good: 200-500lux |
| `sound` | dB | 30-100 | Good: <55dB |
| `motion` | detected | 0/1 | Always good |
| `energy` | kW | 0-1000 | Always good |

## Hardware Recommendations

### WiFi Sensors
**ESP32 Development Boards:**
- ESP32 DevKit V1 - $10-15
- ESP32-S3 - $15-20 (with better WiFi)
- ESP32-C3 - $8-12 (compact version)

**Sensors:**
- DHT22 (Temperature/Humidity) - $5
- MH-Z19B (CO2) - $25
- PMS5003 (PM2.5/PM10) - $30
- BH1750 (Light) - $3
- MAX9814 (Sound) - $8

### LoRaWAN Sensors
**Pre-built Sensors:**
- Dragino LHT65 (Temp/Humidity) - $45
- Milesight EM300-TH - $65
- Dragino LAQ4 (Air Quality) - $85

**Development Boards:**
- RAK4630 (nRF52840 + SX1262) - $35
- Heltec WiFi LoRa 32 V3 - $25

### Gateways
**Indoor:**
- Dragino LG308 - $120
- RAK7258 - $180

**Outdoor:**
- Kerlink iBTS - $800
- MultiTech Conduit - $400

## Step-by-Step Setup

### Method 1: WiFi Sensor (ESP32 + DHT22)

#### Hardware Setup
1. Connect DHT22 to ESP32:
   - VCC → 3.3V
   - GND → GND
   - DATA → GPIO2

2. Connect additional sensors as needed

#### Software Setup
1. Install Arduino IDE and ESP32 board support
2. Install required libraries:
   ```
   - WiFi
   - HTTPClient
   - ArduinoJson
   - DHT sensor library
   ```

3. Upload the WiFi sensor code (see `wifi-sensor-example.ino`)

4. Monitor serial output for connection status

### Method 2: LoRaWAN Sensor

#### Network Setup
1. Set up LoRaWAN gateway
2. Register with The Things Network (TTN) or private network
3. Configure device profiles and applications

#### Device Setup
1. Register device in TTN console
2. Note DevEUI, AppEUI, and AppKey
3. Upload LoRaWAN sensor code
4. Set up MQTT bridge (see `lorawan-integration.md`)

### Method 3: REST API Integration

#### Python Setup
```bash
pip install requests
python rest-api-example.py
```

#### Node.js Setup
```bash
npm install axios
node rest-api-example.js
```

### Method 4: WebSocket Integration

#### Real-time Connection
```bash
node websocket-integration.js
```

## Testing Your Setup

### 1. Verify Sensor Registration
```bash
curl -X GET "https://your-ecoguard-server.com/api/sensors" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 2. Check Recent Readings
```bash
curl -X GET "https://your-ecoguard-server.com/api/sensors/your-sensor-id/readings?limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 3. Monitor WebSocket Connection
```javascript
const ws = new WebSocket('ws://your-server.com:8080/sensors');
ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
```

## Troubleshooting

### Common Issues

#### WiFi Connection Problems
```cpp
// Add to your Arduino code for debugging
Serial.print("WiFi status: ");
Serial.println(WiFi.status());
Serial.print("IP address: ");
Serial.println(WiFi.localIP());
```

#### API Authentication Errors
- Verify API key is correct
- Check if API key has proper permissions
- Ensure Bearer token format: `Bearer YOUR_API_KEY`

#### Sensor Reading Issues
- Check sensor wiring and power supply
- Verify sensor library versions
- Add debug output for sensor values

#### LoRaWAN Connection Issues
- Verify gateway is online and connected
- Check device registration in network server
- Confirm frequency plan matches your region
- Monitor gateway logs for uplink messages

### Debug Commands

#### Check Sensor Status
```bash
# List all sensors
curl -X GET "https://your-server.com/api/sensors" \
  -H "Authorization: Bearer YOUR_API_KEY" | jq

# Get specific sensor
curl -X GET "https://your-server.com/api/sensors/sensor-id" \
  -H "Authorization: Bearer YOUR_API_KEY" | jq
```

#### Test API Connectivity
```bash
# Test API endpoint
curl -X GET "https://your-server.com/api/health" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Monitor Logs
```bash
# For Node.js applications
DEBUG=* node your-app.js

# For Python applications
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Security Best Practices

### 1. API Key Management
- Use environment variables for API keys
- Rotate API keys regularly
- Use different keys for different environments

### 2. Network Security
- Use HTTPS for all API communications
- Implement certificate pinning for production
- Use VPN for sensitive deployments

### 3. Device Security
- Enable secure boot on ESP32
- Use encrypted flash storage
- Implement over-the-air (OTA) update security

### 4. Data Validation
- Validate sensor readings before sending
- Implement rate limiting on device side
- Use checksums for data integrity

## Scaling Your Deployment

### 1. Multiple Sensors
- Use unique sensor IDs
- Implement sensor discovery protocols
- Use configuration management tools

### 2. High-Volume Data
- Implement data batching
- Use compression for large payloads
- Consider time-series databases

### 3. Reliability
- Implement retry mechanisms
- Use message queuing for critical data
- Set up monitoring and alerting

### 4. Performance Optimization
- Cache frequently accessed data
- Use CDN for static resources
- Implement database indexing

## Next Steps

1. **Start Small**: Begin with 1-2 sensors to test your setup
2. **Monitor Performance**: Use EcoGuard Pro's monitoring tools
3. **Scale Gradually**: Add more sensors as you gain experience
4. **Customize**: Modify the examples for your specific needs
5. **Contribute**: Share your improvements with the community

## Support

- **Documentation**: Check the full API documentation
- **Examples**: Browse the example code repository
- **Community**: Join our Discord/Slack for help
- **Issues**: Report bugs on GitHub
- **Professional Support**: Contact us for enterprise support