import React, { useState, useEffect } from 'react'
import { Users, Calendar, Clock, TrendingUp, User, Phone, Mail, Activity, BarChart3, PieChart } from 'lucide-react'
import SimpleChart from './SimpleChart'
import PremiumFeatures from './PremiumFeatures'
import SuccessStories from './SuccessStories'
import { doctorAPI } from '../utils/api'
import { useNavigate } from 'react-router-dom'

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const response = await doctorAPI.getDashboardSummary()
      const data = response.data

      setDashboardData(data)
      
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 400)) {
        navigate('/complete-doctor-profile')
      } else {
        console.error('Error fetching dashboard data:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const renderStatCards = () => {
    if (!dashboardData?.stat_cards) return null

    const { stat_cards } = dashboardData

    return (
      <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 0.25rem 0' }}>
                  {stat_cards.total_patients || 0}
                </h3>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Total Patients</p>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.8rem' }}>All time</p>
              </div>
              <Users size={24} style={{ color: '#64748b' }} />
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 0.25rem 0' }}>
                  {stat_cards.todays_appointments_count || 0}
                </h3>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Today's Appointments</p>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.8rem' }}>Scheduled</p>
              </div>
              <Calendar size={24} style={{ color: '#64748b' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 0.25rem 0' }}>
                  {stat_cards.new_patients_this_month || 0}
                </h3>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>This Month</p>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.8rem' }}>New patients</p>
              </div>
              <TrendingUp size={24} style={{ color: '#64748b' }} />
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 0.25rem 0' }}>
                  {stat_cards.todays_appointments_count || 0}
                </h3>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>This Week</p>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.8rem' }}>Upcoming appointments</p>
              </div>
              <Calendar size={24} style={{ color: '#64748b' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderNextAppointment = () => {
    const nextAppointment = dashboardData?.stat_cards?.next_appointment

    return (
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Calendar size={20} style={{ color: '#3b82f6' }} />
          <h3 style={{ color: '#1e293b', margin: 0 }}>Next Appointment</h3>
        </div>
        
        {nextAppointment ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white'
            }}>
              {nextAppointment.patient?.user?.first_name?.charAt(0) || 'N/A'}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#1e293b', marginBottom: '0.25rem', fontSize: '1.1rem' }}>
                {nextAppointment.patient?.user?.first_name || 'N/A'} {nextAppointment.patient?.user?.last_name || ''}
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                Patient ID: {nextAppointment.patient?.user?.custom_id || 'N/A'}
              </p>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                {new Date(nextAppointment.appointment_datetime).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit' 
                })} at {new Date(nextAppointment.appointment_datetime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
              <p style={{ color: '#3b82f6', fontSize: '0.9rem' }}>
                General Checkup
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <Calendar size={48} style={{ color: '#64748b', margin: '0 auto 1rem', opacity: 0.5 }} />
              <h4 style={{ color: '#1e293b', marginBottom: '0.25rem', fontSize: '1.1rem' }}>
                No Upcoming Appointments
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                Your schedule is clear for now
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }



  const renderPatientDistribution = () => {
    if (!dashboardData?.visualizations) return null

    const { gender_distribution, age_group_distribution } = dashboardData.visualizations

    return (
      <div className="grid grid-2 mb-6">
        <div className="card">
          <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>Gender Distribution</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(gender_distribution).map(([gender, count]) => (
              <div key={gender} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{gender || 'N/A'}</span>
                <span style={{ color: '#1e293b', fontWeight: '500' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>Age Distribution</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(age_group_distribution).map(([ageGroup, count]) => (
              <div key={ageGroup} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{ageGroup} years</span>
                <span style={{ color: '#1e293b', fontWeight: '500' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }



  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading dashboard...</div>
      </div>
    )
  }

  const renderAnalyticsCharts = () => {
    if (!dashboardData?.visualizations) return null

    const { gender_distribution, age_group_distribution } = dashboardData.visualizations

    const genderData = Object.entries(gender_distribution).map(([key, value]) => ({
      label: key || 'N/A',
      value: value
    }))

    const ageData = Object.entries(age_group_distribution).map(([key, value]) => ({
      label: key,
      value: value
    }))

    // Use empty arrays if no data available
    const appointmentTrends = []
    const specialtyStats = []

    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={24} />
            Analytics & Insights
          </h3>
        </div>

        <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
          <SimpleChart 
            data={appointmentTrends} 
            type="line" 
            title="Appointment Trends (6 Months)" 
            color="#10b981"
          />
          <SimpleChart 
            data={specialtyStats} 
            type="bar" 
            title="Consultation Types" 
            color="#3b82f6"
          />
        </div>

        <div className="grid grid-2" style={{ gap: '2rem' }}>
          <SimpleChart 
            data={genderData} 
            type="pie" 
            title="Patient Gender Distribution"
          />
          <SimpleChart 
            data={ageData} 
            type="bar" 
            title="Patient Age Groups" 
            color="#f59e0b"
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      {renderNextAppointment()}
      {renderStatCards()}
      {renderAnalyticsCharts()}
    </div>
  )
}

export default DoctorDashboard