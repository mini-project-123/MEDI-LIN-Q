import React, { useState, useEffect } from 'react'
import { Activity, TrendingUp, Heart, Calendar, AlertCircle, Upload, FileText, Camera, BarChart3 } from 'lucide-react'
import SimpleChart from './SimpleChart'
import PremiumFeatures from './PremiumFeatures'
import SuccessStories from './SuccessStories'
import axios from 'axios'

const PatientDashboard = () => {
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState('report')
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file: null,
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchHealthAnalytics()
  }, [])

  const fetchHealthAnalytics = async () => {
    try {
      setLoading(true)
      
      // Mock health analytics data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockHealthData = {
        total_appointments: 12,
        upcoming_appointments: 2,
        active_prescriptions: 3,
        allergies: 'Penicillin, Shellfish',
        appointments_this_month: 3,
        appointments_last_month: 2,
        appointments_this_year: 12,
        next_appointment: {
          doctor_name: 'Sarah Johnson',
          specialization: 'Cardiology',
          hospital_name: 'City General Hospital',
          appointment_datetime: '2024-01-25T14:00:00'
        },
        recent_doctors: [
          { name: 'Sarah Johnson', specialization: 'Cardiology' },
          { name: 'Michael Chen', specialization: 'Neurology' },
          { name: 'Emily Rodriguez', specialization: 'Pediatrics' }
        ],
        recent_reports: [
          {
            id: 1,
            report_type: 'Blood Test',
            description: 'Complete Blood Count',
            created_at: '2024-01-15T10:00:00',
            file: '#'
          },
          {
            id: 2,
            report_type: 'X-Ray',
            description: 'Chest X-Ray',
            created_at: '2024-01-10T15:30:00',
            file: '#'
          }
        ]
      }
      
      setHealthData(mockHealthData)
    } catch (error) {
      console.error('Error fetching health analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    
    // Mock upload functionality
    const newItem = {
      id: Date.now(),
      title: uploadForm.title,
      description: uploadForm.description,
      date: uploadForm.date,
      type: uploadType,
      file: uploadForm.file?.name || 'uploaded-file.pdf',
      uploaded_at: new Date().toISOString()
    }
    
    // Add to existing reports/prescriptions
    if (uploadType === 'report') {
      setHealthData(prev => ({
        ...prev,
        recent_reports: [newItem, ...(prev.recent_reports || [])]
      }))
    }
    
    // Reset form and close modal
    setUploadForm({ title: '', description: '', file: null, date: new Date().toISOString().split('T')[0] })
    setShowUploadModal(false)
    
    alert(`${uploadType === 'report' ? 'Medical Report' : 'Prescription'} uploaded successfully!`)
  }

  const renderUploadModal = () => {
    if (!showUploadModal) return null

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
            Upload {uploadType === 'report' ? 'Medical Report' : 'Prescription'}
          </h3>
          
          <form onSubmit={handleUploadSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                className="form-input"
                placeholder={`Enter ${uploadType} title`}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                className="form-input"
                placeholder="Add description or notes"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                value={uploadForm.date}
                onChange={(e) => setUploadForm({...uploadForm, date: e.target.value})}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">File</label>
              <input
                type="file"
                onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                className="form-input"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                required
              />
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Supported formats: PDF, JPG, PNG, DOC, DOCX
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Upload {uploadType === 'report' ? 'Report' : 'Prescription'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowUploadModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => {
                setUploadType('report')
                setShowUploadModal(true)
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
            >
              <Upload size={16} />
              Upload Report
            </button>
            <button 
              onClick={() => {
                setUploadType('prescription')
                setShowUploadModal(true)
              }}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
            >
              <FileText size={16} />
              Add Prescription
            </button>
          </div>
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
      {healthData?.allergies && (
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
      {healthData?.next_appointment && (
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
            {healthData?.recent_doctors?.slice(0, 3).map((doctor, index) => (
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
            )) || (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                No consultations yet
              </p>
            )}
          </div>
        </div>
      </div>

      {renderHealthAnalytics()}

      {/* Recent Medical Reports */}
      {healthData?.recent_reports && healthData.recent_reports.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h4 style={{ color: '#1e293b' }}>Recent Medical Reports</h4>
            <button 
              onClick={() => {
                setUploadType('report')
                setShowUploadModal(true)
              }}
              className="btn btn-primary"
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              <Upload size={14} style={{ marginRight: '0.25rem' }} />
              Add Report
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {healthData.recent_reports.map((report) => (
              <div 
                key={report.id}
                style={{ 
                  padding: '1rem', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={20} style={{ color: '#3b82f6' }} />
                  </div>
                  <div>
                    <p style={{ color: '#1e293b', fontWeight: '500', marginBottom: '0.25rem' }}>
                      {report.title || report.report_type}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      {report.description}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    {new Date(report.created_at || report.date).toLocaleDateString()}
                  </p>
                  <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <SuccessStories userRole="patient" />

      {renderUploadModal()}
    </div>
  )
}

export default PatientDashboard