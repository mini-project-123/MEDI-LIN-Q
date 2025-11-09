import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Users, Phone, Mail, Briefcase, Plus, X } from 'lucide-react'

const HospitalStaff = () => {
  const { theme } = useTheme()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Nurse',
    department: '',
    phone: '',
    email: ''
  })
  
  const [staff] = useState([
    { id: 1, name: 'Jennifer Brown', staffId: 'S001', role: 'Head Nurse', department: 'Cardiology', phone: '+1 (555) 123-3333', status: 'Working', statusColor: '#10b981' },
    { id: 2, name: 'Michael Davis', staffId: 'S002', role: 'Senior Nurse', department: 'Orthopedics', phone: '+1 (555) 123-3333', status: 'Working', statusColor: '#10b981' },
    { id: 3, name: 'Sarah Wilson', staffId: 'S003', role: 'Nurse', department: 'Obstetrics & Gynecology', phone: '+1 (555) 123-4444', status: 'Night Shift', statusColor: '#8b5cf6' },
    { id: 4, name: 'David Martinez', staffId: 'S004', role: 'Lab Technician', department: 'Laboratory', phone: '+1 (555) 456-5555', status: 'Working', statusColor: '#10b981' },
    { id: 5, name: 'Emily Taylor', staffId: 'S005', role: 'Radiologist Technician', department: 'Radiology', phone: '+1 (555) 555-6666', status: 'Working', statusColor: '#10b981' },
    { id: 6, name: 'Robert Johnson', staffId: 'S006', role: 'Pharmacist', department: 'Pharmacy', phone: '+1 (555) 666-7777', status: 'Working', statusColor: '#10b981' },
    { id: 7, name: 'Lisa Anderson', staffId: 'S007', role: 'Administrative Staff', department: 'Administration', phone: '+1 (555) 888-9999', status: 'Working', statusColor: '#10b981' },
    { id: 8, name: 'James White', staffId: 'S008', role: 'Security Officer', department: 'Security', phone: '+1 (555) 888-9999', status: 'Night', statusColor: '#8b5cf6' }
  ])

  const handleAddStaff = () => {
    alert(`Staff member ${newStaff.name} added successfully!`)
    setShowAddModal(false)
    setNewStaff({ name: '', role: 'Nurse', department: '', phone: '', email: '' })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Staff Directory</h1>
          <p style={{ color: theme.textSecondary, margin: 0 }}>Complete directory of hospital staff members</p>
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
          Add Staff
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {staff.map(member => (
          <div key={member.id} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>{member.name}</h3>
                <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>ID: {member.staffId}</p>
              </div>
              <span style={{
                padding: '0.5rem 1rem',
                backgroundColor: `${member.statusColor}20`,
                color: member.statusColor,
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {member.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={16} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                  {member.role}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                  {member.department}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                  {member.phone}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
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
              <h2 style={{ color: theme.text, margin: 0 }}>Add New Staff Member</h2>
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
                  Staff Name
                </label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="Enter staff name"
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
                    Role
                  </label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
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
                    <option value="Nurse">Nurse</option>
                    <option value="Technician">Technician</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Support">Support</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    placeholder="Department"
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
              </div>

              <div>
                <label style={{ display: 'block', color: theme.text, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
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
                  Email Address
                </label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="Enter email address"
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
                  onClick={handleAddStaff}
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
                  Add Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HospitalStaff
