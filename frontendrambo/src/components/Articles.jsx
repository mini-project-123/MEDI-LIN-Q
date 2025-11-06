import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Heart, 
  MessageCircle, 
  Share2, 
  Search, 
  Filter,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Tag
} from 'lucide-react'

const Articles = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [articles, setArticles] = useState([])
  const [myArticles, setMyArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    summary: ''
  })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      
      // Mock articles data with various authors
      const mockArticles = [
        {
          id: 1,
          title: 'Understanding Heart Disease Prevention',
          content: 'Heart disease remains one of the leading causes of death worldwide. However, many cases can be prevented through lifestyle modifications, regular exercise, and proper diet. This comprehensive guide explores evidence-based strategies for maintaining cardiovascular health...',
          summary: 'A comprehensive guide to preventing heart disease through lifestyle changes and medical interventions.',
          category: 'cardiology',
          tags: 'heart disease, prevention, lifestyle, diet, exercise',
          author: {
            name: 'Dr. Sarah Johnson',
            role: 'doctor',
            specialization: 'Cardiology',
            avatar: 'SJ'
          },
          created_at: '2024-01-15T10:00:00Z',
          views: 1250,
          likes: 89,
          comments: 23,
          reading_time: '8 min read',
          featured: true
        },
        {
          id: 2,
          title: 'Mental Health in the Digital Age',
          content: 'The digital revolution has transformed how we live, work, and interact. While technology brings many benefits, it also presents new challenges for mental health. This article examines the impact of digital technology on psychological well-being...',
          summary: 'Exploring the relationship between technology use and mental health in modern society.',
          category: 'psychology',
          tags: 'mental health, technology, digital wellness, stress management',
          author: {
            name: 'Dr. Michael Chen',
            role: 'doctor',
            specialization: 'Psychiatry',
            avatar: 'MC'
          },
          created_at: '2024-01-12T14:30:00Z',
          views: 890,
          likes: 67,
          comments: 15,
          reading_time: '6 min read',
          featured: false
        },
        {
          id: 3,
          title: 'Nutrition Guidelines for Diabetes Management',
          content: 'Managing diabetes effectively requires a comprehensive approach to nutrition. This article provides practical guidelines for meal planning, carbohydrate counting, and making informed food choices that support blood sugar control...',
          summary: 'Practical nutrition advice for effective diabetes management and blood sugar control.',
          category: 'endocrinology',
          tags: 'diabetes, nutrition, blood sugar, meal planning, diet',
          author: {
            name: 'Dr. Emily Rodriguez',
            role: 'doctor',
            specialization: 'Endocrinology',
            avatar: 'ER'
          },
          created_at: '2024-01-10T09:15:00Z',
          views: 1100,
          likes: 78,
          comments: 31,
          reading_time: '10 min read',
          featured: true
        },
        {
          id: 4,
          title: 'My Journey with Chronic Pain Management',
          content: 'Living with chronic pain has taught me valuable lessons about resilience, self-advocacy, and finding hope in difficult times. I want to share my experience to help others who may be facing similar challenges...',
          summary: 'A patient\'s personal story about managing chronic pain and finding effective treatments.',
          category: 'patient-stories',
          tags: 'chronic pain, patient experience, coping strategies, support',
          author: {
            name: 'John Patient',
            role: 'patient',
            specialization: null,
            avatar: 'JP'
          },
          created_at: '2024-01-08T16:45:00Z',
          views: 650,
          likes: 45,
          comments: 18,
          reading_time: '5 min read',
          featured: false
        },
        {
          id: 5,
          title: 'Healthcare Technology Trends 2024',
          content: 'The healthcare industry continues to evolve rapidly with new technologies. From AI-powered diagnostics to telemedicine platforms, this article explores the most significant technological trends shaping healthcare delivery...',
          summary: 'An overview of emerging healthcare technologies and their impact on patient care.',
          category: 'technology',
          tags: 'healthcare technology, AI, telemedicine, innovation, digital health',
          author: {
            name: 'Admin Healthcare',
            role: 'admin',
            specialization: 'Healthcare Administration',
            avatar: 'AH'
          },
          created_at: '2024-01-05T11:20:00Z',
          views: 980,
          likes: 72,
          comments: 26,
          reading_time: '7 min read',
          featured: true
        }
      ]

      // Filter articles by current user for "My Articles" tab
      const userArticles = mockArticles.filter(article => 
        article.author.name === user?.name || 
        (user?.role === 'doctor' && article.author.role === 'doctor') ||
        (user?.role === 'patient' && article.author.name === 'John Patient') ||
        (user?.role === 'admin' && article.author.role === 'admin')
      )

      setArticles(mockArticles)
      setMyArticles(userArticles.slice(0, 2)) // Limit user articles for demo
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', label: 'All Categories', icon: BookOpen },
    { id: 'cardiology', label: 'Cardiology', icon: Heart },
    { id: 'psychology', label: 'Mental Health', icon: User },
    { id: 'endocrinology', label: 'Endocrinology', icon: FileText },
    { id: 'patient-stories', label: 'Patient Stories', icon: MessageCircle },
    { id: 'technology', label: 'Healthcare Tech', icon: TrendingUp },
    { id: 'general', label: 'General Medicine', icon: Award }
  ]

  const handleCreateArticle = async (e) => {
    e.preventDefault()
    try {
      const articleData = {
        ...newArticle,
        id: Date.now(),
        author: {
          name: user?.name || 'Anonymous',
          role: user?.role || 'patient',
          specialization: user?.specialization || null,
          avatar: user?.name?.charAt(0) || 'A'
        },
        created_at: new Date().toISOString(),
        views: 0,
        likes: 0,
        comments: 0,
        reading_time: `${Math.ceil(newArticle.content.length / 200)} min read`,
        featured: false
      }

      setMyArticles([articleData, ...myArticles])
      setArticles([articleData, ...articles])
      setNewArticle({ title: '', content: '', category: '', tags: '', summary: '' })
      setShowCreateForm(false)
      alert('Article published successfully!')
    } catch (error) {
      console.error('Error creating article:', error)
    }
  }

  const deleteArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return
    }

    try {
      setMyArticles(myArticles.filter(article => article.id !== articleId))
      setArticles(articles.filter(article => article.id !== articleId))
      alert('Article deleted successfully!')
    } catch (error) {
      console.error('Error deleting article:', error)
    }
  }

  const handleLike = (articleId) => {
    setArticles(articles.map(article => 
      article.id === articleId 
        ? { ...article, likes: article.likes + 1 }
        : article
    ))
  }

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const displayArticles = activeTab === 'my' ? myArticles : filteredArticles

  const renderArticleCard = (article, isMyArticle = false) => (
    <div 
      key={article.id}
      className="card"
      style={{ 
        marginBottom: '1.5rem',
        border: article.featured ? '2px solid #3b82f6' : `1px solid ${theme.border || '#e5e7eb'}`,
        position: 'relative'
      }}
    >
      {article.featured && (
        <div style={{
          position: 'absolute',
          top: '-1px',
          right: '1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '0 0 0.5rem 0.5rem',
          fontSize: '0.8rem',
          fontWeight: '500'
        }}>
          Featured
        </div>
      )}

      <div style={{ padding: '1.5rem' }}>
        {/* Author Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1rem',
            color: 'white'
          }}>
            {article.author.avatar}
          </div>
          <div>
            <h4 style={{ 
              margin: 0, 
              fontSize: '0.95rem', 
              fontWeight: '500',
              color: theme.text || '#1e293b'
            }}>
              {article.author.name}
            </h4>
            <p style={{ 
              margin: 0, 
              fontSize: '0.8rem', 
              color: theme.textSecondary || '#64748b'
            }}>
              {article.author.role === 'doctor' && `Dr. • ${article.author.specialization}`}
              {article.author.role === 'patient' && 'Patient'}
              {article.author.role === 'admin' && 'Healthcare Admin'}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: theme.textSecondary || '#64748b', fontSize: '0.8rem' }}>
              <Calendar size={12} />
              {new Date(article.created_at).toLocaleDateString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: theme.textSecondary || '#64748b', fontSize: '0.8rem' }}>
              <Clock size={12} />
              {article.reading_time}
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ 
            color: theme.text || '#1e293b', 
            marginBottom: '0.5rem', 
            fontSize: '1.3rem',
            fontWeight: '600'
          }}>
            {article.title}
          </h3>
          
          <p style={{ 
            color: theme.textSecondary || '#64748b', 
            marginBottom: '1rem',
            lineHeight: '1.6',
            fontSize: '0.95rem'
          }}>
            {article.summary || `${article.content.substring(0, 150)}...`}
          </p>

          {/* Category and Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ 
              padding: '0.25rem 0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '0.25rem',
              fontSize: '0.8rem',
              textTransform: 'capitalize',
              fontWeight: '500'
            }}>
              {article.category.replace('-', ' ')}
            </span>
            {article.tags && article.tags.split(',').slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: theme.cardBackground || '#f8fafc',
                  color: theme.textSecondary || '#64748b',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  border: `1px solid ${theme.border || '#e5e7eb'}`
                }}
              >
                <Tag size={10} style={{ display: 'inline', marginRight: '0.25rem' }} />
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Article Stats and Actions */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '1rem',
          borderTop: `1px solid ${theme.border || '#e5e7eb'}`
        }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: theme.textSecondary || '#64748b', fontSize: '0.9rem' }}>
              <Eye size={14} />
              {article.views}
            </div>
            <button
              onClick={() => handleLike(article.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'none',
                border: 'none',
                color: theme.textSecondary || '#64748b',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <Heart size={14} />
              {article.likes}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: theme.textSecondary || '#64748b', fontSize: '0.9rem' }}>
              <MessageCircle size={14} />
              {article.comments}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isMyArticle && (
              <>
                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                >
                  <Edit size={14} style={{ marginRight: '0.25rem' }} />
                  Edit
                </button>
                <button 
                  onClick={() => deleteArticle(article.id)}
                  className="btn btn-secondary" 
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
            <button 
              className="btn btn-primary" 
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              <BookOpen size={14} style={{ marginRight: '0.25rem' }} />
              Read More
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading articles...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ color: theme.text || '#1e293b', margin: '0 0 0.5rem 0' }}>
            Medical Articles & Knowledge Hub
          </h2>
          <p style={{ color: theme.textSecondary || '#64748b', margin: 0 }}>
            Discover insights from healthcare professionals and share your own knowledge
          </p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          Write Article
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: `1px solid ${theme.border || '#e5e7eb'}`
      }}>
        {[
          { id: 'all', label: 'All Articles', count: articles.length },
          { id: 'my', label: 'My Articles', count: myArticles.length }
        ].map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'none',
              color: activeTab === id ? '#3b82f6' : theme.textSecondary,
              borderBottom: activeTab === id ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === id ? '500' : '400'
            }}
          >
            {label}
            <span style={{
              backgroundColor: activeTab === id ? '#3b82f6' : theme.cardBackground || '#f1f5f9',
              color: activeTab === id ? 'white' : theme.textSecondary,
              padding: '0.25rem 0.5rem',
              borderRadius: '0.75rem',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters and Search */}
      {activeTab === 'all' && (
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '300px' }}>
            <Search size={16} style={{ color: theme.textSecondary || '#64748b' }} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: `1px solid ${theme.border || '#e5e7eb'}`,
                borderRadius: '0.5rem',
                fontSize: '0.9rem'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: theme.textSecondary || '#64748b' }} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.5rem',
                border: `1px solid ${theme.border || '#e5e7eb'}`,
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                minWidth: '150px'
              }}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Create Article Form */}
      {showCreateForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: theme.text || '#1e293b' }}>
            Share Your Knowledge
          </h3>
          <form onSubmit={handleCreateArticle}>
            <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Article Title</label>
                <input
                  type="text"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                  className="form-input"
                  placeholder="Enter a compelling title"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={newArticle.category}
                  onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                  className="form-input"
                  required
                >
                  <option value="">Select category</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="psychology">Mental Health</option>
                  <option value="endocrinology">Endocrinology</option>
                  <option value="patient-stories">Patient Stories</option>
                  <option value="technology">Healthcare Technology</option>
                  <option value="general">General Medicine</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Summary</label>
              <textarea
                value={newArticle.summary}
                onChange={(e) => setNewArticle({...newArticle, summary: e.target.value})}
                className="form-input"
                placeholder="Brief summary of your article (150 characters max)"
                rows="2"
                maxLength="150"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                value={newArticle.content}
                onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                className="form-input"
                placeholder="Write your article content here..."
                rows="10"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                value={newArticle.tags}
                onChange={(e) => setNewArticle({...newArticle, tags: e.target.value})}
                className="form-input"
                placeholder="e.g., heart disease, prevention, treatment"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                Publish Article
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Articles List */}
      <div>
        {displayArticles.length > 0 ? (
          displayArticles.map((article) => renderArticleCard(article, activeTab === 'my'))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
            <h3 style={{ color: theme.text || '#1e293b', marginBottom: '1rem' }}>
              {activeTab === 'my' ? 'No articles published yet' : 'No articles found'}
            </h3>
            <p style={{ color: theme.textSecondary || '#64748b', fontSize: '1rem' }}>
              {activeTab === 'my' 
                ? 'Share your knowledge and experience with the community'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {activeTab === 'my' && (
              <button 
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
              >
                Write Your First Article
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Articles