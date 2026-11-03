# Deploy to IIS

The app uses client-side routes. The `public/web.config` file configures IIS to
serve the app's `index.html` for route URLs (for example, `/dashboard`) when the
page is refreshed or opened directly. Vite copies this file into the build output.

1. Install the IIS **URL Rewrite** and **Application Request Routing (ARR)**
   modules. In IIS Manager, select the server, open **Application Request
   Routing Cache** → **Server Proxy Settings**, and enable **Proxy**.
2. Set the API origin once in `src/config/apiConfig.js`, in the `API_HOST`
   value. Use an absolute HTTP(S) origin without an `/api` path.
3. Run `npm run build`. The build reads `API_HOST` and writes it into
   `dist/web.config` for HTTPS-to-HTTP proxy fallback.
4. Copy the **contents** of the generated `dist` folder, including `web.config`,
   into the IIS site's physical directory (for example, `C:\inetpub\wwwroot`).
5. Ensure the IIS server can connect to the API origin in `API_HOST`.
6. Open a client-side route directly or refresh it, then test an API-backed page.

The frontend calls the API origin in `API_HOST` directly when the browser can
reach it. The API must allow the frontend's origin through CORS. If the frontend
uses HTTPS and `API_HOST` uses HTTP, browsers block direct requests as mixed
content; those requests use the same-origin IIS proxy instead, so keep URL
Rewrite and ARR proxy enabled in that case. The Vite development server uses the
same API origin as its proxy target. Update `API_HOST` and rebuild whenever the
API origin changes.
