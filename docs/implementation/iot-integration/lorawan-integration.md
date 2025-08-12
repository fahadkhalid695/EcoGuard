# LoRaWAN Integration with EcoGuard Pro

## Overview

LoRaWAN (Long Range Wide Area Network) is perfect for:

- Remote sensor locations (up to 15km range)
- Battery-powered sensors (2-10 years battery life)
- Low data rate applications
- Outdoor environmental monitoring

## Hardware Requirements

### LoRaWAN Sensors

- **Temperature/Humidity**: Dragino LHT65, Milesight EM300-TH
- **Air Quality**: Dragino LAQ4, Milesight EM500-CO2
- **Water Quality**: Dragino LWL02, Milesight EM500-PP
- **Soil Monitoring**: Dragino LSE01, Milesight EM500-SMTC

### LoRaWAN Gateway

- **Indoor**: Dragino LG308, RAK7258
- **Outdoor**: Kerlink iBTS, MultiTech Conduit

## Network Setup

### 1. Gateway Configuration

```bash
# Configure gateway to connect to The Things Network (TTN)
# Or use your private LoRaWAN network server

# Gateway EUI: 0016C001F0000001 (example)
# Frequency Plan: US915 (for North America)
# Network Server: eu1.cloud.thethings.network
```

### 2. Device Registration

```javascript
// Register device on TTN or your network server
{
  "device_id": "ecoguard-temp-001",
  "dev_eui": "0004A30B001C0530",
  "app_eui": "70B3D57ED000985F",
  "app_key": "A665A45920422F9D417E4867EFDC4FB8",
  "frequency_plan": "US_902_928_FSB_2",
  "lorawan_version": "1.0.3",
  "regional_parameters_version": "RP001_REGIONAL_PARAMETERS_1.0.3_REV_A"
}
```

### 3. Payload Decoder

```javascript
// TTN Payload Formatter (JavaScript)
function decodeUplink(input) {
  var bytes = input.bytes;
  var decoded = {};

  // EcoGuard Pro sensor payload format
  switch (bytes[0]) {
    case 0x01: // Temperature & Humidity
      decoded.temperature = ((bytes[1] << 8) | bytes[2]) / 100;
      decoded.humidity = ((bytes[3] << 8) | bytes[4]) / 100;
      decoded.battery = bytes[5];
      break;

    case 0x02: // Air Quality
      decoded.co2 = (bytes[1] << 8) | bytes[2];
      decoded.voc = (bytes[3] << 8) | bytes[4];
      decoded.pm25 = ((bytes[5] << 8) | bytes[6]) / 10;
      decoded.battery = bytes[7];
      break;

    case 0x03: // Water Quality
      decoded.ph = ((bytes[1] << 8) | bytes[2]) / 100;
      decoded.turbidity = ((bytes[3] << 8) | bytes[4]) / 10;
      decoded.temperature = ((bytes[5] << 8) | bytes[6]) / 100;
      decoded.battery = bytes[7];
      break;
  }

  return {
    data: decoded,
    warnings: [],
    errors: [],
  };
}
```

## Integration with EcoGuard Pro

### 1. MQTT Bridge Setup

