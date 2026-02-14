/*
 * ESP32 with NEO-6M GPS Module
 * Outputs location data to Serial Monitor
 * 
 * Connections:
 * NEO-6M TX  -> ESP32 GPIO 17 (RX)
 * NEO-6M RX  -> ESP32 GPIO 16 (TX)
 * NEO-6M VCC -> ESP32 3.3V or 5V
 * NEO-6M GND -> ESP32 GND
 */

#include <TinyGPS++.h>
#include <HardwareSerial.h>

// Create TinyGPS++ object
TinyGPSPlus gps;

// Create hardware serial object for GPS
// ESP32 has 3 hardware serial ports (0, 1, 2)
// Serial0 is used for USB debugging, so we use Serial2
HardwareSerial gpsSerial(2);

// GPS Module pins
#define GPS_TX 16  // ESP32 TX pin (connects to GPS RX)
#define GPS_RX 17  // ESP32 RX pin (connects to GPS TX)

void setup() {
  // Start serial communication with computer
  Serial.begin(115200);
  Serial.println("ESP32 GPS Location Tracker");
  Serial.println("Initializing GPS...");
  
  // Start serial communication with GPS module
  // NEO-6M default baud rate is 9600
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  
  Serial.println("Waiting for GPS signal...");
  Serial.println("This may take a few minutes if GPS is starting cold.");
  Serial.println("Make sure you're in an open area with clear sky view.");
  Serial.println("=====================================");
}

void loop() {
  // Check if data is available from GPS
  while (gpsSerial.available() > 0) {
    char c = gpsSerial.read();
    
    // Feed the character to TinyGPS++
    if (gps.encode(c)) {
      // If we have a new valid location
      if (gps.location.isValid()) {
        displayLocationInfo();
      } else {
        Serial.println("Waiting for valid GPS fix...");
      }
      
      // Display satellite and HDOP info periodically
      if (gps.satellites.isValid()) {
        Serial.print("Satellites: ");
        Serial.println(gps.satellites.value());
      }
    }
  }
  
  // If no data received from GPS for 5 seconds, show message
  if (millis() > 5000 && gps.charsProcessed() < 10) {
    Serial.println("No GPS data received. Check wiring:");
    Serial.println("- GPS TX -> ESP32 GPIO 17");
    Serial.println("- GPS RX -> ESP32 GPIO 16");
    Serial.println("- GPS VCC -> 3.3V or 5V");
    Serial.println("- GPS GND -> GND");
    delay(5000);
  }
}

void displayLocationInfo() {
  Serial.println("=====================================");
  Serial.println("GPS DATA RECEIVED:");
  
  // Latitude
  Serial.print("Latitude: ");
  Serial.print(gps.location.lat(), 6);
  Serial.println("°");
  
  // Longitude
  Serial.print("Longitude: ");
  Serial.print(gps.location.lng(), 6);
  Serial.println("°");
  
  // Altitude
  if (gps.altitude.isValid()) {
    Serial.print("Altitude: ");
    Serial.print(gps.altitude.meters());
    Serial.println(" meters");
  }
  
  // Speed
  if (gps.speed.isValid()) {
    Serial.print("Speed: ");
    Serial.print(gps.speed.kmph());
    Serial.println(" km/h");
  }
  
  // Number of satellites
  if (gps.satellites.isValid()) {
    Serial.print("Satellites: ");
    Serial.println(gps.satellites.value());
  }
  
  // HDOP (Horizontal Dilution of Precision)
  if (gps.hdop.isValid()) {
    Serial.print("HDOP: ");
    Serial.println(gps.hdop.value() / 100.0);
  }
  
  // Date and Time
  if (gps.date.isValid() && gps.time.isValid()) {
    Serial.print("Date/Time: ");
    Serial.print(gps.date.day());
    Serial.print("/");
    Serial.print(gps.date.month());
    Serial.print("/");
    Serial.print(gps.date.year());
    Serial.print(" ");
    
    if (gps.time.hour() < 10) Serial.print("0");
    Serial.print(gps.time.hour());
    Serial.print(":");
    if (gps.time.minute() < 10) Serial.print("0");
    Serial.print(gps.time.minute());
    Serial.print(":");
    if (gps.time.second() < 10) Serial.print("0");
    Serial.print(gps.time.second());
    Serial.println(" UTC");
  }
  
  // Google Maps link
  Serial.print("Google Maps: ");
  Serial.print("https://maps.google.com/?q=");
  Serial.print(gps.location.lat(), 6);
  Serial.print(",");
  Serial.println(gps.location.lng(), 6);
  
  Serial.println("=====================================");
  Serial.println();
  
  delay(2000); // Update every 2 seconds
}
