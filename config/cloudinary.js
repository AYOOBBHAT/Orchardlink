/**
 * The Cloudinary Node SDK reads CLOUDINARY_URL on first load and throws if it is
 * set but does not start with `cloudinary://`. Some .env files set a wrong URL
 * (or a placeholder) while still defining CLOUD_NAME / API_KEY / API_SECRET.
 */
const rawCloudinaryUrl = process.env.CLOUDINARY_URL;
if (
  typeof rawCloudinaryUrl === 'string' &&
  rawCloudinaryUrl.length > 0 &&
  !rawCloudinaryUrl.toLowerCase().trimStart().startsWith('cloudinary://')
) {
  delete process.env.CLOUDINARY_URL;
}

const cloudinary = require('cloudinary').v2;

const cloud_name =
  process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const api_key =
  process.env.API_KEY || process.env.CLOUDINARY_API_KEY;
const api_secret =
  process.env.API_SECRET || process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

function isCloudinaryConfigured() {
  return Boolean(cloud_name && api_key && api_secret);
}

module.exports = { cloudinary, isCloudinaryConfigured };
