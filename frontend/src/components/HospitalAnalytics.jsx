import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext' // Import useAuth
import axios from 'axios' // Import axios
import { TrendingUp, Users, Activity, Bed, AlertCircle } from 'lucide-react'
import SimpleChart from './SimpleChart'

// --- Helper Data for Chart Colors ---
const DEPARTMENT_COLORS = {
  'Cardiology': '#3b82f6',
  'Orthopedics': '#10b81',
  'OB/GYN': '#8b5cf6',
  'Internal Medicine': '#f59e0b',
  'Surgery': '#ef4444',
  'ICU': '#06b6d4',
  'Default': '#6b7280'
}

const HospitalAnalytics = () => {
  const { theme } = useTheme()
  const { logout } = useAuth() // Get logout function

  // --- STATE FOR API DATA ---
  const [analyticsData, setAnalyticsData] = useState({
    // FIX: Initialize as an empty array of objects
    departmentVisits: [], 
    departmentDistribution: [],
    monthlyVisits: {},
    bedOccupancy: [],
    totalAppointments: 0,
    avgDailyVisits: 0,
    totalBedOccupancy: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('accessToken')

        // Make the API call
        const response = await axios.get('/api/hospital/analytics/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const data = response.data;
        
        // --- Transform Backend Data for Frontend Charts ---
        
        // 1. Transform 'department_distribution' (a dictionary) for the Bar Chart
        const deptVisitsLabels = Object.keys(data.department_distribution);
        const deptVisitsData = Object.values(data.department_distribution);
        
        // THIS IS THE FIX: Create the array of objects
        const transformedDeptVisits = deptVisitsLabels.map((label, index) => ({
          label: label,
          value: deptVisitsData[index]
        }));

        // 2. Transform 'department_distribution' (a dictionary) for the Progress Bars
        const totalVisits = deptVisitsData.reduce((sum, count) => sum + count, 0);
        const transformedDeptDistribution = deptVisitsLabels.map(deptName => {
          const count = data.department_distribution[deptName];
          return {
            name: deptName,
            value: totalVisits > 0 ? parseFloat(((count / totalVisits) * 100).toFixed(1)) : 0,
            color: DEPARTMENT_COLORS[deptName] || DEPARTMENT_COLORS.Default
          }
        });

        // 3. Calculate summary statistics
        const monthlyValues = Object.values(data.monthly_visits);
        const totalAppts = monthlyValues.reduce((sum, count) => sum + count, 0);
        const avgDailyVisits = monthlyValues.length > 0 ? Math.round(totalAppts / (monthlyValues.length * 30)) : 0;
        
        // 4. Calculate bed occupancy
        const bedData = data.department_bed_occupancy;
        const totalBeds = bedData.reduce((sum, ward) => sum + ward.total_beds, 0);
        const totalOccupied = bedData.reduce((sum, ward) => sum + ward.occupied_beds, 0);
        const avgBedOccupancy = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;

        setAnalyticsData({
          departmentVisits: transformedDeptVisits,
          departmentDistribution: transformedDeptDistribution,
          monthlyVisits: data.monthly_visits,
          bedOccupancy: bedData,
          totalAppointments: totalAppts,
          avgDailyVisits: avgDailyVisits,
          totalBedOccupancy: avgBedOccupancy
        });

      } catch (err) {
        console.error('Error fetching analytics:', err)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Authentication failed. Please log in again.')
          logout() // Logout on auth error
        } else {
          setError('Failed to load analytics data.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [logout]) // Re-run effect if logout function changes

  
  // --- RENDER FUNCTIONS ---
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
        Loading analytics...
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444' }}>
        <h3 style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          Error
        </h3>
        <p style={{ color: '#b91c1c' }}>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Analytics</h1>
        <p style={{ color: theme.textSecondary, margin: 0 }}>Hospital performance metrics and insights</p>
      </div>

      {/* Summary Stats (Now using real API data) */}
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
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>Total Appointments</p>
              <h3 style={{ color: theme.text, margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>{analyticsData.totalAppointments.toLocaleString()}</h3>
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
              <Activity size={24} style={{ color: '#10b81' }} />
            </div>
            <div>
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>Avg Daily Visits</p>
              <h3 style={{ color: theme.text, margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>{analyticsData.avgDailyVisits}</h3>
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
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>Total Departments</p>
              <h3 style={{ color: theme.text, margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>{analyticsData.departmentDistribution.length}</h3>
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
              <h3 style={{ color: theme.text, margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>{analyticsData.totalBedOccupancy}%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts (Now connected to API data) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: theme.text, margin: '0 0 1rem 0' }}>Patient Visits by Department</h3>
          {/* THIS IS THE FIX: We just pass the transformed array directly */}
          <SimpleChart 
            data={analyticsData.departmentVisits}
            type="bar"
            color="#3b82f6"
            height={250}
          />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: theme.text, margin: '0 0 1rem 0' }}>Department Distribution</h3>
          {/* These progress bars now use data transformed from the API */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
            {analyticsData.departmentDistribution.map((dept, index) => (
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