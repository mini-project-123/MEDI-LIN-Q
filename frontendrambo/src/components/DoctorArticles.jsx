import React, { useState, useEffect } from 'react'
import { FileText, Plus, Edit, Trash2, Eye, Calendar, User } from 'lucide-react'
import axios from 'axios'

const DoctorArticles = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/doctor/articles/')
      setArticles(response.data)
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateArticle = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/doctor/articles/', newArticle)
      setNewArticle({ title: '', content: '', category: '', tags: '' })
      setShowCreateForm(false)
      fetchArticles()
    } catch (error) {
      console.error('Error creating article:', error)
    }
  }

  const deleteArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return
    }

    try {
      await axios.delete(`/api/doctor/articles/${articleId}/`)
      fetchArticles()
    } catch (error) {
      console.error('Error deleting article:', error)
    }
  }

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
      {/* Header with Create Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ color: '#1e293b', margin: '0 0 0.5rem 0' }}>Medical Articles</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Share knowledge and insights with the medical community</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          Create Article
        </button>
      </div>

      {/* Create Article Form */}
      {showCreateForm && (
        <div className="card mb-6">
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Create New Article</h3>
          <form onSubmit={handleCreateArticle}>
            <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                  className="form-input"
                  placeholder="Article title"
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
                  <option value="neurology">Neurology</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="general">General Medicine</option>
                  <option value="research">Research</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                value={newArticle.content}
                onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                className="form-input"
                placeholder="Write your article content here..."
                rows="8"
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
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
          My Articles ({articles.length})
        </h3>

        {articles.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {articles.map((article) => (
              <div 
                key={article.id}
                style={{ 
                  padding: '1.5rem', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.75rem',
                  backgroundColor: '#fafafa'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                      {article.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '0.25rem',
                        fontSize: '0.8rem',
                        textTransform: 'capitalize'
                      }}>
                        {article.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.9rem' }}>
                        <Calendar size={14} />
                        {new Date(article.created_at).toLocaleDateString()}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.9rem' }}>
                        <Eye size={14} />
                        {article.views || 0} views
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '0.5rem' }}>
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => deleteArticle(article.id)}
                      className="btn btn-secondary" 
                      style={{ 
                        fontSize: '0.9rem', 
                        padding: '0.5rem',
                        backgroundColor: '#ef4444'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p style={{ 
                  color: '#64748b', 
                  marginBottom: '1rem',
                  lineHeight: '1.6'
                }}>
                  {article.content.substring(0, 200)}...
                </p>

                {article.tags && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {article.tags.split(',').map((tag, index) => (
                      <span 
                        key={index}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#e5e7eb',
                          color: '#64748b',
                          borderRadius: '0.25rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                    <Eye size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    View Full Article
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
              No articles published yet
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Share your medical knowledge by creating your first article
            </p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Create Your First Article
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorArticles