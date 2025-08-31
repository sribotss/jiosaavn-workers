import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const lyricsRoutes = new Hono()

// Get lyrics by song ID or link
lyricsRoutes.get('/lyrics', zValidator('query', z.object({
  id: z.string().optional(),
  link: z.string().url().optional()
})), async (c) => {
  const { id, link } = c.req.valid('query')
  
  try {
    const lyricsController = await import('../controllers/lyrics')
    
    if (link) {
      const songId = await lyricsController.getSongIdFromUrl(link)
      const lyrics = await lyricsController.getLyricsById(songId)
      return c.json({ success: true, data: { lyrics } })
    } else if (id) {
      const lyrics = await lyricsController.getLyricsById(id)
      return c.json({ success: true, data: { lyrics } })
    } else {
      return c.json({ success: false, message: 'Either song ID or link is required' }, 400)
    }
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Get lyrics by song ID (path parameter)
lyricsRoutes.get('/lyrics/:id', zValidator('param', z.object({
  id: z.string()
})), async (c) => {
  const { id } = c.req.valid('param')
  
  try {
    const lyricsController = await import('../controllers/lyrics')
    const lyrics = await lyricsController.getLyricsById(id)
    return c.json({ success: true, data: { lyrics } })
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

export { lyricsRoutes }