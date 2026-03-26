import React, { useState, useRef } from 'react';
import { Upload, Play, CheckCircle, Loader, FileText, Download, AlertCircle, Layers } from 'lucide-react';

export default function OnboardHeroAgentSystem() {
  const [files, setFiles] = useState([]);
  const [projectContext, setProjectContext] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('');
  const [agentOutputs, setAgentOutputs] = useState({});
  const [executionLog, setExecutionLog] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const fileInputRef = useRef(null);

  const agents = [
    { id: 'orchestrator', name: 'Master Orchestrator', icon: '🎯', color: '#2C5F2D' },
    { id: 'strategy', name: 'Business Strategy', icon: '📊', color: '#1E3A5F' },
    { id: 'marketing', name: 'Marketing & Growth', icon: '📈', color: '#5F1E3A' },
    { id: 'communication', name: 'Communication & Branding', icon: '💬', color: '#5F3A1E' },
    { id: 'legal', name: 'Legal & Compliance', icon: '⚖️', color: '#3A1E5F' },
    { id: 'finance', name: 'Finance & Funding', icon: '💰', color: '#1E5F5F' },
    { id: 'sales', name: 'Commercial / B2B Sales', icon: '🤝', color: '#5F2C1E' },
    { id: 'product', name: 'Product & UX', icon: '🎨', color: '#2C1E5F' },
    { id: 'technical', name: 'Full-Stack / Technical', icon: '⚙️', color: '#1E5F2C' },
    { id: 'editor', name: 'Editor & Integration', icon: '📝', color: '#5F5F1E' }
  ];

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const filePromises = uploadedFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            type: file.type,
            content: e.target.result,
            size: file.size
          });
        };
        reader.readAsDataURL(file);
      });
    });
    
    const processedFiles = await Promise.all(filePromises);
    setFiles(prev => [...prev, ...processedFiles]);
    addLog('Files uploaded successfully', 'success');
  };

  const addLog = (message, type = 'info') => {
    setExecutionLog(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const callAgent = async (agentId, systemPrompt, userPrompt) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            { role: "user", content: userPrompt }
          ],
        })
      });

      const data = await response.json();
      const textContent = data.content
        .filter(item => item.type === "text")
        .map(item => item.text)
        .join("\n");
      
      return textContent;
    } catch (error) {
      console.error(`Error calling ${agentId}:`, error);
      throw error;
    }
  };

  const executeWorkflow = async () => {
    setIsRunning(true);
    setAgentOutputs({});
    setExecutionLog([]);
    setFinalReport(null);

    try {
      // Prepare context from files and user input
      const contextData = {
        projectContext,
        fileCount: files.length,
        fileNames: files.map(f => f.name)
      };

      // Phase 1: Master Orchestrator
      addLog('Phase 1: Master Orchestrator analyzing project scope...', 'info');
      setCurrentPhase('orchestrator');
      
      const orchestratorPrompt = `You are the Master Orchestrator for the ONBOARD HERO master's project development.

PROJECT CONTEXT:
${projectContext}

UPLOADED FILES: ${files.map(f => f.name).join(', ')}

Your task is to:
1. Analyze the project scope and identify all critical workstreams
2. Define dependencies between workstreams
3. Create an execution plan with clear priorities
4. Identify any missing information or assumptions that need validation
5. Propose a clear structure for the final deliverable

Provide a concise strategic plan that will guide the specialized agents. Format your response as:
- Executive Summary
- Critical Workstreams (prioritized)
- Dependencies & Execution Order
- Key Assumptions & Gaps
- Final Deliverable Structure`;

      const orchestratorOutput = await callAgent(
        'orchestrator',
        'You are a senior strategy consultant specializing in business development and academic project structuring.',
        orchestratorPrompt
      );

      setAgentOutputs(prev => ({ ...prev, orchestrator: orchestratorOutput }));
      addLog('Master Orchestrator plan completed', 'success');

      // Phase 2: Specialized Agents (parallel execution)
      addLog('Phase 2: Executing specialized agent workstreams...', 'info');
      
      const agentPromises = [
        // Business Strategy
        (async () => {
          setCurrentPhase('strategy');
          const output = await callAgent(
            'strategy',
            'You are a senior business strategy consultant with expertise in SaaS business models and market positioning.',
            `Based on the ONBOARD HERO project context, develop a comprehensive business strategy including:
- Market analysis and positioning
- Competitive advantage
- Business model and value proposition
- Go-to-market strategy
- Success metrics and KPIs

Context: ${projectContext}
Orchestrator Plan: ${orchestratorOutput}`
          );
          setAgentOutputs(prev => ({ ...prev, strategy: output }));
          addLog('Business Strategy completed', 'success');
        })(),

        // Marketing & Growth
        (async () => {
          setCurrentPhase('marketing');
          const output = await callAgent(
            'marketing',
            'You are a growth marketing expert specializing in B2B SaaS customer acquisition.',
            `Develop a marketing and growth strategy for ONBOARD HERO including:
- Target customer segments
- Marketing channels and tactics
- Content strategy
- Customer acquisition strategy
- Growth projections

Context: ${projectContext}
Orchestrator Plan: ${orchestratorOutput}`
          );
          setAgentOutputs(prev => ({ ...prev, marketing: output }));
          addLog('Marketing & Growth completed', 'success');
        })(),

        // Finance & Funding
        (async () => {
          setCurrentPhase('finance');
          const output = await callAgent(
            'finance',
            'You are a financial analyst and startup CFO with expertise in SaaS financial modeling.',
            `Create financial projections and funding strategy for ONBOARD HERO including:
- Revenue model and pricing strategy
- Cost structure and unit economics
- Financial projections (3-year)
- Funding requirements and timeline
- Key financial assumptions

Context: ${projectContext}
Orchestrator Plan: ${orchestratorOutput}`
          );
          setAgentOutputs(prev => ({ ...prev, finance: output }));
          addLog('Finance & Funding completed', 'success');
        })(),

        // Product & UX
        (async () => {
          setCurrentPhase('product');
          const output = await callAgent(
            'product',
            'You are a senior product manager and UX designer specializing in B2B SaaS products.',
            `Design the product strategy and UX for ONBOARD HERO including:
- Core features and product roadmap
- User flows and journey maps
- UX principles and design system
- MVP vs. future versions
- Product differentiation

Context: ${projectContext}
Orchestrator Plan: ${orchestratorOutput}`
          );
          setAgentOutputs(prev => ({ ...prev, product: output }));
          addLog('Product & UX completed', 'success');
        })(),

        // Technical Architecture
        (async () => {
          setCurrentPhase('technical');
          const output = await callAgent(
            'technical',
            'You are a senior full-stack architect and CTO specializing in scalable SaaS systems.',
            `Define the technical architecture for ONBOARD HERO including:
- Technology stack recommendations
- System architecture and infrastructure
- Security and compliance considerations
- Scalability strategy
- Implementation roadmap

Context: ${projectContext}
Orchestrator Plan: ${orchestratorOutput}`
          );
          setAgentOutputs(prev => ({ ...prev, technical: output }));
          addLog('Technical Architecture completed', 'success');
        })()
      ];

      await Promise.all(agentPromises);

      // Phase 3: Editor & Integration
      addLog('Phase 3: Consolidating outputs into final deliverable...', 'info');
      setCurrentPhase('editor');

      const editorPrompt = `You are the Editor & Integration Agent. Your task is to consolidate all workstream outputs into a coherent final deliverable structure.

ORCHESTRATOR PLAN:
${orchestratorOutput}

WORKSTREAM OUTPUTS:
Strategy: ${agentOutputs.strategy}
Marketing: ${agentOutputs.marketing}
Finance: ${agentOutputs.finance}
Product: ${agentOutputs.product}
Technical: ${agentOutputs.technical}

Create a structured final report outline that:
1. Integrates all workstreams coherently
2. Eliminates redundancies and contradictions
3. Presents a clear narrative arc
4. Provides executive summaries for each section
5. Identifies gaps or areas needing further development

Format as a ready-to-compile document structure suitable for academic submission.`;

      const editorOutput = await callAgent(
        'editor',
        'You are a senior editor and business writer specializing in academic and professional business documents.',
        editorPrompt
      );

      setAgentOutputs(prev => ({ ...prev, editor: editorOutput }));
      setFinalReport(editorOutput);
      addLog('Final integration completed!', 'success');
      setCurrentPhase('complete');

    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    const reportContent = `ONBOARD HERO - Master's Project Development Report
Generated: ${new Date().toLocaleString()}

${'='.repeat(80)}
MASTER ORCHESTRATOR PLAN
${'='.repeat(80)}

${agentOutputs.orchestrator || 'Not generated'}

${'='.repeat(80)}
BUSINESS STRATEGY
${'='.repeat(80)}

${agentOutputs.strategy || 'Not generated'}

${'='.repeat(80)}
MARKETING & GROWTH
${'='.repeat(80)}

${agentOutputs.marketing || 'Not generated'}

${'='.repeat(80)}
FINANCE & FUNDING
${'='.repeat(80)}

${agentOutputs.finance || 'Not generated'}

${'='.repeat(80)}
PRODUCT & UX
${'='.repeat(80)}

${agentOutputs.product || 'Not generated'}

${'='.repeat(80)}
TECHNICAL ARCHITECTURE
${'='.repeat(80)}

${agentOutputs.technical || 'Not generated'}

${'='.repeat(80)}
FINAL INTEGRATION & STRUCTURE
${'='.repeat(80)}

${agentOutputs.editor || 'Not generated'}
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'onboard-hero-project-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
      fontFamily: '"Crimson Pro", Georgia, serif',
      color: '#e8e8e8',
      padding: '40px 20px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;600;700&family=Work+Sans:wght@400;500;600&display=swap');
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .agent-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .agent-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }

        .upload-zone {
          transition: all 0.3s ease;
          border: 2px dashed #444;
        }
        
        .upload-zone:hover {
          border-color: #888;
          background: rgba(255,255,255,0.02);
        }

        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '48px',
          animation: 'slideUp 0.6s ease-out',
          borderBottom: '1px solid #333',
          paddingBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <Layers size={40} color="#d4af37" />
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '700',
              margin: 0,
              background: 'linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              ONBOARD HERO
            </h1>
          </div>
          <p style={{ 
            fontSize: '18px',
            color: '#aaa',
            fontFamily: '"Work Sans", sans-serif',
            margin: 0,
            letterSpacing: '0.02em'
          }}>
            Multi-Agent Development System for Master's Project Excellence
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
          {/* Left Panel: Setup */}
          <div style={{ animation: 'slideUp 0.6s ease-out 0.1s backwards' }}>
            {/* File Upload */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #242424 100%)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #333'
            }}>
              <h2 style={{ 
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '16px',
                fontFamily: '"Work Sans", sans-serif',
                color: '#d4af37'
              }}>
                Project Materials
              </h2>
              
              <div 
                className="upload-zone"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '32px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                <Upload size={32} color="#888" style={{ marginBottom: '12px' }} />
                <p style={{ margin: 0, color: '#888', fontFamily: '"Work Sans", sans-serif' }}>
                  Click to upload project files
                </p>
                <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                  Documents, presentations, notes, drafts
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept=".pdf,.docx,.pptx,.txt,.md"
              />

              {files.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  {files.map((file, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: '#0f0f0f',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontFamily: '"Work Sans", sans-serif'
                    }}>
                      <FileText size={16} color="#d4af37" />
                      <span style={{ flex: 1, color: '#ccc' }}>{file.name}</span>
                      <span style={{ color: '#666', fontSize: '12px' }}>
                        {(file.size / 1024).toFixed(1)}KB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Context */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #242424 100%)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #333'
            }}>
              <h2 style={{ 
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '16px',
                fontFamily: '"Work Sans", sans-serif',
                color: '#d4af37'
              }}>
                Project Context
              </h2>
              
              <textarea
                value={projectContext}
                onChange={(e) => setProjectContext(e.target.value)}
                placeholder="Describe your ONBOARD HERO project: goals, target market, key features, current status, specific challenges or focus areas..."
                style={{
                  width: '100%',
                  minHeight: '200px',
                  background: '#0f0f0f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '16px',
                  color: '#e8e8e8',
                  fontFamily: '"Work Sans", sans-serif',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={executeWorkflow}
              disabled={isRunning || !projectContext}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: isRunning || !projectContext 
                  ? '#333' 
                  : 'linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%)',
                color: isRunning || !projectContext ? '#666' : '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: '"Work Sans", sans-serif',
                cursor: isRunning || !projectContext ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.3s ease'
              }}
            >
              {isRunning ? (
                <>
                  <Loader size={20} className="shimmer" style={{ animation: 'pulse 1.5s infinite' }} />
                  Running Workflow...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Execute Multi-Agent Workflow
                </>
              )}
            </button>
          </div>

          {/* Right Panel: Execution & Results */}
          <div style={{ animation: 'slideUp 0.6s ease-out 0.2s backwards' }}>
            {/* Agent Status Grid */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #242424 100%)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #333'
            }}>
              <h2 style={{ 
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '20px',
                fontFamily: '"Work Sans", sans-serif',
                color: '#d4af37'
              }}>
                Agent Execution Status
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {agents.map((agent, idx) => (
                  <div
                    key={agent.id}
                    className="agent-card"
                    style={{
                      background: currentPhase === agent.id 
                        ? `linear-gradient(135deg, ${agent.color}22 0%, ${agent.color}11 100%)`
                        : '#0f0f0f',
                      border: `1px solid ${currentPhase === agent.id ? agent.color : '#222'}`,
                      borderRadius: '8px',
                      padding: '16px',
                      animation: `slideUp 0.3s ease-out ${idx * 0.05}s backwards`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{agent.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '14px',
                          fontWeight: '500',
                          fontFamily: '"Work Sans", sans-serif',
                          color: '#e8e8e8',
                          marginBottom: '4px'
                        }}>
                          {agent.name}
                        </div>
                        <div style={{ 
                          fontSize: '11px',
                          color: '#888',
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          {agentOutputs[agent.id] ? 'Completed' : 
                           currentPhase === agent.id ? 'In Progress' : 
                           'Pending'}
                        </div>
                      </div>
                      {agentOutputs[agent.id] ? (
                        <CheckCircle size={18} color="#4ade80" />
                      ) : currentPhase === agent.id ? (
                        <Loader size={18} color={agent.color} style={{ animation: 'pulse 1.5s infinite' }} />
                      ) : (
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '2px solid #333'
                        }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Log */}
            {executionLog.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #242424 100%)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid #333'
              }}>
                <h2 style={{ 
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  fontFamily: '"Work Sans", sans-serif',
                  color: '#d4af37'
                }}>
                  Execution Log
                </h2>
                
                <div style={{
                  background: '#0f0f0f',
                  borderRadius: '8px',
                  padding: '16px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  fontFamily: '"Work Sans", sans-serif',
                  fontSize: '13px'
                }}>
                  {executionLog.map((log, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 0',
                      borderBottom: idx < executionLog.length - 1 ? '1px solid #222' : 'none'
                    }}>
                      <span style={{ color: '#666', fontSize: '11px', minWidth: '60px' }}>
                        {log.timestamp}
                      </span>
                      {log.type === 'success' && <CheckCircle size={14} color="#4ade80" />}
                      {log.type === 'error' && <AlertCircle size={14} color="#f87171" />}
                      {log.type === 'info' && <Loader size={14} color="#60a5fa" />}
                      <span style={{ color: '#ccc' }}>{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Outputs */}
            {Object.keys(agentOutputs).length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #242424 100%)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #333'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h2 style={{ 
                    fontSize: '20px',
                    fontWeight: '600',
                    fontFamily: '"Work Sans", sans-serif',
                    color: '#d4af37',
                    margin: 0
                  }}>
                    Agent Outputs
                  </h2>
                  
                  {finalReport && (
                    <button
                      onClick={downloadReport}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        fontFamily: '"Work Sans", sans-serif',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Download size={16} />
                      Download Report
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {Object.entries(agentOutputs).map(([agentId, output]) => {
                    const agent = agents.find(a => a.id === agentId);
                    return (
                      <details key={agentId} style={{
                        background: '#0f0f0f',
                        borderRadius: '8px',
                        border: `1px solid #222`
                      }}>
                        <summary style={{
                          padding: '16px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontFamily: '"Work Sans", sans-serif',
                          color: '#e8e8e8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span>{agent?.icon}</span>
                          {agent?.name}
                        </summary>
                        <div style={{
                          padding: '0 16px 16px 16px',
                          color: '#ccc',
                          fontSize: '14px',
                          lineHeight: '1.8',
                          fontFamily: '"Crimson Pro", serif',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {output}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
