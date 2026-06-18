import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Layout from './Layout';
import './SuperheroList.css';

function buildPowersFromApi(hero) {
  const powers = [];

  if (hero.work?.occupation && hero.work.occupation !== '-') {
    powers.push(hero.work.occupation);
  }

  if (hero.powerstats) {
    Object.entries(hero.powerstats).forEach(([stat, value]) => {
      if (Number(value) >= 80) {
        powers.push(`${stat.charAt(0).toUpperCase()}${stat.slice(1)} ${value}`);
      }
    });
  }

  return powers.slice(0, 6);
}

function SuperheroList({ user, onLogout }) {
  const [superheroes, setSuperheroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [apiSearch, setApiSearch] = useState('');
  const [apiResults, setApiResults] = useState([]);
  const [showApiResults, setShowApiResults] = useState(false);
  const [importingId, setImportingId] = useState(null);

  useEffect(() => {
    fetchSuperheroes();
  }, []);

  const fetchSuperheroes = async () => {
    try {
      const response = await api.get('/api/superheroes');
      setSuperheroes(response.data);
    } catch (err) {
      setError('Could not load your roster.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hero from your roster?')) {
      return;
    }

    try {
      await api.delete(`/api/superheroes/${id}`);
      setSuperheroes((current) => current.filter((hero) => hero._id !== id));
    } catch (err) {
      setError('Could not delete hero.');
    }
  };

  const searchApi = async (e) => {
    e.preventDefault();
    if (!apiSearch.trim()) return;

    setError('');

    try {
      const response = await api.get(`/api/superhero-api/search/${encodeURIComponent(apiSearch.trim())}`);
      const results = response.data.results || [];

      if (response.data.response === 'error') {
        setError(response.data.error || 'No matches found.');
        setApiResults([]);
        setShowApiResults(false);
        return;
      }

      setApiResults(results);
      setShowApiResults(true);
    } catch (err) {
      setError(err.response?.data?.message || 'API search failed.');
    }
  };

  const importFromApi = async (apiHero) => {
    setImportingId(apiHero.id);
    setError('');

    try {
      const alignment = ['good', 'bad', 'neutral'].includes(apiHero.biography?.alignment)
        ? apiHero.biography.alignment
        : 'neutral';

      await api.post('/api/superheroes', {
        name: apiHero.name,
        realName: apiHero.biography?.['full-name'] || '',
        publisher: apiHero.biography?.publisher || '',
        alignment,
        powers: buildPowersFromApi(apiHero).join(', '),
        firstAppearance: apiHero.biography?.['first-appearance'] || '',
        description: apiHero.biography?.['alter-egos'] !== 'No alter egos found.'
          ? apiHero.biography?.['alter-egos']
          : '',
        imageUrl: apiHero.image?.url || '',
        apiId: String(apiHero.id)
      });

      await fetchSuperheroes();
      setShowApiResults(false);
      setApiSearch('');
      setApiResults([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not import hero.');
    } finally {
      setImportingId(null);
    }
  };

  const filteredHeroes = superheroes.filter((hero) => {
    const query = localSearch.toLowerCase();
    return (
      hero.name.toLowerCase().includes(query) ||
      (hero.realName && hero.realName.toLowerCase().includes(query))
    );
  });

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="list-header">
        <div>
          <h1 className="page-title">Roster</h1>
          <p className="page-subtitle">Your saved heroes, local search, and Superhero API imports.</p>
        </div>
        <Link to="/superheroes/new" className="btn btn-primary">
          Add hero
        </Link>
      </div>

      <div className="search-panels">
        <section className="panel search-panel">
          <h2>Filter roster</h2>
          <input
            type="text"
            placeholder="Search by name or alias..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="input"
          />
        </section>

        <section className="panel search-panel">
          <h2>Superhero API</h2>
          <form className="api-search-form" onSubmit={searchApi}>
            <input
              type="text"
              placeholder="Try Batman, Wonder Woman, Spider-Man..."
              value={apiSearch}
              onChange={(e) => setApiSearch(e.target.value)}
              className="input"
            />
            <button type="submit" className="btn btn-secondary">
              Search API
            </button>
          </form>
        </section>
      </div>

      {error && <p className="error list-error">{error}</p>}

      {showApiResults && (
        <section className="panel api-results">
          <div className="api-results-header">
            <h2>API matches</h2>
            <button type="button" onClick={() => setShowApiResults(false)} className="btn btn-ghost">
              Close
            </button>
          </div>

          {apiResults.length === 0 ? (
            <p className="empty-copy">No characters matched that search.</p>
          ) : (
            <div className="api-grid">
              {apiResults.map((hero) => (
                <article key={hero.id} className="api-card">
                  {hero.image?.url ? (
                    <img src={hero.image.url} alt={hero.name} className="api-image" />
                  ) : (
                    <div className="image-placeholder">No image</div>
                  )}
                  <h3>{hero.name}</h3>
                  <p>{hero.biography?.publisher || 'Unknown publisher'}</p>
                  <button
                    type="button"
                    onClick={() => importFromApi(hero)}
                    className="btn btn-success"
                    disabled={importingId === hero.id}
                  >
                    {importingId === hero.id ? 'Saving...' : 'Add to roster'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {loading ? (
        <p className="empty-copy">Loading roster...</p>
      ) : filteredHeroes.length === 0 ? (
        <section className="panel empty-state">
          <h2>No heroes yet</h2>
          <p className="empty-copy">Create one manually or import from the Superhero API above.</p>
          <Link to="/superheroes/new" className="btn btn-primary">
            Add your first hero
          </Link>
        </section>
      ) : (
        <div className="heroes-grid">
          {filteredHeroes.map((hero) => (
            <article key={hero._id} className="hero-card panel">
              {hero.imageUrl ? (
                <img src={hero.imageUrl} alt={hero.name} className="hero-image" />
              ) : (
                <div className="image-placeholder hero-placeholder">No image</div>
              )}

              <div className="hero-info">
                <h3>{hero.name}</h3>
                {hero.realName && <p className="real-name">{hero.realName}</p>}
                {hero.publisher && <p className="publisher">{hero.publisher}</p>}
                {hero.alignment && <span className={`alignment ${hero.alignment}`}>{hero.alignment}</span>}
                {hero.powers?.length > 0 && (
                  <p className="powers">{hero.powers.join(', ')}</p>
                )}
              </div>

              <div className="hero-actions">
                <Link to={`/superheroes/${hero._id}/edit`} className="btn btn-secondary">
                  Edit
                </Link>
                <button type="button" onClick={() => handleDelete(hero._id)} className="btn btn-danger">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default SuperheroList;
