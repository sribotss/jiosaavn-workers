// JioSaavn API service implementation
// Adapted from the original Python version

const BASE_URL = 'https://www.jiosaavn.com/api.php'

// User agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
]

// Helper function to make API requests
async function makeApiRequest(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(BASE_URL)
  url.searchParams.append('__call', endpoint)
  url.searchParams.append('_format', 'json')
  url.searchParams.append('_marker', '0')
  url.searchParams.append('api_version', '4')
  url.searchParams.append('ctx', 'web6dot0')
  
  // Add additional parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })
  
  const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  
  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': randomUserAgent,
      'Accept': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const text = await response.text()
  
  // Fix JSON response (similar to Python version)
  const pattern = /\(From "([^"]+)"\)/
  const fixedJson = text.replace(pattern, "(From '$1')")
  
  try {
    return JSON.parse(fixedJson)
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error.message}`)
  }
}

// URL decryption function (simplified version)
function decryptUrl(encryptedUrl: string): string {
  try {
    // This is a simplified decryption - in production, you'd need proper DES implementation
    // For now, we'll try to extract the URL from common patterns
    const decoded = atob(encryptedUrl.trim())
    
    // Try to extract URL pattern
    const urlMatch = decoded.match(/https?:\/\/[^\s]+/)
    if (urlMatch) {
      return urlMatch[0]
    }
    
    // Fallback: return modified preview URL
    return encryptedUrl
      .replace('preview', 'aac')
      .replace('_96_p.mp4', '_320.mp4')
  } catch (error) {
    console.error('Decryption failed:', error)
    return encryptedUrl
  }
}

// Format song data
function formatSongData(song: any, includeLyrics: boolean = false) {
  try {
    // Decrypt media URL if available
    if (song.encrypted_media_url) {
      song.media_url = decryptUrl(song.encrypted_media_url)
    }
    
    // Upgrade image quality
    if (song.image) {
      song.image = song.image.replace('150x150', '500x500')
    }
    
    // Format text fields
    const formatText = (text: string) => {
      if (typeof text !== 'string') return text
      return text
        .replace(/"/g, "'")
        .replace(/&/g, "&")
        .replace(/'/g, "'")
    }
    
    return {
      id: song.id,
      title: formatText(song.title || song.song),
      album: formatText(song.album),
      artists: formatText(song.primary_artists || song.singers),
      duration: song.duration,
      year: song.year,
      language: song.language,
      image: song.image,
      url: song.perma_url,
      download_url: song.media_url,
      has_lyrics: song.has_lyrics === 'true',
      lyrics: includeLyrics && song.has_lyrics === 'true' ? song.lyrics : null
    }
  } catch (error) {
    console.error('Error formatting song data:', error)
    return song
  }
}

// Export functions
export async function fetchSongById(id: string, includeLyrics: boolean = false) {
  try {
    const response = await makeApiRequest('song.getDetails', { pids: id })
    const songData = response[id]
    
    if (!songData) {
      throw new Error('Song not found')
    }
    
    if (includeLyrics && songData.has_lyrics === 'true') {
      try {
        const lyricsResponse = await makeApiRequest('lyrics.getLyrics', { lyrics_id: songData.id })
        songData.lyrics = lyricsResponse.lyrics
      } catch (error) {
        console.warn('Failed to fetch lyrics:', error)
        songData.lyrics = null
      }
    }
    
    return formatSongData(songData, includeLyrics)
  } catch (error) {
    throw new Error(`Failed to fetch song: ${error.message}`)
  }
}

export async function fetchSongIdFromUrl(url: string) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'bitrate=320'
    })
    
    const text = await response.text()
    
    try {
      return text.split('"pid":"')[1].split('","')[0]
    } catch (e) {
      const songSection = text.split('"song":{"type":"')[1].split('","image":')[0]
      return songSection.split('"id":"').pop()
    }
  } catch (error) {
    throw new Error(`Failed to extract song ID: ${error.message}`)
  }
}

export async function fetchAlbumById(id: string, includeLyrics: boolean = false) {
  try {
    const response = await makeApiRequest('content.getAlbumDetails', { albumid: id })
    
    if (!response.songs || !Array.isArray(response.songs)) {
      throw new Error('Album not found or has no songs')
    }
    
    // Format album info
    const album = {
      id: response.id,
      name: response.title || response.name,
      year: response.year,
      image: response.image?.replace('150x150', '500x500'),
      songs: response.songs.map((song: any) => formatSongData(song, includeLyrics))
    }
    
    return album
  } catch (error) {
    throw new Error(`Failed to fetch album: ${error.message}`)
  }
}

export async function fetchAlbumIdFromUrl(url: string) {
  try {
    const response = await fetch(url)
    const text = await response.text()
    
    try {
      return text.split('"album_id":"')[1].split('"')[0]
    } catch (e) {
      return text.split('"page_id","')[1].split('","')[0]
    }
  } catch (error) {
    throw new Error(`Failed to extract album ID: ${error.message}`)
  }
}

export async function fetchPlaylistById(id: string, includeLyrics: boolean = false) {
  try {
    const response = await makeApiRequest('playlist.getDetails', { listid: id })
    
    if (!response.songs || !Array.isArray(response.songs)) {
      throw new Error('Playlist not found or has no songs')
    }
    
    // Format playlist info
    const playlist = {
      id: response.id,
      name: response.listname,
      image: response.image?.replace('150x150', '500x500'),
      songs: response.songs.map((song: any) => formatSongData(song, includeLyrics))
    }
    
    return playlist
  } catch (error) {
    throw new Error(`Failed to fetch playlist: ${error.message}`)
  }
}

export async function fetchPlaylistIdFromUrl(url: string) {
  try {
    const response = await fetch(url)
    const text = await response.text()
    
    try {
      return text.split('"type":"playlist","id":"')[1].split('"')[0]
    } catch (e) {
      return text.split('"page_id","')[1].split('","')[0]
    }
  } catch (error) {
    throw new Error(`Failed to extract playlist ID: ${error.message}`)
  }
}

export async function searchSongs(query: string, includeLyrics: boolean = false, page: number = 1) {
  try {
    const response = await makeApiRequest('autocomplete.get', {
      query,
      includeMetaTags: '1',
      cc: 'in'
    })
    
    if (!response.songs || !response.songs.data) {
      return []
    }
    
    const songs = response.songs.data.slice((page - 1) * 10, page * 10)
    
    return Promise.all(
      songs.map(async (song: any) => {
        try {
          return await fetchSongById(song.id, includeLyrics)
        } catch (error) {
          console.warn(`Failed to fetch song ${song.id}:`, error)
          return null
        }
      })
    ).then(results => results.filter(Boolean))
  } catch (error) {
    throw new Error(`Failed to search songs: ${error.message}`)
  }
}

export async function searchAlbums(query: string, page: number = 1) {
  try {
    const response = await makeApiRequest('search.getAlbumResults', {
      query,
      p: page.toString(),
      n: '10'
    })
    
    if (!response.results || !Array.isArray(response.results)) {
      return []
    }
    
    return response.results.map((album: any) => ({
      id: album.id,
      name: album.title,
      year: album.year,
      image: album.image?.replace('150x150', '500x500'),
      url: album.perma_url
    }))
  } catch (error) {
    throw new Error(`Failed to search albums: ${error.message}`)
  }
}

export async function searchAll(query: string) {
  try {
    const response = await makeApiRequest('autocomplete.get', {
      query,
      includeMetaTags: '1',
      cc: 'in'
    })
    
    return {
      songs: response.songs?.data?.slice(0, 5).map((song: any) => ({
        id: song.id,
        title: song.title,
        album: song.album,
        artists: song.primary_artists,
        image: song.image?.replace('150x150', '500x500')
      })) || [],
      albums: response.albums?.data?.slice(0, 5).map((album: any) => ({
        id: album.id,
        name: album.title,
        year: album.year,
        image: album.image?.replace('150x150', '500x500')
      })) || [],
      artists: response.artists?.data?.slice(0, 5).map((artist: any) => ({
        id: artist.id,
        name: artist.title,
        image: artist.image?.replace('150x150', '500x500')
      })) || [],
      playlists: response.playlists?.data?.slice(0, 5).map((playlist: any) => ({
        id: playlist.id,
        name: playlist.title,
        image: playlist.image?.replace('150x150', '500x500')
      })) || []
    }
  } catch (error) {
    throw new Error(`Failed to search: ${error.message}`)
  }
}

export async function fetchLyricsById(id: string) {
  try {
    const response = await makeApiRequest('lyrics.getLyrics', { lyrics_id: id })
    return response.lyrics
  } catch (error) {
    throw new Error(`Failed to fetch lyrics: ${error.message}`)
  }
}