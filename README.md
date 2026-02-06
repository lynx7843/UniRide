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


## 🤝 Contributing

Contributions are welcome!
Feel free to fork this repository, create a new branch, and submit a pull request.


## 📜 License

This project is developed for educational and academic purposes.
License can be added later as required.
