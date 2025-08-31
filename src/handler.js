// Main request handler for JioSaavnAPI Cloudflare Worker

import { searchForSong, getSong, getSongId, getAlbum, getAlbumId, getPlaylist, getPlaylistId, getLyrics } from './jiosaavn.js';

export async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  // Only allow GET requests
  if (method !== 'GET') {
    return new Response(JSON.stringify({
      status: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Route handling
  try {
    switch (path) {
      case '/':
        return Response.redirect('https://cyberboysumanjay.github.io/JioSaavnAPI/', 302);

      case '/song/':
      case '/song/get/':
        return await handleSongRequest(url, path);

      case '/playlist/':
        return await handlePlaylistRequest(url);

      case '/album/':
        return await handleAlbumRequest(url);

      case '/lyrics/':
        return await handleLyricsRequest(url);

      case '/result/':
        return await handleResultRequest(url);

      default:
        return new Response(JSON.stringify({
          status: false,
          error: 'Endpoint not found'
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response(JSON.stringify({
      status: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function handleSongRequest(url, path) {
  const query = url.searchParams.get('query');
  const lyrics = url.searchParams.get('lyrics');
  const songdata = url.searchParams.get('songdata');
  const id = url.searchParams.get('id');

  const fetchLyrics = lyrics && lyrics.toLowerCase() !== 'false';
  const fetchSongData = !songdata || songdata.toLowerCase() !== 'false';

  if (path === '/song/get/' && id) {
    // Get song by ID
    const song = await getSong(id, fetchLyrics);
    if (!song) {
      return new Response(JSON.stringify({
        status: false,
        error: 'Invalid Song ID received!'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    return jsonResponse(song);
  }

  if (!query) {
    return new Response(JSON.stringify({
      status: false,
      error: 'Query is required to search songs!'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const result = await searchForSong(query, fetchLyrics, fetchSongData);
  return jsonResponse(result);
}

async function handlePlaylistRequest(url) {
  const query = url.searchParams.get('query');
  const lyrics = url.searchParams.get('lyrics');

  const fetchLyrics = lyrics && lyrics.toLowerCase() !== 'false';

  if (!query) {
    return new Response(JSON.stringify({
      status: false,
      error: 'Query is required to search playlists!'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const id = await getPlaylistId(query);
  const songs = await getPlaylist(id, fetchLyrics);
  return jsonResponse(songs);
}

async function handleAlbumRequest(url) {
  const query = url.searchParams.get('query');
  const lyrics = url.searchParams.get('lyrics');

  const fetchLyrics = lyrics && lyrics.toLowerCase() !== 'false';

  if (!query) {
    return new Response(JSON.stringify({
      status: false,
      error: 'Query is required to search albums!'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const id = await getAlbumId(query);
  const songs = await getAlbum(id, fetchLyrics);
  return jsonResponse(songs);
}

async function handleLyricsRequest(url) {
  const query = url.searchParams.get('query');

  if (!query) {
    return new Response(JSON.stringify({
      status: false,
      error: 'Query containing song link or id is required to fetch lyrics!'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    let lyrics;
    if (query.includes('http') && query.includes('saavn')) {
      const id = await getSongId(query);
      lyrics = await getLyrics(id);
    } else {
      lyrics = await getLyrics(query);
    }

    return jsonResponse({
      status: true,
      lyrics: lyrics
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function handleResultRequest(url) {
  const query = url.searchParams.get('query');
  const lyrics = url.searchParams.get('lyrics');

  const fetchLyrics = lyrics && lyrics.toLowerCase() !== 'false';

  if (!query) {
    return new Response(JSON.stringify({
      status: false,
      error: 'Query is required!'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Universal endpoint - determine type based on query
  if (!query.includes('saavn')) {
    // Search for song
    const result = await searchForSong(query, fetchLyrics, true);
    return jsonResponse(result);
  }

  try {
    if (query.includes('/song/')) {
      const songId = await getSongId(query);
      const song = await getSong(songId, fetchLyrics);
      return jsonResponse(song);
    } else if (query.includes('/album/')) {
      const id = await getAlbumId(query);
      const songs = await getAlbum(id, fetchLyrics);
      return jsonResponse(songs);
    } else if (query.includes('/playlist/') || query.includes('/featured/')) {
      const id = await getPlaylistId(query);
      const songs = await getPlaylist(id, fetchLyrics);
      return jsonResponse(songs);
    } else {
      return new Response(JSON.stringify({
        status: false,
        error: 'Unsupported JioSaavn URL format'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      status: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

function jsonResponse(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}