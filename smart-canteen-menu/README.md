# Smart Canteen Menu System 🍔📱

A full-stack, responsive web application designed for college campus canteens to streamline food ordering, reduce queue waiting times, and manage live canteen menu items efficiently.

---

## 🚀 Features

- **Interactive Menu Display**: Filter food items by category (Breakfast, Lunch, Snacks, Drinks, Desserts) and real-time live text search.
- **Cart & Order Checkout**: Add dishes to cart, adjust quantities, calculate real-time totals, and submit customer checkout info.
- **Admin Management Portal (Full CRUD)**:
  - Add new menu dishes with prices, images, and descriptions.
  - Edit existing food items and toggle real-time availability (In Stock / Sold Out).
  - Delete retired menu items.
  - Live Order Monitor with status updates (Pending, Preparing, Ready, Completed).
- **Responsive UI/UX**: Built with standard CSS custom variables, modern fonts, toast notifications, loading indicators, and mobile-first layouts.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+), FontAwesome Icons.
- **Backend**: Node.js, Express.js (REST API framework), CORS, dotenv.
- **Database**: Supabase PostgreSQL with Row Level Security (RLS).
- **Client-Server Communication**: Fetch API (JSON Data Exchange).

---

## 📁 Project Structure

```text
smart-canteen-menu/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   ├── server.js
│   ├── supabase.js
│   ├── package.json
│   └── .env.example
├── database/
│   └── schema.sql
├── .gitignore
└── README.md
```

---

## 📦 Installation & Setup Guide

### 1. Database Setup (Supabase)
1. Sign up/Log in to [Supabase](https://supabase.com/).
2. Create a new project named `smart-canteen`.
3. Go to the **SQL Editor** in your Supabase dashboard.
4. Open `database/schema.sql` from this repository, paste its contents, and click **Run**.
5. Copy your **Project URL** and **anon / service_role API key** from `Settings -> API`.

### 2. Backend Configuration
Navigate into the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

*(Note: If configuring manually, run: `npm install express cors dotenv @supabase/supabase-js ws` and `npm install --save-dev nodemon`)*

Create a `.env` file inside `backend/` based on `.env.example`:

```env
PORT=5000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key
```

### 3. Running the Backend Server

- **Development Mode (with live reload):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```
The server will run on `http://localhost:5000`.

### 4. Running the Frontend
- Open `frontend/index.html` directly in any web browser, or serve it using Live Server extension in VS Code.

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/health` | Health check endpoint |
| **GET** | `/api/categories` | Get all food categories |
| **GET** | `/api/menu` | Fetch menu items (supports query params `?category=` & `?search=`) |
| **POST** | `/api/menu` | Add a new menu item |
| **PUT** | `/api/menu/:id` | Update item details / availability |
| **DELETE** | `/api/menu/:id` | Delete a menu item |
| **POST** | `/api/orders` | Place a new customer order |
| **GET** | `/api/orders` | Fetch recent orders for admin |
| **PATCH** | `/api/orders/:id/status` | Update order preparation status |

---

## 🧪 Testing & Verification

1. **Static Analysis & Integration Verification**:
   - Backend routes correctly match frontend `fetch()` URLs.
   - Database columns (`id`, `name`, `price`, `category_id`, `is_available`) strictly correspond with API payload schemas.
2. **Local Test Execution**:
   - Run `node backend/server.js` to ensure zero syntax errors and that all modules (`express`, `cors`, `@supabase/supabase-js`) import cleanly.

---

## 🎬 Project Demonstration Script

1. **Load Web App**: Open `frontend/index.html`. Verify that initial sample menu items (Masala Dosa, Cold Coffee, etc.) load from the database.
2. **Search & Filter**: Click on category pills like "Beverages" or type "Burger" into the search box to observe instant UI updates.
3. **Place Order**: Click "Add" on a dish, open "My Cart", fill in your name and phone number, and submit. Notice the success toast confirmation!
4. **Admin Management**: Scroll down to the Admin section. Add a new item (e.g., "Puri Bhaji - ₹50"). Observe it instantly appearing in the top menu list.

---

## ❓ Five Beginner Viva Questions & Answers

1. **Q: Why use Supabase PostgreSQL over MongoDB for a canteen ordering app?**  
   *A: PostgreSQL is a relational database management system (RDBMS) ideal for structured data like orders, menu items, and categories with table constraints and key relationships.*
2. **Q: What is the purpose of CORS middleware in Node/Express?**  
   *A: Cross-Origin Resource Sharing (CORS) allows frontend web applications hosted on one origin/port (e.g., `5500` or `file://`) to securely make HTTP API calls to a backend server running on another port (`5000`).*
3. **Q: What is Row Level Security (RLS) in Supabase?**  
   *A: RLS is a database-level security policy feature that controls which user roles can read, insert, update, or delete specific rows inside PostgreSQL tables.*
4. **Q: How does client-side state management work in Vanilla JS?**  
   *A: In this application, state array variables (such as `cart[]` and `menuItems[]`) hold active app data in memory and trigger DOM re-renders whenever items are added or updated.*
5. **Q: Why store API keys in `.env` files rather than client JS code?**  
   *A: Storing sensitive database credentials on the backend prevents attackers from viewing keys in public browser source code or network tabs.*

---

## 🔒 Security & Educational Limitations
- RLS policies included in `schema.sql` are configured for standard demonstration read/write access. In production, configure Supabase Auth (JWT tokens) to restrict administrative POST/PUT/DELETE operations exclusively to authenticated admin accounts.