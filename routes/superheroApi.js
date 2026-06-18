const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');

const router = express.Router();
const SUPERHERO_API_BASE = 'https://superheroapi.com/api';

router.get('/search/:name', auth, async (req, res) => {
  try {
    const apiKey = process.env.SUPERHERO_API_KEY?.trim();

    if (!apiKey) {
      return res.status(500).json({ message: 'Add SUPERHERO_API_KEY to your .env file' });
    }

    const name = encodeURIComponent(req.params.name.trim());
    const response = await axios.get(`${SUPERHERO_API_BASE}/${apiKey}/search/${name}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Superhero API request failed' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const apiKey = process.env.SUPERHERO_API_KEY?.trim();

    if (!apiKey) {
      return res.status(500).json({ message: 'Add SUPERHERO_API_KEY to your .env file' });
    }

    const response = await axios.get(`${SUPERHERO_API_BASE}/${apiKey}/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Superhero API request failed' });
  }
});

module.exports = router;
