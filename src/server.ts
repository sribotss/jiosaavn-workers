import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

// Import route handlers
import { songRoutes } from './routes/songs'
import { albumRoutes } from './routes/albums'
import { playlistRoutes } from './routes/playlists'
import { searchRoutes } from './routes/search'
import { lyricsRoutes } from './routes/lyrics'

const app = new Hono()

// Global middlewares
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors())

// Health check route
app.get('/', (c) => {
  return c.redirect('https://cyberboysumanjay.github.io/JioSaavnAPI/', 302)
})

// API routes
app.route('/api', songRoutes)
app.route('/api', albumRoutes)
app.route('/api', playlistRoutes)
app.route('/api', searchRoutes)
app.route('/api', lyricsRoutes)

// Legacy endpoints for compatibility with original API
app.get('/song', async (c) => {
  const query = c.req.query('query')
  const lyrics = c.req.query('lyrics')
  
  if (!query) {
    return c.json({ success: false, message: 'Query is required' }, 400)
  }

  try {
    const { getSongById, getSongByLink } = await import('./controllers/songs')
    
    let result
    if (query.includes('jiosaavn.com')) {
      result = await getSongByLink(query, lyrics === 'true')
    } else {
      // For search queries, we need to get song IDs first
      const { searchSongs } = await import('./controllers/search')
      const searchResults = await searchSongs(query, lyrics === 'true')
      result = searchResults[0] || null
    }
    
    if (!result) {
      return c.json({ success: false, message: 'Song not found' }, 404)
    }
    
    return c.json(result)
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

app.get('/album', async (c) => {
  const query = c.req.query('query')
  
  if (!query) {
    return c.json({ success: false, message: 'Query is required' }, 400)
  }

  try {
    const { getAlbumByLink } = await import('./controllers/albums')
    const result = await getAlbumByLink(query)
    return c.json(result)
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

app.get('/playlist', async (c) => {
  const query = c.req.query('query')
  
  if (!query) {
    return c.json({ success: false, message: 'Query is required' }, 400)
  }

  try {
    const { getPlaylistByLink } = await import('./controllers/playlists')
    const result = await getPlaylistByLink(query)
    return c.json(result)
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

app.get('/lyrics', async (c) => {
  const query = c.req.query('query')
  
  if (!query) {
    return c.json({ success: false, message: 'Query is required' }, 400)
  }

  try {
    const { getLyrics } = await import('./controllers/lyrics')
    let lyricsId = query
    
    if (query.includes('jiosaavn.com')) {
      const { getSongIdFromUrl } = await import('./controllers/songs')
      lyricsId = await getSongIdFromUrl(query)
    }
    
    const lyrics = await getLyrics(lyricsId)
    return c.json({ lyrics })
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Universal endpoint (like the original)
app.get('/result', async (c) => {
  const query = c.req.query('query')
  const lyrics = c.req.query('lyrics')
  
  if (!query) {
    return c.json({ success: false, message: 'Query is required' }, 400)
  }

  try {
    if (!query.includes('saavn')) {
      // Search for songs
      const { searchSongs } = await import('./controllers/search')
      const result = await searchSongs(query, lyrics === 'true')
      return c.json(result)
    }

    // Handle JioSaavn URLs
    if (query.includes('/song/')) {
      const { getSongById, getSongIdFromUrl } = await import('./controllers/songs')
      const songId = await getSongIdFromUrl(query)
      const song = await getSongById(songId, lyrics === 'true')
      return c.json([song])
    } else if (query.includes('/album/')) {
      const { getAlbumById, getAlbumIdFromUrl } = await import('./controllers/albums')
      const albumId = await getAlbumIdFromUrl(query)
      const album = await getAlbumById(albumId)
      return c.json(album)
    } else if (query.includes('/playlist/') || query.includes('/featured/')) {
      const { getPlaylistById, getPlaylistIdFromUrl } = await import('./controllers/playlists')
      const playlistId = await getPlaylistIdFromUrl(query)
      const playlist = await getPlaylistById(playlistId)
      return c.json(playlist)
    } else {
      return c.json({ success: false, message: 'Unsupported JioSaavn URL format' }, 400)
    }
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, message: 'Route not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ success: false, message: 'Internal server error' }, 500)
})

export default app