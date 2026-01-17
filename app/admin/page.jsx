'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProjects, createProject, deleteProjectFromDb } from '../../lib/supabase';

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const data = await getProjects();
    setProjects(data.map((p) => ({
      id: p.id,
      name: p.name || 'Untitled',
      client: p.client || 'No Client',
      type: p.type || 'brand',
      date: p.date || '',
      slug: p.slug || p.id,
      password: p.password,
      is_published: p.is_published || false,
    })));
    setIsLoading(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    setIsCreating(true);
    const slug = newProjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const result = await createProject({
      name: newProjectName,
      client: newProjectClient || 'Client Name',
      slug: slug,
    });

    if (result) {
      setProjects([{
        id: result.id,
        name: result.name,
        client: result.client,
        type: result.type,
        date: result.date,
        slug: result.slug,
        password: result.password,
        is_published: result.is_published,
      }, ...projects]);
      
      setNewProjectName('');
      setNewProjectClient('');
      setShowNewProject(false);
    } else {
      alert('Failed to create project. Please try again.');
    }
    setIsCreating(false);
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    
    const success = await deleteProjectFromDb(id);
    if (success) {
      setProjects(projects.filter(p => p.id !== id));
    } else {
      alert('Failed to delete project. Please try again.');
    }
  };

  const typeLabels = {
    brand: 'Brand Identity',
    website: 'Website',
    product: 'Product',
    deck: 'Pitch Deck'
  };

  const typeColors = {
    brand: '#A89585',
    website: '#5B8A72',
    product: '#7B6B8D',
    deck: '#8B7355'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F6F3',
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      color: '#2C2C2C',
    }}>
      {/* Top Accent Bar */}
      <div style={{
        height: '8px',
        backgroundColor: '#A89585',
        width: '100%',
      }} />

      {/* Header */}
      <header style={{
        padding: '48px 64px',
        borderBottom: '1px solid #E8E4DE',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <div>
          <p style={{
            fontSize: '12px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#A89585',
            marginBottom: '12px',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontWeight: '500',
          }}>
            Admin Dashboard
          </p>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '400',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Project Handoffs
          </h1>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          style={{
            padding: '14px 28px',
            backgroundColor: '#2C2C2C',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontWeight: '500',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          + New Project
        </button>
      </header>

      {/* New Project Modal */}
      {showNewProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '48px',
            width: '480px',
            maxWidth: '90%',
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '400',
              margin: '0 0 32px 0',
            }}>
              Create New Project
            </h2>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#888',
                marginBottom: '8px',
              }}>
                Project Name
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Symphony Rebrand"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: '1px solid #E8E4DE',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                }}
              />
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#888',
                marginBottom: '8px',
              }}>
                Client Name
              </label>
              <input
                type="text"
                value={newProjectClient}
                onChange={(e) => setNewProjectClient(e.target.value)}
                placeholder="e.g., Acme Corp"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: '1px solid #E8E4DE',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={handleCreateProject}
                disabled={isCreating}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  backgroundColor: isCreating ? '#888' : '#2C2C2C',
                  color: '#fff',
                  border: 'none',
                  cursor: isCreating ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontWeight: '500',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </button>
              <button
                onClick={() => setShowNewProject(false)}
                style={{
                  padding: '14px 24px',
                  backgroundColor: 'transparent',
                  color: '#2C2C2C',
                  border: '1px solid #E8E4DE',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontWeight: '500',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <main style={{ padding: '64px' }}>
        {isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
          }}>
            <p style={{
              fontSize: '16px',
              color: '#888',
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}>
              Loading projects...
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            border: '2px dashed #E8E4DE',
          }}>
            <p style={{
              fontSize: '18px',
              color: '#888',
              marginBottom: '24px',
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}>
              No projects yet. Create your first handoff.
            </p>
            <button
              onClick={() => setShowNewProject(true)}
              style={{
                padding: '14px 28px',
                backgroundColor: '#A89585',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              + Create Project
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '32px',
          }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  border: '1px solid #E8E4DE',
                  backgroundColor: '#fff',
                  position: 'relative',
                }}
              >
                {/* Delete button */}
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ccc',
                    fontSize: '18px',
                    zIndex: 10,
                  }}
                >
                  ×
                </button>

                <div style={{ padding: '32px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px',
                  }}>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: typeColors[project.type] || '#A89585',
                      color: '#fff',
                      fontSize: '10px',
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      fontWeight: '500',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      borderRadius: '2px',
                    }}>
                      {typeLabels[project.type] || project.type}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {project.password && (
                        <span style={{
                          fontSize: '12px',
                          color: '#888',
                        }}>
                          🔒
                        </span>
                      )}
                      <span style={{
                        fontSize: '10px',
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                        color: project.is_published ? '#2D5A2D' : '#888',
                        backgroundColor: project.is_published ? '#E8F5E8' : '#F5F5F5',
                        padding: '4px 8px',
                        borderRadius: '2px',
                        fontWeight: '500',
                      }}>
                        {project.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '400',
                    margin: '0 0 8px 0',
                    letterSpacing: '-0.01em',
                  }}>
                    {project.name}
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    fontStyle: 'italic',
                    color: '#666',
                    margin: '0 0 8px 0',
                  }}>
                    {project.client}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    fontFamily: '"DM Mono", monospace',
                    color: '#A89585',
                    margin: 0,
                  }}>
                    /{project.slug}
                  </p>
                </div>
                
                <div style={{
                  padding: '20px 32px',
                  borderTop: '1px solid #E8E4DE',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#888',
                  }}>
                    {project.date}
                  </span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {project.is_published && (
                      <Link
                        href={`/${project.slug}`}
                        target="_blank"
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          border: '1px solid #E8E4DE',
                          color: '#666',
                          textDecoration: 'none',
                          fontSize: '11px',
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          fontWeight: '500',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Preview
                      </Link>
                    )}
                    <Link
                      href={`/admin/${project.id}`}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#2C2C2C',
                        color: '#fff',
                        textDecoration: 'none',
                        fontSize: '11px',
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                        fontWeight: '500',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Edit →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '32px 64px',
        borderTop: '1px solid #E8E4DE',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <p style={{
          fontSize: '13px',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          color: '#888',
          margin: 0,
        }}>
          Interlude Studio Admin
        </p>
        <p style={{
          fontSize: '20px',
          fontStyle: 'italic',
          margin: 0,
        }}>
          Interlude
        </p>
      </footer>
    </div>
  );
}
