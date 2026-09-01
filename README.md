     <div align="center">

     <img src="docs/images/banner.png" alt="College Hostel & Transport Management System Banner" width="100%">

     # 🏫 College Hostel & Transport Management System

     ### Enterprise Digital Campus Management Platform

     Designed and Developed for

     ## **Madha Group of Institutions**
     ### Madha Dental College & Hospital

     ---

     ### 🚀 Designed, Developed & Maintained by

     # **Kishore Kumar P**

     **Software Development Engineer (SDE)**

     ---

     ![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)

     ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

     ![ASP.NET](https://img.shields.io/badge/ASP.NET_Core-10-512BD4?style=for-the-badge&logo=dotnet)

     ![SQL Server](https://img.shields.io/badge/SQL_Server-Database-CC2927?style=for-the-badge&logo=microsoftsqlserver)

     ![SignalR](https://img.shields.io/badge/SignalR-Real_Time-00BCF2?style=for-the-badge)

     ![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge)

     ![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?style=for-the-badge)

     ![License](https://img.shields.io/badge/License-Institutional-success?style=for-the-badge)

     ---

     ![GitHub stars](https://img.shields.io/github/stars/Kishoreex/college-hostel-transport-management?style=social)

     ![GitHub forks](https://img.shields.io/github/forks/Kishoreex/college-hostel-transport-management?style=social)

     ![GitHub issues](https://img.shields.io/github/issues/Kishoreex/college-hostel-transport-management)

     ![GitHub last commit](https://img.shields.io/github/last-commit/Kishoreex/college-hostel-transport-management)

     </div>

     ---

     # 📑 Table of Contents

     - Overview
     - Project Highlights
     - Key Features
     - Technology Stack
     - Architecture
     - Modules
     - Screenshots
     - Workflow
     - API Documentation
     - Installation
     - Deployment
     - Mobile Application
     - Security
     - Future Roadmap
     - Developer

     ---

     # 📖 Overview

     The **College Hostel & Transport Management System** is a full-stack enterprise web application developed for **Madha Group of Institutions – Madha Dental College & Hospital**.

     The platform digitizes the complete hostel and transport management lifecycle, replacing manual paperwork with secure, role-based digital workflows.

     The application is actively designed to streamline operations across students, wardens, hostel administrators, transport administrators, security staff, and institutional management.

     ---

     # ⭐ Project Highlights

     ✔ Enterprise Grade Architecture

     ✔ Role Based Authentication

     ✔ Digital QR Outpass

     ✔ GPS Based Geofencing

     ✔ SignalR Real-time Notifications

     ✔ Mobile Responsive Design

     ✔ Android Application

     ✔ SQL Server Database

     ✔ RESTful API Architecture

     ✔ IIS Production Deployment

     ✔ Excel Report Generation

     ✔ Profile Photo Management

     ✔ Room Allocation System

     ✔ Leave Management

     ✔ Vacating Management

     ✔ Transport Registration

     ✔ Transport Cancellation

     ✔ Dashboard Analytics

     ✔ QR Verification

     ✔ GPS Exit & Return Tracking

     ---

     # 🎯 Objective

     The primary objective of this platform is to eliminate paper-based hostel and transport operations by providing a secure, scalable and centralized digital ecosystem.

     The system enables efficient communication between students and administrators while maintaining transparency, security and operational efficiency.

     ---

     # 🏛 Institution

     **Madha Group of Institutions**

     Project Deployed For

     **Madha Dental College & Hospital**

     ---

     # 👨‍💻 My Role

     **Software Development Engineer (SDE)**

     This application was independently designed and implemented by **Kishore Kumar P** as part of his responsibilities as a Software Development Engineer.

     ### Responsibilities

     - Solution Architecture
     - UI / UX Design
     - Frontend Development
     - Backend Development
     - SQL Server Database Design
     - Entity Framework Core
     - REST API Development
     - Authentication & Authorization
     - SignalR Integration
     - GPS Geofencing
     - QR Code Generation
     - Android Application Development
     - IIS Deployment
     - Testing
     - Bug Fixing
     - Production Support

     ---

     # 🚀 Key Features

     ## Student Portal

     - Hostel Registration
     - Transport Registration
     - Student Dashboard
     - QR Digital Outpass
     - Leave Request
     - Vacating Request
     - Transport Cancellation
     - Profile Photo Upload
     - Password Management
     - Live Notifications
     - GPS Tracking

     ---

     ## Hostel Administration

     - Student Verification
     - Room Allocation
     - Room Transfer
     - Remove Student
     - Outpass Approval
     - Leave Approval
     - Vacating Approval
     - Dashboard Analytics
     - Excel Reports

     ---

     ## Transport Administration

     - Route Management
     - Bus Management
     - Stop Management
     - Student Approval
     - Transport Cancellation
     - Reports
     - Dashboard

     ---

     ## Security

     - QR Verification
     - Student Verification
     - Exit Tracking
     - Return Tracking
     - Late Detection
     - GPS Validation

     ---

     # 📸 Application Preview

     | Landing | Student Login |
     |----------|---------------|
     | ![](docs/screenshots/landing.png) | ![](docs/screenshots/student-login.png) |

     | Hostel Dashboard | Transport Dashboard |
     |------------------|---------------------|
     | ![](docs/screenshots/hostel-dashboard.png) | ![](docs/screenshots/transport-dashboard.png) |

     | Admin Login | QR Outpass |
     |-------------|------------|
     | ![](docs/screenshots/admin-login.png) | ![](docs/screenshots/qr-outpass.png) |

     ---

     # ⚡ Technology Stack

     | Layer | Technology |
     |--------|------------|
     | Frontend | React 19 |
     | Language | TypeScript |
     | Styling | Tailwind CSS |
     | UI | Material UI |
     | Backend | ASP.NET Core Web API |
     | ORM | Entity Framework Core |
     | Database | SQL Server |
     | Authentication | JWT |
     | Realtime | SignalR |
     | QR | React QR Code |
     | Mobile | Capacitor Android |
     | Deployment | IIS + Vercel |

     ---

     # 🏗 Enterprise System Architecture

     ```text
                                        Users
                                        │
               ┌────────────────────────────┼────────────────────────────┐
               │                            │                            │
               ▼                            ▼                            ▼
          Students                  Hostel Administration       Transport Administration
               │                            │                            │
               └────────────────────────────┼────────────────────────────┘
                                        │
                                        ▼
                                   React + TypeScript
                              (Vite + Tailwind + MUI)
                                        │
                                   REST API / SignalR
                                        │
                                        ▼
                              ASP.NET Core Web API (.NET 10)
                                        │
          ┌─────────────────────────────┼──────────────────────────────┐
          │                             │                              │
          ▼                             ▼                              ▼
     JWT Authentication            Business Logic                 SignalR Hub
          │                             │                              │
          └─────────────────────────────┼──────────────────────────────┘
                                        │
                                        ▼
                              Entity Framework Core
                                        │
                                        ▼
                                   Microsoft SQL Server
                                        │
                                        ▼
                                   IIS Production Server
     ```

     ---

     # 🗄 Database Architecture

     The backend uses **Microsoft SQL Server** with **Entity Framework Core**.

     ## Primary Entities

     ```text
     Users
     │
     ├── Student Registration
     │
     ├── Hostel Registration
     │
     ├── Hostel Room Allocation
     │
     ├── Transport Registration
     │
     ├── Leave Requests
     │
     ├── Outpass Requests
     │
     ├── Vacating Requests
     │
     ├── Transport Cancellation
     │
     └── Notifications
     ```

     ---

     # 🗺 Database ER Diagram

     ```text
     User
     │
     ├──────────────┐
     │              │
     ▼              ▼
     Hostel      Transport
     Registration Registration
     │              │
     ▼              ▼
     Room        Route
     Allocation  Allocation
     │              │
     └──────┐  ┌────┘
          ▼  ▼
          Student
          │
     ┌───────┼─────────────────────────┐
     ▼       ▼          ▼              ▼
     Leave  Outpass  Vacating   Cancellation
     ```

     ---

     # 🔄 System Workflow

     ```text
     Student

          │

          ▼

     Authentication

          │

          ▼

     Dashboard

          │

          ├─────────────┐
          │             │
          ▼             ▼

     Hostel         Transport

          │             │

          ▼             ▼

     Registration   Registration

          │             │

          ▼             ▼

     Admin Approval

          │

          ▼

     Student Dashboard Updated

          │

          ▼

     QR Outpass

          │

          ▼

     Security Verification

          │

          ▼

     GPS Exit Detection

          │

          ▼

     GPS Return Detection

          │

          ▼

     Outpass Closed
     ```

     ---

     # 🔐 Authentication Flow

     ```text
     Login Request

          │

          ▼

     Validate Credentials

          │

          ▼

     JWT Token Generated

          │

          ▼

     Role Verification

          │

          ▼

     Protected APIs

          │

          ▼

     Dashboard Access
     ```

     ---

     # 📡 API Architecture

     ```text
     React Frontend

          │

     HTTP REST APIs

          │

          ▼

     ASP.NET Core Controllers

          │

          ▼

     Services

          │

          ▼

     Entity Framework Core

          │

          ▼

     SQL Server
     ```

     ---

     # 📁 Project Structure

     ```text
     College Hostel Transport Management

     ├── android
     │
     ├── backend
     │   └── HostelTransportAPI
     │       ├── Controllers
     │       ├── DTOs
     │       ├── Models
     │       ├── Data
     │       ├── Hubs
     │       ├── Migrations
     │       ├── Properties
     │       ├── wwwroot
     │       ├── Program.cs
     │       └── appsettings.json
     │
     ├── src
     │   ├── api
     │   ├── app
     │   │   ├── components
     │   │   ├── dashboards
     │   │   ├── hostel
     │   │   ├── transport
     │   │   ├── outpass
     │   │   ├── leave
     │   │   ├── auth
     │   │   └── common
     │   │
     │   ├── services
     │   ├── config
     │   ├── utils
     │   └── types
     │
     ├── public
     │
     ├── docs
     │
     ├── android
     │
     ├── package.json
     │
     └── README.md
     ```

     ---

     # 🌐 Deployment Architecture

     ```text
                         Internet

                         │

                         ▼

                    Vercel Frontend

                         │

     HTTPS REST API

                         │

                         ▼

                    IIS Web Server

                         │

     ASP.NET Core Web API

                         │

     Entity Framework Core

                         │

                         ▼

               Microsoft SQL Server
     ```

     ---

     # 🔄 QR Digital Outpass Workflow

     ```text
     Student

          │

     Create Outpass

          │

          ▼

     Warden Approval

          │

          ▼

     QR Code Generated

          │

          ▼

     Security Scan

          │

          ▼

     GPS Exit

          │

          ▼

     GPS Return

          │

          ▼

     Late Detection

          │

          ▼

     Completed
     ```

     ---

     # 📍 GPS Geofencing

     The application automatically tracks

     - Student Exit
     - Student Return
     - Hostel Radius
     - Latitude
     - Longitude
     - Exit Timestamp
     - Return Timestamp
     - Late Return Duration

     without requiring manual attendance.

     ---

     # 🔔 Real-Time Communication

     SignalR is integrated to synchronize data across all connected users.

     ### Live Events

     - Hostel Registration Status
     - Transport Registration Status
     - Leave Approval
     - Outpass Approval
     - Vacating Approval
     - Transport Cancellation
     - Dashboard Refresh
     - Notifications

     ---

     # 📊 Reporting Module

     The platform supports exporting reports to Microsoft Excel.

     Available reports include:

     - Student Report
     - Hostel Report
     - Transport Report
     - Leave Report
     - Outpass Report
     - Vacating Report
     - Room Allocation Report
     - Transport Cancellation Report
     ---

     # 🚀 Getting Started

     ## System Requirements

     ### Frontend

     - Node.js 20+
     - npm 10+
     - React 19
     - Vite

     ### Backend

     - .NET 10 SDK
     - ASP.NET Core Web API
     - Entity Framework Core

     ### Database

     - Microsoft SQL Server 2022+

     ### IDE

     - Visual Studio 2022
     - Visual Studio Code

     ---

     # 📥 Clone Repository

     ```bash
     git clone https://github.com/Kishoreex/college-hostel-transport-management.git

     cd college-hostel-transport-management
     ```

     ---

     # 📦 Frontend Setup

     ```bash
     npm install

     npm run dev
     ```

     Frontend runs at

     ```
     http://localhost:5173
     ```

     ---

     # ⚙ Backend Setup

     ```bash
     cd backend/HostelTransportAPI

     dotnet restore

     dotnet build

     dotnet ef database update

     dotnet run
     ```

     Backend runs at

     ```
     https://localhost:5001
     ```

     ---

     # 🗄 Database Configuration

     Update **appsettings.json**

     ```json
     {
     "ConnectionStrings": {
     "DefaultConnection": "YOUR_SQL_SERVER_CONNECTION_STRING"
     }
     }
     ```

     Then execute

     ```bash
     dotnet ef database update
     ```

     ---

     # 🌐 Production Deployment

     ## Frontend

     Platform

     ```
     Vercel
     ```

     Build Command

     ```bash
     npm run build
     ```

     Output Directory

     ```
     dist
     ```

     ---

     ## Backend

     Platform

     ```
     Microsoft IIS
     ```

     Deployment Steps

     - Publish ASP.NET Core API
     - Configure IIS Website
     - Configure HTTPS
     - Install .NET Hosting Bundle
     - Configure Reverse Proxy
     - Enable WebSockets
     - Deploy Production Build

     ---

     ## Database

     Platform

     ```
     Microsoft SQL Server
     ```

     Management Tool

     ```
     SQL Server Management Studio (SSMS)
     ```

     ---

     # 📱 Android Application

     Built using

     - Capacitor
     - Android Studio

     Target Platform

     - Android

     Distribution

     - Google Play Store (Planned)

     ---

     # 🔐 Authentication

     Authentication is implemented using **JWT (JSON Web Tokens)**.

     Flow

     ```text
     Login

     ↓

     Credential Validation

     ↓

     JWT Generation

     ↓

     Role Validation

     ↓

     Protected APIs

     ↓

     Dashboard Access
     ```

     ---

     # 👥 Authorization

     Supported Roles

     - Super Admin
     - Hostel Administrator
     - Boys Hostel Warden
     - Girls Hostel Warden
     - Transport Administrator
     - Student

     ---

     # 📡 REST API Overview

     Base URL

     ```
     https://202.61.121.102:8443/api
     ```

     ---

     ## Authentication

     | Method | Endpoint |
     |---------|----------|
     | POST | /auth/login |
     | POST | /auth/change-password |
     | GET | /users/profile |

     ---

     ## Student

     | Method | Endpoint |
     |---------|----------|
     | GET | /students |
     | GET | /students/{id} |
     | PUT | /students/{id} |

     ---

     ## Hostel

     | Method | Endpoint |
     |---------|----------|
     | POST | /studentregistrations |
     | GET | /hostelrooms |
     | POST | /hostelroomallocation |

     ---

     ## Transport

     | Method | Endpoint |
     |---------|----------|
     | POST | /transportregistrations |
     | GET | /transportroutes |
     | GET | /transportstops |

     ---

     ## Leave

     | Method | Endpoint |
     |---------|----------|
     | POST | /leaverequests |
     | GET | /leaverequests |

     ---

     ## Outpass

     | Method | Endpoint |
     |---------|----------|
     | POST | /outpasses |
     | GET | /outpasses |
     | PUT | /outpasses/{id} |

     ---

     ## Vacating

     | Method | Endpoint |
     |---------|----------|
     | POST | /vacating |
     | GET | /vacating |

     ---

     ## Reports

     | Method | Endpoint |
     |---------|----------|
     | GET | /reports |
     | GET | /transportreports |

     ---

     # 📲 QR Digital Outpass

     Each approved outpass contains

     - Student Information
     - Student Photo
     - QR Code
     - Outpass ID
     - Destination
     - Reason
     - Valid From
     - Valid To
     - Exit Time
     - Return Time
     - GPS Tracking
     - Current Status

     The QR Code is scanned by security personnel to verify the student's authorization.

     ---

     # 📍 GPS Tracking

     Automatically captures

     - Exit Latitude
     - Exit Longitude
     - Return Latitude
     - Return Longitude
     - Exit Timestamp
     - Return Timestamp
     - Late Return Duration

     ---

     # 🔔 SignalR Integration

     Real-time events include

     - Hostel Registration Updates
     - Transport Registration Updates
     - Leave Approval
     - Outpass Approval
     - Vacating Approval
     - Transport Cancellation
     - Live Dashboard Refresh
     - Notification Updates

     ---

     # 🧪 Testing

     Testing performed during development

     ✅ Authentication Testing

     ✅ API Testing

     ✅ Database Validation

     ✅ QR Verification

     ✅ GPS Validation

     ✅ Role-Based Authorization

     ✅ Responsive UI Testing

     ✅ Android Testing

     ✅ IIS Deployment Testing

     ---

     # 🔒 Security Features

     - JWT Authentication
     - Password Hashing
     - Role-Based Authorization
     - Protected REST APIs
     - Secure HTTPS Communication
     - Input Validation
     - SQL Injection Protection (Entity Framework Core)
     - Route Protection
     - QR Verification
     - GPS Validation

     ---

     # ⚡ Performance Optimizations

     - Lazy Loaded Components
     - Optimized REST Calls
     - Efficient Entity Framework Queries
     - Responsive UI
     - SignalR Real-Time Updates
     - Production Build Optimization

     ---

     # 🛠 Maintenance

     Current maintenance includes

     - Feature Enhancements
     - Bug Fixes
     - Security Updates
     - Performance Improvements
     - Production Monitoring
     ---

     # 📸 Application Gallery

     > Replace the placeholder images below with the latest screenshots from the application.

     ## 🌐 Landing Page

     <p align="center">
     <img src="docs/screenshots/landing.png" width="90%">
     </p>

     ---

     ## 🔐 Student Login

     <p align="center">
     <img src="docs/screenshots/student-login.png" width="90%">
     </p>

     ---

     ## 🛡 Administrator Login

     <p align="center">
     <img src="docs/screenshots/admin-login.png" width="90%">
     </p>

     ---

     ## 🏠 Hostel Dashboard

     <p align="center">
     <img src="docs/screenshots/hostel-dashboard.png" width="90%">
     </p>

     ---

     ## 🚌 Transport Dashboard

     <p align="center">
     <img src="docs/screenshots/transport-dashboard.png" width="90%">
     </p>

     ---

     ## 📱 Digital QR Outpass

     <p align="center">
     <img src="docs/screenshots/qr-outpass.png" width="60%">
     </p>

     ---

     ## 📊 Reports

     <p align="center">
     <img src="docs/screenshots/reports.png" width="90%">
     </p>

     ---

     ## 📱 Android Application

     <p align="center">
     <img src="docs/screenshots/mobile-app.png" width="35%">
     </p>

     ---

     # 🎥 Demonstration

     ## Web Application

     <p align="center">

     Coming Soon

     </p>

     ---

     ## Android Application

     <p align="center">

     Coming Soon

     </p>

     ---

     # 📈 Roadmap

     ## Version 1.0

     - Student Authentication
     - Hostel Registration
     - Transport Registration
     - QR Outpass
     - Leave Management
     - Vacating Management
     - GPS Tracking
     - SignalR Notifications
     - Room Allocation
     - Reports

     ---

     ## Version 2.0

     - Parent Portal
     - Security Guard Mobile Application
     - Push Notifications
     - Visitor Management
     - Analytics Dashboard
     - Attendance Management

     ---

     ## Version 3.0

     - AI Chat Assistant
     - Face Recognition
     - RFID Integration
     - Smart Attendance
     - Student Analytics
     - Predictive Reports

     ---

     # 📋 Coding Standards

     This project follows

     - Clean Architecture
     - REST API Principles
     - SOLID Principles
     - Repository Pattern
     - Dependency Injection
     - Entity Framework Core Best Practices
     - Responsive UI Design
     - Modular Component Architecture

     ---

     # 📦 Major Modules

     ✔ Authentication

     ✔ Student Management

     ✔ Hostel Registration

     ✔ Hostel Room Allocation

     ✔ Transport Registration

     ✔ Transport Route Management

     ✔ Leave Management

     ✔ QR Outpass Management

     ✔ GPS Geofencing

     ✔ Vacating Management

     ✔ Transport Cancellation

     ✔ Reports

     ✔ Notifications

     ✔ Android Application

     ---

     # 🌍 Production Environment

     | Component | Platform |
     |------------|----------|
     | Frontend | Vercel |
     | Backend | Microsoft IIS |
     | Database | Microsoft SQL Server |
     | Mobile | Android |
     | Real-Time | SignalR |
     | Authentication | JWT |

     ---

     # 📊 Project Statistics

     | Category | Details |
     |-----------|----------|
     | Architecture | Enterprise Full Stack |
     | Frontend | React + TypeScript |
     | Backend | ASP.NET Core Web API |
     | Database | SQL Server |
     | Mobile | Capacitor Android |
     | Authentication | JWT |
     | Real-Time | SignalR |
     | Deployment | IIS + Vercel |
     | Reports | Excel Export |
     | GPS | Supported |
     | QR | Supported |

     ---

     # 👨‍💻 About the Developer

     ## Kishore Kumar P

     **Software Development Engineer (SDE)**

     **Madha Group of Institutions**

     **Madha Dental College & Hospital**

     ---

     ### Professional Summary

     Software Development Engineer with experience designing and developing enterprise web applications for educational institutions.

     Specialized in full-stack application development using React, ASP.NET Core Web API, SQL Server, and modern software engineering practices.

     Experienced in designing scalable architectures, implementing secure REST APIs, building responsive user interfaces, integrating real-time communication with SignalR, developing Android applications using Capacitor, and deploying production applications on Microsoft IIS.

     ---

     ### Responsibilities

     - Solution Architecture
     - Database Design
     - UI / UX Design
     - Frontend Development
     - Backend Development
     - REST API Development
     - Entity Framework Core
     - JWT Authentication
     - SignalR Integration
     - QR Code System
     - GPS Geofencing
     - Android Development
     - IIS Deployment
     - SQL Server Administration
     - Testing & Quality Assurance
     - Production Support

     ---

     ### Education

     **Bachelor of Engineering**

     Computer Science and Engineering

     **St. Lourdes Engineering College**

     2022 – 2026

     ---

     ### Current Position

     Software Development Engineer (SDE)

     Madha Group of Institutions

     Madha Dental College & Hospital

     ---

     ### Contact

     GitHub

     https://github.com/Kishoreex

     LinkedIn

     https://www.linkedin.com/in/kishorekumar-cse

     Email

     kishore1kumar4@gmail.com

     ---

     # 🤝 Contributing

     Contributions, suggestions, and feedback are welcome.

     Please open an Issue or submit a Pull Request for improvements.

     ---

     # 🙏 Acknowledgements

     Special thanks to

     - Madha Group of Institutions
     - Madha Dental College & Hospital

     for providing the opportunity to design and develop this enterprise application.

     ---

     # 📄 License

     Copyright © 2026 Kishore Kumar P.

     This repository showcases software engineering work completed for professional and portfolio purposes. Please ensure you have appropriate permission before reusing or redistributing the source code. Refer to the repository's license for usage terms.

     ---

     <div align="center">

     ## ⭐ If you found this project useful, please consider giving it a Star.

     Made with ❤️ by **Kishore Kumar P**

     Software Development Engineer

     Madha Group of Institutions

     Madha Dental College & Hospital

     </div>