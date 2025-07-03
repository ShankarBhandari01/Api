# 🍽️ Restaurant Menu & Order Tracking API

This is a **modular, scalable, and multilingual Node.js API** built for managing restaurant menus, real-time order tracking, and background job processing. It supports English and Finnish languages and features real-time notifications using `Socket.IO` and `Redis`, scheduled tasks with `Agenda.js`, and clean architecture with **Awilix** for dependency injection.

---

## 🚀 Key Features

- 🗓️ **Multilingual Menu Management** (English + Finnish)
- 🔔 **Real-Time Order Tracking** with `Cluster.js`, `Redis`, and `Socket.IO`
- 🧠 **Dependency Injection** using `Awilix` (DI Container)
- 📦 Stock-based food item management (Starters, Main, Desserts, Drinks, Extras)
- 🗃️ **Agenda.js** for job scheduling (e.g., campaign expiry, auto-updates)
- 🔧 Clustered app structure for multi-core performance
- 🌐 Localization-ready schema and data models
- 🧩 Scalable architecture: Controller-Service-Repository pattern
- 🧪 Fully testable, modular components

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Real-Time:** Redis, Socket.IO
- **Scheduling:** Agenda.js
- **DI:** Awilix
- **Clustering:** Cluster.js
- **Caching/Queues:** Redis
- **Languages Supported:** English 🇬🇧 & Finnish 🇫🇮

---

## 📂 Project Structure

src/
│
├── models/ # Mongoose schemas (Menu, Stock, Order, etc.)
├── controllers/ # HTTP layer
├── services/ # Core business logic
├── repositories/ # Database layer
├── jobs/ # Agenda job definitions
├── schedulers/ # Agenda job registration
├── utils/ # Day mappings, common utilities
├── sockets/ # Socket.IO event handlers
├── config/ # Redis, Mongo, DI, Cluster setup
├── app.js # Express app init
└── index.js # Cluster-enabled entry point



👨‍💻 Author
Shankar Bhandari
GitHub: @ShankarBhandari01
