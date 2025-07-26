import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';

const ReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const structured = useMemo(() => location.state?.structured || {}, [location.state]);

  const [linkedinSummary, setLinkedinSummary] = useState('');
  const [jdText, setJdText] = useState('');
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modifiedMap, setModifiedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions'); // State for active tab

  useEffect(() => {
    const extractBullets = () => {
      const bullets = [];

      const flatten = (val, parentKey = '') => {
        if (typeof val === 'string' && val.trim() !== '') {
          // Only add meaningful strings (not just section titles)
          // Adjusted length check to be more inclusive for education details
          if (val.length > 3 && !parentKey.toLowerCase().includes('title')) {
            bullets.push(val);
          }
        } else if (Array.isArray(val)) {
          val.forEach((item, index) => flatten(item, `${parentKey}_${index}`));
        } else if (typeof val === 'object' && val !== null) {
          Object.entries(val).forEach(([key, value]) => {
            flatten(value, key);
          });
        }
      };

      Object.entries(structured).forEach(([sectionName, sectionData]) => {
        flatten(sectionData, sectionName);
      });

      console.log('📝 Extracted Bullets to Improve:', bullets);
      return bullets;
    };


    const bullets = extractBullets();
    if (!bullets.length) {
      console.warn('⚠️ No bullet points found in structured data.');
      setLoading(false);
      return;
    }

    fetch('/api/improve-bullets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bullets })
    })
      .then(res => res.json())
      .then(data => {
        console.log('✅ Suggestions received from backend:', data.results);
        setImprovements(data.results || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error improving bullets:', err);
        setLoading(false);
      });
  }, [structured]);

  const getSuggestionData = (original) => {
    const suggestion = improvements.find(item => {
      // Exact match first
      if (item.original === original) return true;
      
      // Trim and compare (in case of whitespace issues)
      if (item.original.trim() === original.trim()) return true;
      
      // Check if the original text is contained within the suggestion's original
      // This is crucial for partial matches or slight variations
      if (item.original.includes(original) || original.includes(item.original)) return true;
      
      return false;
    });
    
    console.log('🔍 Looking for suggestion for:', original);
    console.log('🎯 Found suggestion:', suggestion);
    
    return suggestion;
  };


  const handleApply = (original) => {
    const improved = getSuggestionData(original)?.suggested;
    if (!improved) {
      console.warn(`No improved suggestion found for: ${original}`);
      return;
    }
    setModifiedMap(prev => ({ ...prev, [original]: improved }));
    console.log(`Applied: ${original} -> ${improved}`);
  };

  const handleIgnore = (original) => {
    setModifiedMap(prev => {
      const newMap = { ...prev };
      delete newMap[original];
      return newMap;
    });
    console.log(`Ignored: ${original}`);
  };

  const generateLinkedInSummary = () => {
    setSummaryLoading(true);
    fetch('/api/generate-linkedin-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structured })
    })
      .then(res => res.json())
      .then(data => {
        setLinkedinSummary(data.linkedin_summary || 'No summary generated.');
        setSummaryLoading(false);
      })
      .catch(err => {
        console.error('Error generating LinkedIn summary:', err);
        setLinkedinSummary('Error generating LinkedIn summary.');
        setSummaryLoading(false);
      });
  };

  const matchKeywords = () => {
    setKeywordLoading(true);
    fetch('/api/match-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structured, jd: jdText })
    })
      .then(res => res.json())
      .then(data => {
        setMissingKeywords(data.missing || []);
        setKeywordLoading(false);
      })
      .catch(err => {
        console.error('Error matching keywords:', err);
        setMissingKeywords(['Error matching keywords.']);
        setKeywordLoading(false);
      });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadModifiedResume = async () => {
    // Create a deep copy of the structured data to apply modifications
    const modifiedResume = JSON.parse(JSON.stringify(structured));
    
    // Apply all modifications from modifiedMap to the deep copy
    // This is the crucial part to ensure all changes are reflected
    Object.entries(modifiedMap).forEach(([original, improved]) => {
      replaceTextInObject(modifiedResume, original, improved);
    });

    try {
      const response = await fetch('/api/download-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: modifiedResume,
          modifications: Object.entries(modifiedMap).map(([original, improved]) => ({
            original,
            improved
          }))
        })

      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modified_resume.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  // REVISED replaceTextInObject function to handle nested structures more effectively
  // ✅ Enhanced and safe version — only update this
  const replaceTextInObject = (obj, original, replacement) => {
    if (typeof obj === 'string') {
      return obj.trim() === original.trim() ? replacement : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => replaceTextInObject(item, original, replacement));
    }

    if (typeof obj === 'object' && obj !== null) {
      const newObj = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = replaceTextInObject(value, original, replacement);
      }
      return newObj;
    }

    return obj;
  };



  const renderSection = (sectionName, sectionData) => (
    <div key={sectionName} className="resume-section-card">
      <h2 className="resume-section-heading">
        {sectionName}
      </h2>
      {Array.isArray(sectionData) ? (
        sectionData.map((item, idx) => {
          if (typeof item === 'object' && item !== null) {
            return Object.entries(item).map(([subheading, bullets], subIdx) => (
              <div key={`${idx}-${subIdx}`} className="mb-4">
                {subheading && <h4 className="text-lg font-semibold text-primary mb-2">{subheading}</h4>}
                <ul className="space-y-2">
                  {Array.isArray(bullets)
                    ? bullets.map((bullet, i) => {
                        const displayText = modifiedMap[bullet] || bullet;
                        const isModified = modifiedMap[bullet];
                        const isSelected = selected === bullet;
                        return (
                          <li
                            key={i}
                            onClick={() => {
                              console.log('🖱️ Clicked bullet:', bullet);
                              setSelected(bullet);
                              const suggestion = getSuggestionData(bullet);
                              console.log('💡 Found suggestion for clicked bullet:', suggestion);
                            }}
                            className={`bullet-item ${isModified ? 'modified' : ''} ${isSelected ? 'selected' : ''}`}
                          >
                            <span className="bullet-icon">•</span>
                            {displayText}
                          </li>
                        );
                      })
                    : typeof bullets === 'object'
                      ? Object.entries(bullets).map(([key, value], i) => (
                          <li key={i} className="bullet-item">
                            <span className="bullet-icon">•</span>
                            <strong className="text-primary">{key}:</strong> {value}
                          </li>
                        ))
                      : (
                        <li
                          onClick={() => {
                            console.log('🖱️ Clicked bullet:', bullets);
                            setSelected(bullets);
                            const suggestion = getSuggestionData(bullets);
                            console.log('💡 Found suggestion for clicked bullet:', suggestion);
                          }}
                          className={`bullet-item ${selected === bullets ? 'selected' : ''}`}
                        >
                          <span className="bullet-icon">•</span>
                          {bullets}
                        </li>
                      )}
                </ul>
              </div>
            ));
          }
          if (typeof item === 'string') {
            const displayText = modifiedMap[item] || item;
            const isModified = modifiedMap[item];
            const isSelected = selected === item;
            return (
              <ul key={idx} className="mb-4">
                <li
                  onClick={() => {
                    console.log('🖱️ Clicked bullet:', item);
                    setSelected(item);
                    const suggestion = getSuggestionData(item);
                    console.log('💡 Found suggestion for clicked bullet:', suggestion);
                  }}

                  className={`bullet-item ${isModified ? 'modified' : ''} ${isSelected ? 'selected' : ''}`}
                >
                  <span className="bullet-icon">•</span>
                  {displayText}
                </li>
              </ul>
            );
          }
          return null;
        })
      ) : typeof sectionData === 'object' ? (
        Object.entries(sectionData).map(([subheading, bullets], idx) => (
          <div key={idx} className="mb-4">
            {subheading && <h4 className="text-lg font-semibold text-primary mb-2">{subheading}</h4>}
            <ul className="space-y-2">
              {Array.isArray(bullets)
                ? bullets.map((bullet, i) => {
                    const displayText = modifiedMap[bullet] || bullet;
                    const isModified = modifiedMap[bullet];
                    const isSelected = selected === bullet;
                    return (
                      <li
                        key={i}
                        onClick={() => {
                          console.log('🖱️ Clicked bullet:', bullet);
                          setSelected(bullet);
                          const suggestion = getSuggestionData(bullet);
                          console.log('💡 Found suggestion for clicked bullet:', suggestion);
                        }}
                        className={`bullet-item ${isModified ? 'modified' : ''} ${isSelected ? 'selected' : ''}`}
                      >
                        <span className="bullet-icon">•</span>
                        {displayText}
                      </li>
                    );
                  })
                : typeof bullets === 'object'
                  ? Object.entries(bullets).map(([key, value], i) => (
                      <li key={i} className="bullet-item">
                        <span className="bullet-icon">•</span>
                        <strong className="text-primary">{key}:</strong> {value}
                      </li>
                    ))
                  : (
                    <li
                      onClick={() => {
                        console.log('🖱️ Clicked bullet:', bullets);
                        setSelected(bullets);
                        const suggestion = getSuggestionData(bullets);
                        console.log('💡 Found suggestion for clicked bullet:', suggestion);
                      }}
                      className={`bullet-item ${selected === bullets ? 'selected' : ''}`}
                    >
                      <span className="bullet-icon">•</span>
                      {bullets}
                    </li>
                  )}
            </ul>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground">No content available for this section.</p>
      )}
    </div>
  );

  const tabs = [
    { id: 'suggestions', label: 'AI Suggestions', icon: '💡' },
    { id: 'summary', label: 'LinkedIn Summary', icon: '💼' },
    { id: 'keywords', label: 'Keyword Analysis', icon: '🔍' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="nav-header py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="back-button"
            >
              <span>←</span>
              <span>Back to Upload</span>
            </button>
            <div className="h-6 w-px bg-border"></div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 icon-primary">📄</span>
              <h1 className="text-xl font-bold text-gradient">ResuMate</h1>
            </div>
          </div>
          <div className="text-sm-bold text-muted-foreground">
            Resume Analysis Results
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8">
        <div className="review-layout">
          {/* Left Panel - Resume Content */}
          <div className="resume-content-panel">
            <h1 className="main-analysis-heading">Resume Analysis</h1>
            <div className="mb-4">
              <button
                onClick={downloadModifiedResume}
                className="btn-primary px-4 py-2 flex items-center space-x-2"
              >
                <span>📥</span>
                <span>Download Modified Resume</span>
              </button>
            </div>

            
            <div className="scrollable-content">
              {Object.entries(structured).length === 0 ? (
                <div className="empty-state">
                  <span className="text-6xl text-muted-foreground">📄</span>
                  <p className="text-lg text-muted-foreground mt-4">No structured data to display.</p>
                </div>
              ) : (
                Object.entries(structured).map(([section, data]) => renderSection(section, data))
              )}
            </div>
          </div>

          {/* Right Panel - Analysis Tools */}
          <div className="analysis-tools-panel">
            {/* Tab Navigation for Analysis Tools */}
            <div className="tab-navigation-header">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <span>{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="scrollable-content p-6">
              {activeTab === 'suggestions' && (
                <div>
                  {loading ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p className="text-muted-foreground mt-4">Generating AI suggestions...</p>
                    </div>
                  ) : selected ? (
                    <div className="space-y-4">
                      <div className="suggestion-card">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          <span className="mr-2">🎯</span>
                          Original Text
                        </h4>
                        <p className="text-sm text-muted-foreground">{selected}</p>
                      </div>

                      <div className="suggestion-card">
                        <h4 className="font-semibold text-primary mb-2 flex items-center">
                          <span className="mr-2">✨</span>
                          AI Suggestion
                        </h4>
                        <p className="text-sm text-foreground mb-3">
                          {getSuggestionData(selected)?.suggested || 'No suggestion available.'}
                        </p>
                        <button
                          onClick={() => copyToClipboard(getSuggestionData(selected)?.suggested || '')}
                          className="btn-secondary text-xs flex items-center space-x-1"
                        >
                          <span>📋</span>
                          <span>Copy</span>
                        </button>
                      </div>

                      <div className="suggestion-card">
                        <h4 className="font-semibold text-foreground mb-2">Feedback</h4>
                        <p className="text-sm text-muted-foreground">
                          {getSuggestionData(selected)?.feedback || 'No feedback available.'}
                        </p>
                      </div>

                      <div className="action-buttons">
                        <button
                          onClick={() => handleApply(selected)}
                          className="btn-apply flex items-center space-x-2"
                        >
                          <span>✅</span>
                          <span>Apply</span>
                        </button>
                        <button
                          onClick={() => handleIgnore(selected)}
                          className="btn-ignore flex items-center space-x-2"
                        >
                          <span>❌</span>
                          <span>Ignore</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <span className="text-5xl text-muted-foreground">💡</span>
                      <p className="text-muted-foreground mt-4">
                        Click on any bullet point in your resume to view AI-powered suggestions.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-5xl text-primary">💼</span>
                    <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">
                      LinkedIn Summary Generator
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a professional LinkedIn summary based on your resume.
                    </p>
                    <button
                      onClick={generateLinkedInSummary}
                      disabled={summaryLoading}
                      className="btn-primary px-6 py-2 flex items-center space-x-2 mx-auto"
                    >
                      {summaryLoading ? (
                        <>
                          <div className="loading-spinner"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          <span>Generate Summary</span>
                        </>
                      )}
                    </button>
                  </div>

                  {linkedinSummary && (
                    <div className="suggestion-card mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">Generated Summary</h4>
                        <button
                          onClick={() => copyToClipboard(linkedinSummary)}
                          className="btn-secondary text-xs flex items-center space-x-1"
                        >
                          <span>📋</span>
                          <span>Copy</span>
                        </button>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {linkedinSummary}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'keywords' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-5xl text-primary">🔍</span>
                    <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">
                      Keyword Analysis
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Compare your resume against a job description to find missing keywords.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      rows={6}
                      placeholder="Paste the job description here..."
                      value={jdText}
                      onChange={e => setJdText(e.target.value)}
                      className="keyword-input"
                    />
                    
                    <div className="action-buttons">
                      <button
                        onClick={() => {
                          setJdText('');
                          setMissingKeywords([]);
                        }}
                        className="btn-secondary px-3 py-2 text-sm flex items-center space-x-1"
                      >
                        <span>🔄</span>
                        <span>Clear</span>
                      </button>
                      <button
                        onClick={matchKeywords}
                        disabled={!jdText.trim() || keywordLoading}
                        className="btn-primary px-4 py-2 text-sm flex items-center space-x-2 flex-1"
                      >
                        {keywordLoading ? (
                          <>
                            <div className="loading-spinner"></div>
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <span>🔍</span>
                            <span>Analyze Keywords</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {missingKeywords.length > 0 && (
                    <div className="suggestion-card mt-6">
                      <h4 className="font-semibold text-destructive mb-3">Missing Keywords</h4>
                      <div className="space-y-2">
                        {missingKeywords.map((keyword, i) => (
                          <div key={i} className="missing-keyword-item">
                            <span>❌</span>
                            <span className="text-foreground">{keyword}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;