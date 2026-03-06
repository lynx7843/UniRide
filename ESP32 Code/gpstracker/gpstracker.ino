#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "";
const char* password = "";
const char* serverUrl = "";

TinyGPSPlus gps;
HardwareSerial SerialGPS(2);

// Timers and state tracking variables
unsigned long lastActionTime = 0; 
float lastSentLat = 0.0;
float lastSentLng = 0.0;

void setup() {
  Serial.begin(115200);
  delay(1000); 
  
  Serial.println("\n=== GPS Tracker Starting ===");
  
  // Initialize GPS Serial
  SerialGPS.begin(9600, SERIAL_8N1, 25, 26);
  Serial.println("GPS Serial initialized on pins RX=25, TX=26");

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // 1. Constantly feed the GPS module data (DO NOT put delays here)
  while (SerialGPS.available() > 0) {
    gps.encode(SerialGPS.read());
  }

  // 2. Check if 30 seconds have passed
  if (millis() - lastActionTime >= 30000) {
    lastActionTime = millis(); // Reset the timer

    // Print general status
    Serial.println("\n--- GPS Status ---");
    Serial.print("Satellites: ");
    Serial.println(gps.satellites.value());
    Serial.print("Location valid: ");
    Serial.println(gps.location.isValid() ? "YES" : "NO");

    // Process Location Data
    if (gps.location.isValid()) {
      float currentLat = gps.location.lat();
      float currentLng = gps.location.lng();

      // Check if the coordinates are exactly the same as the last ones sent
      if (currentLat == lastSentLat && currentLng == lastSentLng) {
        Serial.println("Bus is stationary. No data sent to AWS.");
      } else {
        Serial.println("\n*** Valid GPS Fix & Movement Detected! ***");
        Serial.print("Lat: ");
        Serial.println(currentLat, 6);
        Serial.print("Lng: ");
        Serial.println(currentLng, 6);
        
        sendDataToAWS(currentLat, currentLng);
        
        // Update the last sent coordinates so we have a new baseline for next time
        lastSentLat = currentLat;
        lastSentLng = currentLng;
      }
    } else {
      Serial.println("Waiting for valid satellite lock...");
    }
  }
}

void sendDataToAWS(float lat, float lng) {
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    
    Serial.println("=== Sending to AWS ===");
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["deviceId"] = "t001";
    doc["lat"] = lat;
    doc["lng"] = lng;
    
    String requestBody;
    serializeJson(doc, requestBody);
    Serial.println("Payload: " + requestBody);
    
    int httpResponseCode = http.POST(requestBody);
    
    if(httpResponseCode > 0){
      String response = http.getString();
      Serial.print("Response Code: ");
      Serial.println(httpResponseCode);
      Serial.println("AWS Response: " + response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}