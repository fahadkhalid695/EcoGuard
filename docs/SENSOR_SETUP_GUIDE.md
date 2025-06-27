# EcoGuard Pro - Sensor Setup Guide

## Overview

This guide will help you set up real IoT sensors with your EcoGuard Pro system. The platform supports multiple connection types and sensor protocols.

## Supported Sensor Types

### Environmental Sensors
- **Temperature**: DS18B20, DHT22, SHT30, BME280
- **Humidity**: DHT22, SHT30, HIH6130, BME280
- **Air Quality**: 
  - CO2: MH-Z19B, SCD30, SCD40
  - VOC: SGP30, CCS811, BME680
  - PM2.5/PM10: PMS5003, SDS011, PMSA003

### Motion & Occupancy
- **PIR Sensors**: HC-SR501, AM312
- **Ultrasonic**: HC-SR04
- **Microwave**: RCWL-0516

### Light & Sound
- **Light Sensors**: BH1750, TSL2561, VEML7700
- **Sound**: MAX9814, INMP441, SPH0645

## Connection Methods

### 1. WiFi Sensors (Recommended)

**Hardware Requirements:**
- ESP32 or ESP8266 microcontroller
- Sensor modules
- WiFi network access

**Setup Steps:**
1. Flash your microcontroller with sensor firmware
2. Connect to your WiFi network
3. Configure API endpoint (default port: 8080)
4. Use auto-discovery or add manually

**Example ESP32 Code:**
```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>

const char* ssid = "your-wifi-ssid";
const char* password = "your-wifi-password";

DHT dht(2, DHT22);
WebServer server(8080);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  
  server.on("/status", handleStatus);
  server.on("/data", handleData);
  server.begin();
}

void handleStatus() {
  server.send(200, "application/json", "{\"status\":\"online\"}");
}

void handleData() {
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  String json = "{";
  json += "\"temperature\":" + String(temp) + ",";
  json += "\"humidity\":" + String(humidity) + ",";
  json += "\"timestamp\":\"" + String(millis()) + "\"";
  json += "}";
  
  server.send(200, "application/json", json);
}

void loop() {
  server.handleClient();
}
```

### 2. LoRaWAN Sensors

**Hardware Requirements:**
- LoRaWAN module (RFM95W, SX1276)
- LoRaWAN gateway
- MQTT broker

**Setup Steps:**
1. Configure LoRaWAN device with proper keys
2. Set up MQTT broker to receive data
3. Configure MQTT topic in EcoGuard Pro
4. Test data transmission

### 3. Bluetooth Sensors

**Hardware Requirements:**
- Bluetooth-enabled microcontroller
- BLE support in browser

**Setup Steps:**
1. Implement BLE GATT services
2. Use Web Bluetooth API for connection
3. Configure service UUIDs
4. Pair and connect through interface

## Database Setup

### Option 1: Supabase (Recommended)

1. Create a Supabase project
2. Set up the database schema:

```sql
-- Sensors table
CREATE TABLE sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  sensor_type VARCHAR(50) NOT NULL,
  connection_type VARCHAR(20) NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_name VARCHAR(200),
  status VARCHAR(20) DEFAULT 'offline',
  battery_level INTEGER,
  calibration_date TIMESTAMP,
  next_maintenance_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sensor readings table
CREATE TABLE sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES sensors(id),
  timestamp TIMESTAMP NOT NULL,
  value DECIMAL(10, 4) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quality VARCHAR(20) DEFAULT 'good',
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_name VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES sensors(id),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
CREATE POLICY "Allow all operations for authenticated users" ON sensors
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON sensor_readings
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON alerts
  FOR ALL TO authenticated USING (true);
```

3. Update your `.env` file with Supabase credentials

### Option 2: PostgreSQL

1. Install PostgreSQL
2. Create database and run the schema above
3. Configure connection string in `.env`

### Option 3: InfluxDB (For Time Series Data)

1. Install InfluxDB
2. Create bucket for sensor data
3. Configure connection in database service

## MQTT Broker Setup

### Using Mosquitto

1. Install Mosquitto MQTT broker:
```bash
# Ubuntu/Debian
sudo apt-get install mosquitto mosquitto-clients

# macOS
brew install mosquitto

# Windows
# Download from https://mosquitto.org/download/
```

2. Configure mosquitto.conf:
```
port 1883
allow_anonymous true
log_type all
log_dest file /var/log/mosquitto/mosquitto.log
```

3. Start the broker:
```bash
mosquitto -c /etc/mosquitto/mosquitto.conf
```

### Using Cloud MQTT

1. Sign up for a cloud MQTT service (AWS IoT, Google Cloud IoT, etc.)
2. Configure credentials and endpoints
3. Update MQTT configuration in `.env`

## Testing Your Setup

### 1. Test WiFi Sensor
```bash
# Test sensor status
curl http://your-sensor-ip:8080/status

# Test sensor data
curl http://your-sensor-ip:8080/data
```

### 2. Test MQTT Connection
```bash
# Subscribe to sensor topic
mosquitto_sub -h localhost -t "sensors/+/data"

# Publish test data
mosquitto_pub -h localhost -t "sensors/temp001/data" -m '{"value":23.5,"unit":"°C"}'
```

### 3. Test Database Connection
1. Open EcoGuard Pro dashboard
2. Check system health in settings
3. Verify data is being stored

## Troubleshooting

### Common Issues

1. **Sensor not discovered**
   - Check WiFi connection
   - Verify sensor is on same network
   - Check firewall settings

2. **MQTT connection failed**
   - Verify broker is running
   - Check credentials and topic names
   - Test with MQTT client tools

3. **Database connection issues**
   - Verify credentials in `.env`
   - Check network connectivity
   - Review database logs

4. **Bluetooth pairing fails**
   - Ensure browser supports Web Bluetooth
   - Check sensor is in pairing mode
   - Try clearing browser cache

### Getting Help

1. Check the logs in browser console
2. Review sensor firmware logs
3. Test individual components separately
4. Consult the troubleshooting section in main documentation

## Production Deployment

### Security Considerations

1. **Network Security**
   - Use WPA3 for WiFi
   - Implement VPN for remote access
   - Segment IoT network

2. **Data Security**
   - Enable TLS for all connections
   - Use strong authentication
   - Encrypt sensitive data

3. **Device Security**
   - Regular firmware updates
   - Secure boot process
   - Hardware security modules

### Scaling

1. **Load Balancing**
   - Use multiple MQTT brokers
   - Implement database clustering
   - Add caching layer

2. **Monitoring**
   - Set up system monitoring
   - Configure alerting
   - Regular health checks

3. **Maintenance**
   - Automated backups
   - Update procedures
   - Disaster recovery plan

This guide provides the foundation for setting up a complete IoT sensor network with EcoGuard Pro. Adjust the configurations based on your specific hardware and requirements.