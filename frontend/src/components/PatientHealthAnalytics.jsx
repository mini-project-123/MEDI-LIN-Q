import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Send, MessageCircle, Bot, User, Loader2, X, AlertCircle } from 'lucide-react'

const PatientHealthAnalytics = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const token = localStorage.getItem('accessToken')
  const messagesEndRef = useRef(null)

  // State
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState(null)

  // Health data (mock for now - integrate with real data)
  const healthData = [
    { date: '2025-11-01', weight: 75, bloodPressure: '120/80', heartRate: 72 },
    { date: '2025-11-02', weight: 74.8, bloodPressure: '118/79', heartRate: 71 },
    { date: '2025-11-03', weight: 74.5, bloodPressure: '119/80', heartRate: 72 },
    { date: '2025-11-04', weight: 74.3, bloodPressure: '120/81', heartRate: 73 },
    { date: '2025-11-05', weight: 74.2, bloodPressure: '119/79', heartRate: 71 },
    { date: '2025-11-06', weight: 74.1, bloodPressure: '118/78', heartRate: 70 },
    { date: '2025-11-07', weight: 74.0, bloodPressure: '117/77', heartRate: 70 }
  ]

  const activityData = [
    { date: 'Mon', steps: 8500, calories: 2100 },
    { date: 'Tue', steps: 9200, calories: 2200 },
    { date: 'Wed', steps: 7500, calories: 1900 },
    { date: 'Thu', steps: 10000, calories: 2400 },
    { date: 'Fri', steps: 9500, calories: 2300 },
    { date: 'Sat', steps: 6500, calories: 1800 },
    { date: 'Sun', steps: 8000, calories: 2000 }
  ]

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (chatOpen && messages.length === 0) {
      setMessages([{
        id: 0,
        sender: 'bot',
        text: 'Hello! I\'m your health AI assistant. I can help you with health-related questions, analyze your health data, or provide recommendations. How can I help you today?',
        timestamp: new Date()
      }])
    }
  }, [chatOpen])

  // Send message to AI Chatbot API
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage = {
      id: messages.length,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setChatLoading(true)
    setChatError(null)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/patient/ai-chatbot/',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: inputMessage,
            context: `User: ${user?.first_name} ${user?.last_name}. Recent health metrics available.`
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      // Add bot response
      const botMessage = {
        id: messages.length + 1,
        sender: 'bot',
        text: data.response,
        confidence_score: data.confidence_score,
        suggested_actions: data.suggested_actions || [],
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (err) {
      setChatError(err.message)
      console.error('Error sending message:', err)

      // Add error message
      const errorMessage = {
        id: messages.length + 1,
        sender: 'bot',
        text: `I apologize, but I couldn't process your request. Error: ${err.message}. Please try again.`,
        isError: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setChatLoading(false)
    }
  }

  // Styles
  const styles = {
    container: {
      padding: '2rem',
      backgroundColor: theme.background || '#f9fafb',
      minHeight: '100vh'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: theme.textPrimary || '#111',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: theme.textSecondary || '#6b7280',
      marginBottom: '2rem'
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem'
    },
    card: {
      backgroundColor: theme.cardBackground || '#fff',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: theme.textPrimary || '#111',
      marginBottom: '1rem'
    },
    chartContainer: {
      width: '100%',
      height: '300px'
    },
    chatButton: {
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: theme.primary || '#3b82f6',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 999,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.1)'
      }
    },
    chatWindow: {
      position: 'fixed',
      bottom: '5.5rem',
      right: '2rem',
      width: '400px',
      height: '600px',
      backgroundColor: theme.cardBackground || '#fff',
      borderRadius: '12px',
      boxShadow: '0 5px 40px rgba(0,0,0,0.16)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      animation: 'slideUp 0.3s ease-out'
    },
    chatHeader: {
      padding: '1rem',
      borderBottom: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.primary || '#3b82f6',
      color: '#fff',
      borderRadius: '12px 12px 0 0'
    },
    chatMessages: {
      flex: 1,
      overflow: 'auto',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    message: (isBotMessage) => ({
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'flex-end',
      flexDirection: isBotMessage ? 'row' : 'row-reverse',
      marginBottom: '0.5rem'
    }),
    messageBubble: (isBotMessage) => ({
      maxWidth: '80%',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      backgroundColor: isBotMessage ? (theme.background || '#f3f4f6') : (theme.primary || '#3b82f6'),
      color: isBotMessage ? (theme.textPrimary || '#111') : '#fff',
      wordWrap: 'break-word'
    }),
    chatInput: {
      padding: '1rem',
      borderTop: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      display: 'flex',
      gap: '0.5rem'
    },
    input: {
      flex: 1,
      padding: '0.75rem',
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontFamily: 'inherit',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      '&:focus': {
        borderColor: theme.primary || '#3b82f6'
      }
    },
    sendButton: {
      padding: '0.75rem 1rem',
      backgroundColor: theme.primary || '#3b82f6',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      '&:hover': {
        opacity: 0.9
      }
    },
    suggestedActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginTop: '0.5rem',
      fontSize: '0.85rem'
    },
    actionButton: {
      padding: '0.5rem',
      backgroundColor: (theme.background || '#f3f4f6') + '80',
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      borderRadius: '4px',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: (theme.primary || '#3b82f6') + '20'
      }
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Health Analytics</h1>
        <p style={styles.subtitle}>
          Track your health metrics and get AI-powered insights
        </p>
      </div>

      {/* Health Metrics Cards */}
      <div style={styles.cardGrid}>
        {/* Weight Trend */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Weight Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke={theme.primary || '#3b82f6'} />
            </LineChart>
          </ResponsiveContainer>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: theme.textSecondary || '#6b7280' }}>
            Current: 74.0 kg | Goal: 70 kg | Progress: 60%
          </p>
        </div>

        {/* Activity Chart */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="steps" fill={theme.primary || '#3b82f6'} />
              <Bar dataKey="calories" fill={theme.success || '#10b981'} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Health Summary */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Health Summary</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: theme.textSecondary || '#6b7280' }}>
                Blood Pressure
              </label>
              <p style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '0.25rem' }}>
                117/77 mmHg
              </p>
              <p style={{ fontSize: '0.85rem', color: '#10b981' }}>✓ Normal</p>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: theme.textSecondary || '#6b7280' }}>
                Heart Rate
              </label>
              <p style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '0.25rem' }}>
                70 bpm
              </p>
              <p style={{ fontSize: '0.85rem', color: '#10b981' }}>✓ Normal</p>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: theme.textSecondary || '#6b7280' }}>
                BMI
              </label>
              <p style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '0.25rem' }}>
                22.8
              </p>
              <p style={{ fontSize: '0.85rem', color: '#10b981' }}>✓ Healthy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Recommendations */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Health Recommendations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{
            padding: '1rem',
            backgroundColor: theme.background || '#f9fafb',
            borderRadius: '8px',
            borderLeft: `4px solid ${theme.success || '#10b981'}`
          }}>
            <h4 style={{ marginBottom: '0.5rem' }}>💧 Hydration</h4>
            <p style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280' }}>
              Drink 8-10 glasses of water daily
            </p>
          </div>
          <div style={{
            padding: '1rem',
            backgroundColor: theme.background || '#f9fafb',
            borderRadius: '8px',
            borderLeft: `4px solid ${theme.success || '#10b981'}`
          }}>
            <h4 style={{ marginBottom: '0.5rem' }}>🏃 Exercise</h4>
            <p style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280' }}>
              Aim for 30 minutes of moderate activity daily
            </p>
          </div>
          <div style={{
            padding: '1rem',
            backgroundColor: theme.background || '#f9fafb',
            borderRadius: '8px',
            borderLeft: `4px solid ${theme.success || '#10b981'}`
          }}>
            <h4 style={{ marginBottom: '0.5rem' }}>😴 Sleep</h4>
            <p style={{ fontSize: '0.9rem', color: theme.textSecondary || '#6b7280' }}>
              Get 7-9 hours of quality sleep each night
            </p>
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={styles.chatButton}
        title="Health AI Assistant"
      >
        {chatOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {chatOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.chatHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={20} />
              <span style={{ fontWeight: '600' }}>Health AI Assistant</span>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {chatError && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fee2e2',
              borderBottom: '1px solid #fca5a5',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}>
              <AlertCircle size={16} />
              {chatError}
            </div>
          )}

          <div style={styles.chatMessages}>
            {messages.map(msg => (
              <div key={msg.id} style={styles.message(msg.sender === 'bot')}>
                {msg.sender === 'bot' ? (
                  <Bot size={20} style={{ flexShrink: 0 }} />
                ) : (
                  <User size={20} style={{ flexShrink: 0 }} />
                )}
                <div>
                  <div style={styles.messageBubble(msg.sender === 'bot')}>
                    {msg.text}
                  </div>
                  {msg.confidence_score && (
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: theme.textSecondary || '#6b7280' }}>
                      Confidence: {(msg.confidence_score * 100).toFixed(0)}%
                    </p>
                  )}
                  {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                    <div style={styles.suggestedActions}>
                      <strong style={{ fontSize: '0.8rem' }}>Suggested actions:</strong>
                      {msg.suggested_actions.map((action, idx) => (
                        <p key={idx} style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}>
                          • {action}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={styles.message(true)}>
                <Bot size={20} style={{ flexShrink: 0 }} />
                <div style={styles.messageBubble(true)}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.chatInput}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a health question..."
              style={styles.input}
              disabled={chatLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={chatLoading || !inputMessage.trim()}
              style={{
                ...styles.sendButton,
                opacity: chatLoading || !inputMessage.trim() ? 0.5 : 1,
                cursor: chatLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default PatientHealthAnalytics
