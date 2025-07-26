import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (selectedFile) => {
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      alert('Please upload a valid PDF or Text file.');
      setFile(null);
      setFileName('');
    }
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileChange(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('No file selected.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Upload successful:', result);
      navigate('/review', { state: { structured: result.structured } });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const features = [
    {
      icon: "✨",
      title: "AI-Powered Suggestions",
      description: "Get intelligent recommendations to improve your resume content and make it more impactful."
    },
    {
      icon: "🎯",
      title: "Keyword Matching",
      description: "Analyze your resume against job descriptions to identify missing keywords and improve ATS compatibility."
    },
    {
      icon: "⚡",
      title: "LinkedIn Summary Generator",
      description: "Automatically generate professional LinkedIn summaries based on your resume content."
    }
  ];

  return (
    <div className="min-h-screen hero-gradient">
      {/* Navigation Header */}
      <nav className="nav-header py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 icon-primary text-2xl">📄</span>
            <h1 className="text-2xl font-bold text-gradient">ResuMate</h1>
          </div>
          <div className="text-sm-bold text-muted-foreground">
            Smart Resume Reviewer
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16 slide-in-animation">
          <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6">
            ResuMate
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Smart Resume Reviewer
          </p>
          <p className="text-lg text-foreground leading-relaxed max-w-2xl mx-auto">
            Transform your resume with AI-powered suggestions, keyword optimization, and professional LinkedIn summaries. 
            Get the competitive edge you need in today's job market.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-8 mb-16 fade-in-animation">
          {features.map((feature, index) => (
            <div key={index} className="feature-card p-8 rounded-xl text-center">
              <div className="flex justify-center mb-4 floating-animation" style={{ animationDelay: `${index * 0.5}s` }}>
                <span className="text-5xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto">
          <div className="professional-card p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Upload Your Resume
              </h2>
              <p className="text-muted-foreground">
                Upload your resume in PDF or text format to get started with AI-powered analysis
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Drag and Drop Area */}
              <div
                className={`upload-area p-12 text-center cursor-pointer ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleInputChange}
                  className="hidden"
                />
                
                <div className="flex flex-col items-center space-y-4">
                  {file ? (
                    <span className="text-6xl text-primary pulse-animation">✅</span>
                  ) : (
                    <span className="text-6xl text-muted-foreground">📤</span>
                  )}
                  
                  <div>
                    {file ? (
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-primary">
                          File Selected Successfully!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {fileName}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-foreground">
                          Drop your resume here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports PDF and TXT files
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={!file || isUploading}
                  className={`btn-primary px-8 py-4 text-lg font-semibold rounded-lg flex items-center space-x-2 ${
                    !file || isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Analyzing Resume...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Analyze Resume</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Help Text */}
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <div className="flex items-start space-x-3">
                <span className="text-primary mt-05">ℹ️</span>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Tips for best results:</p>
                  <ul className="space-y-1">
                    <li>Use a well-formatted PDF or text file</li>
                    <li>Ensure your resume includes clear sections (Experience, Education, Skills)</li>
                    <li>File size should be under 10MB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p>© 2024 ResuMate - Smart Resume Reviewer. Built with ❤️ for job seekers.</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
