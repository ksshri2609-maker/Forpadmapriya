# For Padmapriya — shared Cloudinary Memories

This package keeps the existing romantic website and adds a Cloudflare Worker API that stores shared gallery uploads in Cloudinary.

## Project layout

- `public/` — website HTML, CSS, JavaScript and existing photos
- `src/index.js` — Cloudflare Worker API
- `wrangler.jsonc` — Worker and static-assets configuration

## Before deploying

In Cloudflare Worker settings, add these as **Secrets** for Production:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `MEMORIES_ADMIN_PASSWORD`

Do not put secret values in GitHub or in the `public/` folder.

In Cloudinary, use your product environment's Cloud name, API Key and API Secret.

## Deploy

This project is configured for the existing Worker name `forpadmapriya`.

If using Git-connected Cloudflare Workers:
- Root directory: `/`
- Build command: leave blank
- Deploy command: `npx wrangler deploy`

If Cloudflare asks to install Wrangler, allow it. Ensure the repository root contains `wrangler.jsonc`, `src/`, and `public/`.

Alternatively, from this folder with Node.js installed:
1. `npx wrangler login`
2. `npx wrangler deploy`

## Gallery behavior

- Anyone can view shared Cloudinary images at `GET /api/memories`.
- Upload requires the admin password at `POST /api/memories/upload`.
- Delete requires the admin password at `DELETE /api/memories/:id`.
- The existing bundled photos remain in `public/assets/`.
- Hiding bundled photos affects only the current browser; Cloudinary uploads/deletions are shared.

## Security and limits

- The API secret and admin password must remain Cloudflare Worker Secrets.
- The Worker limits each upload to 10 MB and accepts image MIME types only.
- Cloudinary free-plan quotas and terms apply. Check your Cloudinary dashboard for current usage.
