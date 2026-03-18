### Frontend (`client`)
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- API structure based on your Nuxt sample (`APIError`, `BaseAPIService`, service classes)

## Features Implemented

- Redirect on app open:
  - no token → `/login`
  - with valid token → `/home`
- Login with email/password against database
- Seeder user account for login
- Home shows current user IP geolocation (`ipinfo`)
- Search by IP and show geolocation
- Validate invalid IP on frontend + backend
- Clear search to revert to current user geolocation
- Search history list
- Click history item to load its geolocation
- Multi-select history delete
- Logout

## Frontend Setup

1. Go to frontend:
   - `cd client`
2. Install deps:
   - `npm install`
3. Create env:
   - copy `.env.example` to `.env.local`
4. Run app:
   - `npm run dev`

Runs at: `http://localhost:3000`

Env value:
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
