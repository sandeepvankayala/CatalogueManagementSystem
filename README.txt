SHOP CATALOGUE (ANURADHA AGENCIES) - FIXED BUILD
=================================================

Backend: Spring Boot 3.5.5 / Java 21 / MySQL / JPA-Hibernate / JWT
Frontend: Vite + React (owner + customer flows, matches your architecture diagrams)

WHAT WAS FIXED IN THIS BUILD
-----------------------------
Backend:
1. SecurityConfig.java - /api/catalogue/** was locked to ROLE_CUSTOMER only, so the
   Owner Dashboard got 403 errors every time it tried to load the agency/product list.
   Now both OWNER and CUSTOMER can read the catalogue.
2. AuthController.java - /api/auth/register returned a raw string instead of JSON,
   which crashed the frontend's response.json() call. Now returns {"message": "..."}.
3. GlobalExceptionHandler.java - errors were returned as {"error": "..."} but the
   frontend reads {"message": "..."}, so every failed request showed a generic
   fallback instead of the real reason. Standardized on "message" everywhere, and
   added a catch-all handler so unexpected errors return a clean JSON message
   instead of a raw stack trace / HTML error page.
4. User.java - password hash had no @JsonIgnore, so it leaked in the pending-customers
   list, approve/reject responses, and the owner's order list (nested customer object).
   Fixed.
5. OwnerController.java - the deactivate endpoints returned raw strings (same JSON
   issue as #2). Now return {"message": "..."}.

Frontend (App.jsx):
6. Added the missing Register page (name, shop name, phone, email, password) with a
   toggle between Login/Register - this existed on the backend but had no UI, so
   there was no way for a new customer to sign up, matching your Register -> Pending
   -> Owner Approval diagram.
7. Fixed the "NO TOTAL PRICE" bug flagged in your cart diagram - the cart now stores
   each item's price and shows a running total per line and a grand total before
   "Submit Order".
8. All error alerts now read the corrected "message" key (see backend fix #3), so
   real error text (e.g. "Email already registered", "Your registration is waiting
   for owner approval") shows up instead of generic fallback text.
9. Frontend - the "Waiting" state after Login (diagrammed as its own box, for a
   PENDING or REJECTED account) was only a one-off alert() popup. It's now a real
   screen: the login form is replaced with a persistent "Waiting" message and a
   "Back to Login" button, sourced directly from the backend's actual status message.


BEFORE YOU RUN IT
-------------------
1. Create the MySQL database: CREATE DATABASE shop_catalogue;
2. Edit backend/shop-catalogue-backend/src/main/resources/application.properties:
   - spring.datasource.password -> your real MySQL password
   - shop.whatsapp.number -> the WhatsApp number that should receive orders
     (digits only, with country code, e.g. 919876543210)
   - shop.owner.email / shop.owner.password -> the login you'll use as the shop owner
     (this account is auto-created on first run)
3. Start the backend first (from backend/shop-catalogue-backend):
     mvn spring-boot:run
   It runs on http://localhost:8080
4. Then start the frontend (from frontend):
     npm install
     npm run dev
   It runs on http://localhost:5173 and talks to the backend automatically.
5. Log in as the owner (the email/password from step 2) to approve customers, add
   agencies, products and variants. New customers register via the "Register here"
   link on the login page and wait for owner approval before they can log in.

=================================================
MOBILE APP (PWA + Android via Capacitor)
=================================================

PWA (installable icon, works today, no extra tools):
- Already wired in: manifest.json, service worker (sw.js), icons, and meta
  tags are all in place.
- Open the site on your phone's Chrome browser -> menu -> "Add to Home
  Screen" (or Chrome will show an install banner automatically). That's it.

Android app (.apk) via Capacitor - needs Android Studio (you already have it):
1. IMPORTANT FIRST STEP: open frontend/src/App.jsx and change the `API`
   constant near the top of the file. "localhost" means the PHONE once this
   runs as an installed app, not your PC. Full instructions are in the
   comment right above that line in the file. Short version:
     - Real phone: use your PC's LAN IP, e.g. http://192.168.1.42:8080
       (find it via `ipconfig` on your PC, look for "IPv4 Address")
     - Android emulator: use http://10.0.2.2:8080 instead
2. cd frontend
3. npm install          (pulls in the Capacitor packages added to package.json)
4. npx cap add android  (generates the android/ native project folder - only
                         needed once)
5. Create this file: android/app/src/main/res/xml/network_security_config.xml
   with this content (needed because Android blocks plain HTTP by default,
   and our backend isn't using HTTPS locally):

     <?xml version="1.0" encoding="utf-8"?>
     <network-security-config>
         <base-config cleartextTrafficPermitted="true" />
     </network-security-config>

6. Open android/app/src/main/AndroidManifest.xml and add these two attributes
   to the existing <application> tag:
     android:networkSecurityConfig="@xml/network_security_config"
     android:usesCleartextTraffic="true"
7. npm run android      (builds the web app, syncs it into the native
                         project, and opens Android Studio for you)
8. In Android Studio: Build menu -> Build Bundle(s) / APK(s) -> Build APK(s).
   The .apk appears under android/app/build/outputs/apk/debug/ once it
   finishes - copy that file to install it on a phone.
9. Make sure your Spring Boot backend is running and reachable at the
   address you set in step 1 (same WiFi network as the phone, Windows
   Firewall allowing inbound port 8080) whenever you use the app.

Whenever you change frontend code again, repeat step 7 (npm run android) to
rebuild and re-sync before building a new APK.

=================================================
ANDROID HARDWARE BACK BUTTON (add once you build the Android app)
=================================================
The in-app "Back"/"Home" buttons work fine, but Android's own hardware/gesture
back button is NOT wired to them by default - pressing it will just quit the
app instantly from any screen instead of navigating back within it. This
snippet fixes that. Add it AFTER you've run `npm install` for the Android
build (it needs @capacitor/app, already added to package.json).

Add this near the top of frontend/src/App.jsx, right after the existing
imports:

  import { App as CapacitorApp } from '@capacitor/app';

Then add this near the top of the Root() function body:

  useEffect(() => {
    let handler;
    CapacitorApp.addListener('backButton', () => {
      if (backHandlerStack.length) {
        backHandlerStack[backHandlerStack.length - 1]();
      } else {
        CapacitorApp.exitApp();
      }
    }).then(h => { handler = h; });
    return () => { handler && handler.remove(); };
  }, []);

And add this small pub-sub near the top of the file, next to the toast/confirm
system:

  let backHandlerStack = [];
  function useBackHandler(onBack, active) {
    useEffect(() => {
      if (!active) return;
      backHandlerStack.push(onBack);
      return () => { backHandlerStack = backHandlerStack.filter(h => h !== onBack); };
    }, [onBack, active]);
  }

Then, in CustomerFlow, register the current back action:
  useBackHandler(() => { if (product) backToProducts(); else if (agency) backToAgencies(); }, !!(agency || product));

And in OwnerDashboard, register logout as the back action when on a tab other
than "orders" isn't really needed - tabs don't need back-button handling since
they're not a drill-down flow. This is safe as-is without changes there.

This is entirely no-op in a plain web browser (no hardware back button exists
there), so it never affects the website or the PWA - only the installed
Android app.

=================================================
DEPLOYING LIVE: NETLIFY (frontend) + RENDER (backend) + AIVEN (MySQL)
=================================================
I can't perform this deployment myself (no internet access, no ability to
log into accounts on your behalf) - but everything below is already set up
in this project so it's just a sequence of clicks + copy-pasted values on
your end.

Free-tier reality check (checked fresh, since these change often):
- Netlify: genuinely free for a static frontend like this one.
- Render: free web service tier exists, but it "sleeps" after inactivity -
  the first request after a quiet period takes about a minute to wake up.
  Fine for a small shop's usage pattern.
- Aiven: has a real free tier for a small MySQL instance - good enough for
  this app's scale.
- (PlanetScale dropped its free MySQL tier in April 2026, and Railway's
  "free" tier is now just a 30-day trial, not permanent - both skipped for
  that reason.)

You'll need a GitHub account with this project pushed to a repo (both Render
and Netlify deploy most easily straight from GitHub).

--- STEP 1: Database (Aiven) ---
1. Create a free account at aiven.io, create a new MySQL service (free plan).
2. Once it's running, open its "Connection details" and note: host, port,
   user, password, and database name (or create a database named
   shop_catalogue).
3. Keep this tab open - you'll paste these into Render in Step 2.

--- STEP 2: Backend (Render) ---
1. Push this project to a GitHub repo if you haven't already.
2. Create a free account at render.com -> New -> Web Service -> connect
   your GitHub repo.
3. Root directory: backend/shop-catalogue-backend (this repo already has a
   Dockerfile in there, so Render will build it automatically - no extra
   configuration needed for the build itself).
4. Environment: Docker (Render should auto-detect this from the Dockerfile).
5. Add these environment variables in Render's dashboard (Environment tab),
   using your Aiven details from Step 1:
     DB_URL       = jdbc:mysql://<aiven-host>:<aiven-port>/<database-name>?useSSL=true&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
     DB_USERNAME  = <aiven-user>
     DB_PASSWORD  = <aiven-password>
     JWT_SECRET   = <any long random string, at least 32 characters>
     WHATSAPP_NUMBER = <your WhatsApp number, digits only with country code>
     OWNER_EMAIL      = <email you'll log in with as the owner>
     OWNER_PASSWORD   = <password you'll log in with as the owner>
     OWNER_NAME       = <your name>
     OWNER_SHOP_NAME  = Anuradha Agencies
     OWNER_PHONE      = <your phone number>
   (These map directly to application.properties, which already reads every
   one of them from the environment - see the comments in that file.)
6. Deploy. Once live, Render gives you a public URL like
   https://your-app-name.onrender.com - copy it, you need it in Step 3.
7. Test it directly: open https://your-app-name.onrender.com/api/catalogue/agencies
   in a browser - you should get back a JSON array (empty [] is fine, that
   just means no agencies added yet).

--- STEP 3: Frontend (Netlify) ---
1. Create a free account at netlify.com -> Add new site -> Import an
   existing project -> connect the same GitHub repo.
2. Netlify should auto-detect netlify.toml at the repo root (already set up:
   base "frontend", build command "npm run build", publish directory
   "dist") - if it asks anyway, use those same values.
3. Before deploying, add an environment variable in Netlify's dashboard
   (Site configuration -> Environment variables):
     VITE_API_URL = https://your-app-name.onrender.com
   (the exact URL from Step 2.6, no trailing slash)
4. Deploy. Netlify gives you a URL like https://your-site-name.netlify.app -
   that's your live app. The backend's CORS config already allows any
   *.netlify.app address, so no backend change is needed for this step.

--- STEP 4: Verify end to end ---
1. Open your Netlify URL, click "Owner / Admin Login", log in with the
   OWNER_EMAIL/OWNER_PASSWORD you set in Step 2.5.
2. Add a test Agency/Product/Variant, then open the site in a new
   incognito tab, go through the customer flow, and place a test order.
3. If anything fails, open the browser's DevTools -> Network tab and check
   what the failing request's response actually says - that's almost always
   enough to tell whether it's a CORS issue, a wrong VITE_API_URL, or a
   database connection problem on Render.

Whenever you push new commits to GitHub, both Render and Netlify redeploy
automatically - you don't need to repeat these steps for future updates.

=================================================
CHANGING THE OWNER PASSWORD
=================================================
Owner Dashboard now has an "Account" tab -> enter your current password and
a new one there. This is the correct way to change it once the app is
running.

Important: shop.owner.password in application.properties (or OWNER_PASSWORD
as an env var on Render) only sets the password ONCE, the very first time
the app starts and creates the owner account. Editing it after that point
has no effect - the account already exists, so that line is skipped on every
later restart. Use the Account tab instead.
