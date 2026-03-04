#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_Fingerprint.h>

// contection strings
const char* ssid = "";
const char* password = "";
const char* serverUrl = "";

TinyGPSPlus gps;
HardwareSerial SerialGPS(2);

HardwareSerial SerialFingerprint(1);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&SerialFingerprint);

unsigned long lastPrint = 0;

String authStatus = "unverified";

void setup() {
  Serial.begin(115200);
  delay(1000); 
  
  Serial.println("\n=== Starting ===");
  
  SerialGPS.begin(9600, SERIAL_8N1, 25, 26);
  Serial.println("GPS pins RX=25, TX=26");

  SerialFingerprint.begin(57600, SERIAL_8N1, 32, 33);
  finger.begin(57600);
  
  if (finger.verifyPassword()) {
    Serial.println("Fingerprint sensor found!");
  } else {
    Serial.println("Did not find fingerprint sensor :(");
  }

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
  checkFingerprint();

  // every 30 seconds
  if (millis() - lastPrint > 30000) {
    lastPrint = millis();
    Serial.println("\n--- System Status ---");
    Serial.print("Auth Status: ");
    Serial.println(authStatus);
    Serial.print("Satellites: ");
    Serial.println(gps.satellites.value());
    Serial.print("Location valid: ");
    Serial.println(gps.location.isValid() ? "YES" : "NO");
  }

  while (SerialGPS.available() > 0) {
    char c = SerialGPS.read();
    
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
}

// sending data
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
    doc["status"] = authStatus;
    
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

void checkFingerprint() {
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK)  return;

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK)  return;

  p = finger.fingerFastSearch();
  if (p == FINGERPRINT_OK) {
    Serial.println("\n*** FINGERPRINT VERIFIED! ***");
    Serial.print("Found ID #"); Serial.print(finger.fingerID); 
    Serial.print(" with confidence of "); Serial.println(finger.confidence);
    
    authStatus = "verified"; 
  } else {
    Serial.println("\n*** FINGERPRINT NOT RECOGNIZED ***");
  }
}