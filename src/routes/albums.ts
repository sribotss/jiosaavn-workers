import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const albumRoutes = new Hono()

// Get album by ID or link
albumRoutes.get('/albums', zValidator('query', z.object({
  id: z.string().optional(),
  link: z.string().url().optional(),
  lyrics: z.string().optional()
})), async (c) => {
  const { id, link, lyrics } = c.req.valid('query')
  
  try {
    const albumController = await import('../controllers/albums')
    
    if (link) {
      const albumId = await albumController.getAlbumIdFromUrl(link)
      const album = await albumController.getAlbumById(albumId, lyrics === 'true')
      return c.json({ success: true, data: album })
    } else if (id) {
      const album = await albumController.getAlbumById(id, lyrics === 'true')
      return c.json({ success: true, data: album })
    } else {
      return c.json({ success: false, message: 'Either album ID or link is required' }, 400)
    }
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Get album by ID (path parameter)
albumRoutes.get('/albums/:id', zValidator('param', z.object({
  id: z.string()
})), async (c) => {
  const { id } = c.req.valid('param')
  const lyrics = c.req.query('lyrics')
  
  try {
    const albumController = await import('../controllers/albums')
    const album = await albumController.getAlbumById(id, lyrics === 'true')
    return c.json({ success: true, data: album })
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500)
  }
})

export { albumRoutes }