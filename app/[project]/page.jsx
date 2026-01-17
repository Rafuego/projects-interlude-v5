'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getProjectBySlug } from '../../lib/supabase';
import ClientHandoffPlatform from '../../components/ClientHandoffPlatform.jsx';

export default function ClientProjectPage() {
  const params = useParams();
  const slug = typeof params.project === 'string' ? params.project : null;
  
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [storedProject, setStoredProject] = useState(null);

  useEffect(() => {
    if (slug) {
      loadProject();
    }
  }, [slug]);

  const loadProject = async () => {
    setIsLoading(true);
    
    const data = await getProjectBySlug(slug);
    
    if (data) {
      const transformedProject = {
        ...data,
        figmaLink: data.figma_link,
        ...data.data,
      };
      
      if (data.password) {
        const authKey = `interlude-auth-${slug}`;
        const isAuthenticated = typeof window !== 'undefined' && sessionStorage.getItem(authKey) === 'true';
        
        if (isAuthenticated) {
          setProject(transformedProject);
        } else {
          setStoredProject(transformedProject);
          setNeedsPassword(true);
        }
      } else {
        setProject(transformedProject);
      }
    } else {
      setNotFound(true);
    }
    
    setIsLoading(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (storedProject && password === storedProject.password) {
      sessionStorage.setItem(`interlude-auth-${slug}`, 'true');
      setProject(storedProject);
      setNeedsPassword(false);
      setError('');
    } else {
      setError('Incorrect password');
    }
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
        <p style={{ color: '#888' }}>Loading...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8F6F3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Cormorant Garamond", Georgia, serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '8px',
            height: '80px',
            backgroundColor: '#A89585',
            margin: '0 auto 32px',
          }} />
          <h1 style={{
            fontSize: '48px',
            fontWeight: '400',
            margin: '0 0 16px 0',
            color: '#2C2C2C',
          }}>
            Project Not Found
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#888',
            fontFamily: '"DM Sans", system-ui, sans-serif',
          }}>
            This handoff may not exist or hasn't been published yet.
          </p>
        </div>
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8F6F3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Cormorant Garamond", Georgia, serif',
      }}>
        <div style={{
          width: '400px',
          padding: '48px',
          backgroundColor: '#fff',
          border: '1px solid #E8E4DE',
          textAlign: 'center',
        }}>
          <div style={{
            width: '8px',
            height: '60px',
            backgroundColor: '#A89585',
            margin: '0 auto 32px',
          }} />
          <h1 style={{
            fontSize: '32px',
            fontWeight: '400',
            margin: '0 0 8px 0',
          }}>
            Protected Handoff
          </h1>
          <p style={{
            fontSize: '14px',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            color: '#888',
            margin: '0 0 32px 0',
          }}>
            Enter the password to view this project
          </p>
          
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '16px',
                border: error ? '1px solid #E57373' : '1px solid #E8E4DE',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                marginBottom: '8px',
                textAlign: 'center',
              }}
            />
            {error && (
              <p style={{
                fontSize: '13px',
                color: '#E57373',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                margin: '0 0 16px 0',
              }}>
                {error}
              </p>
            )}
            <button
              type="submit"
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
                marginTop: '8px',
              }}
            >
              View Handoff
            </button>
          </form>
          
          <p style={{
            fontSize: '12px',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            color: '#888',
            marginTop: '32px',
          }}>
            Prepared by Interlude Studio
          </p>
        </div>
      </div>
    );
  }

  return <ClientHandoffPlatform project={project} />;
}
