#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_Fingerprint.h>

// WiFi Credentials
const char* ssid = "";
const char* password = "";

// API Endpoints
const char* gpsServerUrl = "https://123.amazonaws.com/SaveLocation"; 
const char* verifyServerUrl = "https://123.amazonaws.com/LogFingerprint"; 

#define BUZZER_PIN 18

TinyGPSPlus gps;
HardwareSerial SerialGPS(2);
HardwareSerial SerialFinger(1); 

Adafruit_Fingerprint finger = Adafruit_Fingerprint(&SerialFinger);

unsigned long lastGpsSendTime = 0; 
float lastSentLat = 0.0;
float lastSentLng = 0.0;

bool isBuzzerActive = false;
unsigned long buzzerStartTime = 0;
const unsigned long BUZZER_DURATION = 1500; // 1.5 seconds

void setup() {
  Serial.begin(115200);
  delay(1000); 
  
  // Initialize Buzzer (Assuming Active-Low module)
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, HIGH); // HIGH turns an active-low buzzer OFF
  
  Serial.println("\n=== UniRide GPS & Verification Tracker ===");

  SerialGPS.begin(9600, SERIAL_8N1, 25, 26);
  Serial.println("GPS Initialized (RX=25, TX=26)");

  SerialFinger.begin(57600, SERIAL_8N1, 16, 17);
  finger.begin(57600);
  
  if (finger.verifyPassword()) {
    Serial.println("Fingerprint sensor detected!");
  } else {
    Serial.println("ERROR: Fingerprint sensor not found!");
  }

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected! IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // 1. Constantly feed the GPS module data (Won't block if GPS is unplugged)
  while (SerialGPS.available() > 0) {
    gps.encode(SerialGPS.read());
  }

  // 2. Check Buzzer Timer (Turn it off if 1.5 seconds have passed)
  if (isBuzzerActive && (millis() - buzzerStartTime >= BUZZER_DURATION)) {
    digitalWrite(BUZZER_PIN, HIGH); // HIGH turns it OFF
    isBuzzerActive = false;
  }

  // 3. Constantly check for a fingerprint scan
  int fingerId = getFingerprintID();
  if (fingerId > 0) {
    Serial.println("\n*** VALID FINGERPRINT SCANNED! ***");
    Serial.print("Metadata ID: ");
    Serial.println(fingerId);
    
    // Attempt to send data to AWS. Only buzz if it succeeds!
    if (sendVerificationToAWS(String(fingerId))) {
      Serial.println("AWS Success! Buzzing...");
      digitalWrite(BUZZER_PIN, LOW); // LOW turns it ON
      isBuzzerActive = true;
      buzzerStartTime = millis();
    } else {
      Serial.println("AWS Failed. No buzz.");
    }
  }

  // 4. Routine GPS Update (Every 30 Seconds)
  if (millis() - lastGpsSendTime >= 30000) {
    lastGpsSendTime = millis(); 

    if (gps.location.isValid()) {
      float currentLat = gps.location.lat();
      float currentLng = gps.location.lng();

      if (currentLat == lastSentLat && currentLng == lastSentLng) {
        Serial.println("Bus is stationary. No GPS data sent.");
      } else {
        Serial.println("\n*** Movement Detected! Sending GPS update. ***");
        sendGpsToAWS(currentLat, currentLng); 
        
        lastSentLat = currentLat;
        lastSentLng = currentLng;
      }
    } else {
      Serial.println("Waiting for valid GPS satellite lock (or GPS is unplugged)...");
    }
  }
}


int getFingerprintID() {
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK) return -1; 

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) return -1; 

  p = finger.fingerFastSearch();
  if (p != FINGERPRINT_OK) return -1; 

  return finger.fingerID;
}

void sendGpsToAWS(float lat, float lng) {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(gpsServerUrl);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc; 
    doc["deviceId"] = "t001";
    doc["lat"] = lat;
    doc["lng"] = lng;
    
    String requestBody;
    serializeJson(doc, requestBody);
    
    int httpResponseCode = http.POST(requestBody);
    Serial.print("GPS AWS Response Code: ");
    Serial.println(httpResponseCode);
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected. Cannot send GPS.");
  }
}

// Changed to return a boolean so we know if it succeeded
bool sendVerificationToAWS(String fingerprintId) {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(verifyServerUrl);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc; 
    doc["trackerId"] = "t001";
    doc["fingerprintId"] = fingerprintId;
    
    String requestBody;
    serializeJson(doc, requestBody);
    Serial.println("Sending Verification: " + requestBody);
    
    int httpResponseCode = http.POST(requestBody);
    Serial.print("Verification AWS Response Code: ");
    Serial.println(httpResponseCode);
    
    http.end();
    
    // Return true if we got a successful HTTP response code (200 OK)
    if (httpResponseCode > 0) {
      return true;
    }
  } else {
    Serial.println("WiFi Disconnected. Cannot send Verification.");
  }
  return false;
}