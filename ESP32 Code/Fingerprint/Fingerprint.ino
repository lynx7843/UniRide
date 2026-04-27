#include <HardwareSerial.h>
#include <Adafruit_Fingerprint.h>

// --- Hardware Pins ---
HardwareSerial SerialFinger(1); 
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&SerialFinger);

uint8_t id;

void setup() {
  Serial.begin(115200);
  
  Serial.println("\n=== Simple Fingerprint Enrollment ===");

  // Initialize Fingerprint Scanner on UART1 (RX=16, TX=17)
  SerialFinger.begin(57600, SERIAL_8N1, 16, 17);
  finger.begin(57600);
  
  if (finger.verifyPassword()) {
    Serial.println("Sensor found and ready!");
  } else {
    Serial.println("Sensor not found. Check wiring.");
    while (1) { delay(1); } // Stop the program if no sensor
  }
}

// Simple function to read the ID typed in the Serial Monitor
uint8_t readnumber(void) {
  uint8_t num = 0;
  while (num == 0) {
    while (!Serial.available());
    num = Serial.parseInt();
  }
  return num;
}

void loop() {
  Serial.println("\nType an ID (1-127) in the Serial Monitor and press Enter:");
  
  id = readnumber();
  if (id == 0) return; 
  
  Serial.print("Starting enrollment for ID #");
  Serial.println(id);
  
  while (!getFingerprintEnroll());
}

// The simplified enrollment logic
uint8_t getFingerprintEnroll() {
  int p = -1;
  
  // --- Step 1: First Scan ---
  Serial.println("-> Place your finger on the scanner...");
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
  }
  
  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK) {
    Serial.println("Error processing image. Try again.");
    return p;
  }
  
  Serial.println("-> Good! Now remove your finger.");
  delay(2000); // Give the user time to remove it
  p = 0;
  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
  }
  
  // --- Step 2: Second Scan ---
  Serial.println("-> Place the SAME finger back on the scanner...");
  p = -1;
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
  }
  
  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK) {
    Serial.println("Error processing image. Try again.");
    return p;
  }
  
  // --- Step 3: Create and Save Model ---
  p = finger.createModel();
  if (p != FINGERPRINT_OK) {
    Serial.println("Prints did not match. Please restart.");
    return p;
  }
  
  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK) {
    Serial.println("\n*** ENROLLMENT SUCCESSFUL! ***");
    
    // Print the simple JSON for DynamoDB
    Serial.println("Copy this into your DriverFingerprints table in AWS:");
    Serial.println("--------------------------------------------------");
    Serial.println("{");
    Serial.println("  \"driverId\": {");
    Serial.print("    \"S\": \"DRV-100"); Serial.print(id); Serial.println("\"");
    Serial.println("  },");
    Serial.println("  \"fingerprintId\": {");
    Serial.print("    \"S\": \""); Serial.print(id); Serial.println("\"");
    Serial.println("  },");
    Serial.println("  \"driverName\": {");
    Serial.print("    \"S\": \"Driver "); Serial.print(id); Serial.println("\"");
    Serial.println("  },");
    Serial.println("  \"templateData\": {");
    Serial.println("    \"S\": \"A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F455AABBCCDDEEFFF4A2B9C8E1D7F600\""); 
    Serial.println("  }");
    Serial.println("}");
    Serial.println("--------------------------------------------------\n");
    
  } else {
    Serial.println("Error saving to sensor memory.");
    return p;
  }
  
  return true;
}