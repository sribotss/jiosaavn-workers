import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const songRoutes = new Hono()

// Get song by ID or link
songRoutes.get('/songs', zValidator('query', z.object({
  id: z.string().optional(),
  link: z.string().url().optional(),
  lyrics: z.string().optional()
})), async (c) => {
  const { id, link, lyrics } = c.req.valid('query')
  
  try {
    const songController = await import('../controllers/songs')
    
    if (link) {
      const songId = await songController.getSongIdFromUrl(link)
      const song = await songController.getSongById(songId, lyrics === 'true')
      return c.json({ success: true, data: song })
    } else if (id) {
      const song = await songController.getSongById(id, lyrics === 'true')
      return c.json({ success: true, data: song })
    } else {
      return c.json({ success: false, message: 'Either song ID or link is required' }, 400)
    }
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Get song by ID (path parameter)
songRoutes.get('/songs/:id', zValidator('param', z.object({
  id: z.string()
})), async (c) => {
  const { id } = c.req.valid('param')
  const lyrics = c.req.query('lyrics')
  
  try {
    const songController = await import('../controllers/songs')
    const song = await songController.getSongById(id, lyrics === 'true')
    return c.json({ success: true, data: song })
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

export { songRoutes }