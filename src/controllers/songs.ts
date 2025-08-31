import { fetchSongById, fetchSongIdFromUrl } from '../services/jiosaavn'

export async function getSongById(id: string, includeLyrics: boolean = false) {
  try {
    const song = await fetchSongById(id, includeLyrics)
    return song
  } catch (error) {
    throw new Error(`Failed to fetch song: ${error.message}`)
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