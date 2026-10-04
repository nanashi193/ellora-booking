# Cloudinary images

Set these environment variables on the backend (locally in .env.supabase, on Render in Environment):

CLOUDINARY_CLOUD_NAME=dqegrlmu5
CLOUDINARY_API_KEY=YOUR_VALUE
CLOUDINARY_API_SECRET=YOUR_VALUE

Restart the backend after setting them. Never add the API secret to frontend code or Git.

Owner dashboard: cover and gallery (up to 10 gallery images).
Owner services/employees: create the record first, then select an image and press Save image.
Uploads accept JPEG/PNG up to 5 MB and 25 megapixels. Files are sent through the backend to Cloudinary; the database stores HTTPS URLs.
Removing a gallery image only removes its display reference. Replaced/removed assets remain in Cloudinary for manual cleanup. If a DB write fails after upload, retrying may leave an unused asset in Cloudinary.

Official upload API: https://cloudinary.com/documentation/upload_images
