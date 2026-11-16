import { useState, useEffect } from 'react'
import './App.css'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop'

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  // Close the popup with the Escape key
  useEffect(() => {
    if (!selected) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      setError(null)
      const API_URL =
        import.meta.env.VITE_API_URL ||
        'https://backend-node-production-8d11.up.railway.app'
      const response = await fetch(`${API_URL}/api/books`)
      const result = await response.json()

      if (result.success) {
        setBooks(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to connect to the server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageError = (e) => {
    e.target.onerror = null
    e.target.src = FALLBACK_IMAGE
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>📚 Book Collection</h1>
          <p className="subtitle">Browse our curated collection of books</p>
        </div>
      </header>

      <main className="main-content">
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading books...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchBooks}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="stats-bar">
              <span className="stat">
                <strong>{books.length}</strong> books in collection
              </span>
            </div>
            <div className="books-grid">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="book-card"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelected(book)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelected(book)
                    }
                  }}
                >
                  <div className="book-image">
                    <img
                      src={book.image}
                      alt={book.name}
                      loading="lazy"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="book-info">
                    <h3 className="book-title">{book.name}</h3>
                    <p className="book-author">by {book.author}</p>
                    <span className="book-category">{book.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 100,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              color: '#222',
              padding: 24,
              borderRadius: 12,
              width: '100%',
              maxWidth: 380,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
            }}
          >
            <img
              src={selected.image}
              alt={selected.name}
              onError={handleImageError}
              style={{
                width: '100%',
                maxHeight: '35vh',
                objectFit: 'cover',
                borderRadius: 8,
                marginBottom: 16,
                display: 'block',
              }}
            />
            <h2 style={{ margin: '0 0 8px' }}>{selected.name}</h2>
            <p style={{ margin: '0 0 4px' }}>by {selected.author}</p>
            <p style={{ margin: '0 0 16px' }}>Category: {selected.category}</p>
            <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>Summary</h3>
            <p style={{ margin: '0 0 20px', lineHeight: 1.5 }}>
              {selected.summary || 'No summary yet for this book.'}
            </p>
            <button
              autoFocus
              onClick={() => setSelected(null)}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#333',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 15,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>Built with React + Node.js + Express + MongoDB</p>
      </footer>
    </div>
  )
}

export default App
