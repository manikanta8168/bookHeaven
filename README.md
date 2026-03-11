# Leafline Bookstore (MERN)

Bookstore app inspired by the referenced project flow, implemented with an original UI and structure.

## Stack
- Frontend: React + Vite + React Router
- Backend: Node.js + Express + MongoDB + Mongoose
- Auth: JWT (user/admin roles)

## Features
- User register/login/logout
- Separate user and admin login flows
- Browse/search/filter books
- Book details page
- Cart with quantity updates
- Checkout to create orders
- User order history
- Admin dashboard:
  - Add/delete books
  - View all orders
  - Update order status

## Run
1. Start MongoDB locally on `mongodb://localhost:27017`.
2. Backend:
   - `cd backend`
   - `npm.cmd install`
   - `npm.cmd run seed` (optional demo books + admin)
   - `npm.cmd run dev`
3. Frontend:
   - `cd frontend`
   - `npm.cmd install`
   - `npm.cmd run dev`

Frontend runs on Vite default URL, backend on `http://localhost:5000`.

## Default admin (after seed)
- Email: `admin@example.com`
- Password: `123456`

Seed now inserts 15 books with richer descriptions and metadata (publisher, pages, year, language, ISBN).

## Environment
- `backend/.env`
  - `MONGO_URI=mongodb://localhost:27017/book-store`
  - `JWT_SECRET=dev_super_secret_change_me`
  - `PORT=5000`
  - `CORS_ORIGINS=http://localhost:5173`
- `frontend/.env.development`
  - `VITE_API_URL=http://localhost:5000/api`

## API Pagination
The following endpoints support pagination when `paginate=true` is provided:
- `GET /api/books?paginate=true&page=1&limit=20`
- `GET /api/orders?paginate=true&page=1&limit=20` (admin)
- `GET /api/orders/myorders?paginate=true&page=1&limit=20`
- `GET /api/collab?paginate=true&page=1&limit=20` (admin)

Response shape for paginated endpoints:
```json
{
  "items": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "pages": 0
  }
}
```
