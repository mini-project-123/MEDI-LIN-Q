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
import axios from 'axios' // 1. IMPORT AXIOS

const Articles = () => {
  const { user } = useAuth() // Get the logged-in user
  const { theme } = useTheme()
  const [articles, setArticles] = useState([])
  
  // 2. "My Articles" logic is removed for now, as the backend doesn't support it
  // const [myArticles, setMyArticles] = useState([]) 
  
  const [loading, setLoading] = useState(true)
  
  // 3. "activeTab" is removed, as we will only show "All Articles"
  // const [activeTab, setActiveTab] = useState('all')
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: '', // Note: Your backend Article model doesn't have category/tags.
    tags: '',
    summary: '' // Note: Your backend Article model doesn't have summary.
  })

  useEffect(() => {
    fetchArticles()
  }, [])

  // 4. UPDATED to fetch from backend
  const fetchArticles = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken') // Needed for auth, even for GET
      
      //
      const response = await axios.get('/api/articles/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setArticles(response.data)
      
      // 5. We can't filter "My Articles" reliably without the user's full name,
      //    so we will leave this part out for now.
      // const userArticles = response.data.filter(article => ...);
      // setMyArticles(userArticles);

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

  // 6. UPDATED to POST to the backend
  const handleCreateArticle = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('accessToken')
      
      // Prepare the data. The backend only accepts 'title' and 'content'.
      //
      const articleData = {
        title: newArticle.title,
        content: newArticle.content
        // 'author' and 'status' are set automatically by the backend view
      }

      //
      await axios.post('/api/articles/', articleData, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Reset form, hide it, and refresh the list
      setNewArticle({ title: '', content: '', category: '', tags: '', summary: '' })
      setShowCreateForm(false)
      fetchArticles() // Re-fetch to see the new article
      alert('Article published successfully!')

    } catch (error) {
      console.error('Error creating article:', error)
      alert('Failed to publish article. Please try again.')
    }
  }

  // 7. UPDATED: Delete functionality with backend API call
  const deleteArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      await axios.delete(`/api/articles/${articleId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      alert('Article deleted successfully!')
      fetchArticles() // Refresh the article list
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Failed to delete article. You can only delete your own articles.')
    }
  }

  const handleLike = (articleId) => {
    // This is frontend-only for now, as backend doesn't track likes
    setArticles(articles.map(article => 
      article.id === articleId 
        ? { ...article, likes: (article.likes || 0) + 1 }
        : article
    ))
  }

  // 8. Filter logic is simplified
  const filteredArticles = articles.filter(article => {
    // We can't filter by category or tags, as they aren't in the backend model
    // const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    
    // We can only filter by title and content
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase())
                        
    return matchesSearch // && matchesCategory
  })

  // 9. displayArticles is simplified
  const displayArticles = filteredArticles

  // 10. UPDATED to use backend data structure
  const renderArticleCard = (article, isMyArticle = false) => (
    <div 
      key={article.id}
      className="card"
      style={{ 
        marginBottom: '1.5rem',
        border: `1px solid ${theme.border || '#e5e7eb'}`,
        position: 'relative'
      }}
    >
      {/* "Featured" is not in backend model, so this is removed */}

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
            {/* 11. Use backend serializer structure */}
            {article.author.user?.first_name?.charAt(0) || 'D'}
          </div>
          <div>
            <h4 style={{ 
              margin: 0, 
              fontSize: '0.95rem', 
              fontWeight: '500',
              color: theme.text || '#1e293b'
            }}>
              {article.author.user?.first_name} {article.author.user?.last_name}
            </h4>
            <p style={{ 
              margin: 0, 
              fontSize: '0.8rem', 
              color: theme.textSecondary || '#64748b'
            }}>
              {/* 12. Use backend serializer structure */}
              Dr. • {article.author.specialization}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: theme.textSecondary || '#64748b', fontSize: '0.8rem' }}>
              <Calendar size={12} />
              {new Date(article.created_at).toLocaleDateString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: theme.textSecondary || '#64748b', fontSize: '0.8rem' }}>
              <Clock size={12} />
              {/* 13. Calculate reading time (mock) */}
              {Math.ceil(article.content.length / 1000)} min read
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
            {/* 14. Use content for summary */}
            {`${article.content.substring(0, 150)}...`}
          </p>

          {/* 15. Removed Category and Tags display (not in backend model) */}
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
              {article.views || 0} {/* Mock */}
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
              {article.likes || 0} {/* Mock */}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: theme.textSecondary || '#64748b', fontSize: '0.9rem' }}>
              <MessageCircle size={14} />
              {article.comments || 0} {/* Mock */}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* Show delete button if user is the article author */}
            {user && user.role === 'doctor' && article.author.user?.id === user.id && (
              <button
                onClick={() => deleteArticle(article.id)}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
              >
                <Trash2 size={14} />
                Delete
              </button>
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
            Discover insights from healthcare professionals
          </p>
        </div>
        {/* 17. Show "Write Article" button if user is a doctor or hospital admin */}
        {user && (user.role === 'doctor' || user.role === 'hospital_admin') && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} />
            Write Article
          </button>
        )}
      </div>

      {/* 18. REMOVED Navigation Tabs for "My Articles" */}
      
      {/* Filters and Search */}
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
            placeholder="Search articles by title or content..."
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
        
        {/* 19. Removed Category filter (not supported by backend model) */}
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
            disabled={true} // Disable as it's not in the backend model
          >
            <option value="all">All Categories (Not Implemented)</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create Article Form */}
      {showCreateForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: theme.text || '#1e293b' }}>
            Share Your Knowledge
          </h3>
          <form onSubmit={handleCreateArticle}>
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

            {/* 20. REMOVED Category, Summary, and Tags fields from form */}

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
          displayArticles.map((article) => renderArticleCard(article, false))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
            <h3 style={{ color: theme.text || '#1e293b', marginBottom: '1rem' }}>
              No articles found
            </h3>
            <p style={{ color: theme.textSecondary || '#64748b', fontSize: '1rem' }}>
              {user.role === 'doctor' 
                ? 'Be the first to share your knowledge!'
                : 'Check back later for new articles from our doctors.'
              }
            </p>
            {user && (user.role === 'doctor' || user.role === 'hospital_admin') && (
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