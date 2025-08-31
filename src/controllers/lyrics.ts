import { fetchLyricsById, fetchSongIdFromUrl } from '../services/jiosaavn'

export async function getLyricsById(id: string) {
  try {
    const lyrics = await fetchLyricsById(id)
    return lyrics
  } catch (error) {
    throw new Error(`Failed to fetch lyrics: ${error.message}`)
  }
}

export async function getSongIdFromUrl(url: string) {
  try {
    const songId = await fetchSongIdFromUrl(url)
    return songId
  } catch (error) {
    throw new Error(`Failed to extract song ID from URL: ${error.message}`)
  }
}