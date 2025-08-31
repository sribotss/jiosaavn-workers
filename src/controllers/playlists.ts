import { fetchPlaylistById, fetchPlaylistIdFromUrl } from '../services/jiosaavn'

export async function getPlaylistById(id: string, includeLyrics: boolean = false) {
  try {
    const playlist = await fetchPlaylistById(id, includeLyrics)
    return playlist
  } catch (error) {
    throw new Error(`Failed to fetch playlist: ${error.message}`)
  }
}

export async function getPlaylistIdFromUrl(url: string) {
  try {
    const playlistId = await fetchPlaylistIdFromUrl(url)
    return playlistId
  } catch (error) {
    throw new Error(`Failed to extract playlist ID from URL: ${error.message}`)
  }
}