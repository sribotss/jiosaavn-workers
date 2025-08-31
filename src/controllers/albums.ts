import { fetchAlbumById, fetchAlbumIdFromUrl } from '../services/jiosaavn'

export async function getAlbumById(id: string, includeLyrics: boolean = false) {
  try {
    const album = await fetchAlbumById(id, includeLyrics)
    return album
  } catch (error) {
    throw new Error(`Failed to fetch album: ${error.message}`)
  }
}

export async function getAlbumIdFromUrl(url: string) {
  try {
    const albumId = await fetchAlbumIdFromUrl(url)
    return albumId
  } catch (error) {
    throw new Error(`Failed to extract album ID from URL: ${error.message}`)
  }
}