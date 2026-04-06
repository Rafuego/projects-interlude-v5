'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getProjectById, updateProject, checkSlugAvailable, supabase } from '../../../lib/supabase';
import HandoffPlatform from '../../../components/HandoffPlatform.jsx';

export default function AdminProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params.project === 'string' ? params.project : null;
  
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    setIsLoading(true);
    const data = await getProjectById(projectId);
    if (data) {
      setProject({
        ...data,
        figmaLink: data.figma_link,
        ...data.data,
        settings: {
          slug: data.slug,
          password: data.password,
          isPublished: data.is_published,
        }
      });
    } else {
      router.push('/admin');
    }
    setIsLoading(false);
  };

  const saveProject = useCallback(async (updatedProject) => {
    if (!projectId) return;
    
    setIsSaving(true);
    
    const dbProject = {
      name: updatedProject.name,
      client: updatedProject.client,
      type: updatedProject.type,
      date: updatedProject.date,
      overview: updatedProject.overview,
      figma_link: updatedProject.figmaLink,
      slug: updatedProject.settings?.slug || project?.slug,
      password: updatedProject.settings?.password || null,
      is_published: updatedProject.settings?.isPublished || false,
      data: {
        research: updatedProject.research,
        logos: updatedProject.logos,
        colors: updatedProject.colors,
        typography: updatedProject.typography,
        webpages: updatedProject.webpages,
        animations: updatedProject.animations,
        devNotes: updatedProject.devNotes,
        helpDocs: updatedProject.helpDocs,
      }
    };
    
    await updateProject(projectId, dbProject);
    setIsSaving(false);
  }, [projectId, project?.slug]);

  const handleSettingsChange = async (field, value) => {
    if (field === 'slug') {
      const slug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      const isAvailable = await checkSlugAvailable(slug, projectId);
      if (!isAvailable) {
        setSlugError('This slug is already taken');
        return;
      }
      setSlugError('');
    }
    
    const updatedProject = {
      ...project,
      settings: {
        ...project.settings,
        [field]: value,
      }
    };
    setProject(updatedProject);
    saveProject(updatedProject);
  };

  const handleFileUpload = useCallback(async (file, folder) => {
    if (!projectId) return null;
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${projectId}/${folder}/${Date.now()}-${safeName}`;

      const { error } = await supabase.storage
        .from('project-files')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  }, [projectId]);

  const copyClientLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/${project.settings?.slug || project.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8F6F3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"DM Sans", system-ui, sans-serif',
      }}>
        <p style={{ color: '#888' }}>Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const isPublished = project.settings?.isPublished || project.is_published;
  const currentSlug = project.settings?.slug || project.slug;

  return (
    <div style={{ position: 'relative' }}>
      {/* Admin Toolbar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        backgroundColor: '#2C2C2C',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 1000,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link
            href="/admin"
            style={{
              color: '#888',
              textDecoration: 'none',
              fontSize: '13px',
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}
          >
            ← Dashboard
          </Link>
          <span style={{
            color: '#fff',
            fontSize: '14px',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontWeight: '500',
          }}>
            {project.name}
          </span>
          <span style={{
            fontSize: '10px',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            color: isPublished ? '#4ADE80' : '#888',
            backgroundColor: isPublished ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.1)',
            padding: '4px 10px',
            borderRadius: '2px',
            fontWeight: '500',
          }}>
            {isPublished ? '● Published' : '○ Draft'}
          </span>
          {isSaving && (
            <span style={{
              fontSize: '11px',
              fontFamily: '"DM Sans", system-ui, sans-serif',
              color: '#A89585',
            }}>
              Saving...
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isPublished && (
            <button
              onClick={copyClientLink}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: '500',
              }}
            >
              {copied ? '✓ Copied!' : '🔗 Copy Client Link'}
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#A89585',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: '500',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            ⚙ Settings
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
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
          zIndex: 1001,
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '48px',
            width: '520px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '400',
              margin: '0 0 8px 0',
              fontFamily: '"Cormorant Garamond", Georgia, serif',
            }}>
              Project Settings
            </h2>
            <p style={{
              fontSize: '14px',
              fontFamily: '"DM Sans", system-ui, sans-serif',
              color: '#888',
              margin: '0 0 32px 0',
            }}>
              Configure sharing and access for this handoff
            </p>
            
            {/* Client URL Slug */}
            <div style={{ marginBottom: '28px' }}>
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
                Client URL Slug
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '14px',
                  fontFamily: '"DM Mono", monospace',
                  color: '#888',
                }}>
                  {typeof window !== 'undefined' ? window.location.origin : ''}/
                </span>
                <input
                  type="text"
                  value={currentSlug}
                  onChange={(e) => handleSettingsChange('slug', e.target.value)}
                  placeholder="client-project"
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    fontSize: '14px',
                    fontFamily: '"DM Mono", monospace',
                    border: slugError ? '1px solid #E57373' : '1px solid #E8E4DE',
                  }}
                />
              </div>
              {slugError && (
                <p style={{
                  fontSize: '12px',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  color: '#E57373',
                  marginTop: '8px',
                }}>
                  {slugError}
                </p>
              )}
            </div>
            
            {/* Password Protection */}
            <div style={{ marginBottom: '28px' }}>
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
                Password Protection (Optional)
              </label>
              <input
                type="text"
                value={project.settings?.password || ''}
                onChange={(e) => handleSettingsChange('password', e.target.value || null)}
                placeholder="Leave blank for no password"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '14px',
                  border: '1px solid #E8E4DE',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                }}
              />
              <p style={{
                fontSize: '12px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                color: '#888',
                marginTop: '8px',
              }}>
                {project.settings?.password 
                  ? '🔒 Clients will need this password to view the handoff'
                  : '🔓 Anyone with the link can view this handoff'
                }
              </p>
            </div>
            
            {/* Publish Status */}
            <div style={{
              marginBottom: '32px',
              padding: '20px',
              backgroundColor: '#FAF9F7',
              border: '1px solid #E8E4DE',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => handleSettingsChange('isPublished', e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                  }}
                />
                <div>
                  <span style={{
                    fontSize: '15px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontWeight: '500',
                  }}>
                    Publish this handoff
                  </span>
                  <p style={{
                    fontSize: '13px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#888',
                    margin: '4px 0 0 0',
                  }}>
                    When published, the client link will be accessible
                  </p>
                </div>
              </label>
            </div>

            {/* Preview Link */}
            {isPublished && (
              <div style={{
                marginBottom: '32px',
                padding: '16px 20px',
                backgroundColor: '#E8F5E8',
                border: '1px solid #C8E6C9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{
                    fontSize: '12px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#2D5A2D',
                    fontWeight: '500',
                    margin: '0 0 4px 0',
                  }}>
                    Client Link Ready
                  </p>
                  <p style={{
                    fontSize: '13px',
                    fontFamily: '"DM Mono", monospace',
                    color: '#2D5A2D',
                    margin: 0,
                  }}>
                    {typeof window !== 'undefined' ? window.location.origin : ''}/{currentSlug}
                  </p>
                </div>
                <button
                  onClick={copyClientLink}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2D5A2D',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontWeight: '500',
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            )}
            
            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%',
                padding: '14px 24px',
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
              Done
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Handoff Platform in Edit Mode */}
      <div style={{ paddingTop: '56px' }}>
        <HandoffPlatform
          projectSlug={null}
          initialProject={project}
          onSave={saveProject}
          onFileUpload={handleFileUpload}
          isAdmin={true}
        />
      </div>
    </div>
  );
}
