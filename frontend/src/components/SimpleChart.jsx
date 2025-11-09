import React from 'react'

const SimpleChart = ({ data, type = 'bar', title, color = '#3b82f6' }) => {
  const maxValue = Math.max(...data.map(item => item.value))

  const renderBarChart = () => (
    <div style={{ display: 'flex', alignItems: 'end', gap: '0.5rem', height: '200px', padding: '1rem 0' }}>
      {data.map((item, index) => (
        <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: '100%',
              backgroundColor: color,
              borderRadius: '4px 4px 0 0',
              height: `${(item.value / maxValue) * 150}px`,
              minHeight: '10px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb'
              e.target.style.transform = 'scaleY(1.05)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = color
              e.target.style.transform = 'scaleY(1)'
            }}
            title={`${item.label}: ${item.value}`}
          />
          <span style={{ 
            fontSize: '0.8rem', 
            color: '#64748b', 
            marginTop: '0.5rem',
            textAlign: 'center',
            transform: 'rotate(-45deg)',
            transformOrigin: 'center'
          }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )

  const renderLineChart = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - (item.value / maxValue) * 80
      return `${x},${y}`
    }).join(' ')

    return (
      <div style={{ height: '200px', padding: '1rem 0' }}>
        <svg width="100%" height="150" style={{ overflow: 'visible' }}>
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={points}
            style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))' }}
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - (item.value / maxValue) * 80
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill={color}
                style={{ cursor: 'pointer' }}
                title={`${item.label}: ${item.value}`}
              />
            )
          })}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          {data.map((item, index) => (
            <span key={index} style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = 0
    const radius = 60
    const centerX = 80
    const centerY = 80

    return (
      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <svg width="160" height="160">
            {data.map((item, index) => {
              const angle = (item.value / total) * 360
              const startAngle = currentAngle
              const endAngle = currentAngle + angle
              currentAngle += angle

              const startX = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180)
              const startY = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180)
              const endX = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180)
              const endY = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180)

              const largeArcFlag = angle > 180 ? 1 : 0

              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
              const itemColor = colors[index % colors.length]

              return (
                <path
                  key={index}
                  d={`M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                  fill={itemColor}
                  stroke="white"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  title={`${item.label}: ${item.value} (${((item.value / total) * 100).toFixed(1)}%)`}
                />
              )
            })}
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.map((item, index) => {
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
              const itemColor = colors[index % colors.length]
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: itemColor, 
                    borderRadius: '2px' 
                  }} />
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    {item.label}: {item.value}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h4 style={{ color: '#1e293b', marginBottom: '1rem', textAlign: 'center' }}>
        {title}
      </h4>
      {type === 'bar' && renderBarChart()}
      {type === 'line' && renderLineChart()}
      {type === 'pie' && renderPieChart()}
    </div>
  )
}

export default SimpleChart