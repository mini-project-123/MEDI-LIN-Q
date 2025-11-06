import React from 'react'
import { Star, Heart, TrendingUp, Users } from 'lucide-react'

const SuccessStories = ({ userRole = 'patient' }) => {
  const patientStories = [
    {
      name: 'Priya Sharma',
      condition: 'Diabetes Management',
      improvement: '40% better glucose control',
      story: 'MedLinq helped me track my diabetes better than ever. The analytics showed patterns I never noticed!',
      avatar: 'P',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      condition: 'Heart Health',
      improvement: 'Prevented major cardiac event',
      story: 'Early detection through MedLinq\'s health monitoring saved my life. Forever grateful!',
      avatar: 'R',
      rating: 5
    }
  ]

  const doctorStories = [
    {
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      improvement: '300% more patients',
      story: 'MedLinq transformed my practice. I now reach more patients and provide better care with data insights.',
      avatar: 'S',
      rating: 5
    },
    {
      name: 'Dr. Michael Chen',
      specialty: 'Neurology',
      improvement: '50% time savings',
      story: 'The analytics dashboard helps me make faster, more accurate diagnoses. My patients love the convenience!',
      avatar: 'M',
      rating: 5
    }
  ]

  const stories = userRole === 'doctor' ? doctorStories : patientStories

  return (
    <div className="card" style={{ marginTop: '2rem', backgroundColor: '#f8fafc' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Heart size={24} style={{ color: '#ef4444' }} />
          Success Stories
        </h3>
        <p style={{ color: '#64748b' }}>
          Real results from real {userRole === 'doctor' ? 'doctors' : 'patients'}
        </p>
      </div>

      <div className="grid grid-2" style={{ gap: '1.5rem' }}>
        {stories.map((story, index) => (
          <div key={index} className="card" style={{ backgroundColor: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>
                {story.avatar}
              </div>
              <div>
                <h4 style={{ color: '#1e293b', marginBottom: '0.25rem' }}>
                  {story.name}
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                  {story.condition || story.specialty}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', marginBottom: '1rem' }}>
              {[...Array(story.rating)].map((_, i) => (
                <Star key={i} size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
              ))}
            </div>

            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#10b981', 
              color: 'white',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <TrendingUp size={20} style={{ marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontWeight: '600' }}>{story.improvement}</p>
            </div>

            <p style={{ color: '#64748b', fontStyle: 'italic', lineHeight: '1.6' }}>
              "{story.story}"
            </p>
          </div>
        ))}
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#dbeafe',
        borderRadius: '0.75rem'
      }}>
        <Users size={32} style={{ color: '#3b82f6', margin: '0 auto 0.5rem' }} />
        <h4 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
          Join 10,000+ Happy {userRole === 'doctor' ? 'Doctors' : 'Patients'}
        </h4>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Experience the difference MedLinq makes in healthcare management
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>4.9★</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>App Rating</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>98%</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Satisfaction</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>24/7</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Support</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuccessStories