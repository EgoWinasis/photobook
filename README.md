# Forever With You ♡

Private romantic photobook for Dita & Ego. Built with Next.js App Router and Google Drive API; deployable to Vercel.

## What it does
- Login accepts `dita` or `ego` and a shared password.
- Reads a **flat** Google Drive structure: root folder -> moment folders -> image files.
- Displays each moment folder as an album.
- Serves private Drive images through an authenticated server-side proxy (the browser never receives Drive credentials).
- Re-checks Drive every 60 seconds and has a manual Sync button.
- Responsive pink floral UI, album modal, photo lightbox, local-session favorites, and optional piano audio.

## 1. Google Drive private access
1. Open [Google Cloud Console](https://console.cloud.google.com/), create a project.
2. Enable **Google Drive API**.
3. Create a **Service Account** under IAM & Admin -> Service Accounts.
4. Create a JSON key and download it. Keep it secret; do not commit it to GitHub.
5. Copy the service account email (looks like `name@project.iam.gserviceaccount.com`).
6. In Google Drive, share ONLY the root `OUR MEMORIES` folder with that email as **Viewer**.
7. Open the root folder in Drive and copy its folder ID from the URL:
   `https://drive.google.com/drive/folders/FOLDER_ID`
8. Put moment folders directly inside this root. Put photos directly inside each moment folder. This project intentionally reads one folder level (flat album structure).

If the root folder is in a Shared Drive, the service account must be granted access there too. The API code includes shared-drive support.

## 2. Local setup
Requirements: Node.js 18.17+ (Node 20 LTS recommended).

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:
- `GOOGLE_SERVICE_ACCOUNT_JSON`: paste the entire downloaded service-account JSON as ONE LINE. Keep the surrounding JSON braces.
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`: folder ID of the root folder.
- `LOGIN_PASSWORD`: choose your own strong password. Both `dita` and `ego` use this password.
- `SESSION_SECRET`: generate a random secret at least 32 characters long. Example:
  `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

Run:
```bash
npm run dev
```
Open http://localhost:3000.

## 3. Add instrumental background music
Audio is not included in the source project. Add an MP3 you own or are licensed to use:
- Create `public/music/`
- Put your piano/instrumental MP3 at `public/music/romantic-piano.mp3`

Browsers block autoplay with sound until the visitor interacts. The music starts when the user presses Play. This avoids intrusive autoplay and follows browser policies.

## 4. Deploy to Vercel
1. Push this project to a **private GitHub repository** (recommended).
2. In Vercel, choose Add New -> Project -> import the repository.
3. Framework preset: Next.js. Build command: `npm run build`.
4. Add the same environment variables in Project -> Settings -> Environment Variables:
   - `GOOGLE_SERVICE_ACCOUNT_JSON`
   - `GOOGLE_DRIVE_ROOT_FOLDER_ID`
   - `LOGIN_PASSWORD`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_SITE_TITLE` (optional)
5. Deploy. If you change environment variables, redeploy for changes to take effect.

## Security notes
- Keep the repository private because the service account JSON and password are sensitive.
- Never put Google credentials in `NEXT_PUBLIC_*` variables or client-side code.
- Share only the root folder with the service account, not your entire Drive.
- Use a strong password rather than the example word `forever` if the website is public on the internet. The requested username choices are preserved; the password is configured through `LOGIN_PASSWORD`.
- This is a simple two-person shared-password gate, not separate per-person accounts or MFA. Use a long unique password.
- The API polls on page load and every 60 seconds while the page is open. It is not an instant Google push notification. Newly added folders/photos appear after the next successful sync.
- Drive API quotas apply. For a very large archive, consider pagination/caching and a scheduled sync strategy.

## Structure
```text
src/
  app/
    api/albums/route.ts
    api/image/[id]/route.ts
    login/route.ts
    logout/route.ts
    memories/page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    Login.tsx
    Photobook.tsx
  lib/
    auth.ts
    drive.ts
public/
  music/
    romantic-piano.mp3   # add your licensed MP3
```

## Troubleshooting
- **No albums:** check root folder ID and make sure moment folders are directly inside it.
- **403 / no images:** share the root folder with the service-account email as Viewer; check that Drive API is enabled.
- **Invalid JSON:** the service-account JSON environment variable must be valid JSON, on one line in Vercel.
- **Images fail:** confirm each image is inside a moment folder, not nested in another subfolder; supported files are Drive image MIME types.
- **Music does not play:** add the MP3 at the exact path above and press Play once.
# photobook
