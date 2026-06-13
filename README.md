# 👗 Fashion Recommendation System

> Sistem rekomendasi fashion berbasis Machine Learning untuk retailer fashion menggunakan Collaborative Filtering, Content-Based Filtering, dan Hybrid Recommendation.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📌 Overview

Fashion Recommendation System merupakan aplikasi berbasis Artificial Intelligence yang dirancang untuk memberikan rekomendasi produk fashion yang relevan kepada pelanggan berdasarkan histori transaksi dan karakteristik produk.

Sistem menggabungkan beberapa pendekatan rekomendasi:

* Collaborative Filtering (SVD)
* Content-Based Filtering (TF-IDF)
* Hybrid Recommendation System

Selain itu, aplikasi menyediakan dashboard analitik untuk memantau performa produk dan perilaku pelanggan.

---

## ✨ Features

### 🤖 AI Recommendation Engine

* Personalized Product Recommendation
* Collaborative Filtering (SVD)
* Content-Based Filtering (TF-IDF)
* Hybrid Recommendation
* Top-N Recommendation

### 📊 Analytics Dashboard

* KPI Summary
* Customer Analytics
* Rating Analysis
* Monthly Trends
* Top Selling Products

### 👥 Customer Features

* Purchase History
* Customer Profile
* Favorite Category Analysis
* Export CSV

### 🎨 User Experience

* Responsive Design
* Dark / Light Mode
* Interactive Charts
* Loading Skeleton
* Toast Notification

---

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Recharts
* Axios
* Lucide React

### Backend

* FastAPI
* Python 3.11
* Pandas
* NumPy
* Scikit-Learn
* Surprise

### Machine Learning

* Singular Value Decomposition (SVD)
* TF-IDF Vectorization
* Cosine Similarity
* Hybrid Recommendation

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/lindanggara/fashion-recommendation-system.git
cd fashion-recommendation-system
```

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## 🌐 Application Access

| Service           | URL                        |
| ----------------- | -------------------------- |
| Frontend          | http://localhost:5173      |
| Backend API       | http://localhost:8000      |
| API Documentation | http://localhost:8000/docs |

---

## 📂 Project Structure

```text
fashion-recommendation-system/
│
├── backend/
│   ├── app/
│   ├── models/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── data/
├── docs/
├── models/
└── README.md
```

---

## 📡 API Endpoints

| Method | Endpoint                        | Description               |
| ------ | ------------------------------- | ------------------------- |
| GET    | /analytics/overview             | Dashboard KPI             |
| GET    | /analytics/top-products         | Top Products              |
| GET    | /analytics/monthly-transactions | Monthly Trends            |
| GET    | /customer/{id}/history          | Customer Purchase History |
| POST   | /recommend                      | Product Recommendation    |
| POST   | /feedback                       | User Feedback             |

---

## 📈 Model Performance

| Model                         | RMSE        | MAE         |
| ----------------------------- | ----------- | ----------- |
| Collaborative Filtering (SVD) | 0.0794      | 0.0265      |
| Content-Based Filtering       | Active      | Active      |
| Hybrid Recommendation         | Best Result | Best Result |

---

## 🖼️ Screenshots

### Dashboard

Tambahkan screenshot dashboard pada folder:

```text
docs/dashboard.png
```

### Recommendation Page

Tambahkan screenshot recommendation page pada folder:

```text
docs/recommendation.png
```

---

## 🎯 SDGs Contribution

Project ini mendukung:

### SDG 9 – Industry, Innovation and Infrastructure

* Pemanfaatan Artificial Intelligence pada industri fashion.
* Peningkatan pengalaman pelanggan melalui sistem rekomendasi.
* Mendukung transformasi digital sektor retail.

---

## 👨‍💻 Author

**Linda Anggara Wati**

* NRP: 3324600008
* Program Studi: Sains Data Terapan
* Politeknik Elektronika Negeri Surabaya (PENS)

GitHub:
https://github.com/lindanggara

Repository:
https://github.com/lindanggara/fashion-recommendation-system

---

## 📄 License

MIT License

Copyright © 2026 Linda Anggara Wati

---

<div align="center">

Made with ❤️ using FastAPI, React, and Machine Learning

</div>
