const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Superhero = require('../models/Superhero');
const auth = require('../middleware/auth');
const { resolveImageUrl } = require('../utils/uploadImage');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const useCloudinary = [
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET
].every(Boolean);

const storage = useCloudinary
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadsDir),
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    });

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const normalizeAlignment = (value) => {
  const alignment = String(value || '').toLowerCase();
  if (['good', 'bad', 'neutral'].includes(alignment)) {
    return alignment;
  }
  return 'neutral';
};

const parsePowers = (powers) => {
  if (!powers) return [];
  if (Array.isArray(powers)) return powers.filter(Boolean);
  return String(powers)
    .split(',')
    .map((power) => power.trim())
    .filter(Boolean);
};

router.get('/', auth, async (req, res) => {
  try {
    const superheroes = await Superhero.find({ createdBy: req.user.userId }).sort({ createdAt: -1 });
    res.json(superheroes);
  } catch (error) {
    res.status(500).json({ message: 'Could not load superheroes' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const superhero = await Superhero.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!superhero) {
      return res.status(404).json({ message: 'Superhero not found' });
    }

    res.json(superhero);
  } catch (error) {
    res.status(500).json({ message: 'Could not load superhero' });
  }
});

router.post('/', auth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, [
  body('name').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const { name, realName, publisher, alignment, powers, firstAppearance, description, apiId, imageUrl } = req.body;
    const uploadedImage = await resolveImageUrl(req.file);

    const superhero = new Superhero({
      name,
      realName,
      publisher,
      alignment: normalizeAlignment(alignment),
      powers: parsePowers(powers),
      firstAppearance,
      description,
      imageUrl: uploadedImage || imageUrl || null,
      apiId,
      createdBy: req.user.userId
    });

    await superhero.save();
    res.status(201).json(superhero);
  } catch (error) {
    res.status(500).json({ message: 'Could not create superhero' });
  }
});

router.put('/:id', auth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, async (req, res) => {
  try {
    const { name, realName, publisher, alignment, powers, firstAppearance, description } = req.body;

    const superhero = await Superhero.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!superhero) {
      return res.status(404).json({ message: 'Superhero not found' });
    }

    if (name) superhero.name = name;
    if (realName !== undefined) superhero.realName = realName;
    if (publisher !== undefined) superhero.publisher = publisher;
    if (alignment) superhero.alignment = normalizeAlignment(alignment);
    if (powers !== undefined) superhero.powers = parsePowers(powers);
    if (firstAppearance !== undefined) superhero.firstAppearance = firstAppearance;
    if (description !== undefined) superhero.description = description;

    if (req.file) {
      superhero.imageUrl = await resolveImageUrl(req.file);
    }

    await superhero.save();
    res.json(superhero);
  } catch (error) {
    res.status(500).json({ message: 'Could not update superhero' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const superhero = await Superhero.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!superhero) {
      return res.status(404).json({ message: 'Superhero not found' });
    }

    res.json({ message: 'Superhero deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete superhero' });
  }
});

module.exports = router;
