const client_id = 'f26642cef3fc43cea664d487775ac68f';
const client_secret = 'f940f17af988483491658948436b738a';
const refresh_token =
  'AQDZiO2_V_xxXCi0Lx8kbKk_1eIo5AopDat-erwzzfsoO5MnDwmresLWnUnm0p5Fbto3RKVlQmlZlebMC_uuaPvQYYSccK4zs9V1OmGyhs5T3NqPJfCe_yMHZEaP0WJMyMU';

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

export const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });

  return response.json();
};

/* export const getPlaylist = async () => {
  const { access_token } = await getAccessToken();
  //const url = 'https://api.spotify.com/v1/playlists/5OAdJaEhIju8OYKCSNRDD4';
  const url = 'https://api.spotify.com/v1/playlists/1RAjDfseAWWrIRWrSXChFe';

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    return result; // Return the result instead of just logging it
  } catch (error) {
    console.error('Error fetching Spotify playlist:', error);
    return null; // Return null if there's an error
  }
}; */

export const getPlaylist = async () => {
  const { access_token } = await getAccessToken();
  const url =
    'https://api.spotify.com/v1/playlists/4mHxqkzOHtJMBM8hprnjLL/tracks';
  let allTracks = [];
  let nextUrl = url;

  try {
    // Keep fetching until there are no more pages
    while (nextUrl) {
      const response = await fetch(nextUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      allTracks = allTracks.concat(result.items); // Accumulate tracks

      nextUrl = result.next; // Update nextUrl to the next page URL (or null if done)
    }

    return allTracks; // Return the full list of tracks
  } catch (error) {
    console.error('Error fetching Spotify playlist:', error);
    return null; // Return null if there's an error
  }
};
