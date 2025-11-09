import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Users, Calendar, Stethoscope, X, Plus, Filter, FileText, Activity } from 'lucide-react'

const HospitalPatients = () => {
  const { theme } = useTheme()
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    diagnosis: ''
  })
  
  const [patients] = useState([
    {
      id: 1,
      name: 'John Smith',
      patientId: 'P001',
      age: 45,
      gender: 'Male',
      doctor: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      lastVisit: '2025-10-28',
      nextVisit: 'Next Visit: 2025-11-15',
      status: 'Recovering',
      statusColor: '#06b6d4'
    },
    {
      id: 2,
      name: 'Emma Wilson',
      patientId: 'P002',
      age: 32,
      gender: 'Female',
      doctor: 'Dr. Michael Chen',
      department: 'Neurology',
      lastVisit: '2025-10-29',
      nextVisit: 'Next Visit: 2025-10-29',
      status: 'Requires Check-up',
      statusColor: '#06b6d4'
    },
    {
      id: 3,
      name: 'Robert Brown',
      patientId: 'P003',
      age: 56,
      gender: 'Male',
      doctor: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      lastVisit: '2025-10-28',
      nextVisit: 'Last Visit: 2025-10-28',
      status: 'Stable, Exercising',
      statusColor: '#10b981'
    },
    {
      id: 4,
      name: 'Lisa Anderson',
      patientId: 'P004',
      age: 24,
      gender: 'Female',
      doctor: 'Dr. Priya Patel',
      department: 'Orthopedics',
      lastVisit: '2025-10-31',
      nextVisit: 'Next Visit: 2025-11-15',
      status: 'Recovering Check-up',
      statusColor: '#06b6d4'
    }
  ])

  const filteredPatients = patients.filter(p => {
    if (filterStatus === 'all') return true
    return p.status === filterStatus
  })

  const handleAddPatient = () => {
    alert(`Patient ${newPatient.name} added successfully!`)
    setShowAddModal(false)
    setNewPatient({ name: '', age: '', gender: 'Male', phone: '', diagnosis: '' })
  }

  const patientHistory = {
    appointments: [
      { date: '2025-11-01', doctor: 'Dr. Sarah Johnson', type: 'Consultation', notes: 'Initial checkup' },
      { date: '2025-10-15', doctor: 'Dr. Sarah Johnson', type: 'Follow-up', notes: 'Blood pressure monitoring' },
      { date: '2025-09-20', doctor: 'Dr. Michael Chen', type: 'Consultation', notes: 'Referred from general physician' }
    ],
    reports: [
      { date: '2025-11-01', type: 'Blood Test', result: 'Normal', doctor: 'Dr. Sarah Johnson' },
      { date: '2025-10-15', type: 'ECG', result: 'Stable', doctor: 'Dr. Sarah Johnson' },
      { date: '2025-09-20', type: 'X-Ray', result: 'Clear', doctor: 'Dr. Michael Chen' }
    ]
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Patients</h1>
          <p style={{ color: theme.textSecondary, margin: 0 }}>Complete list of patients and their visit history</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Filter size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '0.75rem 1rem 0.75rem 3rem',
                borderRadius: '8px',
                border: `1px solid ${theme.border || '#e2e8f0'}`,
                backgroundColor: theme.cardBackground,
                color: theme.text,
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              <option value="all">All Patients</option>
              <option value="Recovering">Recovering</option>
              <option value="Requires Check-up">Requires Check-up</option>
              <option value="Stable, Exercising">Stable</option>
            </select>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            <Plus size={18} />
            Add Patient
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {filteredPatients.map(patient => (
          <div 
            key={patient.id} 
            className="card" 
            style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}
            onClick={() => setSelectedPatient(patient)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>{patient.name}</h3>
                <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>ID: {patient.patientId}</p>
              </div>
              <span style={{
                padding: '0.5rem 1rem',
                backgroundColor: `${patient.statusColor}20`,
                color: patient.statusColor,
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {patient.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                  {patient.age}y • {patient.gender}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stethoscope size={16} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                  {patient.doctor}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                  {patient.nextVisit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ color: theme.text, margin: '0 0 0.5rem 0' }}>{selectedPatient.name}</h2>
                <p style={{ color: theme.textSecondary, margin: 0 }}>Patient ID: {selectedPatient.patientId}</p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.textSecondary
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Patient Info */}
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: theme.background || '#f8fafc', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Age & Gender</p>
                  <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{selectedPatient.age}y • {selectedPatient.gender}</p>
                </div>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Status</p>
                  <p style={{ color: selectedPatient.statusColor, margin: 0, fontWeight: '500' }}>{selectedPatient.status}</p>
                </div>
                <div>
                  <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Assigned Doctor</p>
                  <p style={{ color: theme.text, margin: 0, fontWeight: '500' }}>{selectedPatient.doctor}</p>
                </div>
              </div>
            </div>

            {/* Appointment History */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: theme.text, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} />
                Appointment History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {patientHistory.appointments.map((apt, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background || '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: theme.text, fontWeight: '500' }}>{apt.type}</span>
                      <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>{apt.date}</span>
                    </div>
                    <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{apt.doctor}</p>
                    <p style={{ color: theme.text, margin: 0, fontSize: '0.9rem' }}>{apt.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reports */}
            <div>
              <h3 style={{ color: theme.text, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} />
                Medical Reports
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {patientHistory.reports.map((report, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background || '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: theme.text, fontWeight: '500' }}>{report.type}</span>
                      <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>{report.date}</span>
                    </div>
                    <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{report.doctor}</p>
                    <p style={{ color: '#10b981', margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>Result: {report.result}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: theme.text, margin: 0 }}>Add New Patient</h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.textSecondary
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                  Patient Name
                </label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="Enter patient name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: theme.cardBackground,
                    color: theme.text
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Age
                  </label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    placeholder="Age"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${theme.border || '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: theme.cardBackground,
                      color: theme.text
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Gender
                  </label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${theme.border || '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: theme.cardBackground,
                      color: theme.text
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  placeholder="Enter phone number"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: theme.cardBackground,
                    color: theme.text
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                  Initial Diagnosis
                </label>
                <textarea
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                  placeholder="Enter initial diagnosis"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: theme.cardBackground,
                    color: theme.text,
                    border: `1px solid ${theme.border || '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPatient}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Add Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HospitalPatients
