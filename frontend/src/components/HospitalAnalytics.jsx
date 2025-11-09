import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { TrendingUp, Users, Activity, Bed } from 'lucide-react'
import SimpleChart from './SimpleChart'

const HospitalAnalytics = () => {
  const { theme } = useTheme()

  // Chart data
  const departmentVisits = {
    labels: ['Cardiology', 'Orthopedics', 'OB/GYN', 'Internal Med', 'Surgery', 'ICU'],
    data: [75, 68, 65, 82, 78, 85]
  }

  const departmentDistribution = [
    { name: 'Cardiology', value: 18, color: '#3b82f6' },
    { name: 'Orthopedics', value: 16, color: '#10b981' },
    { name: 'OB/GYN', value: 15, color: '#8b5cf6' },
    { name: 'Internal Medicine', value: 19, color: '#f59e0b' },
    { name: 'Surgery', value: 18, color: '#ef4444' },
    { name: 'ICU', value: 14, color: '#06b6d4' }
  ]





  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Analytics</h1>
        <p style={{ color: theme.textSecondary, margin: 0 }}>Hospital performance metrics and insights</p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={24} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>Total Patients</p>
              <h3 style={{ color: theme.text, margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>2,847</h3>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={24} style={{ color: '#10b981' }} />
            </div>
            <div>
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>Avg Daily Visits</p>
              <h3 style={{ color: theme.text, margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>156</h3>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={24} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>Growth Rate</p>
              <h3 style={{ color: theme.text, margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>+12.5%</h3>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bed size={24} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>Bed Occupancy</p>
              <h3 style={{ color: theme.text, margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>78.5%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: theme.text, margin: '0 0 1rem 0' }}>Patient Visits by Department</h3>
          <SimpleChart 
            data={departmentVisits.data}
            labels={departmentVisits.labels}
            color="#3b82f6"
            height={250}
          />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: theme.text, margin: '0 0 1rem 0' }}>Department Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
            {departmentDistribution.map((dept, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: theme.text, fontSize: '0.9rem' }}>{dept.name}</span>
                  <span style={{ color: theme.text, fontWeight: 'bold' }}>{dept.value}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: theme.border || '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${dept.value}%`,
                    height: '100%',
                    backgroundColor: dept.color,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>




    </div>
  )
}

export default HospitalAnalytics
