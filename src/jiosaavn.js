// Core JioSaavn API functionality for Cloudflare Workers

import { 
  searchBaseUrl, 
  songDetailsBaseUrl, 
  albumDetailsBaseUrl, 
  playlistDetailsBaseUrl, 
  lyricsBaseUrl 
} from './endpoints.js';

import { formatSong, formatAlbum, formatPlaylist } from './helper.js';

export async function searchForSong(query, lyrics, songdata) {
  if (query.startsWith('http') && query.includes('saavn.com')) {
    const id = await getSongId(query);
    return await getSong(id, lyrics);
  }

  const searchUrl = searchBaseUrl + encodeURIComponent(query);
  const response = await fetch(searchUrl);
  const responseText = await response.text();
  
  // Fix the JSON response (similar to the Python version)
  const pattern = /\(From "([^"]+)"\)/;
  const fixedJson = responseText.replace(pattern, "(From '$1')");
  
  const data = JSON.parse(fixedJson);
  const songResponse = data.songs.data;
  
  if (!songdata) {
    return songResponse;
  }
  
  const songs = [];
  for (const song of songResponse) {
    const id = song.id;
    const songData = await getSong(id, lyrics);
    if (songData) {
      songs.push(songData);
    }
  }
  
  return songs;
}

export async function getSong(id, lyrics) {
  try {
    const songDetailsUrl = songDetailsBaseUrl + id;
    const response = await fetch(songDetailsUrl);
    const responseText = await response.text();
    
    const songResponse = JSON.parse(responseText);
    const songData = formatSong(songResponse[id], lyrics);
    
    if (songData && lyrics && songData.has_lyrics === 'true') {
      songData.lyrics = await getLyrics(id);
    }
    
    return songData;
  } catch (error) {
    console.error('Error getting song:', error);
    return null;
  }
}

export async function getSongId(url) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'bitrate=320'
    });
    
    const responseText = await response.text();
    
    try {
      // Try the first extraction method
      return responseText.split('"pid":"')[1].split('","')[0];
    } catch (e) {
      // Fallback extraction method
      const songSection = responseText.split('"song":{"type":"')[1].split('","image":')[0];
      return songSection.split('"id":"').pop();
    }
  } catch (error) {
    console.error('Error getting song ID:', error);
    throw error;
  }
}

export async function getAlbum(albumId, lyrics) {
  try {
    const response = await fetch(albumDetailsBaseUrl + albumId);
    
    if (response.status === 200) {
      const responseText = await response.text();
      const data = JSON.parse(responseText);
      return formatAlbum(data, lyrics);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting album:', error);
    return null;
  }
}

export async function getAlbumId(inputUrl) {
  try {
    const response = await fetch(inputUrl);
    const responseText = await response.text();
    
    try {
      return responseText.split('"album_id":"')[1].split('"')[0];
    } catch (e) {
      return responseText.split('"page_id","')[1].split('","')[0];
    }
  } catch (error) {
    console.error('Error getting album ID:', error);
    throw error;
  }
}

export async function getPlaylist(listId, lyrics) {
  try {
    const response = await fetch(playlistDetailsBaseUrl + listId);
    
    if (response.status === 200) {
      const responseText = await response.text();
      const data = JSON.parse(responseText);
      return formatPlaylist(data, lyrics);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting playlist:', error);
    return null;
  }
}

export async function getPlaylistId(inputUrl) {
  try {
    const response = await fetch(inputUrl);
    const responseText = await response.text();
    
    try {
      return responseText.split('"type":"playlist","id":"')[1].split('"')[0];
    } catch (e) {
      return responseText.split('"page_id","')[1].split('","')[0];
    }
  } catch (error) {
    console.error('Error getting playlist ID:', error);
    throw error;
  }
}

export async function getLyrics(id) {
  try {
    const url = lyricsBaseUrl + id;
    const response = await fetch(url);
    const responseText = await response.text();
    const lyricsData = JSON.parse(responseText);
    
    return lyricsData.lyrics;
  } catch (error) {
    console.error('Error getting lyrics:', error);
    throw error;
  }
}