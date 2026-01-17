'use client';

import React, { useState, useEffect } from 'react';

// Client-facing read-only Handoff Platform
// No editing capabilities - view and download only

const ClientHandoffPlatform = ({ project }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedColor, setCopiedColor] = useState(null);
  const [loadedFonts, setLoadedFonts] = useState({});
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Load custom fonts from uploaded files
  useEffect(() => {
    if (project.typography) {
      project.typography.forEach((type, index) => {
        if (type.fileUrl) {
          const fontName = `CustomFont_${type.id || index}`;
          const fontFace = new FontFace(fontName, `url(${type.fileUrl})`);
          fontFace.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
            setLoadedFonts(prev => ({ ...prev, [type.id || index]: fontName }));
          }).catch(err => {
            console.error('Error loading font:', err);
          });
        }
      });
    }
  }, [project.typography]);

  const copyToClipboard = (text, colorName) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(colorName);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Download a single file
  const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  // Download all assets as ZIP
  const downloadAllAssets = async () => {
    setIsDownloadingAll(true);
    
    try {
      // Dynamically import JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Helper to fetch and add file to zip
      const addFileToZip = async (folder, url, filename) => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          folder.file(filename, blob);
        } catch (error) {
          console.error(`Failed to add ${filename}:`, error);
        }
      };

      // Research Documents
      if (project.research?.documents?.length > 0) {
        const researchFolder = zip.folder('01_Research');
        for (const doc of project.research.documents) {
          if (doc.fileUrl) {
            const filename = doc.fileName || `${doc.name}.pdf`;
            await addFileToZip(researchFolder, doc.fileUrl, filename);
          }
        }
      }

      // Logos
      if (project.logos?.length > 0) {
        const logosFolder = zip.folder('02_Logos');
        for (const logo of project.logos) {
          if (logo.fileUrl) {
            const filename = logo.fileName || `${logo.name}.${logo.format?.split(',')[0]?.trim()?.toLowerCase() || 'png'}`;
            await addFileToZip(logosFolder, logo.fileUrl, filename);
          }
        }
      }

      // Typography
      if (project.typography?.length > 0) {
        const typographyFolder = zip.folder('03_Typography');
        for (const type of project.typography) {
          if (type.fileUrl) {
            const filename = type.fileName || `${type.family || type.name}.otf`;
            await addFileToZip(typographyFolder, type.fileUrl, filename);
          }
        }
      }

      // Web Pages (screenshots)
      if (project.webpages?.length > 0) {
        const webpagesFolder = zip.folder('04_WebPages');
        for (const page of project.webpages) {
          if (page.screenshotUrl) {
            const filename = `${page.name.replace(/[^a-zA-Z0-9]/g, '_')}_screenshot.png`;
            await addFileToZip(webpagesFolder, page.screenshotUrl, filename);
          }
        }
      }

      // Animations
      if (project.animations?.length > 0) {
        const animationsFolder = zip.folder('05_Animations');
        for (const anim of project.animations) {
          if (anim.fileUrl) {
            const ext = anim.animationType === 'lottie' ? 'json' : anim.animationType === 'video' ? 'mp4' : 'file';
            const filename = anim.fileName || `${anim.name}.${ext}`;
            await addFileToZip(animationsFolder, anim.fileUrl, filename);
          }
        }
      }

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_Assets.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
    } catch (error) {
      console.error('Failed to create ZIP:', error);
      alert('Failed to download all assets. Please try downloading individually.');
    }
    
    setIsDownloadingAll(false);
  };

  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'research', label: 'Research & Strategy' },
    { id: 'logos', label: 'Logos' },
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'webpages', label: 'Web Pages' },
    { id: 'animations', label: 'Animations' },
    { id: 'notes', label: 'Dev Notes' },
  ];

  // Filter out empty sections
  const availableSections = sections.filter(section => {
    switch (section.id) {
      case 'overview': return true;
      case 'research': return project.research?.documents?.length > 0 || project.research?.notes?.length > 0;
      case 'logos': return project.logos?.length > 0;
      case 'colors': return project.colors?.length > 0;
      case 'typography': return project.typography?.length > 0;
      case 'webpages': return project.webpages?.length > 0;
      case 'animations': return project.animations?.length > 0;
      case 'notes': return project.devNotes?.length > 0 || project.helpDocs?.length > 0;
      default: return true;
    }
  });

  const typeLabels = {
    brand: 'Brand Identity',
    website: 'Website',
    product: 'Product',
    deck: 'Pitch Deck'
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
        padding: '48px 64px 40px',
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
            Project Handoff
          </p>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '400',
            margin: 0,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            {project.name}
          </h1>
          <p style={{
            fontSize: '20px',
            fontStyle: 'italic',
            color: '#666',
            marginTop: '8px',
          }}>
            by {project.client}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontSize: '13px',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            color: '#888',
            marginBottom: '8px',
          }}>
            {project.date}
          </p>
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            backgroundColor: '#A89585',
            color: '#fff',
            fontSize: '11px',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontWeight: '500',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            borderRadius: '2px',
          }}>
            {typeLabels[project.type] || 'Project'}
          </span>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar Navigation */}
        <nav style={{
          width: '240px',
          padding: '48px 32px',
          borderRight: '1px solid #E8E4DE',
          position: 'sticky',
          top: 0,
          height: 'calc(100vh - 8px)',
          overflowY: 'auto',
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {availableSections.map((section, index) => (
              <li key={section.id} style={{ marginBottom: '8px' }}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '16px',
                    width: '100%',
                    padding: '12px 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderBottom: activeSection === section.id ? '1px solid #2C2C2C' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{
                    fontSize: '12px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#A89585',
                    width: '24px',
                  }}>
                    {romanNumerals[index]}
                  </span>
                  <span style={{
                    fontSize: '15px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontWeight: activeSection === section.id ? '500' : '400',
                    color: activeSection === section.id ? '#2C2C2C' : '#666',
                  }}>
                    {section.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Download All Button */}
          <button 
            onClick={downloadAllAssets}
            disabled={isDownloadingAll}
            style={{
              marginTop: '48px',
              width: '100%',
              padding: '14px 20px',
              backgroundColor: isDownloadingAll ? '#888' : '#2C2C2C',
              color: '#fff',
              border: 'none',
              cursor: isDownloadingAll ? 'wait' : 'pointer',
              fontSize: '12px',
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: '500',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => !isDownloadingAll && (e.target.style.backgroundColor = '#1A1A1A')}
            onMouseLeave={(e) => !isDownloadingAll && (e.target.style.backgroundColor = '#2C2C2C')}
          >
            {isDownloadingAll ? 'Preparing ZIP...' : 'Download All Assets'}
          </button>
        </nav>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '48px 64px',
          minHeight: 'calc(100vh - 200px)',
        }}>
          
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <section>
              <h2 style={{
                fontSize: '14px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#A89585',
                marginBottom: '24px',
              }}>
                Project Overview
              </h2>
              <p style={{
                fontSize: '24px',
                lineHeight: 1.6,
                maxWidth: '720px',
                fontWeight: '300',
              }}>
                {project.overview}
              </p>

              {/* Quick Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '32px',
                marginTop: '64px',
                paddingTop: '48px',
                borderTop: '1px solid #E8E4DE',
              }}>
                {project.logos?.length > 0 && (
                  <div>
                    <p style={{ fontSize: '48px', fontWeight: '300', marginBottom: '8px' }}>
                      {project.logos.length}
                    </p>
                    <p style={{ fontSize: '13px', fontFamily: '"DM Sans", system-ui, sans-serif', color: '#888' }}>
                      Logo Variations
                    </p>
                  </div>
                )}
                {project.colors?.length > 0 && (
                  <div>
                    <p style={{ fontSize: '48px', fontWeight: '300', marginBottom: '8px' }}>
                      {project.colors.length}
                    </p>
                    <p style={{ fontSize: '13px', fontFamily: '"DM Sans", system-ui, sans-serif', color: '#888' }}>
                      Brand Colors
                    </p>
                  </div>
                )}
                {project.webpages?.length > 0 && (
                  <div>
                    <p style={{ fontSize: '48px', fontWeight: '300', marginBottom: '8px' }}>
                      {project.webpages.length}
                    </p>
                    <p style={{ fontSize: '13px', fontFamily: '"DM Sans", system-ui, sans-serif', color: '#888' }}>
                      Pages Designed
                    </p>
                  </div>
                )}
                {project.animations?.length > 0 && (
                  <div>
                    <p style={{ fontSize: '48px', fontWeight: '300', marginBottom: '8px' }}>
                      {project.animations.length}
                    </p>
                    <p style={{ fontSize: '13px', fontFamily: '"DM Sans", system-ui, sans-serif', color: '#888' }}>
                      Animation Files
                    </p>
                  </div>
                )}
              </div>

              {/* Figma Link */}
              {project.figmaLink && (
                <div style={{
                  marginTop: '48px',
                  padding: '32px',
                  backgroundColor: '#FAF9F7',
                  border: '1px solid #E8E4DE',
                }}>
                  <p style={{
                    fontSize: '12px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontWeight: '500',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#A89585',
                    marginBottom: '12px',
                  }}>
                    Design Source
                  </p>
                  <a 
                    href={project.figmaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '16px',
                      color: '#2C2C2C',
                      textDecoration: 'none',
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      borderBottom: '1px solid #A89585',
                      paddingBottom: '2px',
                    }}
                  >
                    Open Figma File →
                  </a>
                </div>
              )}
            </section>
          )}

          {/* Research & Strategy Section */}
          {activeSection === 'research' && (
            <section>
              <h2 style={{
                fontSize: '14px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#A89585',
                marginBottom: '48px',
              }}>
                Research & Strategy
              </h2>

              {/* Documents */}
              {project.research?.documents?.length > 0 && (
                <div style={{ marginBottom: '64px' }}>
                  <h3 style={{
                    fontSize: '11px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontWeight: '500',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#888',
                    marginBottom: '24px',
                  }}>
                    Documents
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {project.research.documents.map((doc, index) => (
                      <div 
                        key={doc.id || index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '24px 32px',
                          border: '1px solid #E8E4DE',
                          backgroundColor: '#fff',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                          <div style={{
                            width: '48px',
                            height: '56px',
                            backgroundColor: '#FAF9F7',
                            border: '1px solid #E8E4DE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{
                              fontSize: '10px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              fontWeight: '600',
                              color: '#A89585',
                            }}>
                              PDF
                            </span>
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontSize: '17px',
                              fontWeight: '500',
                              margin: '0 0 6px 0',
                            }}>
                              {doc.name}
                            </h4>
                            <p style={{
                              fontSize: '14px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              color: '#888',
                              margin: 0,
                            }}>
                              {doc.description}
                            </p>
                          </div>
                        </div>
                        
                        {doc.fileUrl && (
                          <button 
                            onClick={() => downloadFile(doc.fileUrl, doc.fileName || `${doc.name}.pdf`)}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: 'transparent',
                              border: '1px solid #2C2C2C',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              fontWeight: '500',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Download PDF
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategy Notes */}
              {project.research?.notes?.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '11px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontWeight: '500',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#888',
                    marginBottom: '24px',
                  }}>
                    Strategy Notes
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {project.research.notes.map((note, index) => (
                      <div 
                        key={note.id || index}
                        style={{
                          padding: '32px',
                          border: '1px solid #E8E4DE',
                          backgroundColor: '#fff',
                          borderLeft: '3px solid #A89585',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '16px',
                        }}>
                          <h4 style={{
                            fontSize: '18px',
                            fontWeight: '500',
                            margin: 0,
                          }}>
                            {note.title}
                          </h4>
                          <div style={{
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'center',
                          }}>
                            <span style={{
                              fontSize: '12px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              color: '#A89585',
                              fontWeight: '500',
                            }}>
                              {note.author}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              color: '#888',
                            }}>
                              {note.date}
                            </span>
                          </div>
                        </div>
                        <p style={{
                          fontSize: '16px',
                          lineHeight: 1.7,
                          color: '#444',
                          margin: 0,
                        }}>
                          {note.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Logos Section */}
          {activeSection === 'logos' && (
            <section>
              <h2 style={{
                fontSize: '14px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#A89585',
                marginBottom: '48px',
              }}>
                Logo Assets
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '32px',
              }}>
                {project.logos?.map((logo, index) => (
                  <div 
                    key={logo.id || index}
                    style={{
                      border: '1px solid #E8E4DE',
                      backgroundColor: '#fff',
                    }}
                  >
                    <div style={{
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#FAF9F7',
                      borderBottom: '1px solid #E8E4DE',
                    }}>
                      {logo.fileUrl ? (
                        <img src={logo.fileUrl} alt={logo.name} style={{ maxHeight: '120px', maxWidth: '80%' }} />
                      ) : (
                        <span style={{
                          fontSize: logo.preview?.length > 2 ? '42px' : '64px',
                          fontWeight: '400',
                          letterSpacing: '-0.02em',
                        }}>
                          {logo.preview || '◈'}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ padding: '24px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px',
                      }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          margin: 0,
                        }}>
                          {logo.name}
                        </h3>
                        <span style={{
                          fontSize: '11px',
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          color: '#888',
                          backgroundColor: '#F0EDE8',
                          padding: '4px 10px',
                          borderRadius: '2px',
                        }}>
                          {logo.format}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '14px',
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                        color: '#666',
                        lineHeight: 1.5,
                        margin: '0 0 20px 0',
                      }}>
                        {logo.usage}
                      </p>
                      {logo.fileUrl && (
                        <button 
                          onClick={() => downloadFile(logo.fileUrl, logo.fileName || `${logo.name}.${logo.format?.split(',')[0]?.trim()?.toLowerCase() || 'png'}`)}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
                            border: '1px solid #2C2C2C',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontFamily: '"DM Sans", system-ui, sans-serif',
                            fontWeight: '500',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Colors Section */}
          {activeSection === 'colors' && (
            <section>
              <h2 style={{
                fontSize: '14px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#A89585',
                marginBottom: '48px',
              }}>
                Color Palette
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
              }}>
                {project.colors?.map((color, index) => (
                  <div 
                    key={color.id || index}
                    style={{
                      border: '1px solid #E8E4DE',
                      backgroundColor: '#fff',
                    }}
                  >
                    <div style={{
                      height: '140px',
                      backgroundColor: color.hex,
                    }} />
                    
                    <div style={{ padding: '20px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        margin: '0 0 16px 0',
                      }}>
                        {color.name}
                      </h3>
                      
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                      }}>
                        <button
                          onClick={() => copyToClipboard(color.hex, `${color.name}-hex`)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#FAF9F7',
                            border: '1px solid #E8E4DE',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: '"DM Mono", monospace',
                          }}
                        >
                          {copiedColor === `${color.name}-hex` ? 'Copied!' : color.hex}
                        </button>
                        <button
                          onClick={() => copyToClipboard(color.rgb, `${color.name}-rgb`)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#FAF9F7',
                            border: '1px solid #E8E4DE',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: '"DM Mono", monospace',
                          }}
                        >
                          {copiedColor === `${color.name}-rgb` ? 'Copied!' : `RGB ${color.rgb}`}
                        </button>
                      </div>
                      
                      <p style={{
                        fontSize: '13px',
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                        color: '#888',
                        lineHeight: 1.5,
                        margin: 0,
                      }}>
                        {color.usage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Typography Section */}
          {activeSection === 'typography' && (
            <section>
              <h2 style={{
                fontSize: '14px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#A89585',
                marginBottom: '48px',
              }}>
                Typography System
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {project.typography?.map((type, index) => (
                  <div 
                    key={type.id || index}
                    style={{
                      padding: '40px',
                      border: '1px solid #E8E4DE',
                      backgroundColor: '#fff',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '32px',
                    }}>
                      <div>
                        <span style={{
                          fontSize: '12px',
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          color: '#A89585',
                          fontWeight: '500',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}>
                          {romanNumerals[index]}. {type.name}
                        </span>
                        <h3 style={{
                          fontSize: '24px',
                          fontWeight: '400',
                          margin: '12px 0 0 0',
                        }}>
                          {type.family}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {type.fileUrl && (
                          <button 
                            onClick={() => downloadFile(type.fileUrl, type.fileName || `${type.family || type.name}.otf`)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#FAF9F7',
                              border: '1px solid #E8E4DE',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              fontWeight: '500',
                            }}
                          >
                            Download Font
                          </button>
                        )}
                        <span style={{
                          fontSize: '12px',
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          color: '#888',
                          backgroundColor: '#FAF9F7',
                          padding: '6px 12px',
                          border: '1px solid #E8E4DE',
                        }}>
                          Weights: {type.weight}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      padding: '32px',
                      backgroundColor: '#FAF9F7',
                      marginBottom: '20px',
                    }}>
                      <p style={{
                        fontSize: type.name === 'Display' ? '42px' : type.name === 'Body' ? '18px' : '14px',
                        fontFamily: loadedFonts[type.id || index] || 'inherit',
                        fontWeight: '400',
                        lineHeight: type.name === 'Display' ? 1.1 : 1.6,
                        margin: 0,
                        letterSpacing: type.name === 'Display' ? '-0.02em' : 'normal',
                      }}>
                        The quick brown fox jumps over the lazy dog
                      </p>
                      {type.fileUrl && !loadedFonts[type.id || index] && (
                        <p style={{
                          fontSize: '11px',
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          color: '#A89585',
                          marginTop: '12px',
                          fontStyle: 'italic',
                        }}>
                          Loading font preview...
                        </p>
                      )}
                    </div>

                    <p style={{
                      fontSize: '14px',
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      color: '#666',
                      margin: 0,
                    }}>
                      {type.usage}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Web Pages Section */}
          {activeSection === 'webpages' && (
            <section>
              <h2 style={{
                fontSize: '14px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#A89585',
                marginBottom: '48px',
              }}>
                Web Page Specifications
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {project.webpages?.map((page, index) => (
                  <div 
                    key={page.id || index}
                    style={{
                      border: '1px solid #E8E4DE',
                      backgroundColor: '#fff',
                    }}
                  >
                    {/* Page Header */}
                    <div style={{
                      padding: '24px 32px',
                      borderBottom: '1px solid #E8E4DE',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                        <span style={{
                          fontSize: '14px',
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          color: '#A89585',
                        }}>
                          {romanNumerals[index]}
                        </span>
                        <h3 style={{
                          fontSize: '24px',
                          fontWeight: '400',
                          margin: 0,
                        }}>
                          {page.name}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {page.figmaLink && (
                          <a 
                            href={page.figmaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#FAF9F7',
                              border: '1px solid #E8E4DE',
                              color: '#2C2C2C',
                              textDecoration: 'none',
                              fontSize: '12px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/>
                              <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/>
                              <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/>
                              <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/>
                              <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/>
                            </svg>
                            Open in Figma
                          </a>
                        )}
                        <span style={{
                          fontSize: '11px',
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          fontWeight: '500',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          padding: '6px 14px',
                          backgroundColor: page.status === 'Ready for dev' ? '#E8F5E8' : '#FFF8E8',
                          color: page.status === 'Ready for dev' ? '#2D5A2D' : '#8B6914',
                          borderRadius: '2px',
                        }}>
                          {page.status}
                        </span>
                      </div>
                    </div>

                    {/* Page Content */}
                    <div style={{ display: 'flex' }}>
                      {/* Screenshot */}
                      {page.screenshot && (
                        <div style={{
                          width: '360px',
                          minHeight: '270px',
                          backgroundColor: '#F0EDE8',
                          borderRight: '1px solid #E8E4DE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '24px',
                        }}>
                          <img 
                            src={page.screenshot} 
                            alt={page.name} 
                            style={{ 
                              width: '100%', 
                              height: 'auto',
                              border: '1px solid #DDD8D2',
                            }} 
                          />
                        </div>
                      )}

                      {/* Page Details */}
                      <div style={{ flex: 1, padding: '32px' }}>
                        {/* Notes */}
                        {page.notes && (
                          <div style={{ marginBottom: '28px' }}>
                            <p style={{
                              fontSize: '11px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              fontWeight: '500',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              color: '#A89585',
                              marginBottom: '12px',
                            }}>
                              Development Notes
                            </p>
                            <p style={{
                              fontSize: '15px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              lineHeight: 1.6,
                              color: '#444',
                              margin: 0,
                            }}>
                              {page.notes}
                            </p>
                          </div>
                        )}

                        {/* Additional Notes */}
                        {page.additionalNotes?.length > 0 && (
                          <div style={{ marginBottom: '28px' }}>
                            <p style={{
                              fontSize: '11px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              fontWeight: '500',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              color: '#A89585',
                              marginBottom: '12px',
                            }}>
                              Additional Notes
                            </p>
                            <div style={{
                              backgroundColor: '#FAF9F7',
                              border: '1px solid #E8E4DE',
                              padding: '16px 20px',
                            }}>
                              {page.additionalNotes.map((note, noteIndex) => (
                                <div 
                                  key={noteIndex}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    paddingBottom: noteIndex < page.additionalNotes.length - 1 ? '12px' : 0,
                                    marginBottom: noteIndex < page.additionalNotes.length - 1 ? '12px' : 0,
                                    borderBottom: noteIndex < page.additionalNotes.length - 1 ? '1px solid #E8E4DE' : 'none',
                                  }}
                                >
                                  <span style={{
                                    fontSize: '10px',
                                    color: '#A89585',
                                    marginTop: '4px',
                                  }}>
                                    •
                                  </span>
                                  <p style={{
                                    fontSize: '14px',
                                    fontFamily: '"DM Sans", system-ui, sans-serif',
                                    lineHeight: 1.5,
                                    color: '#666',
                                    margin: 0,
                                  }}>
                                    {note}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Links Table */}
                        {page.links?.length > 0 && (
                          <div>
                            <p style={{
                              fontSize: '11px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              fontWeight: '500',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              color: '#A89585',
                              marginBottom: '12px',
                            }}>
                              Link Mapping
                            </p>
                            <div style={{
                              backgroundColor: '#FAF9F7',
                              border: '1px solid #E8E4DE',
                            }}>
                              {page.links.map((link, linkIndex) => (
                                <div 
                                  key={linkIndex}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    borderBottom: linkIndex < page.links.length - 1 ? '1px solid #E8E4DE' : 'none',
                                  }}
                                >
                                  <span style={{
                                    fontSize: '13px',
                                    fontFamily: '"DM Sans", system-ui, sans-serif',
                                    color: '#444',
                                  }}>
                                    {link.element}
                                  </span>
                                  <code style={{
                                    fontSize: '12px',
                                    fontFamily: '"DM Mono", monospace',
                                    color: '#A89585',
                                    backgroundColor: '#fff',
                                    padding: '2px 8px',
                                    border: '1px solid #E8E4DE',
                                  }}>
                                    {link.destination}
                                  </code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Animations Section */}
          {activeSection === 'animations' && (
            <section>
              <h2 style={{
                fontSize: '14px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#A89585',
                marginBottom: '48px',
              }}>
                Animation Assets
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {project.animations?.map((anim, index) => (
                  <div 
                    key={anim.id || index}
                    style={{
                      border: '1px solid #E8E4DE',
                      backgroundColor: '#fff',
                      padding: '28px 32px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <span style={{
                        fontSize: '14px',
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                        color: '#A89585',
                      }}>
                        {romanNumerals[index]}
                      </span>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          margin: '0 0 6px 0',
                        }}>
                          {anim.name}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          color: '#888',
                          margin: 0,
                        }}>
                          {anim.notes}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontFamily: '"DM Mono", monospace',
                        color: '#888',
                        backgroundColor: '#FAF9F7',
                        padding: '6px 12px',
                        border: '1px solid #E8E4DE',
                      }}>
                        {anim.format}
                      </span>
                      {anim.fileUrl && (
                        <button 
                          onClick={() => {
                            const ext = anim.animationType === 'lottie' ? 'json' : anim.animationType === 'video' ? 'mp4' : 'file';
                            downloadFile(anim.fileUrl, anim.fileName || `${anim.name}.${ext}`);
                          }}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
                            border: '1px solid #2C2C2C',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontFamily: '"DM Sans", system-ui, sans-serif',
                            fontWeight: '500',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Dev Notes Section */}
          {activeSection === 'notes' && (
            <section>
              <h2 style={{
                fontSize: '14px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#A89585',
                marginBottom: '48px',
              }}>
                Development Notes
              </h2>

              {project.devNotes?.length > 0 && (
                <div style={{
                  border: '1px solid #E8E4DE',
                  backgroundColor: '#fff',
                  marginBottom: '48px',
                }}>
                  {project.devNotes.map((note, index) => (
                    <div 
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '24px',
                        padding: '24px 32px',
                        borderBottom: index < project.devNotes.length - 1 ? '1px solid #E8E4DE' : 'none',
                      }}
                    >
                      <span style={{
                        fontSize: '14px',
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                        color: '#A89585',
                        minWidth: '32px',
                      }}>
                        {romanNumerals[index]}
                      </span>
                      <p style={{
                        fontSize: '15px',
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                        lineHeight: 1.6,
                        color: '#444',
                        margin: 0,
                      }}>
                        {note}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Help Docs */}
              {project.helpDocs?.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '11px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontWeight: '500',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#888',
                    marginBottom: '24px',
                  }}>
                    Help Documentation
                  </h3>
                  
                  <div style={{
                    border: '1px solid #E8E4DE',
                    backgroundColor: '#fff',
                  }}>
                    {project.helpDocs.map((doc, index) => (
                      <div 
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '20px 24px',
                          borderBottom: index < project.helpDocs.length - 1 ? '1px solid #E8E4DE' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: '#FAF9F7',
                            border: '1px solid #E8E4DE',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: '14px' }}>📄</span>
                          </div>
                          <span style={{
                            fontSize: '15px',
                            fontWeight: '500',
                          }}>
                            {doc.title}
                          </span>
                        </div>
                        
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '8px 16px',
                              backgroundColor: 'transparent',
                              border: '1px solid #2C2C2C',
                              fontSize: '11px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              fontWeight: '500',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              textDecoration: 'none',
                              color: '#2C2C2C',
                            }}
                          >
                            View Docs →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

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
          Prepared by Interlude Studio
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
};

export default ClientHandoffPlatform;
