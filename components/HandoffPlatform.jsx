'use client';

import React, { useState, useRef, useEffect } from 'react';

// Editable Interlude Handoff Platform
// A refined, editorial handoff experience with inline editing and file uploads

const EditableField = ({ value, onChange, style, placeholder, multiline = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  
  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.target.blur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };
  
  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            ...style,
            border: '1px solid #A89585',
            borderRadius: '2px',
            padding: '8px',
            backgroundColor: '#fff',
            resize: 'vertical',
            minHeight: '80px',
            width: '100%',
          }}
        />
      );
    }
    return (
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        style={{
          ...style,
          border: '1px solid #A89585',
          borderRadius: '2px',
          padding: '4px 8px',
          backgroundColor: '#fff',
        }}
      />
    );
  }
  
  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        ...style,
        cursor: 'pointer',
        position: 'relative',
        borderRadius: '2px',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(168, 149, 133, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {value || <span style={{ color: '#999', fontStyle: 'italic' }}>{placeholder}</span>}
      <span style={{
        position: 'absolute',
        right: '-20px',
        top: '50%',
        transform: 'translateY(-50%)',
        opacity: 0.4,
        fontSize: '12px',
      }}>
        ✎
      </span>
    </div>
  );
};

const FileUploadZone = ({ onUpload, accept, children, style, multiple = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (multiple) {
        onUpload(Array.from(files));
      } else {
        onUpload(files[0]);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      if (multiple) {
        onUpload(Array.from(e.target.files));
      } else {
        onUpload(e.target.files[0]);
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{
        ...style,
        border: isDragging ? '2px dashed #A89585' : '2px dashed #E8E4DE',
        backgroundColor: isDragging ? 'rgba(168, 149, 133, 0.1)' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        multiple={multiple}
        style={{ display: 'none' }}
      />
      {children}
    </div>
  );
};

const TagSelector = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tags = ['brand', 'website', 'product', 'deck'];
  const labels = {
    brand: 'Brand Identity',
    website: 'Website',
    product: 'Product',
    deck: 'Pitch Deck'
  };
  const colors = {
    brand: '#A89585',
    website: '#5B8A72',
    product: '#7B6B8D',
    deck: '#8B7355'
  };
  
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-block',
          padding: '6px 16px',
          backgroundColor: colors[value] || '#A89585',
          color: '#fff',
          fontSize: '11px',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontWeight: '500',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          borderRadius: '2px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {labels[value] || 'Select Type'} ▾
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          backgroundColor: '#fff',
          border: '1px solid #E8E4DE',
          borderRadius: '2px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100,
          minWidth: '140px',
        }}>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                onChange(tag);
                setIsOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                backgroundColor: value === tag ? '#FAF9F7' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                color: '#2C2C2C',
              }}
            >
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors[tag],
                marginRight: '8px',
              }} />
              {labels[tag]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const LottiePreview = ({ animationData }) => {
  // Simple Lottie preview using iframe with lottie-web CDN
  const [isPlaying, setIsPlaying] = useState(true);
  
  if (!animationData) {
    return (
      <div style={{
        height: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAF9F7',
        border: '1px solid #E8E4DE',
        color: '#888',
        fontSize: '12px',
        fontFamily: '"DM Sans", system-ui, sans-serif',
      }}>
        No preview available
      </div>
    );
  }
  
  return (
    <div style={{
      height: '120px',
      backgroundColor: '#FAF9F7',
      border: '1px solid #E8E4DE',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{
        fontSize: '32px',
        animation: isPlaying ? 'pulse 1.5s ease-in-out infinite' : 'none',
      }}>
        ◈
      </div>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          padding: '4px 8px',
          backgroundColor: '#fff',
          border: '1px solid #E8E4DE',
          borderRadius: '2px',
          fontSize: '10px',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          cursor: 'pointer',
        }}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
};

const HandoffPlatform = ({ projectSlug = null, initialProject = null, onSave = null, onFileUpload = null, isAdmin = false }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedColor, setCopiedColor] = useState(null);
  const [isLoading, setIsLoading] = useState(!!projectSlug);
  const [isUploading, setIsUploading] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(null); // { current, total }
  
  // Default project data
  const defaultProject = {
    name: "New Project",
    client: "Client Name",
    type: "brand",
    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    overview: "",
    research: { documents: [], notes: [] },
    logos: [],
    colors: [],
    typography: [],
    figmaLink: "",
    webpages: [],
    animations: [],
    collateral: [],
    devNotes: [],
    helpDocs: []
  };
  
  // Editable project state
  const [project, setProject] = useState(initialProject || defaultProject);
  
  // Update project when initialProject changes (from admin page)
  useEffect(() => {
    if (initialProject) {
      setProject(initialProject);
      setIsLoading(false);
    }
  }, [initialProject]);
  
  // Auto-save when project changes (if onSave provided)
  useEffect(() => {
    if (onSave && project && !isLoading) {
      const timeoutId = setTimeout(() => {
        onSave(project);
      }, 500); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [project, onSave, isLoading]);
  
  // Load project data from JSON file if projectSlug is provided
  useEffect(() => {
    if (projectSlug) {
      setIsLoading(true);
      fetch(`/projects/${projectSlug}.json`)
        .then(res => {
          if (!res.ok) throw new Error('Project not found');
          return res.json();
        })
        .then(data => {
          setProject(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error loading project:', err);
          setIsLoading(false);
        });
    }
  }, [projectSlug]);

  const updateProject = (path, value) => {
    setProject(prev => {
      const newProject = { ...prev };
      const keys = path.split('.');
      let current = newProject;
      for (let i = 0; i < keys.length - 1; i++) {
        if (keys[i].includes('[')) {
          const [arrKey, index] = keys[i].split('[');
          const idx = parseInt(index.replace(']', ''));
          current[arrKey] = [...current[arrKey]];
          current = current[arrKey][idx] = { ...current[arrKey][idx] };
        } else {
          current = current[keys[i]] = { ...current[keys[i]] };
        }
      }
      current[keys[keys.length - 1]] = value;
      return newProject;
    });
  };

  const addItem = (section, newItem) => {
    setProject(prev => ({
      ...prev,
      [section]: [...prev[section], { ...newItem, id: Date.now() }]
    }));
  };

  const removeItem = (section, id) => {
    setProject(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
  };

  const copyToClipboard = (text, colorName) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(colorName);
    setTimeout(() => setCopiedColor(null), 2000);
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
    { id: 'collateral', label: 'Collateral' },
    { id: 'notes', label: 'Dev Notes' },
  ];

  const handleFileUpload = async (section, id, file) => {
    // If we have a cloud upload handler, use it
    if (onFileUpload) {
      setIsUploading(true);
      try {
        const folder = section; // Use section name as folder (logos, typography, etc.)
        const fileUrl = await onFileUpload(file, folder);
        
        if (file.name.endsWith('.json')) {
          // For Lottie JSON, also parse the animation data
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const animationData = JSON.parse(e.target.result);
              setProject(prev => ({
                ...prev,
                [section]: prev[section].map(item => 
                  item.id === id ? { ...item, file: file.name, fileUrl, animationData } : item
                )
              }));
            } catch (err) {
              console.error('Invalid JSON');
            }
          };
          reader.readAsText(file);
        } else {
          const ext = file.name.split('.').pop()?.toUpperCase() || '';
          setProject(prev => ({
            ...prev,
            [section]: prev[section].map(item =>
              item.id === id ? { ...item, file: file.name, fileUrl, fileName: file.name, ...(section === 'collateral' ? { fileType: ext } : {}) } : item
            )
          }));
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Error uploading file. Please try again.');
      } finally {
        setIsUploading(false);
      }
      return;
    }
    
    // Fallback to local/base64 storage (for preview without Supabase)
    const reader = new FileReader();
    reader.onload = (e) => {
      if (file.name.endsWith('.json')) {
        try {
          const animationData = JSON.parse(e.target.result);
          setProject(prev => ({
            ...prev,
            [section]: prev[section].map(item => 
              item.id === id ? { ...item, file: file.name, animationData } : item
            )
          }));
        } catch (err) {
          console.error('Invalid JSON');
        }
      } else {
        setProject(prev => ({
          ...prev,
          [section]: prev[section].map(item => 
            item.id === id ? { ...item, file: file.name, fileUrl: e.target.result } : item
          )
        }));
      }
    };
    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  // Helper: read a file as a data URL
  const readFileAsDataUrl = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });

  // Bulk upload: accepts an array of files, a section name, and a function that creates a new item from a file
  const handleBulkUpload = async (section, files, createItemFromFile) => {
    if (!files || files.length === 0) return;
    setBulkUploadProgress({ current: 0, total: files.length });

    const newItems = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setBulkUploadProgress({ current: i + 1, total: files.length });
      const item = createItemFromFile(file);
      item.file = file.name;

      // Always read a local preview first so items display immediately
      if (file.name.endsWith('.json')) {
        try {
          const text = await file.text();
          item.animationData = JSON.parse(text);
        } catch (err) {
          console.error('Invalid JSON:', file.name);
        }
      } else {
        const localUrl = await readFileAsDataUrl(file);
        item.fileUrl = localUrl;
        if (file.type.startsWith('video/')) {
          item.videoUrl = localUrl;
        }
        if (item._isScreenshot && file.type.startsWith('image/')) {
          item.screenshot = localUrl;
          delete item._isScreenshot;
        }
      }

      // Then try cloud upload — overwrite fileUrl with the persistent URL
      if (onFileUpload) {
        try {
          const cloudUrl = await onFileUpload(file, section);
          if (cloudUrl) {
            item.fileUrl = cloudUrl;
          }
        } catch (error) {
          console.error('Cloud upload failed for', file.name, '— using local preview');
        }
      }

      newItems.push(item);
    }

    // Batch update state with all new items
    setProject(prev => {
      if (section === 'research') {
        return {
          ...prev,
          research: {
            ...prev.research,
            documents: [...prev.research.documents, ...newItems]
          }
        };
      }
      return {
        ...prev,
        [section]: [...prev[section], ...newItems]
      };
    });

    setBulkUploadProgress(null);
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
          <EditableField
            value={project.name}
            onChange={(val) => updateProject('name', val)}
            placeholder="Project Name"
            style={{
              fontSize: '56px',
              fontWeight: '400',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              display: 'inline-block',
            }}
          />
          <p style={{
            fontSize: '20px',
            fontStyle: 'italic',
            color: '#666',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            by{' '}
            <EditableField
              value={project.client}
              onChange={(val) => updateProject('client', val)}
              placeholder="Client Name"
              style={{
                fontSize: '20px',
                fontStyle: 'italic',
                color: '#666',
              }}
            />
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <EditableField
            value={project.date}
            onChange={(val) => updateProject('date', val)}
            placeholder="Date"
            style={{
              fontSize: '13px',
              fontFamily: '"DM Sans", system-ui, sans-serif',
              color: '#888',
              marginBottom: '8px',
            }}
          />
          <div style={{ marginTop: '8px' }}>
            <TagSelector
              value={project.type}
              onChange={(val) => updateProject('type', val)}
            />
          </div>
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
            {sections.map((section, index) => (
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
          <button style={{
            marginTop: '48px',
            width: '100%',
            padding: '14px 20px',
            backgroundColor: '#2C2C2C',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontWeight: '500',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1A1A1A'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#2C2C2C'}
          >
            Download All Assets
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
              <EditableField
                value={project.overview}
                onChange={(val) => updateProject('overview', val)}
                placeholder="Project overview description..."
                multiline
                style={{
                  fontSize: '24px',
                  lineHeight: 1.6,
                  maxWidth: '720px',
                  fontWeight: '300',
                  display: 'block',
                }}
              />

              {/* Quick Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '32px',
                marginTop: '64px',
                paddingTop: '48px',
                borderTop: '1px solid #E8E4DE',
              }}>
                <div>
                  <p style={{ fontSize: '48px', fontWeight: '300', marginBottom: '8px' }}>
                    {project.logos.length}
                  </p>
                  <p style={{ fontSize: '13px', fontFamily: '"DM Sans", system-ui, sans-serif', color: '#888' }}>
                    Logo Variations
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '48px', fontWeight: '300', marginBottom: '8px' }}>
                    {project.colors.length}
                  </p>
                  <p style={{ fontSize: '13px', fontFamily: '"DM Sans", system-ui, sans-serif', color: '#888' }}>
                    Brand Colors
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '48px', fontWeight: '300', marginBottom: '8px' }}>
                    {project.webpages.length}
                  </p>
                  <p style={{ fontSize: '13px', fontFamily: '"DM Sans", system-ui, sans-serif', color: '#888' }}>
                    Pages Designed
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '48px', fontWeight: '300', marginBottom: '8px' }}>
                    {project.animations.length}
                  </p>
                  <p style={{ fontSize: '13px', fontFamily: '"DM Sans", system-ui, sans-serif', color: '#888' }}>
                    Animation Files
                  </p>
                </div>
                {(project.collateral?.length > 0) && (
                  <div>
                    <p style={{ fontSize: '48px', fontWeight: '300', marginBottom: '8px' }}>
                      {project.collateral.length}
                    </p>
                    <p style={{ fontSize: '13px', fontFamily: '"DM Sans", system-ui, sans-serif', color: '#888' }}>
                      Collateral Files
                    </p>
                  </div>
                )}
              </div>

              {/* Figma Link */}
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
                <EditableField
                  value={project.figmaLink}
                  onChange={(val) => updateProject('figmaLink', val)}
                  placeholder="Paste Figma link..."
                  style={{
                    fontSize: '16px',
                    color: '#2C2C2C',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                  }}
                />
              </div>
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
                  {/* Bulk Upload Zone */}
                  {isAdmin && (
                    <FileUploadZone
                      accept=".pdf"
                      multiple={true}
                      onUpload={(files) => {
                        const fileArray = Array.isArray(files) ? files : [files];
                        handleBulkUpload('research', fileArray, (file) => ({
                          id: Date.now() + Math.random(),
                          name: file.name.replace(/\.[^/.]+$/, ''),
                          fileType: 'PDF',
                          description: '',
                          uploadDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                          file: null,
                        }));
                      }}
                      style={{
                        padding: '24px',
                        textAlign: 'center',
                        borderRadius: '4px',
                        backgroundColor: '#FAF9F7',
                      }}
                    >
                      <p style={{
                        fontSize: '13px',
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                        color: '#888',
                        margin: 0,
                      }}>
                        {bulkUploadProgress ? `Uploading ${bulkUploadProgress.current} of ${bulkUploadProgress.total}...` : 'Drop PDFs here or click to select multiple'}
                      </p>
                    </FileUploadZone>
                  )}

                  {project.research.documents.map((doc, index) => (
                    <div 
                      key={doc.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '24px 32px',
                        border: '1px solid #E8E4DE',
                        backgroundColor: '#fff',
                        position: 'relative',
                      }}
                    >
                      {/* Remove button */}
                      <button
                        onClick={() => {
                          setProject(prev => ({
                            ...prev,
                            research: {
                              ...prev.research,
                              documents: prev.research.documents.filter(d => d.id !== doc.id)
                            }
                          }));
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#ccc',
                          fontSize: '16px',
                        }}
                      >
                        ×
                      </button>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                        {/* PDF Icon / Upload Zone */}
                        <FileUploadZone
                          accept=".pdf"
                          onUpload={(file) => {
                            setProject(prev => ({
                              ...prev,
                              research: {
                                ...prev.research,
                                documents: prev.research.documents.map(d => 
                                  d.id === doc.id ? { ...d, file: file.name } : d
                                )
                              }
                            }));
                          }}
                          style={{
                            width: '64px',
                            height: '72px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            backgroundColor: doc.file ? '#E8F5E8' : '#FAF9F7',
                            borderRadius: '4px',
                          }}
                        >
                          <span style={{
                            fontSize: '10px',
                            fontFamily: '"DM Sans", system-ui, sans-serif',
                            fontWeight: '600',
                            color: doc.file ? '#2D5A2D' : '#A89585',
                          }}>
                            {doc.file ? '✓ PDF' : '+ PDF'}
                          </span>
                        </FileUploadZone>
                        
                        <div style={{ flex: 1 }}>
                          <EditableField
                            value={doc.name}
                            onChange={(val) => {
                              setProject(prev => ({
                                ...prev,
                                research: {
                                  ...prev.research,
                                  documents: prev.research.documents.map(d => 
                                    d.id === doc.id ? { ...d, name: val } : d
                                  )
                                }
                              }));
                            }}
                            placeholder="Document name"
                            style={{
                              fontSize: '17px',
                              fontWeight: '500',
                              marginBottom: '6px',
                            }}
                          />
                          <EditableField
                            value={doc.description}
                            onChange={(val) => {
                              setProject(prev => ({
                                ...prev,
                                research: {
                                  ...prev.research,
                                  documents: prev.research.documents.map(d => 
                                    d.id === doc.id ? { ...d, description: val } : d
                                  )
                                }
                              }));
                            }}
                            placeholder="Description"
                            style={{
                              fontSize: '14px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              color: '#888',
                            }}
                          />
                        </div>
                      </div>
                      
                      <button 
                        disabled={!doc.file}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: 'transparent',
                          border: '1px solid #2C2C2C',
                          cursor: doc.file ? 'pointer' : 'not-allowed',
                          fontSize: '11px',
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          fontWeight: '500',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          opacity: doc.file ? 1 : 0.4,
                        }}
                      >
                        View PDF
                      </button>
                    </div>
                  ))}
                  
                  {/* Add Document Button */}
                  <button
                    onClick={() => {
                      setProject(prev => ({
                        ...prev,
                        research: {
                          ...prev.research,
                          documents: [...prev.research.documents, {
                            id: Date.now(),
                            name: "",
                            fileType: "PDF",
                            description: "",
                            uploadDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                            file: null
                          }]
                        }
                      }));
                    }}
                    style={{
                      padding: '20px',
                      border: '2px dashed #E8E4DE',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      color: '#888',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    + Add Document
                  </button>
                </div>
              </div>

              {/* Strategy Notes */}
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
                  {project.research.notes.map((note) => (
                    <div 
                      key={note.id}
                      style={{
                        padding: '32px',
                        border: '1px solid #E8E4DE',
                        backgroundColor: '#fff',
                        borderLeft: '3px solid #A89585',
                        position: 'relative',
                      }}
                    >
                      <button
                        onClick={() => {
                          setProject(prev => ({
                            ...prev,
                            research: {
                              ...prev.research,
                              notes: prev.research.notes.filter(n => n.id !== note.id)
                            }
                          }));
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#ccc',
                          fontSize: '16px',
                        }}
                      >
                        ×
                      </button>
                      
                      <EditableField
                        value={note.title}
                        onChange={(val) => {
                          setProject(prev => ({
                            ...prev,
                            research: {
                              ...prev.research,
                              notes: prev.research.notes.map(n => 
                                n.id === note.id ? { ...n, title: val } : n
                              )
                            }
                          }));
                        }}
                        placeholder="Note title"
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          marginBottom: '16px',
                        }}
                      />
                      <EditableField
                        value={note.content}
                        onChange={(val) => {
                          setProject(prev => ({
                            ...prev,
                            research: {
                              ...prev.research,
                              notes: prev.research.notes.map(n => 
                                n.id === note.id ? { ...n, content: val } : n
                              )
                            }
                          }));
                        }}
                        placeholder="Note content..."
                        multiline
                        style={{
                          fontSize: '16px',
                          lineHeight: 1.7,
                          color: '#444',
                        }}
                      />
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      setProject(prev => ({
                        ...prev,
                        research: {
                          ...prev.research,
                          notes: [...prev.research.notes, {
                            id: Date.now(),
                            title: "",
                            content: "",
                            author: "Strategy Team",
                            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          }]
                        }
                      }));
                    }}
                    style={{
                      padding: '20px',
                      border: '2px dashed #E8E4DE',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      color: '#888',
                    }}
                  >
                    + Add Note
                  </button>
                </div>
              </div>
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

              {/* Bulk Upload Zone */}
              {isAdmin && (
                <FileUploadZone
                  accept="image/*,.svg,.pdf,application/pdf"
                  multiple={true}
                  onUpload={(files) => {
                    const fileArray = Array.isArray(files) ? files : [files];
                    handleBulkUpload('logos', fileArray, (file) => {
                      const name = file.name.replace(/\.[^/.]+$/, '');
                      return {
                        id: Date.now() + Math.random(),
                        name: name,
                        format: file.name.split('.').pop().toUpperCase(),
                        usage: '',
                        preview: '◈',
                        file: null,
                        fileUrl: null,
                      };
                    });
                  }}
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    borderRadius: '4px',
                    backgroundColor: '#FAF9F7',
                    marginBottom: '32px',
                  }}
                >
                  <p style={{
                    fontSize: '13px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#888',
                    margin: 0,
                  }}>
                    {bulkUploadProgress ? `Uploading ${bulkUploadProgress.current} of ${bulkUploadProgress.total}...` : 'Drop logo files here or click to select multiple (SVG, PNG, PDF)'}
                  </p>
                </FileUploadZone>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '32px',
              }}>
                {project.logos.map((logo) => (
                  <div 
                    key={logo.id}
                    style={{
                      border: '1px solid #E8E4DE',
                      backgroundColor: '#fff',
                      position: 'relative',
                    }}
                  >
                    <button
                      onClick={() => removeItem('logos', logo.id)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#fff',
                        border: '1px solid #E8E4DE',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        color: '#888',
                        fontSize: '14px',
                        zIndex: 10,
                      }}
                    >
                      ×
                    </button>
                    
                    {/* Logo Preview / Upload Zone */}
                    <FileUploadZone
                      accept="image/*,.svg,.pdf,application/pdf"
                      onUpload={(file) => handleFileUpload('logos', logo.id, file)}
                      style={{
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        backgroundColor: '#FAF9F7',
                        borderBottom: '1px solid #E8E4DE',
                      }}
                    >
                      {logo.fileUrl ? (
                        <img src={logo.fileUrl} alt={logo.name} style={{ maxHeight: '120px', maxWidth: '80%' }} />
                      ) : (
                        <>
                          <span style={{
                            fontSize: logo.preview.length > 2 ? '42px' : '64px',
                            fontWeight: '400',
                            letterSpacing: '-0.02em',
                            marginBottom: '12px',
                          }}>
                            {logo.preview}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontFamily: '"DM Sans", system-ui, sans-serif',
                            color: '#A89585',
                          }}>
                            Click or drag to upload
                          </span>
                        </>
                      )}
                    </FileUploadZone>
                    
                    <div style={{ padding: '24px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px',
                      }}>
                        <EditableField
                          value={logo.name}
                          onChange={(val) => {
                            setProject(prev => ({
                              ...prev,
                              logos: prev.logos.map(l => l.id === logo.id ? { ...l, name: val } : l)
                            }));
                          }}
                          placeholder="Logo name"
                          style={{ fontSize: '18px', fontWeight: '500' }}
                        />
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
                      <EditableField
                        value={logo.usage}
                        onChange={(val) => {
                          setProject(prev => ({
                            ...prev,
                            logos: prev.logos.map(l => l.id === logo.id ? { ...l, usage: val } : l)
                          }));
                        }}
                        placeholder="Usage notes"
                        style={{
                          fontSize: '14px',
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          color: '#666',
                          lineHeight: 1.5,
                        }}
                      />
                      <button 
                        disabled={!logo.file}
                        style={{
                          marginTop: '20px',
                          padding: '10px 20px',
                          backgroundColor: 'transparent',
                          border: '1px solid #2C2C2C',
                          cursor: logo.file ? 'pointer' : 'not-allowed',
                          fontSize: '11px',
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          fontWeight: '500',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          opacity: logo.file ? 1 : 0.5,
                        }}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Add Logo Button */}
                <button
                  onClick={() => addItem('logos', {
                    name: "",
                    format: "SVG, PNG",
                    usage: "",
                    preview: "◈",
                    file: null
                  })}
                  style={{
                    height: '300px',
                    border: '2px dashed #E8E4DE',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#888',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  + Add Logo
                </button>
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
                {project.colors.map((color) => (
                  <div 
                    key={color.id}
                    style={{
                      border: '1px solid #E8E4DE',
                      backgroundColor: '#fff',
                      position: 'relative',
                    }}
                  >
                    <button
                      onClick={() => removeItem('colors', color.id)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(255,255,255,0.9)',
                        border: '1px solid #E8E4DE',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        color: '#888',
                        fontSize: '14px',
                        zIndex: 10,
                      }}
                    >
                      ×
                    </button>
                    
                    {/* Color Swatch with picker */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => {
                          const hex = e.target.value;
                          const r = parseInt(hex.slice(1, 3), 16);
                          const g = parseInt(hex.slice(3, 5), 16);
                          const b = parseInt(hex.slice(5, 7), 16);
                          setProject(prev => ({
                            ...prev,
                            colors: prev.colors.map(c => c.id === color.id ? {
                              ...c,
                              hex: hex.toUpperCase(),
                              rgb: `${r}, ${g}, ${b}`
                            } : c)
                          }));
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '140px',
                          opacity: 0,
                          cursor: 'pointer',
                        }}
                      />
                      <div style={{
                        height: '140px',
                        backgroundColor: color.hex,
                      }} />
                    </div>
                    
                    <div style={{ padding: '20px' }}>
                      <EditableField
                        value={color.name}
                        onChange={(val) => {
                          setProject(prev => ({
                            ...prev,
                            colors: prev.colors.map(c => c.id === color.id ? { ...c, name: val } : c)
                          }));
                        }}
                        placeholder="Color name"
                        style={{ fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}
                      />
                      
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
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
                      
                      <EditableField
                        value={color.usage}
                        onChange={(val) => {
                          setProject(prev => ({
                            ...prev,
                            colors: prev.colors.map(c => c.id === color.id ? { ...c, usage: val } : c)
                          }));
                        }}
                        placeholder="Usage notes"
                        style={{
                          fontSize: '13px',
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          color: '#888',
                          lineHeight: 1.5,
                        }}
                      />
                    </div>
                  </div>
                ))}
                
                {/* Add Color Button */}
                <button
                  onClick={() => addItem('colors', {
                    name: "",
                    hex: "#CCCCCC",
                    rgb: "204, 204, 204",
                    usage: ""
                  })}
                  style={{
                    minHeight: '250px',
                    border: '2px dashed #E8E4DE',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#888',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  + Add Color
                </button>
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

              {/* Bulk Upload Zone */}
              {isAdmin && (
                <FileUploadZone
                  accept=".ttf,.otf,.woff,.woff2"
                  multiple={true}
                  onUpload={(files) => {
                    const fileArray = Array.isArray(files) ? files : [files];
                    handleBulkUpload('typography', fileArray, (file) => {
                      const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                      return {
                        id: Date.now() + Math.random(),
                        name: name,
                        family: '',
                        weight: '400',
                        usage: '',
                        file: null,
                        fileUrl: null,
                      };
                    });
                  }}
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    borderRadius: '4px',
                    backgroundColor: '#FAF9F7',
                    marginBottom: '32px',
                  }}
                >
                  <p style={{
                    fontSize: '13px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#888',
                    margin: 0,
                  }}>
                    {bulkUploadProgress ? `Uploading ${bulkUploadProgress.current} of ${bulkUploadProgress.total}...` : 'Drop font files here or click to select multiple (TTF, OTF, WOFF, WOFF2)'}
                  </p>
                </FileUploadZone>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {project.typography.map((type, index) => (
                  <div 
                    key={type.id}
                    style={{
                      padding: '40px',
                      border: '1px solid #E8E4DE',
                      backgroundColor: '#fff',
                      position: 'relative',
                    }}
                  >
                    <button
                      onClick={() => removeItem('typography', type.id)}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: '1px solid #E8E4DE',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        color: '#888',
                        fontSize: '16px',
                      }}
                    >
                      ×
                    </button>
                    
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
                          {romanNumerals[index]}.{' '}
                          <EditableField
                            value={type.name}
                            onChange={(val) => {
                              setProject(prev => ({
                                ...prev,
                                typography: prev.typography.map(t => t.id === type.id ? { ...t, name: val } : t)
                              }));
                            }}
                            placeholder="Type name"
                            style={{
                              display: 'inline',
                              fontSize: '12px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              color: '#A89585',
                              fontWeight: '500',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                            }}
                          />
                        </span>
                        <div style={{ marginTop: '12px' }}>
                          <EditableField
                            value={type.family}
                            onChange={(val) => {
                              setProject(prev => ({
                                ...prev,
                                typography: prev.typography.map(t => t.id === type.id ? { ...t, family: val } : t)
                              }));
                            }}
                            placeholder="Font family"
                            style={{ fontSize: '24px', fontWeight: '400' }}
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <FileUploadZone
                          accept=".ttf,.otf,.woff,.woff2"
                          onUpload={(file) => handleFileUpload('typography', type.id, file)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: type.file ? '#E8F5E8' : '#FAF9F7',
                            borderRadius: '2px',
                            fontSize: '12px',
                            fontFamily: '"DM Sans", system-ui, sans-serif',
                          }}
                        >
                          {type.file ? `✓ ${type.file}` : '+ Upload Font'}
                        </FileUploadZone>
                        
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
                        fontFamily: 'inherit',
                        fontWeight: '400',
                        lineHeight: type.name === 'Display' ? 1.1 : 1.6,
                        margin: 0,
                        letterSpacing: type.name === 'Display' ? '-0.02em' : 'normal',
                      }}>
                        The quick brown fox jumps over the lazy dog
                      </p>
                    </div>

                    <EditableField
                      value={type.usage}
                      onChange={(val) => {
                        setProject(prev => ({
                          ...prev,
                          typography: prev.typography.map(t => t.id === type.id ? { ...t, usage: val } : t)
                        }));
                      }}
                      placeholder="Usage notes"
                      style={{
                        fontSize: '14px',
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                        color: '#666',
                      }}
                    />
                  </div>
                ))}
                
                {/* Add Typography Button */}
                <button
                  onClick={() => addItem('typography', {
                    name: "",
                    family: "",
                    weight: "400",
                    usage: "",
                    file: null
                  })}
                  style={{
                    padding: '40px',
                    border: '2px dashed #E8E4DE',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#888',
                  }}
                >
                  + Add Typography Style
                </button>
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

              {/* Bulk Upload Zone */}
              {isAdmin && (
                <FileUploadZone
                  accept=".json,.mp4,.c4d,.obj,.fbx,video/mp4"
                  multiple={true}
                  onUpload={(files) => {
                    const fileArray = Array.isArray(files) ? files : [files];
                    handleBulkUpload('animations', fileArray, (file) => {
                      const name = file.name.replace(/\.[^/.]+$/, '');
                      const ext = file.name.split('.').pop().toLowerCase();
                      let animationType = 'lottie';
                      let format = 'Lottie JSON';
                      if (ext === 'mp4' || file.type.startsWith('video/')) { animationType = 'video'; format = 'MP4'; }
                      else if (['c4d', 'obj', 'fbx'].includes(ext)) { animationType = '3d'; format = ext.toUpperCase(); }
                      return {
                        id: Date.now() + Math.random(),
                        name: name,
                        animationType: animationType,
                        format: format,
                        notes: '',
                        file: null,
                        fileUrl: null,
                        animationData: null,
                        videoUrl: null,
                        installInstructions: '',
                        embedUrl: '',
                      };
                    });
                  }}
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    borderRadius: '4px',
                    backgroundColor: '#FAF9F7',
                    marginBottom: '24px',
                  }}
                >
                  <p style={{
                    fontSize: '13px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#888',
                    margin: 0,
                  }}>
                    {bulkUploadProgress ? `Uploading ${bulkUploadProgress.current} of ${bulkUploadProgress.total}...` : 'Drop animation files here or click to select multiple (JSON, MP4, C4D, OBJ, FBX)'}
                  </p>
                </FileUploadZone>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {project.animations.map((anim, index) => (
                  <div 
                    key={anim.id}
                    style={{
                      border: '1px solid #E8E4DE',
                      backgroundColor: '#fff',
                      position: 'relative',
                    }}
                  >
                    <button
                      onClick={() => removeItem('animations', anim.id)}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: '1px solid #E8E4DE',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        color: '#888',
                        fontSize: '16px',
                        zIndex: 10,
                      }}
                    >
                      ×
                    </button>
                    
                    <div style={{ display: 'flex' }}>
                      {/* Animation Preview */}
                      <div style={{ width: '280px', padding: '24px', borderRight: '1px solid #E8E4DE' }}>
                        {/* Type Selector */}
                        <div style={{ marginBottom: '16px' }}>
                          <p style={{
                            fontSize: '10px',
                            fontFamily: '"DM Sans", system-ui, sans-serif',
                            fontWeight: '500',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: '#A89585',
                            marginBottom: '8px',
                          }}>
                            Animation Type
                          </p>
                          <select
                            value={anim.animationType || 'lottie'}
                            onChange={(e) => {
                              setProject(prev => ({
                                ...prev,
                                animations: prev.animations.map(a => a.id === anim.id ? { 
                                  ...a, 
                                  animationType: e.target.value,
                                  format: e.target.value === 'lottie' ? 'Lottie JSON' : 
                                          e.target.value === 'video' ? 'MP4' :
                                          e.target.value === 'c4d' ? 'Cinema 4D' : 'Unicorn Studio'
                                } : a)
                              }));
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              fontSize: '13px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              border: '1px solid #E8E4DE',
                              borderRadius: '2px',
                              backgroundColor: '#FAF9F7',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="lottie">Lottie JSON</option>
                            <option value="video">Video (MP4)</option>
                            <option value="c4d">Cinema 4D</option>
                            <option value="unicorn">Unicorn Studio</option>
                          </select>
                        </div>

                        {/* Preview Area - varies by type */}
                        {(anim.animationType === 'lottie' || !anim.animationType) && (
                          <FileUploadZone
                            accept=".json"
                            onUpload={(file) => handleFileUpload('animations', anim.id, file)}
                            style={{
                              height: '140px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                              backgroundColor: '#FAF9F7',
                              borderRadius: '4px',
                            }}
                          >
                            {anim.animationData ? (
                              <LottiePreview animationData={anim.animationData} />
                            ) : (
                              <>
                                <span style={{ fontSize: '24px', marginBottom: '8px' }}>◈</span>
                                <span style={{
                                  fontSize: '11px',
                                  fontFamily: '"DM Sans", system-ui, sans-serif',
                                  color: '#888',
                                  textAlign: 'center',
                                }}>
                                  Drop Lottie JSON
                                </span>
                              </>
                            )}
                          </FileUploadZone>
                        )}

                        {anim.animationType === 'video' && (
                          <FileUploadZone
                            accept="video/mp4,video/*"
                            onUpload={(file) => {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setProject(prev => ({
                                  ...prev,
                                  animations: prev.animations.map(a => 
                                    a.id === anim.id ? { ...a, file: file.name, videoUrl: e.target.result } : a
                                  )
                                }));
                              };
                              reader.readAsDataURL(file);
                            }}
                            style={{
                              height: '140px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                              backgroundColor: '#FAF9F7',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            {anim.videoUrl ? (
                              <video 
                                src={anim.videoUrl} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                controls
                                muted
                                loop
                              />
                            ) : (
                              <>
                                <span style={{ fontSize: '24px', marginBottom: '8px' }}>▶</span>
                                <span style={{
                                  fontSize: '11px',
                                  fontFamily: '"DM Sans", system-ui, sans-serif',
                                  color: '#888',
                                  textAlign: 'center',
                                }}>
                                  Drop MP4 video
                                </span>
                              </>
                            )}
                          </FileUploadZone>
                        )}

                        {anim.animationType === 'c4d' && (
                          <FileUploadZone
                            accept=".c4d,.obj,.fbx"
                            onUpload={(file) => {
                              setProject(prev => ({
                                ...prev,
                                animations: prev.animations.map(a => 
                                  a.id === anim.id ? { ...a, file: file.name } : a
                                )
                              }));
                            }}
                            style={{
                              height: '140px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                              backgroundColor: '#FAF9F7',
                              borderRadius: '4px',
                            }}
                          >
                            {anim.file ? (
                              <div style={{ textAlign: 'center' }}>
                                <span style={{ 
                                  fontSize: '32px', 
                                  marginBottom: '8px', 
                                  display: 'block',
                                  color: '#A89585' 
                                }}>
                                  ⬡
                                </span>
                                <span style={{
                                  fontSize: '12px',
                                  fontFamily: '"DM Sans", system-ui, sans-serif',
                                  color: '#2D5A2D',
                                  fontWeight: '500',
                                }}>
                                  ✓ {anim.file}
                                </span>
                              </div>
                            ) : (
                              <>
                                <span style={{ fontSize: '24px', marginBottom: '8px' }}>⬡</span>
                                <span style={{
                                  fontSize: '11px',
                                  fontFamily: '"DM Sans", system-ui, sans-serif',
                                  color: '#888',
                                  textAlign: 'center',
                                }}>
                                  Drop C4D / OBJ / FBX
                                </span>
                              </>
                            )}
                          </FileUploadZone>
                        )}

                        {anim.animationType === 'unicorn' && (
                          <div style={{
                            height: '140px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '4px',
                          }}>
                            <span style={{ fontSize: '32px', marginBottom: '8px' }}>🦄</span>
                            <span style={{
                              fontSize: '12px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              color: '#fff',
                              fontWeight: '500',
                            }}>
                              Unicorn Studio
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Animation Info */}
                      <div style={{ flex: 1, padding: '28px 32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
                          <span style={{
                            fontSize: '14px',
                            fontFamily: '"DM Sans", system-ui, sans-serif',
                            color: '#A89585',
                          }}>
                            {romanNumerals[index]}
                          </span>
                          <EditableField
                            value={anim.name}
                            onChange={(val) => {
                              setProject(prev => ({
                                ...prev,
                                animations: prev.animations.map(a => a.id === anim.id ? { ...a, name: val } : a)
                              }));
                            }}
                            placeholder="Animation name"
                            style={{ fontSize: '18px', fontWeight: '500' }}
                          />
                        </div>
                        
                        <EditableField
                          value={anim.notes}
                          onChange={(val) => {
                            setProject(prev => ({
                              ...prev,
                              animations: prev.animations.map(a => a.id === anim.id ? { ...a, notes: val } : a)
                            }));
                          }}
                          placeholder="Animation notes (trigger, duration, easing...)"
                          multiline
                          style={{
                            fontSize: '14px',
                            fontFamily: '"DM Sans", system-ui, sans-serif',
                            color: '#666',
                            marginBottom: '16px',
                            lineHeight: 1.6,
                          }}
                        />

                        {/* Unicorn Studio Installation Instructions */}
                        {anim.animationType === 'unicorn' && (
                          <div style={{
                            marginBottom: '16px',
                            padding: '16px',
                            backgroundColor: '#FAF9F7',
                            border: '1px solid #E8E4DE',
                            borderRadius: '4px',
                          }}>
                            <p style={{
                              fontSize: '11px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              fontWeight: '500',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              color: '#A89585',
                              marginBottom: '12px',
                            }}>
                              Installation Instructions
                            </p>
                            <EditableField
                              value={anim.installInstructions || ''}
                              onChange={(val) => {
                                setProject(prev => ({
                                  ...prev,
                                  animations: prev.animations.map(a => a.id === anim.id ? { ...a, installInstructions: val } : a)
                                }));
                              }}
                              placeholder="Paste embed code or installation steps here..."
                              multiline
                              style={{
                                fontSize: '13px',
                                fontFamily: '"DM Mono", monospace',
                                color: '#444',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                              }}
                            />
                            
                            {/* Embed URL field */}
                            <div style={{ marginTop: '12px' }}>
                              <p style={{
                                fontSize: '10px',
                                fontFamily: '"DM Sans", system-ui, sans-serif',
                                fontWeight: '500',
                                color: '#888',
                                marginBottom: '6px',
                              }}>
                                Unicorn Studio URL
                              </p>
                              <EditableField
                                value={anim.embedUrl || ''}
                                onChange={(val) => {
                                  setProject(prev => ({
                                    ...prev,
                                    animations: prev.animations.map(a => a.id === anim.id ? { ...a, embedUrl: val } : a)
                                  }));
                                }}
                                placeholder="https://unicorn.studio/embed/..."
                                style={{
                                  fontSize: '12px',
                                  fontFamily: '"DM Mono", monospace',
                                  color: '#666',
                                  backgroundColor: '#fff',
                                  padding: '8px',
                                  border: '1px solid #E8E4DE',
                                  width: '100%',
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '12px',
                            fontFamily: '"DM Mono", monospace',
                            color: '#888',
                            backgroundColor: '#FAF9F7',
                            padding: '6px 12px',
                            border: '1px solid #E8E4DE',
                          }}>
                            {anim.file || anim.format}
                          </span>
                          
                          {anim.animationType !== 'unicorn' && (
                            <button 
                              disabled={!anim.file}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                border: '1px solid #2C2C2C',
                                cursor: anim.file ? 'pointer' : 'not-allowed',
                                fontSize: '11px',
                                fontFamily: '"DM Sans", system-ui, sans-serif',
                                fontWeight: '500',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                opacity: anim.file ? 1 : 0.5,
                              }}
                            >
                              Download
                            </button>
                          )}
                          
                          {anim.animationType === 'unicorn' && anim.embedUrl && (
                            <a
                              href={anim.embedUrl}
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
                              Open in Unicorn Studio →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Animation Button */}
                <button
                  onClick={() => addItem('animations', {
                    name: "",
                    animationType: "lottie",
                    format: "Lottie JSON",
                    notes: "",
                    file: null,
                    animationData: null,
                    videoUrl: null,
                    installInstructions: "",
                    embedUrl: ""
                  })}
                  style={{
                    padding: '32px',
                    border: '2px dashed #E8E4DE',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#888',
                  }}
                >
                  + Add Animation
                </button>
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

              {/* Bulk Upload Zone — Screenshots */}
              {isAdmin && (
                <FileUploadZone
                  accept="image/*"
                  multiple={true}
                  onUpload={(files) => {
                    const fileArray = Array.isArray(files) ? files : [files];
                    handleBulkUpload('webpages', fileArray, (file) => {
                      const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                      return {
                        id: Date.now() + Math.random(),
                        name: name,
                        status: 'In progress',
                        figmaLink: '',
                        screenshot: null,
                        _isScreenshot: true,
                        notes: '',
                        additionalNotes: [],
                        links: [],
                      };
                    });
                  }}
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    borderRadius: '4px',
                    backgroundColor: '#FAF9F7',
                    marginBottom: '32px',
                  }}
                >
                  <p style={{
                    fontSize: '13px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#888',
                    margin: 0,
                  }}>
                    {bulkUploadProgress ? `Uploading ${bulkUploadProgress.current} of ${bulkUploadProgress.total}...` : 'Drop screenshots here or click to select multiple (PNG, JPG)'}
                  </p>
                </FileUploadZone>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {project.webpages.map((page, index) => (
                  <div 
                    key={page.id}
                    style={{
                      border: '1px solid #E8E4DE',
                      backgroundColor: '#fff',
                      position: 'relative',
                    }}
                  >
                    <button
                      onClick={() => removeItem('webpages', page.id)}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: '#fff',
                        border: '1px solid #E8E4DE',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        color: '#888',
                        fontSize: '16px',
                        zIndex: 10,
                      }}
                    >
                      ×
                    </button>
                    
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
                        <EditableField
                          value={page.name}
                          onChange={(val) => {
                            setProject(prev => ({
                              ...prev,
                              webpages: prev.webpages.map(p => p.id === page.id ? { ...p, name: val } : p)
                            }));
                          }}
                          placeholder="Page name"
                          style={{ fontSize: '24px', fontWeight: '400' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <a 
                          href={page.figmaLink || '#'}
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
                            transition: 'all 0.2s ease',
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
                        <select
                          value={page.status}
                          onChange={(e) => {
                            setProject(prev => ({
                              ...prev,
                              webpages: prev.webpages.map(p => p.id === page.id ? { ...p, status: e.target.value } : p)
                            }));
                          }}
                          style={{
                            fontSize: '11px',
                            fontFamily: '"DM Sans", system-ui, sans-serif',
                            fontWeight: '500',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            padding: '6px 14px',
                            backgroundColor: page.status === 'Ready for dev' ? '#E8F5E8' : '#FFF8E8',
                            color: page.status === 'Ready for dev' ? '#2D5A2D' : '#8B6914',
                            border: 'none',
                            borderRadius: '2px',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="Ready for dev">Ready for dev</option>
                          <option value="In review">In review</option>
                          <option value="In progress">In progress</option>
                        </select>
                      </div>
                    </div>

                    {/* Page Content */}
                    <div style={{ display: 'flex' }}>
                      {/* Screenshot */}
                      <FileUploadZone
                        accept="image/*"
                        onUpload={(file) => {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setProject(prev => ({
                              ...prev,
                              webpages: prev.webpages.map(p => p.id === page.id ? { ...p, screenshot: e.target.result } : p)
                            }));
                          };
                          reader.readAsDataURL(file);
                        }}
                        style={{
                          width: '360px',
                          minHeight: '270px',
                          backgroundColor: '#F0EDE8',
                          borderRight: '1px solid #E8E4DE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          gap: '12px',
                          padding: '24px',
                        }}
                      >
                        {page.screenshot ? (
                          <img 
                            src={page.screenshot} 
                            alt={page.name} 
                            style={{ 
                              width: '100%', 
                              height: '180px', 
                              objectFit: 'cover',
                              border: '1px solid #DDD8D2',
                            }} 
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '180px',
                            backgroundColor: '#E8E4DE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            border: '1px solid #DDD8D2',
                          }}>
                            <span style={{
                              fontSize: '12px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              color: '#888',
                            }}>
                              Click or drag to upload screenshot
                            </span>
                          </div>
                        )}
                        {page.screenshot && (
                          <button style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            border: '1px solid #A89585',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontFamily: '"DM Sans", system-ui, sans-serif',
                            fontWeight: '500',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#A89585',
                          }}>
                            View Full Size
                          </button>
                        )}
                      </FileUploadZone>

                      {/* Page Details */}
                      <div style={{ flex: 1, padding: '32px' }}>
                        {/* Figma Link */}
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
                            Figma Link
                          </p>
                          <EditableField
                            value={page.figmaLink}
                            onChange={(val) => {
                              setProject(prev => ({
                                ...prev,
                                webpages: prev.webpages.map(p => p.id === page.id ? { ...p, figmaLink: val } : p)
                              }));
                            }}
                            placeholder="Paste Figma link..."
                            style={{
                              fontSize: '13px',
                              fontFamily: '"DM Mono", monospace',
                              color: '#666',
                              backgroundColor: '#FAF9F7',
                              padding: '8px 12px',
                              border: '1px solid #E8E4DE',
                              display: 'block',
                              width: '100%',
                            }}
                          />
                        </div>

                        {/* Primary Notes */}
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
                          <EditableField
                            value={page.notes}
                            onChange={(val) => {
                              setProject(prev => ({
                                ...prev,
                                webpages: prev.webpages.map(p => p.id === page.id ? { ...p, notes: val } : p)
                              }));
                            }}
                            placeholder="Development notes..."
                            multiline
                            style={{
                              fontSize: '15px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              lineHeight: 1.6,
                              color: '#444',
                            }}
                          />
                        </div>

                        {/* Additional Notes */}
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
                            {(page.additionalNotes || []).map((note, noteIndex) => (
                              <div 
                                key={noteIndex}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '12px',
                                  paddingBottom: noteIndex < page.additionalNotes.length - 1 ? '12px' : 0,
                                  marginBottom: noteIndex < page.additionalNotes.length - 1 ? '12px' : 0,
                                  borderBottom: noteIndex < page.additionalNotes.length - 1 ? '1px solid #E8E4DE' : 'none',
                                  position: 'relative',
                                }}
                              >
                                <span style={{
                                  fontSize: '10px',
                                  fontFamily: '"DM Sans", system-ui, sans-serif',
                                  color: '#A89585',
                                  marginTop: '4px',
                                }}>
                                  •
                                </span>
                                <EditableField
                                  value={note}
                                  onChange={(val) => {
                                    setProject(prev => ({
                                      ...prev,
                                      webpages: prev.webpages.map(p => p.id === page.id ? {
                                        ...p,
                                        additionalNotes: p.additionalNotes.map((n, i) => i === noteIndex ? val : n)
                                      } : p)
                                    }));
                                  }}
                                  placeholder="Note..."
                                  style={{
                                    fontSize: '14px',
                                    fontFamily: '"DM Sans", system-ui, sans-serif',
                                    lineHeight: 1.5,
                                    color: '#666',
                                    flex: 1,
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    setProject(prev => ({
                                      ...prev,
                                      webpages: prev.webpages.map(p => p.id === page.id ? {
                                        ...p,
                                        additionalNotes: p.additionalNotes.filter((_, i) => i !== noteIndex)
                                      } : p)
                                    }));
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#ccc',
                                    fontSize: '14px',
                                    padding: '0 4px',
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                setProject(prev => ({
                                  ...prev,
                                  webpages: prev.webpages.map(p => p.id === page.id ? {
                                    ...p,
                                    additionalNotes: [...(p.additionalNotes || []), ""]
                                  } : p)
                                }));
                              }}
                              style={{
                                marginTop: page.additionalNotes?.length ? '12px' : 0,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontFamily: '"DM Sans", system-ui, sans-serif',
                                color: '#A89585',
                                padding: 0,
                              }}
                            >
                              + Add note
                            </button>
                          </div>
                        </div>

                        {/* Links Table */}
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
                            {(page.links || []).map((link, linkIndex) => (
                              <div 
                                key={linkIndex}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '12px 16px',
                                  borderBottom: linkIndex < page.links.length - 1 ? '1px solid #E8E4DE' : 'none',
                                }}
                              >
                                <EditableField
                                  value={link.element}
                                  onChange={(val) => {
                                    setProject(prev => ({
                                      ...prev,
                                      webpages: prev.webpages.map(p => p.id === page.id ? {
                                        ...p,
                                        links: p.links.map((l, i) => i === linkIndex ? { ...l, element: val } : l)
                                      } : p)
                                    }));
                                  }}
                                  placeholder="Element name"
                                  style={{
                                    fontSize: '13px',
                                    fontFamily: '"DM Sans", system-ui, sans-serif',
                                    color: '#444',
                                  }}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <EditableField
                                    value={link.destination}
                                    onChange={(val) => {
                                      setProject(prev => ({
                                        ...prev,
                                        webpages: prev.webpages.map(p => p.id === page.id ? {
                                          ...p,
                                          links: p.links.map((l, i) => i === linkIndex ? { ...l, destination: val } : l)
                                        } : p)
                                      }));
                                    }}
                                    placeholder="/destination"
                                    style={{
                                      fontSize: '12px',
                                      fontFamily: '"DM Mono", monospace',
                                      color: '#A89585',
                                      backgroundColor: '#fff',
                                      padding: '2px 8px',
                                      border: '1px solid #E8E4DE',
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      setProject(prev => ({
                                        ...prev,
                                        webpages: prev.webpages.map(p => p.id === page.id ? {
                                          ...p,
                                          links: p.links.filter((_, i) => i !== linkIndex)
                                        } : p)
                                      }));
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      color: '#ccc',
                                      fontSize: '14px',
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                setProject(prev => ({
                                  ...prev,
                                  webpages: prev.webpages.map(p => p.id === page.id ? {
                                    ...p,
                                    links: [...(p.links || []), { element: "", destination: "" }]
                                  } : p)
                                }));
                              }}
                              style={{
                                width: '100%',
                                padding: '12px',
                                background: 'none',
                                border: 'none',
                                borderTop: page.links?.length ? '1px solid #E8E4DE' : 'none',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontFamily: '"DM Sans", system-ui, sans-serif',
                                color: '#A89585',
                              }}
                            >
                              + Add link mapping
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Page Button */}
                <button
                  onClick={() => addItem('webpages', {
                    name: "",
                    status: "In progress",
                    figmaLink: "",
                    screenshot: null,
                    notes: "",
                    additionalNotes: [],
                    links: []
                  })}
                  style={{
                    padding: '48px',
                    border: '2px dashed #E8E4DE',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#888',
                  }}
                >
                  + Add Web Page
                </button>
              </div>
            </section>
          )}

          {/* Collateral Section */}
          {activeSection === 'collateral' && (
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
                Collateral
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '32px',
              }}>
                {(project.collateral || []).map((item) => {
                  const isImage = item.fileUrl && /\.(png|jpe?g|gif|svg|webp)$/i.test(item.fileName || item.file || '');
                  return (
                    <div
                      key={item.id}
                      style={{
                        border: '1px solid #E8E4DE',
                        backgroundColor: '#fff',
                        position: 'relative',
                      }}
                    >
                      <button
                        onClick={() => removeItem('collateral', item.id)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: '#fff',
                          border: '1px solid #E8E4DE',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          color: '#888',
                          fontSize: '14px',
                          zIndex: 10,
                        }}
                      >
                        ×
                      </button>

                      <FileUploadZone
                        accept="*"
                        onUpload={(file) => handleFileUpload('collateral', item.id, file)}
                        style={{
                          height: '200px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          backgroundColor: '#FAF9F7',
                          borderBottom: '1px solid #E8E4DE',
                        }}
                      >
                        {item.fileUrl ? (
                          isImage ? (
                            <img src={item.fileUrl} alt={item.name} style={{ maxHeight: '120px', maxWidth: '80%', objectFit: 'contain' }} />
                          ) : (
                            <div style={{ textAlign: 'center' }}>
                              <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>📄</span>
                              <span style={{
                                fontSize: '11px',
                                fontFamily: '"DM Sans", system-ui, sans-serif',
                                color: '#888',
                              }}>
                                {item.fileName || item.file}
                              </span>
                            </div>
                          )
                        ) : (
                          <>
                            <span style={{ fontSize: '36px', marginBottom: '12px' }}>+</span>
                            <span style={{
                              fontSize: '11px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              color: '#A89585',
                            }}>
                              Click or drag to upload any file
                            </span>
                          </>
                        )}
                      </FileUploadZone>

                      <div style={{ padding: '24px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '16px',
                        }}>
                          <EditableField
                            value={item.name}
                            onChange={(val) => {
                              setProject(prev => ({
                                ...prev,
                                collateral: prev.collateral.map(c => c.id === item.id ? { ...c, name: val } : c)
                              }));
                            }}
                            placeholder="Item name (e.g. Business Card)"
                            style={{ fontSize: '18px', fontWeight: '500' }}
                          />
                          {item.fileType && (
                            <span style={{
                              fontSize: '11px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              color: '#888',
                              backgroundColor: '#F0EDE8',
                              padding: '4px 10px',
                              borderRadius: '2px',
                              flexShrink: 0,
                              marginLeft: '12px',
                            }}>
                              {item.fileType}
                            </span>
                          )}
                        </div>
                        <EditableField
                          value={item.description}
                          onChange={(val) => {
                            setProject(prev => ({
                              ...prev,
                              collateral: prev.collateral.map(c => c.id === item.id ? { ...c, description: val } : c)
                            }));
                          }}
                          placeholder="Description or usage notes"
                          multiline
                          style={{
                            fontSize: '14px',
                            fontFamily: '"DM Sans", system-ui, sans-serif',
                            color: '#666',
                            lineHeight: 1.5,
                          }}
                        />
                        {item.fileUrl && (
                          <a
                            href={item.fileUrl}
                            download={item.fileName || item.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              marginTop: '20px',
                              padding: '10px 20px',
                              backgroundColor: 'transparent',
                              border: '1px solid #2C2C2C',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontFamily: '"DM Sans", system-ui, sans-serif',
                              fontWeight: '500',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              textDecoration: 'none',
                              color: '#2C2C2C',
                            }}
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add Collateral Button */}
                <button
                  onClick={() => addItem('collateral', {
                    name: "",
                    description: "",
                    fileType: "",
                    file: null,
                    fileUrl: null,
                    fileName: null,
                  })}
                  style={{
                    height: '300px',
                    border: '2px dashed #E8E4DE',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#888',
                  }}
                >
                  + Add Collateral
                </button>
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

              <div style={{
                border: '1px solid #E8E4DE',
                backgroundColor: '#fff',
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
                      position: 'relative',
                    }}
                  >
                    <button
                      onClick={() => {
                        setProject(prev => ({
                          ...prev,
                          devNotes: prev.devNotes.filter((_, i) => i !== index)
                        }));
                      }}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '16px',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ccc',
                        fontSize: '16px',
                      }}
                    >
                      ×
                    </button>
                    
                    <span style={{
                      fontSize: '14px',
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      color: '#A89585',
                      minWidth: '32px',
                    }}>
                      {romanNumerals[index]}
                    </span>
                    <EditableField
                      value={note}
                      onChange={(val) => {
                        setProject(prev => ({
                          ...prev,
                          devNotes: prev.devNotes.map((n, i) => i === index ? val : n)
                        }));
                      }}
                      placeholder="Development note..."
                      style={{
                        fontSize: '15px',
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                        lineHeight: 1.6,
                        color: '#444',
                        flex: 1,
                      }}
                    />
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => {
                  setProject(prev => ({
                    ...prev,
                    devNotes: [...prev.devNotes, ""]
                  }));
                }}
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  width: '100%',
                  border: '2px dashed #E8E4DE',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  color: '#888',
                }}
              >
                + Add Note
              </button>

              {/* Help Docs Section */}
              <div style={{ marginTop: '64px' }}>
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
                  {(project.helpDocs || []).map((doc, index) => (
                    <div 
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px',
                        borderBottom: index < (project.helpDocs || []).length - 1 ? '1px solid #E8E4DE' : 'none',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
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
                        <div style={{ flex: 1 }}>
                          <EditableField
                            value={doc.title}
                            onChange={(val) => {
                              setProject(prev => ({
                                ...prev,
                                helpDocs: prev.helpDocs.map((d, i) => i === index ? { ...d, title: val } : d)
                              }));
                            }}
                            placeholder="Documentation title"
                            style={{
                              fontSize: '15px',
                              fontWeight: '500',
                              marginBottom: '4px',
                            }}
                          />
                          <EditableField
                            value={doc.url}
                            onChange={(val) => {
                              setProject(prev => ({
                                ...prev,
                                helpDocs: prev.helpDocs.map((d, i) => i === index ? { ...d, url: val } : d)
                              }));
                            }}
                            placeholder="https://..."
                            style={{
                              fontSize: '12px',
                              fontFamily: '"DM Mono", monospace',
                              color: '#888',
                            }}
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                        <button
                          onClick={() => {
                            setProject(prev => ({
                              ...prev,
                              helpDocs: prev.helpDocs.filter((_, i) => i !== index)
                            }));
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ccc',
                            fontSize: '18px',
                            padding: '4px',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {(!project.helpDocs || project.helpDocs.length === 0) && (
                    <div style={{
                      padding: '32px',
                      textAlign: 'center',
                      color: '#888',
                      fontSize: '14px',
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                    }}>
                      No documentation linked yet
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setProject(prev => ({
                      ...prev,
                      helpDocs: [...(prev.helpDocs || []), { title: "", url: "", description: "" }]
                    }));
                  }}
                  style={{
                    marginTop: '16px',
                    padding: '16px',
                    width: '100%',
                    border: '2px dashed #E8E4DE',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: '#888',
                  }}
                >
                  + Add Documentation Link
                </button>
              </div>
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

export default HandoffPlatform;
