# Great Way Environmental — Field Service App

Two access points, one app:
- **Crew** → Clock in, take work photos, get manager signature, clock out
- **Management** → Dashboard, calendar, all visits with photos/signatures, manage locations + crew

## Launch Steps (20 minutes total)

### 1. Supabase — Database (8 min)
1. Go to **supabase.com** → sign up or log in → **New Project**
2. Name: `gwe-field-service` → set a DB password → Create
3. Wait ~2 min for provisioning
4. Go to **SQL Editor** → paste entire `SUPABASE_SCHEMA.sql` → **Run**
5. Go to **Storage** → **New Bucket** → name: `visit-photos` → toggle **Public** ON → Create
6. In that bucket → **Policies** → **New Policy** → use template "Allow authenticated uploads"
7. Go to **Settings → API** → copy your **Project URL** and **anon public key**

### 2. GitHub — Push Code (3 min)
1. Create a new repo on GitHub
2. Upload ALL files from this folder (make sure `package.json` is at ROOT, not in a subfolder)
3. Push

### 3. Vercel — Deploy (3 min)
1. Go to **vercel.com** → **Add New Project** → Import your GitHub repo
2. Framework: **Vite** (should auto-detect)
3. Add **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   VITE_MANAGER_EMAIL=@ye.com
   ```
4. Click **Deploy** → get your URL

### 4. Create Manager Accounts (3 min)
In Supabase → **Authentication → Users → Invite User**:
- `che@greatwaye.com` (Che's account)
- Your own email

Then in **SQL Editor** run:
```sql
UPDATE profiles SET role = 'manager' WHERE email = '@ye.com';
UPDATE profiles SET role = 'manager' WHERE email = 'YOUR_EMAIL_HERE';
```

### 5. Create Crew Accounts (from the app)
Log in as manager → **Crew → Add Member** → enter name, email, phone, password → share credentials with them via WhatsApp.

That's it. **Logins are stored in Supabase → Authentication → Users.**

---

## How It Works

### Crew logs in on their phone:
1. Selects location → **Check In** (GPS + timestamp logged)
2. Manager gets notified
3. When done → taps **Check Out** → takes a **photo** of completed work → gets **manager signature** on screen
4. Everything saved + manager notified

### Manager logs in on desktop or phone:
- **Dashboard** → live stats, who's on site, recent activity
- **Calendar** → monthly view of all visits, click a day to see details
- **All Visits** → search, filter by status/date, view photos + signatures, flag visits
- **Locations** → add/deactivate job sites
- **Crew** → add new crew members directly
