/*
 * GPS Diagnostic Test Code
 * This will show raw GPS data to verify communication
 */

#include <HardwareSerial.h>

HardwareSerial gpsSerial(2);

#define GPS_TX 25
#define GPS_RX 26

void setup() {
  Serial.begin(115200);
  delay(3000);

  Serial.println("=== GPS DIAGNOSTIC TEST ===");
  Serial.println("Starting GPS on pins RX=25, TX=26");
  
  // Try 9600 baud first (NEO-6M default)
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  
  Serial.println("Listening for GPS data...");
  Serial.println("You should see raw NMEA sentences like $GPGGA, $GPRMC, etc.");
  Serial.println("If you see nothing after 30 seconds, there's a wiring issue.");
  Serial.println("================================");
}

void loop() {
  // Print any data received from GPS directly to Serial Monitor
  if (gpsSerial.available()) {
    char c = gpsSerial.read();
    Serial.print(c);
  }
  
  // Also check if Serial Monitor has data (for testing)
  if (Serial.available()) {
    char c = Serial.read();
    gpsSerial.write(c);
  }
}
