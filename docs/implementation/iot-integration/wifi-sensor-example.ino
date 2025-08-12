/*
 * EcoGuard Pro - WiFi Sensor Integration Example
 * Compatible with ESP32/ESP8266
 * Supports: Temperature, Humidity, CO2, Motion, Light sensors
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// EcoGuard Pro API Configuration
const char* serverURL = "http://your-ecoguard-server.com/api/sensors";
const char* apiKey = "YOUR_API_KEY";
const char* sensorId = "temp-001"; // Unique sensor ID

// Sensor Configuration
#define DHT_PIN 2
#define DHT_TYPE DHT22
#define MOTION_PIN 4
#define LIGHT_PIN A0

DHT dht(DHT_PIN, DHT_TYPE);

// Timing
unsigned long lastReading = 0;
const unsigned long readingInterval = 30000; // 30 seconds

void setup() {
  Serial.begin(115200);
  
  // Initialize sensors
  dht.begin();
  pinMode(MOTION_PIN, INPUT);
  pinMode(LIGHT_PIN, INPUT);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Register sensor with EcoGuard Pro
  registerSensor();
}

void loop() {
  if (millis() - lastReading >= readingInterval) {
    // Read sensor data
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    int motion = digitalRead(MOTION_PIN);
    int lightLevel = analogRead(LIGHT_PIN);
    
    // Check if readings are valid
    if (!isnan(temperature) && !isnan(humidity)) {
      // Send temperature reading
      sendSensorReading("temperature", temperature, "°C", getQuality(temperature, "temperature"));
      
      // Send humidity reading
      sendSensorReading("humidity", humidity, "%", getQuality(humidity, "humidity"));
      
      // Send motion reading
      sendSensorReading("motion", motion, "detected", "good");
      
      // Send light reading
      float lux = map(lightLevel, 0, 1023, 0, 1000);
      sendSensorReading("light", lux, "lux", "good");
      
      Serial.println("Sensor readings sent successfully");
    } else {
      Serial.println("Failed to read from DHT sensor!");
    }
    
    lastReading = millis();
  }
  
  delay(1000);
}

void registerSensor() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + String(apiKey));
    
    // Create sensor registration JSON
    DynamicJsonDocument doc(1024);
    doc["id"] = sensorId;
    doc["name"] = "Temperature & Humidity Sensor";
    doc["type"] = "temperature";
    doc["connectivity"] = "wifi";
    doc["location"]["lat"] = 40.7128;  // Replace with actual coordinates
    doc["location"]["lng"] = -74.0060;
    doc["location"]["name"] = "Building A - Floor 1";
    doc["batteryLevel"] = 100; // For powered sensors
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Sensor registered: " + response);
    } else {
      Serial.println("Error registering sensor: " + String(httpResponseCode));
    }
    
    http.end();
  }
}

void sendSensorReading(String type, float value, String unit, String quality) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL + "/" + sensorId + "/readings");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + String(apiKey));
    
    // Create reading JSON
    DynamicJsonDocument doc(512);
    doc["sensorId"] = sensorId;
    doc["timestamp"] = getTimestamp();
    doc["value"] = value;
    doc["unit"] = unit;
    doc["quality"] = quality;
    doc["location"]["lat"] = 40.7128;
    doc["location"]["lng"] = -74.0060;
    doc["location"]["name"] = "Building A - Floor 1";
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.println(type + " reading sent: " + String(value) + " " + unit);
    } else {
      Serial.println("Error sending " + type + " reading: " + String(httpResponseCode));
    }
    
    http.end();
  }
}

String getQuality(float value, String sensorType) {
  if (sensorType == "temperature") {
    if (value < 18 || value > 26) return "poor";
    if (value < 20 || value > 24) return "moderate";
    return "good";
  } else if (sensorType == "humidity") {
    if (value < 30 || value > 70) return "poor";
    if (value < 40 || value > 60) return "moderate";
    return "good";
  }
  return "good";
}

String getTimestamp() {
  // Simple timestamp - in production, use NTP for accurate time
  return String(millis());
}