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
GPS module hardware schematics and AWS configuration can be found on **UniRide AWS Config** Repository.

### 🔗 Repositories
| Project | Repository |
|---|---|
|  UniRide Mobile | [lynx7843/UniRide_mobile](https://github.com/lynx7843/UniRide_mobile) |
|  UniRide Client | [lynx7843/UniRide_client](https://github.com/lynx7843/UniRide_client) |
|  UniRide AWS Config | [lynx7843/UniRide_client](https://github.com/lynx7843/UniRide_AWS_Config) |

## ✨ Key Features
### Shuttle Tracking
- Real-time bus location tracking
- GPS data collected via Arduino-based tracker
- Live updates on both mobile and web apps
### Travel Timetable
- Daily bus schedules
- Easy-to-read UI for quick access
### Bus & Driver Information
- Bus number, route, and capacity
- Driver name and contact details
- Helps students identify the correct bus easily
### Mobile Application (Flutter)
- Android support
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
- JavaScript
- CSS
### Backend & Hardware
- **Arduino** (GPS Tracking Module)
- Simple GPS sensor (NEO-6M)
- REST APIs (Node.js / Firebase)
## 🚀 Getting Started
### Mobile App (Flutter)
````bash
cd UniRide_mobile
flutter pub get
flutter run
````
### Driver Mobile App (Flutter)
````bash
cd UniRide_client
flutter pub get
flutter run
````
### Web App (React)
````bash
cd UniRide Site\map-app\src
npm install
npm start
````
### Arduino GPS Tracker
1. Upload the Arduino code to `/ESP32 Code`
2. Connect the GPS module
3. Ensure serial/GSM/WiFi communication is active
4. Test whether the GPS coordinates are sending to the server
5. Additional testing codes are also provided for testing and debugging
## 🎯 Target Users
* University students
* University transport administrators
* Campus security & transport staff
