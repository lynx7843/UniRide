#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Install this library!

// 1. WiFi Credentials
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// 2. AWS API URL (Paste your API Gateway URL here)
const char* serverUrl = "https://m6pw0tii65.execute-api.eu-north-1.amazonaws.com/SaveLocation";

TinyGPSPlus gps;
HardwareSerial SerialGPS(2);

void setup() {
  Serial.begin(115200);
  SerialGPS.begin(9600, SERIAL_8N1, 16, 17);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  // Check for GPS data
  while (SerialGPS.available() > 0) {
    if (gps.encode(SerialGPS.read())) {
      
      // If we have a valid location, send it to AWS
      if (gps.location.isValid()) {
        sendDataToAWS(gps.location.lat(), gps.location.lng());
        
        // Wait 10 seconds before sending again to save data/battery
        delay(10000); 
      }
    }
  }
}

void sendDataToAWS(float lat, float lng) {
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    
    // Start connection
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON Payload
    // Format: {"deviceId": "esp32_01", "lat": 6.9271, "lng": 79.8612}
    StaticJsonDocument<200> doc;
    doc["deviceId"] = "ESP32_NSBM_Student";
    doc["lat"] = lat;
    doc["lng"] = lng;
    
    String requestBody;
    serializeJson(doc, requestBody);
    
    // Send POST Request
    int httpResponseCode = http.POST(requestBody);
    
    if(httpResponseCode > 0){
      String response = http.getString();
      Serial.println("AWS Response: " + response);
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}