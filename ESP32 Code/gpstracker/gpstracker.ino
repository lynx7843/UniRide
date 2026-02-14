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

unsigned long lastPrint = 0;

void setup() {
  Serial.begin(115200);
  delay(1000); // Give serial time to initialize
  
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
  // Print GPS data status every 2 seconds
  if (millis() - lastPrint > 2000) {
    lastPrint = millis();
    Serial.println("\n--- GPS Status ---");
    Serial.print("Satellites: ");
    Serial.println(gps.satellites.value());
    Serial.print("Location valid: ");
    Serial.println(gps.location.isValid() ? "YES" : "NO");
    Serial.print("Characters processed: ");
    Serial.println(gps.charsProcessed());
    Serial.print("Sentences with fix: ");
    Serial.println(gps.sentencesWithFix());
    Serial.print("Failed checksum: ");
    Serial.println(gps.failedChecksum());
  }

  // Check for GPS data
  while (SerialGPS.available() > 0) {
    char c = SerialGPS.read();
    Serial.print(c); // Print raw NMEA data to see if GPS is transmitting
    
    if (gps.encode(c)) {
      if (gps.location.isValid()) {
        Serial.println("\n*** Valid GPS Fix! ***");
        Serial.print("Lat: ");
        Serial.println(gps.location.lat(), 6);
        Serial.print("Lng: ");
        Serial.println(gps.location.lng(), 6);
        
        sendDataToAWS(gps.location.lat(), gps.location.lng());
        delay(10000);
      }
    }
  }
  
  // Check if GPS is getting ANY data
  if (millis() > 5000 && gps.charsProcessed() < 10) {
    Serial.println("\nWARNING: No GPS data detected!");
    Serial.println("Check:");
    Serial.println("1. GPS module power (3.3V or 5V depending on module)");
    Serial.println("2. RX/TX connections (GPS TX -> ESP32 Pin 25)");
    Serial.println("3. GPS module has clear view of sky");
    Serial.println("4. Wait 30-60 seconds for satellite lock");
  }
}

void sendDataToAWS(float lat, float lng) {
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    
    Serial.println("\n=== Sending to AWS ===");
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["deviceId"] = "ESP32_NSBM_Student";
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