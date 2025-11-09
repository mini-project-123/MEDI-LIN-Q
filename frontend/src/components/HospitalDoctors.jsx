import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Stethoscope, Mail, Phone, Award } from 'lucide-react'

const HospitalDoctors = () => {
  const { theme } = useTheme()
  const [doctors] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      doctorId: 'D001',
      degree: 'MD, FACC',
      specialty: 'Cardiology',
      experience: '15 years experience',
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@hospital.com',
      badge: 'Cardiology',
      badgeColor: '#3b82f6'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      doctorId: 'D002',
      degree: 'MD, FACS',
      specialty: 'Diabetes Management',
      experience: '10 years experience',
      phone: '+1 (555) 234-5678',
      email: 'michael.chen@hospital.com',
      badge: 'Endocrinology',
      badgeColor: '#06b6d4'
    },
    {
      id: 3,
      name: 'Dr. Priya Patel',
      doctorId: 'D003',
      degree: 'MS, FACS',
      specialty: 'High-Risk Pregnancy',
      experience: '12 years experience',
      phone: '+1 (555) 345-6789',
      email: 'priya.patel@hospital.com',
      badge: 'Obstetrics & Gynecology',
      badgeColor: '#8b5cf6'
    },
    {
      id: 4,
      name: 'Dr. David Lee',
      doctorId: 'D004',
      degree: 'MD, FAANS',
      specialty: 'Joint Replacement',
      experience: '20 years experience',
      phone: '+1 (555) 456-7890',
      email: 'david.lee@hospital.com',
      badge: 'Orthopedics',
      badgeColor: '#10b981'
    },
    {
      id: 5,
      name: 'Dr. Emily Rodriguez',
      doctorId: 'D005',
      degree: 'MD, FACS',
      specialty: 'General Medicine',
      experience: '8 years experience',
      phone: '+1 (555) 567-8901',
      email: 'emily.rodriguez@hospital.com',
      badge: 'Internal Medicine',
      badgeColor: '#f59e0b'
    },
    {
      id: 6,
      name: 'Dr. Thomas Anderson',
      doctorId: 'D006',
      degree: 'MS, FACS',
      specialty: 'General Surgery',
      experience: '22 years experience',
      phone: '+1 (555) 678-9012',
      email: 'thomas.anderson@hospital.com',
      badge: 'Surgery',
      badgeColor: '#ef4444'
    }
  ])

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: theme.text, margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Doctors</h1>
        <p style={{ color: theme.textSecondary, margin: 0 }}>Medical professionals working in our hospital</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {doctors.map(doctor => (
          <div key={doctor.id} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ color: theme.text, margin: '0 0 0.25rem 0' }}>{doctor.name}</h3>
                <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>ID: {doctor.doctorId}</p>
              </div>
              <span style={{
                padding: '0.5rem 1rem',
                backgroundColor: `${doctor.badgeColor}20`,
                color: doctor.badgeColor,
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {doctor.badge}
              </span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: theme.text, margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: '500' }}>
                {doctor.degree}
              </p>
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>
                {doctor.specialty}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={16} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
                  {doctor.experience}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
                  {doctor.phone}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} style={{ color: theme.textSecondary }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
                  {doctor.email}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HospitalDoctors
