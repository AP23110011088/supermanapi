import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import Layout from './Layout';
import './SuperheroForm.css';

function SuperheroForm({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    realName: '',
    publisher: '',
    alignment: 'good',
    powers: '',
    firstAppearance: '',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;

    const fetchSuperhero = async () => {
      try {
        const response = await api.get(`/api/superheroes/${id}`);
        const hero = response.data;
        setFormData({
          name: hero.name || '',
          realName: hero.realName || '',
          publisher: hero.publisher || '',
          alignment: hero.alignment || 'good',
          powers: Array.isArray(hero.powers) ? hero.powers.join(', ') : hero.powers || '',
          firstAppearance: hero.firstAppearance || '',
          description: hero.description || ''
        });
        if (hero.imageUrl) {
          setPreview(hero.imageUrl);
        }
      } catch (err) {
        setError('Could not load hero details.');
      } finally {
        setFetching(false);
      }
    };

    fetchSuperhero();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImage(null);
    setPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (image) {
        data.append('image', image);
      }

      if (isEdit) {
        await api.put(`/api/superheroes/${id}`, data);
      } else {
        await api.post('/api/superheroes', data);
      }

      navigate('/superheroes');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save hero.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <p className="empty-copy">Loading hero...</p>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="form-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit hero' : 'Add hero'}</h1>
          <p className="page-subtitle">
            {isEdit ? 'Update details or replace the image.' : 'Fill in the basics and upload an image if you have one.'}
          </p>
        </div>
        <button type="button" onClick={() => navigate('/superheroes')} className="btn btn-secondary">
          Back to roster
        </button>
      </div>

      <form onSubmit={handleSubmit} className="panel hero-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="realName">Real name</label>
            <input
              id="realName"
              type="text"
              name="realName"
              value={formData.realName}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="publisher">Publisher</label>
            <input
              id="publisher"
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              className="input"
              placeholder="Marvel, DC, etc."
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="alignment">Alignment</label>
            <select
              id="alignment"
              name="alignment"
              value={formData.alignment}
              onChange={handleChange}
              className="input"
            >
              <option value="good">Good</option>
              <option value="bad">Bad</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          <div className="form-group form-group-wide">
            <label className="label" htmlFor="powers">Powers</label>
            <input
              id="powers"
              type="text"
              name="powers"
              value={formData.powers}
              onChange={handleChange}
              className="input"
              placeholder="Comma-separated list"
            />
          </div>

          <div className="form-group form-group-wide">
            <label className="label" htmlFor="firstAppearance">First appearance</label>
            <input
              id="firstAppearance"
              type="text"
              name="firstAppearance"
              value={formData.firstAppearance}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="form-group form-group-wide">
            <label className="label" htmlFor="description">Notes</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input textarea"
              rows="4"
            />
          </div>

          <div className="form-group form-group-wide">
            <label className="label" htmlFor="image">Image upload</label>
            <input
              id="image"
              type="file"
              onChange={handleImageChange}
              className="input file-input"
              accept="image/*"
            />
          </div>
        </div>

        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" className="preview-image" />
            <button type="button" onClick={clearImage} className="btn btn-danger">
              Remove preview
            </button>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/superheroes')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create hero'}
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default SuperheroForm;
