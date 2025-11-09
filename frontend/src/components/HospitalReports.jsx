import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FileText, Download, Eye } from 'lucide-react'

const HospitalReports = () => {
  const { theme } = useTheme()
  const [reports] = useState([
    { id: 1, title: 'Monthly Patient Report', category: 'Patient Analytics', description: 'Comprehensive report of patient visits and treatments', date: 'October 2025' },
    { id: 2, title: 'Department Performance', category: 'Performance', description: 'Performance analysis of hospital departments', date: 'October 2025' },
    { id: 3, title: 'Financial Summary', category: 'Financial', description: 'Overview of financial and billing health overview', date: 'October 2025' },
    { id: 4, title: 'Staff Productivity Report', category: 'HR Analytics', description: 'Working hours and productivity metrics for all staff', date: 'October 2024' },
    { id: 5, title: 'Bed Occupancy Trends', category: 'Operations', description: 'Historical bed occupancy data and forecasts', date: 'October 2024' },
    { id: 6, title: 'Patient Satisfaction Survey', category: 'Quality', description: 'Patient feedback and satisfaction scores', date: 'Q3 2024' }
  ])

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Reports</h1>
        <p style={{ color: theme.textSecondary, margin: 0 }}>Generate and download various hospital reports</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {reports.map(report => (
          <div key={report.id} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={24} style={{ color: '#3b82f6' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>{report.title}</h3>
                <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>{report.category}</p>
              </div>
            </div>

            <p style={{ color: theme.textSecondary, margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
              {report.description}
            </p>

            <div style={{
              padding: '0.75rem',
              backgroundColor: theme.background || '#f8fafc',
              borderRadius: '6px',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '0.85rem', color: theme.textSecondary }}>{report.date}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: 'transparent',
                color: theme.text,
                border: `1px solid ${theme.border || '#e2e8f0'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <Eye size={16} />
                View
              </button>
              <button style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HospitalReports
