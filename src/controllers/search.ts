import { searchSongs, searchAlbums, searchAll } from '../services/jiosaavn'

export async function searchSongs(query: string, includeLyrics: boolean = false, page: number = 1) {
  try {
    const results = await searchSongs(query, includeLyrics, page)
    return results
  } catch (error) {
    throw new Error(`Failed to search songs: ${error.message}`)
  }
}

export async function searchAlbums(query: string, page: number = 1) {
  try {
    const results = await searchAlbums(query, page)
    return results
  } catch (error) {
    throw new Error(`Failed to search albums: ${error.message}`)
  }
}

export async function searchAll(query: string) {
  try {
    const results = await searchAll(query)
    return results
  } catch (error) {
    throw new Error(`Failed to search: ${error.message}`)
  }
}