PawFinder

Map-based lost/found pet finder for Thailand on React + Supabase.

## Quick start

1) Env (.env or .env.local)
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

2) Install & run
```
npm install
npm run dev
```

3) Build
```
npm run build
npm run preview
```

## Supabase (Auth URLs)
- Authentication → URL Configuration
	- Site URL: your production domain (e.g. https://your-app.vercel.app)
	- Redirect URLs:
		- https://your-app.vercel.app/auth/callback
		- https://*.vercel.app/auth/callback (preview)
		- http://localhost:5173/auth/callback (dev)

## Usage notes
- Found Search: click map (or a pet marker) to set the green pin.
- Rewards → Nearby: sorts by distance from that pin; pets without coords show last.
