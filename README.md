<div align="center">

# 🚍 UniRide  
### Smart Travel Companion for University Students

**UniRide** is a cross-platform travel management system designed specifically for university students.  
It combines a **Flutter mobile app**, a **React web application**, and a **hardware-based GPS tracking system** to make campus transportation smarter, safer, and more reliable.

</div>


## 📖 About UniRide

University transportation can be unpredictable—late buses, unclear routes, and lack of real-time updates.  
**UniRide** solves this problem by providing:

- Real-time university bus tracking  
- Accurate travel timetables  
- Driver & bus information for easy identification  
- Mobile + Web access for convenience  

The system uses a **simple GPS tracking module built with Arduino** to track university buses and display live location data to students.


## ✨ Key Features

### Bus Tracking
- Real-time bus location tracking
- GPS data collected via Arduino-based tracker
- Live updates on both mobile and web apps

### Travel Timetable
- Daily and weekly bus schedules
- Route-based timetable filtering
- Easy-to-read UI for quick access

### Bus & Driver Information
- Bus number, route, and capacity
- Driver name and contact details
- Helps students identify the correct bus easily

### Mobile Application (Flutter)
- Android & iOS support
- Student-friendly UI
- Optimized for low data usage

### Web Application (React)
- Accessible from any browser
- Admin and information dashboard
- Real-time map view of buses


## 🛠️ Tech Stack

### Mobile App
- **Flutter**
- Dart

### Web App
- **React.js**
- JavaScript / TypeScript
- CSS / Tailwind (optional)

### Backend & Hardware
- **Arduino** (GPS Tracking Module)
- Simple GPS sensor (e.g., NEO-6M)
- REST APIs (Node.js / Firebase / Spring Boot – optional integration)


## 📂 Project Structure

```

UniRide/
│
├── mobile-app/          # Flutter mobile application
│
├── web-app/             # React web application
│
├── hardware/            # Arduino GPS tracker code
│
├── docs/                # Documentation & diagrams
│
└── README.md

````

---

## ⚙️ Initial Setup

UniRide’s GPS tracking system is configured in **two main phases**:

1. **Backend Setup (AWS – Serverless)**
2. **ESP32 GPS Client Setup**

This setup uses **AWS Free Tier** services and does not require managing a traditional server (EC2).

---

## Phase 1: Backend Setup (AWS Serverless)

Before programming the ESP32, a backend endpoint is required to receive GPS data.  
We use **DynamoDB**, **AWS Lambda**, and **API Gateway** to build a serverless backend.

---

### Step 1: Create the Database (DynamoDB)

1. Log in to the **AWS Console**
2. Search for **DynamoDB** → Click **Create Table**
3. Configure the table:
   - **Table Name:** `GPSTrackerData`
   - **Partition Key:** `deviceId` (String)
   - **Sort Key:** `timestamp` (Number)
4. Click **Create Table**

---

### Step 2: Create the Lambda Function

This function receives GPS data from the ESP32 and stores it in DynamoDB.

1. Search for **AWS Lambda** → Click **Create Function**
2. Configure:
   - **Function Name:** `SaveLocation`
   - **Runtime:** Node.js 20.x
3. Replace the contents of `index.mjs` with the following code:

```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const body = JSON.parse(event.body);

  const command = new PutCommand({
    TableName: "GPSTrackerData",
    Item: {
      deviceId: body.deviceId,
      timestamp: Date.now(),
      lat: body.lat,
      lng: body.lng
    },
  });

  await docClient.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Location Saved!" }),
  };
};
````

**Required Permissions**

1. Open the Lambda function
2. Go to Configuration → Permissions
3. Click the Execution Role
4. Attach the policy:
**AmazonDynamoDBFullAccess**

### Step 3: Create the API Endpoint (API Gateway)

1. Search for API Gateway
2. Select HTTP API → Click Build
3. Set Integration to the **SaveLocation** Lambda function
4. Name the API: **GPS_API**
5. Complete the setup and deploy
6. Copy the Invoke URL, for example:
```bash
https://xyz123.execute-api.us-east-1.amazonaws.com/SaveLocation
````

##Phase 2: ESP32 GPS Client Setup

The ESP32 collects GPS data and sends it to the AWS API.

**Requirements**
- ESP32 board
- GPS module (e.g., NEO-6M)
- Arduino IDE
- Libraries:
TinyGPS++
ArduinoJson
WiFi
HTTPClient

**Install ArduinoJson via Library Manager.**

### ESP32 Code Example
```bash
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi Credentials
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// AWS API Gateway URL
const char* serverUrl = "https://xyz123.execute-api.us-east-1.amazonaws.com/SaveLocation";

TinyGPSPlus gps;
HardwareSerial SerialGPS(2);

void setup() {
  Serial.begin(115200);
  SerialGPS.begin(9600, SERIAL_8N1, 16, 17);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected");
}

void loop() {
  while (SerialGPS.available() > 0) {
    if (gps.encode(SerialGPS.read())) {
      if (gps.location.isValid()) {
        sendDataToAWS(gps.location.lat(), gps.location.lng());
        delay(10000); // Send data every 10 seconds
      }
    }
  }
}

void sendDataToAWS(float lat, float lng) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["deviceId"] = "ESP32_NSBM_Student";
    doc["lat"] = lat;
    doc["lng"] = lng;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      Serial.println("AWS Response: " + http.getString());
    } else {
      Serial.print("HTTP Error: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}
````

## 🚀 Getting Started

### Mobile App (Flutter)

```bash
cd mobile-app
flutter pub get
flutter run
````

### Web App (React)

```bash
cd web-app
npm install
npm start
```

### Arduino GPS Tracker

1. Upload the Arduino code from `/hardware`
2. Connect the GPS module
3. Ensure serial/GSM/WiFi communication is active
4. Start sending GPS coordinates to the server


## 🎯 Target Users

* University students
* University transport administrators
* Campus security & transport staff


## 🔮 Future Enhancements

* Push notifications for bus delays
* Route optimization
* Travel analytics
* Student authentication
* Multiple university support


This project is developed for educational and academic purposes.
License can be added later as required.
