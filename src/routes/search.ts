import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const searchRoutes = new Hono()

// Search songs
searchRoutes.get('/search/songs', zValidator('query', z.object({
  query: z.string(),
  lyrics: z.string().optional(),
  page: z.string().optional()
})), async (c) => {
  const { query, lyrics, page } = c.req.valid('query')
  
  try {
    const searchController = await import('../controllers/search')
    const results = await searchController.searchSongs(query, lyrics === 'true', parseInt(page) || 1)
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Search albums
searchRoutes.get('/search/albums', zValidator('query', z.object({
  query: z.string(),
  page: z.string().optional()
})), async (c) => {
  const { query, page } = c.req.valid('query')
  
  try {
    const searchController = await import('../controllers/search')
    const results = await searchController.searchAlbums(query, parseInt(page) || 1)
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Search all (songs, albums, artists, playlists)
searchRoutes.get('/search/all', zValidator('query', z.object({
  query: z.string()
})), async (c) => {
  const { query } = c.req.valid('query')
  
  try {
    const searchController = await import('../controllers/search')
    const results = await searchController.searchAll(query)
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

export { searchRoutes }