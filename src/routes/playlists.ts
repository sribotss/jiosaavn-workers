import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const playlistRoutes = new Hono()

// Get playlist by ID or link
playlistRoutes.get('/playlists', zValidator('query', z.object({
  id: z.string().optional(),
  link: z.string().url().optional(),
  lyrics: z.string().optional()
})), async (c) => {
  const { id, link, lyrics } = c.req.valid('query')
  
  try {
    const playlistController = await import('../controllers/playlists')
    
    if (link) {
      const playlistId = await playlistController.getPlaylistIdFromUrl(link)
      const playlist = await playlistController.getPlaylistById(playlistId, lyrics === 'true')
      return c.json({ success: true, data: playlist })
    } else if (id) {
      const playlist = await playlistController.getPlaylistById(id, lyrics === 'true')
      return c.json({ success: true, data: playlist })
    } else {
      return c.json({ success: false, message: 'Either playlist ID or link is required' }, 400)
    }
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Get playlist by ID (path parameter)
playlistRoutes.get('/playlists/:id', zValidator('param', z.object({
  id: z.string()
})), async (c) => {
  const { id } = c.req.valid('param')
  const lyrics = c.req.query('lyrics')
  
  try {
    const playlistController = await import('../controllers/playlists')
    const playlist = await playlistController.getPlaylistById(id, lyrics === 'true')
    return c.json({ success: true, data: playlist })
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

export { playlistRoutes }