```javascript
const mqtt = require("mqtt");
const axios = require("axios");

class LoRaWANBridge {
  constructor(ttnAppId, ttnApiKey, ecoguardApiUrl, ecoguardApiKey) {
    this.ttnAppId = ttnAppId;
    this.ttnApiKey = ttnApiKey;
    this.ecoguardApiUrl = ecoguardApiUrl;
    this.ecoguardApiKey = ecoguardApiKey;

    // Connect to TTN MQTT broker
    this.mqttClient = mqtt.connect("mqtts://eu1.cloud.thethings.network", {
      username: ttnAppId,
      password: ttnApiKey,
    });

    this.setupMqttHandlers();
  }

  setupMqttHandlers() {
    this.mqttClient.on("connect", () => {
      console.log("Connected to TTN MQTT broker");

      // Subscribe to uplink messages
      this.mqttClient.subscribe(`v3/${this.ttnAppId}/devices/+/up`);
    });

    this.mqttClient.on("message", (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        this.handleUplinkMessage(data);
      } catch (error) {
        console.error("Error parsing MQTT message:", error);
      }
    });
  }

  async handleUplinkMessage(data) {
    const deviceId = data.end_device_ids.device_id;
    const payload = data.uplink_message.decoded_payload;
    const timestamp = new Date(data.received_at);

    // Map LoRaWAN device to EcoGuard sensor
    const sensorMapping = this.getSensorMapping(deviceId);

    if (sensorMapping) {
      // Send readings to EcoGuard Pro
      for (const [key, value] of Object.entries(payload)) {
        if (key !== "battery") {
          await this.sendReading(sensorMapping.sensorId, {
            value: value,
            unit: this.getUnit(key),
            quality: this.getQuality(key, value),
            timestamp: timestamp,
            location: sensorMapping.location,
          });
        }
      }

      // Update battery level if available
      if (payload.battery) {
        await this.updateSensorBattery(sensorMapping.sensorId, payload.battery);
      }
    }
  }

  getSensorMapping(deviceId) {
    // Map LoRaWAN device IDs to EcoGuard sensor IDs
    const mappings = {
      "ecoguard-temp-001": {
        sensorId: "temp-001",
        location: { lat: 40.7128, lng: -74.006, name: "Building A" },
      },
      "ecoguard-air-001": {
        sensorId: "air-001",
        location: { lat: 40.713, lng: -74.0058, name: "Outdoor Station" },
      },
    };

    return mappings[deviceId];
  }

  getUnit(sensorType) {
    const units = {
      temperature: "°C",
      humidity: "%",
      co2: "ppm",
      voc: "ppb",
      pm25: "μg/m³",
      ph: "pH",
      turbidity: "NTU",
    };

    return units[sensorType] || "units";
  }

  getQuality(sensorType, value) {
    // Implement quality assessment based on sensor type and value
    switch (sensorType) {
      case "temperature":
        return value >= 18 && value <= 26 ? "good" : "moderate";
      case "co2":
        return value < 600 ? "good" : value < 800 ? "moderate" : "poor";
      default:
        return "good";
    }
  }

  async sendReading(sensorId, reading) {
    try {
      await axios.post(
        `${this.ecoguardApiUrl}/sensors/${sensorId}/readings`,
        reading,
        {
          headers: {
            Authorization: `Bearer ${this.ecoguardApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`Reading sent for sensor ${sensorId}:`, reading);
    } catch (error) {
      console.error("Error sending reading:", error.message);
    }
  }

  async updateSensorBattery(sensorId, batteryLevel) {
    try {
      await axios.patch(
        `${this.ecoguardApiUrl}/sensors/${sensorId}`,
        {
          batteryLevel: batteryLevel,
        },
        {
          headers: {
            Authorization: `Bearer ${this.ecoguardApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`Battery updated for sensor ${sensorId}: ${batteryLevel}%`);
    } catch (error) {
      console.error("Error updating battery:", error.message);
    }
  }
}

// Usage
const bridge = new LoRaWANBridge(
  "your-ttn-app-id",
  "your-ttn-api-key",
  "https://your-ecoguard-server.com/api",
  "your-ecoguard-api-key"
);
```

### 2. Sensor Configuration

```cpp
// Arduino code for LoRaWAN sensor
#include <LoRaWan-RAK4630.h>
#include <SPI.h>
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

// LoRaWAN credentials
uint8_t nodeDeviceEUI[8] = {0x00, 0x04, 0xA3, 0x0B, 0x00, 0x1C, 0x05, 0x30};
uint8_t nodeAppEUI[8] = {0x70, 0xB3, 0xD5, 0x7E, 0xD0, 0x00, 0x98, 0x5F};
uint8_t nodeAppKey[16] = {0xA6, 0x65, 0xA4, 0x59, 0x20, 0x42, 0x2F, 0x9D, 0x41, 0x7E, 0x48, 0x67, 0xEF, 0xDC, 0x4F, 0xB8};

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Initialize LoRaWAN
  if (lmh_init(&g_lora_callbacks, g_lora_param_init, true, CLASS_A, LORAMAC_REGION_US915) != 0) {
    Serial.println("LoRaWAN init failed");
    return;
  }

  // Start join procedure
  lmh_join();
}

void loop() {
  // Read sensors every 10 minutes
  static unsigned long lastReading = 0;
  if (millis() - lastReading > 600000) {
    sendSensorData();
    lastReading = millis();
  }

  delay(1000);
}

void sendSensorData() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (!isnan(temp) && !isnan(hum)) {
    uint8_t payload[6];

    // Payload format: [type][temp_high][temp_low][hum_high][hum_low][battery]
    payload[0] = 0x01; // Temperature & Humidity type

    uint16_t tempInt = (uint16_t)(temp * 100);
    payload[1] = (tempInt >> 8) & 0xFF;
    payload[2] = tempInt & 0xFF;

    uint16_t humInt = (uint16_t)(hum * 100);
    payload[3] = (humInt >> 8) & 0xFF;
    payload[4] = humInt & 0xFF;

    payload[5] = getBatteryLevel(); // Battery percentage

    // Send payload
    lmh_error_status error = lmh_send(&g_lora_app_data, payload, sizeof(payload), false);

    if (error == LMH_SUCCESS) {
      Serial.println("Sensor data sent successfully");
    } else {
      Serial.println("Failed to send sensor data");
    }
  }
}

uint8_t getBatteryLevel() {
  // Read battery voltage and convert to percentage
  // Implementation depends on your hardware
  return 85; // Example: 85%
}
```

## Benefits of LoRaWAN Integration

- **Long Range**: Up to 15km in rural areas, 2-5km in urban areas
- **Low Power**: Sensors can run for years on a single battery
- **Penetration**: Works well indoors and underground
- **Scalability**: Support for thousands of sensors per gateway
- **Cost Effective**: Low infrastructure and operational costs

## Deployment Considerations

1. **Gateway Placement**: Position gateways for optimal coverage
2. **Frequency Planning**: Use appropriate frequency bands for your region
3. **Data Rate**: Balance between range and data transmission speed
4. **Security**: Implement proper encryption and device authentication
5. **Network Management**: Monitor gateway and device performance
