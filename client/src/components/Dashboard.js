import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Layout from './Layout';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const [stats, setStats] = useState({ total: 0, latest: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get('/api/superheroes');
        const heroes = response.data;
        setStats({
          total: heroes.length,
          latest: heroes[0] || null
        });
      } catch (err) {
        setStats({ total: 0, latest: null });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your private roster and API imports in one place.</p>
        </div>
        <Link to="/superheroes/new" className="btn btn-primary">
          Add hero
        </Link>
      </div>

      <div className="stats-grid">
        <article className="stat-card panel">
          <p className="stat-label">Saved heroes</p>
          <p className="stat-value">{loading ? '-' : stats.total}</p>
        </article>

        <article className="stat-card panel">
          <p className="stat-label">Latest addition</p>
          <p className="stat-value stat-value-sm">
            {loading ? '-' : stats.latest?.name || 'None yet'}
          </p>
        </article>

        <article className="stat-card panel">
          <p className="stat-label">API lookup</p>
          <p className="stat-value stat-value-sm">Search by name on the roster page</p>
        </article>
      </div>

      <section className="panel dashboard-section">
        <h2>Get started</h2>
        <ul className="action-list">
          <li>
            <Link to="/superheroes">Browse your roster</Link>
            <span>View, edit, or remove saved heroes.</span>
          </li>
          <li>
            <Link to="/superheroes/new">Create a hero manually</Link>
            <span>Add details and upload a custom image.</span>
          </li>
          <li>
            <Link to="/superheroes">Import from Superhero API</Link>
            <span>Use the API search on the roster page to pull in published characters.</span>
          </li>
        </ul>
      </section>
    </Layout>
  );
}

export default Dashboard;
