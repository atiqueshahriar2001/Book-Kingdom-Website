# Book Kingdom

Book Kingdom is a MERN bookstore starter that includes:

- JWT auth with admin and user roles
- Book catalog, search, filtering, ratings, and featured books
- Cart, wishlist, checkout, and order history
- Admin dashboards for books, users, and orders
- Responsive React frontend and Express/MongoDB backend

## Project structure

- `server` - Express API, MongoDB models, auth, business logic
- `client` - Vite + React frontend

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Copy env files:

```bash
copy server\\.env.example server\\.env
copy client\\.env.example client\\.env
```

3. Start the app:

```bash
npm run dev
```

## Default features

- Authentication, profile updates, password change
- Browse books, categories, featured books, reviews
- Search by title and author
- Filter by category, price, rating
- Cart and wishlist
- Orders and checkout
- Admin book, order, and user management

## Optional extensions left ready for integration

- Stripe / SSLCommerz payment gateway
- Email notifications
- Recommendations and recently viewed
- Multi-language and dark mode
