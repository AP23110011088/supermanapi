function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing ${name} in .env`);
  }
  return value.trim();
}

function getMongoUri(warnings = []) {
  let uri;
  try {
    uri = requireEnv('MONGODB_URI');
  } catch (error) {
    warnings.push('MONGODB_URI is missing in .env - falling back to local MongoDB');
    return 'mongodb://127.0.0.1:27017/superhero_db';
  }

  const placeholders = [
    '<db_username>',
    '<password>',
    'YOUR_USERNAME',
    'YOUR_PASSWORD',
    'cluster.mongodb.net'
  ];

  if (placeholders.some((placeholder) => uri.includes(placeholder))) {
    warnings.push('Placeholder values found in MONGODB_URI - falling back to local MongoDB (mongodb://127.0.0.1:27017/superhero_db)');
    return 'mongodb://127.0.0.1:27017/superhero_db';
  }

  if (uri.includes('mongodb+srv://') && !/\.mongodb\.net\/[^/?]+/.test(uri)) {
    if (uri.includes('/?')) {
      return uri.replace('/?', '/superhero_db?');
    } else if (uri.includes('?')) {
      return uri.replace('?', '/superhero_db?');
    } else {
      return uri + '/superhero_db';
    }
  }


  return uri;
}

function validateEnv() {
  requireEnv('JWT_SECRET');

  const warnings = [];

  if (!process.env.SUPERHERO_API_KEY?.trim()) {
    warnings.push('SUPERHERO_API_KEY is missing - API search/import will not work');
  }

  const cloudinaryReady = [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET
  ].every(Boolean);

  if (!cloudinaryReady) {
    warnings.push('Cloudinary keys incomplete - falling back to local uploads folder');
  }

  const mongoUri = getMongoUri(warnings);

  return { mongoUri, cloudinaryReady, warnings };
}

module.exports = { validateEnv };

