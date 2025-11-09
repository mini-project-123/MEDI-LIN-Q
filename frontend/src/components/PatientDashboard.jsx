import React, { useState, useEffect } from 'react'
import { Activity, TrendingUp, Heart, Calendar, AlertCircle, BarChart3 } from 'lucide-react'
import SimpleChart from './SimpleChart'
import PremiumFeatures from './PremiumFeatures'
import axios from 'axios' // Import axios
import { useNavigate } from 'react-router-dom' // Import useNavigate

const PatientDashboard = () => {
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    fetchHealthAnalytics()
  }, [])

  const fetchHealthAnalytics = async () => {
    try {
      setLoading(true)
      
      // This is the real API call to your backend
      // [cite: mini-project-123/medi-lin-q/MEDI-LIN-Q-f1f2447704983cbe580896d9edf78aec33d147ff/api/urls/patient_urls.py]
      const response = await axios.get('/api/dashboard/')
      
      // The backend sends raw data. We need to process it.
      const data = response.data;
      
      // --- Process Backend Data to Fit Frontend Component ---
      const total_appointments = data.appointments.length;
      
      const upcoming_appointments = data.appointments.filter(app => 
        new Date(app.appointment_datetime) > new Date()
      ).length;

      // NOTE: Your backend doesn't send 'active_prescriptions' in this view.
      // We'll have to fetch that separately later or set it to 0 for now.
      // We will also need to adjust for 'next_appointment', 'recent_doctors', etc.
      
      // Process prescriptions data if it exists
      const active_prescriptions = data.prescriptions ? data.prescriptions.filter(p => new Date(p.end_date) > new Date()).length : 0;

      // Find next appointment
      const next_appointment = data.appointments
        .filter(app => new Date(app.appointment_datetime) > new Date())
        .sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime))[0];

      // Process recent doctors (this is a simplified example)
      // A more robust implementation would fetch doctor details based on IDs
      const recent_doctors = data.appointments.slice(0, 3).map(app => ({
          name: app.doctor_name || 'Dr. Unknown', // Assuming backend serializes this
          specialization: app.doctor_specialization || 'Specialist'
      }));

      const processedData = {
        total_appointments: total_appointments,
        upcoming_appointments: upcoming_appointments,
        active_prescriptions: active_prescriptions,
        allergies: data.user.allergies || 'None', // Allergies are on the profile
        appointments_this_month: data.appointments.filter(app => 
          new Date(app.appointment_datetime).getMonth() === new Date().getMonth()
        ).length,
        appointments_last_month: data.appointments.filter(app => 
          new Date(app.appointment_datetime).getMonth() === new Date().getMonth() - 1
        ).length,
         appointments_this_year: data.appointments.filter(app => 
          new Date(app.appointment_datetime).getFullYear() === new Date().getFullYear()
        ).length,
        next_appointment: next_appointment ? {
          doctor_name: next_appointment.doctor_name || 'Dr. Unknown',
          specialization: next_appointment.doctor_specialization || 'Specialist',
          hospital_name: next_appointment.hospital_name || 'Hospital',
          appointment_datetime: next_appointment.appointment_datetime
        } : null,
        recent_doctors: recent_doctors,
        // ... (other processing logic can be added here)
      };

      setHealthData(processedData);

    } catch (error) {
      // --- THIS IS THE KEY ---
      // If the profile is incomplete, the API returns a 404
      if (error.response && error.response.status === 404) {
        // Redirect to the complete profile page
        navigate('/complete-profile');
      } else {
        console.error('Error fetching health analytics:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const renderHealthAnalytics = () => {
    const appointmentHistory = [
      { label: 'Jan', value: 2 },
      { label: 'Feb', value: 1 },
      { label: 'Mar', value: 3 },
      { label: 'Apr', value: 2 },
      { label: 'May', value: 1 },
      { label: 'Jun', value: 3 }
    ]

    const healthMetrics = [
      { label: 'Blood Pressure', value: 85 },
      { label: 'Heart Rate', value: 72 },
      { label: 'Weight', value: 68 },
      { label: 'BMI', value: 22 }
    ]

    const doctorVisits = [
      { label: 'Cardiology', value: 5 },
      { label: 'General', value: 4 },
      { label: 'Neurology', value: 2 },
      { label: 'Dermatology', value: 1 }
    ]

    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={24} />
            Health Analytics
          </h3>
        </div>

        <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
          <SimpleChart 
            data={appointmentHistory} 
            type="line" 
            title="Appointment History (6 Months)" 
            color="#10b981"
          />
          <SimpleChart 
            data={healthMetrics} 
            type="bar" 
            title="Health Metrics" 
            color="#3b82f6"
          />
        </div>

        <div className="grid grid-2" style={{ gap: '2rem' }}>
          <SimpleChart 
            data={doctorVisits} 
            type="pie" 
            title="Doctor Consultations by Specialty"
          />
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: '#1e293b', marginBottom: '1rem', textAlign: 'center' }}>
              Health Score
            </h4>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                position: 'relative'
              }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.5rem'
                }}>
                  8.5
                </div>
              </div>
              <h5 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Excellent Health</h5>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Based on recent checkups and vital signs
              </p>
            </div>
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
        <div>Loading health analytics...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Health Stats Cards */}
      <div className="grid grid-3 mb-6">
        <div className="card text-center">
          <Activity size={32} style={{ color: '#3b82f6', margin: '0 auto 0.5rem' }} />
          <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
            {healthData?.total_appointments || 0}
          </h3>
          <p style={{ color: '#64748b' }}>Total Appointments</p>
        </div>
        
        <div className="card text-center">
          <Calendar size={32} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
          <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
            {healthData?.upcoming_appointments || 0}
          </h3>
          <p style={{ color: '#64748b' }}>Upcoming</p>
        </div>
        
        <div className="card text-center">
          <Heart size={32} style={{ color: '#ef4444', margin: '0 auto 0.5rem' }} />
          <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
            {healthData?.active_prescriptions || 0}
          </h3>
          <p style={{ color: '#64748b' }}>Active Prescriptions</p>
        </div>
      </div>

      {/* Health Alerts */}
      {healthData?.allergies && healthData.allergies !== 'None' && (
        <div className="card mb-6" style={{ 
          backgroundColor: '#fef3c7', 
          borderColor: '#f59e0b' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertCircle size={20} style={{ color: '#92400e' }} />
            <h4 style={{ color: '#92400e', fontWeight: '600' }}>Allergy Alert</h4>
          </div>
          <p style={{ color: '#92400e' }}>{healthData.allergies}</p>
        </div>
      )}

      {/* Next Appointment */}
      {healthData?.next_appointment ? (
        <div className="card mb-6">
          <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Next Appointment</h3>
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#f8fafc', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
                  Dr. {healthData.next_appointment.doctor_name}
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  {healthData.next_appointment.specialization} • {healthData.next_appointment.hospital_name}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#1e293b', fontWeight: '500' }}>
                  {new Date(healthData.next_appointment.appointment_datetime).toLocaleDateString()}
                </p>
                <p style={{ color: '#3b82f6', fontSize: '0.9rem' }}>
                  {new Date(healthData.next_appointment.appointment_datetime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
         <div className="card mb-6">
          <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Next Appointment</h3>
           <p style={{ color: '#64748b' }}>No upcoming appointments scheduled.</p>
         </div>
      )}

      {/* Health Trends */}
      <div className="grid grid-2 mb-6">
        <div className="card">
          <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
            <TrendingUp size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Appointment History
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>This Month</span>
              <span style={{ color: '#1e293b', fontWeight: '500' }}>
                {healthData?.appointments_this_month || 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Last Month</span>
              <span style={{ color: '#1e293b', fontWeight: '500' }}>
                {healthData?.appointments_last_month || 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>This Year</span>
              <span style={{ color: '#1e293b', fontWeight: '500' }}>
                {healthData?.appointments_this_year || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
            <Heart size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Doctors Consulted
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {healthData?.recent_doctors?.length > 0 ? healthData.recent_doctors.map((doctor, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '0.75rem', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '0.5rem' 
                }}
              >
                <p style={{ color: '#1e293b', fontWeight: '500', fontSize: '0.9rem' }}>
                  Dr. {doctor.name}
                </p>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {doctor.specialization}
                </p>
              </div>
            )) : (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                No consultations yet
              </p>
            )}
          </div>
        </div>
      </div>

      {renderHealthAnalytics()}
    </div>
  )
}

export default PatientDashboard