import React, { useState } from 'react'
import { MessageCircle, Send, X, Bot, User } from 'lucide-react'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm MedLinq Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const quickReplies = [
    "Book an appointment",
    "Find a doctor",
    "Upload medical records",
    "Check appointment status",
    "Emergency contact"
  ]

  const botResponses = {
    "book an appointment": "I can help you book an appointment! Please visit our booking page or tell me your preferred specialty and I'll guide you through the process.",
    "find a doctor": "You can find doctors by specialty in our 'Find Doctors' section. We have specialists in Cardiology, Neurology, Pediatrics, and more. What specialty are you looking for?",
    "upload medical records": "To upload your medical records, go to your Dashboard > Reports tab. You can upload PDFs, images, and other medical documents there.",
    "check appointment status": "You can check your appointment status in your Dashboard > Appointments tab. You'll see all your upcoming and past appointments there.",
    "emergency contact": "For medical emergencies, please call 911 immediately. For non-emergency support, you can reach us at +91 1800-123-4567 or email support@medlinq.com",
    "default": "I understand you need help with that. For specific medical questions, please consult with one of our doctors. For technical support, you can contact our team at support@medlinq.com or call +91 1800-123-4567."
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])

    // Generate bot response
    setTimeout(() => {
      const lowerInput = inputMessage.toLowerCase()
      let botResponse = botResponses.default

      for (const [key, response] of Object.entries(botResponses)) {
        if (lowerInput.includes(key)) {
          botResponse = response
          break
        }
      }

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    }, 1000)

    setInputMessage('')
  }

  const handleQuickReply = (reply) => {
    setInputMessage(reply)
    handleSendMessage()
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)'
          e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)'
          e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)'
        }}
      >
        <MessageCircle size={28} />
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      width: '350px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={24} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>MedLinq Assistant</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>Online now</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0.25rem'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: message.sender === 'bot' ? '#3b82f6' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.8rem'
            }}>
              {message.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div style={{
              maxWidth: '70%',
              padding: '0.75rem',
              borderRadius: '1rem',
              backgroundColor: message.sender === 'bot' ? '#f1f5f9' : '#3b82f6',
              color: message.sender === 'bot' ? '#1e293b' : 'white',
              fontSize: '0.9rem',
              lineHeight: '1.4'
            }}>
              {message.text}
            </div>
          </div>
        ))}

        {/* Quick Replies */}
        {messages.length === 1 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
              Quick options:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8fafc'
                    e.target.style.borderColor = '#3b82f6'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white'
                    e.target.style.borderColor = '#e5e7eb'
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          style={{
            padding: '0.75rem',
            backgroundColor: inputMessage.trim() ? '#3b82f6' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}

export default Chatbot