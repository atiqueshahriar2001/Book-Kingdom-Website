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

## Runtime configuration

- `server/.env` should use your deployed frontend origin in `CLIENT_URL`
- `client/.env` should use your deployed backend `/api` URL in `VITE_API_URL`
- This repository is currently configured for the deployed project:
  - Frontend: `https://bookkingdom.netlify.app`
  - Backend: `https://book-kingdom-server.onrender.com/api`

## Required server env vars

- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## Seed admin

- Run `cd server && npm run seed`
- The seed script is blocked in production by design

## Deployment notes

- Render server config lives in [server/render.yaml](/c:/Users/User/Downloads/Book-Kingdom/server/render.yaml)
- Netlify client config lives in [client/netlify.toml](/c:/Users/User/Downloads/Book-Kingdom/client/netlify.toml)
- On Render, make sure `CLIENT_URL` matches the deployed frontend origin exactly
- On Netlify, set `VITE_API_URL` to your deployed backend `/api` URL
- If you deploy from the repo root, configure Netlify base directory as `client`

## Security

- Never commit real secrets to `.env`
- If any real secret was exposed before, rotate it in the provider dashboard
- Keep real values only in local `.env` files or hosting platform env settings

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
