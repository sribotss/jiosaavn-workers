// Helper functions for JioSaavnAPI Cloudflare Worker

import { decryptUrl } from './crypto.js';

export function formatSong(data, lyrics) {
  try {
    // Decrypt media URL
    data.media_url = decryptUrl(data.encrypted_media_url);
    
    if (data['320kbps'] !== "true") {
      data.media_url = data.media_url.replace("_320.mp4", "_160.mp4");
    }
    
    data.media_preview_url = data.media_url
      .replace("_320.mp4", "_96_p.mp4")
      .replace("_160.mp4", "_96_p.mp4")
      .replace("//aac.", "//preview.");
  } catch (error) {
    // Fallback for URL decryption
    let url = data.media_preview_url;
    url = url.replace("preview", "aac");
    if (data['320kbps'] === "true") {
      url = url.replace("_96_p.mp4", "_320.mp4");
    } else {
      url = url.replace("_96_p.mp4", "_160.mp4");
    }
    data.media_url = url;
  }

  // Format text fields
  data.song = formatText(data.song);
  data.music = formatText(data.music);
  data.singers = formatText(data.singers);
  data.starring = formatText(data.starring);
  data.album = formatText(data.album);
  data.primary_artists = formatText(data.primary_artists);
  
  // Upgrade image quality
  data.image = data.image.replace("150x150", "500x500");

  // Fetch lyrics if requested
  if (lyrics) {
    if (data.has_lyrics === 'true') {
      // Note: Lyrics fetching will be handled in the main jiosaavn.js
      data.lyrics = null; // Placeholder
    } else {
      data.lyrics = null;
    }
  }

  // Format copyright text
  try {
    data.copyright_text = data.copyright_text.replace("©", "©");
  } catch (error) {
    // Ignore if copyright_text doesn't exist
  }

  return data;
}

export function formatAlbum(data, lyrics) {
  data.image = data.image.replace("150x150", "500x500");
  data.name = formatText(data.name);
  data.primary_artists = formatText(data.primary_artists);
  data.title = formatText(data.title);
  
  // Format each song in the album
  if (data.songs && Array.isArray(data.songs)) {
    data.songs = data.songs.map(song => formatSong(song, lyrics));
  }
  
  return data;
}

export function formatPlaylist(data, lyrics) {
  data.firstname = formatText(data.firstname);
  data.listname = formatText(data.listname);
  
  // Format each song in the playlist
  if (data.songs && Array.isArray(data.songs)) {
    data.songs = data.songs.map(song => formatSong(song, lyrics));
  }
  
  return data;
}

export function formatText(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&quot;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'");
}

// Note: decryptUrl function is now imported from crypto.js