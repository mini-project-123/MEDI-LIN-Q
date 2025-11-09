import React, { useState, useEffect } from 'react'
import { Users, Calendar, Clock, TrendingUp, User, Phone, Mail, Activity, BarChart3, PieChart } from 'lucide-react'
import SimpleChart from './SimpleChart'
import PremiumFeatures from './PremiumFeatures'
import SuccessStories from './SuccessStories'

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Mock dashboard data
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
      
      const mockDashboardData = {
        stat_cards: {
          total_patients: 180,
          todays_appointments_count: 8,
          new_patients_this_month: 42,
          next_appointment: {
            id: 1,
            appointment_datetime: '2024-01-19T10:00:00',
            patient: {
              user: {
                first_name: 'Emily',
                last_name: 'Rodriguez',
                custom_id: 'PT003'
              }
            }
          }
        },
        visualizations: {
          gender_distribution: {
            'Male': 95,
            'Female': 85
          },
          age_group_distribution: {
            '0-18': 25,
            '19-35': 45,
            '36-50': 60,
            '51-65': 35,
            '65+': 15
          }
        }
      }
      
      const mockAppointments = [
        {
          id: 1,
          appointment_datetime: '2024-01-19T10:00:00',
          status: 'confirmed',
          patient: {
            user: {
              first_name: 'Emily',
              last_name: 'Rodriguez',
              custom_id: 'PT003'
            }
          },
          token_number: 'T001'
        },
        {
          id: 2,
          appointment_datetime: '2024-01-19T14:30:00',
          status: 'pending',
          patient: {
            user: {
              first_name: 'John',
              last_name: 'Smith',
              custom_id: 'PT004'
            }
          },
          token_number: 'T002'
        }
      ]
      
      const mockPatients = [
        {
          id: 1,
          user: {
            first_name: 'Emily',
            last_name: 'Rodriguez',
            custom_id: 'PT003',
            age: 28
          },
          last_visit_date: '2024-01-15'
        },
        {
          id: 2,
          user: {
            first_name: 'John',
            last_name: 'Smith',
            custom_id: 'PT004',
            age: 45
          },
          last_visit_date: '2024-01-10'
        }
      ]
      
      setDashboardData(mockDashboardData)
      setAppointments(mockAppointments)
      setPatients(mockPatients)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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
                  {stat_cards.total_patients || 180}
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
                  {stat_cards.todays_appointments_count || 8}
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
                  {stat_cards.new_patients_this_month || 42}
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
                  {stat_cards.upcomingAppointments || 15}
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
              {nextAppointment.patient?.user?.first_name?.charAt(0) || 'E'}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#1e293b', marginBottom: '0.25rem', fontSize: '1.1rem' }}>
                {nextAppointment.patient?.user?.first_name || 'Emily'} {nextAppointment.patient?.user?.last_name || 'Rodriguez'}
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                Patient ID: {nextAppointment.patient?.user?.custom_id || 'PT003'}
              </p>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                {new Date(nextAppointment.appointment_datetime || '2024-01-19T10:00:00').toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit' 
                })} at {new Date(nextAppointment.appointment_datetime || '2024-01-19T10:00:00').toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}-{new Date(new Date(nextAppointment.appointment_datetime || '2024-01-19T10:00:00').getTime() + 60*60*1000).toLocaleTimeString([], { 
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
              E
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#1e293b', marginBottom: '0.25rem', fontSize: '1.1rem' }}>
                Emily Rodriguez
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                Patient ID: PT003
              </p>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                2024-01-19 at 10:00-11:00
              </p>
              <p style={{ color: '#3b82f6', fontSize: '0.9rem' }}>
                General Checkup
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderTodaysSchedule = () => {
    const today = new Date().toDateString()
    const todaysAppointments = appointments.filter(apt => 
      new Date(apt.appointment_datetime).toDateString() === today
    )

    return (
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Today's Schedule</h3>
        {todaysAppointments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {todaysAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                style={{ 
                  padding: '1rem', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ color: '#1e293b', marginBottom: '0.25rem' }}>
                    {appointment.patient?.user?.first_name} {appointment.patient?.user?.last_name}
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Token: {appointment.token_number} • ID: {appointment.patient?.user?.custom_id}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#1e293b', fontWeight: '500' }}>
                    {new Date(appointment.appointment_datetime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '0.25rem', 
                    fontSize: '0.8rem',
                    backgroundColor: appointment.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
                    color: appointment.status === 'confirmed' ? '#166534' : '#92400e'
                  }}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
            No appointments scheduled for today.
          </p>
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
                <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{gender}</span>
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

  const renderRecentPatients = () => {
    const recentPatients = patients.slice(0, 5)

    return (
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Recent Patients</h3>
        {recentPatients.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentPatients.map((patient) => (
              <div 
                key={patient.id}
                style={{ 
                  padding: '1rem', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {patient.user?.first_name?.charAt(0)}{patient.user?.last_name?.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ color: '#1e293b', marginBottom: '0.25rem' }}>
                      {patient.user?.first_name} {patient.user?.last_name}
                    </h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      ID: {patient.user?.custom_id}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Last visit: {patient.last_visit_date ? 
                      new Date(patient.last_visit_date).toLocaleDateString() : 
                      'No visits'
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
            No patients found.
          </p>
        )}
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
      label: key,
      value: value
    }))

    const ageData = Object.entries(age_group_distribution).map(([key, value]) => ({
      label: key,
      value: value
    }))

    const appointmentTrends = [
      { label: 'Jan', value: 45 },
      { label: 'Feb', value: 52 },
      { label: 'Mar', value: 48 },
      { label: 'Apr', value: 61 },
      { label: 'May', value: 55 },
      { label: 'Jun', value: 67 }
    ]

    const specialtyStats = [
      { label: 'Cardiology', value: 85 },
      { label: 'General', value: 45 },
      { label: 'Emergency', value: 30 },
      { label: 'Follow-up', value: 20 }
    ]

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