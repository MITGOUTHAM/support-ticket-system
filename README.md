# 🛠 Support Ticket System (LLM Powered)

A full-stack support ticket management system built with:

- Django + Django REST Framework (Backend)
- React (Vite) (Frontend)
- LLM-powered auto classification
- Dockerized deployment
- Clean dashboard UI

---

## 📌 Features

- Create support tickets
- LLM-based automatic category & priority suggestion
- Filter tickets by category, priority, status
- Update ticket status (Open → In Progress → Resolved → Closed)
- Dashboard statistics:
  - Total tickets
  - Open tickets
  - Average tickets per day
  - Category breakdown
  - Priority breakdown
- Fully Dockerized setup

---

## 🏗 Tech Stack

### Backend
- Python
- Django
- Django REST Framework
- django-filter
- Groq / LLM API

### Frontend
- React (Vite)
- Axios
- Custom Dark UI

### DevOps
- Docker
- Docker Compose
- Nginx (for frontend production build)

---

## 🚀 Running the Project (Docker - Recommended)

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd support-ticket-system


