// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesBtn = document.getElementById('getImagesBtn');
const gallery = document.getElementById('gallery');

// Modal elements
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// TODO: Replace DEMO_KEY with your own key from https://api.nasa.gov for higher rate limits
// TODO: Replace DEMO_KEY with your own key from https://api.nasa.gov for higher rate limits
const APOD_URL = 'https://api.nasa.gov/planetary/apod';

const url = `${APOD_URL}?api_key=${NASA_API_KEY}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });

// LevelUp: Random "Did You Know?" space facts
const spaceFacts = [
  "A day on Venus is longer than a year on Venus.",
  "Neutron stars can spin at a rate of 600 rotations per second.",
  "There are more stars in the universe than grains of sand on every beach on Earth.",
  "The Sun accounts for about 99.86% of the mass in the solar system.",
  "One million Earths could fit inside the Sun.",
  "Jupiter's Great Red Spot is a storm bigger than Earth that has raged for centuries.",
  "Space is completely silent because there is no atmosphere for sound to travel through.",
  "The footprints left on the Moon by astronauts will likely stay there for millions of years.",
  "A full NASA space suit costs about $12 million.",
  "Saturn could float in water because it is mostly made of gas.",
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy, though it won't happen for about 4.5 billion years.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth."
];

function showRandomFact() {
  const fact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  document.getElementById('spaceFact').innerHTML = `<strong>Did You Know?</strong> ${fact}`;
}
showRandomFact();

// Show the loading message inside the gallery area
function showLoading() {
  gallery.innerHTML = `
    <div class="loading-message">
      🔄 Loading space photos…
    </div>
  `;
}

// Build one gallery card, handling both images and YouTube videos
function createGalleryItem(entry) {
  const item = document.createElement('div');
  item.className = 'gallery-item';

  if (entry.media_type === 'image') {
    item.innerHTML = `
      <div class="media-wrap">
        <img src="${entry.url}" alt="${entry.title}" />
      </div>
      <h2>${entry.title}</h2>
      <p>${entry.date}</p>
    `;
  } else if (entry.media_type === 'video') {
    // LevelUp: handle video entries with a clear thumbnail/link
    item.innerHTML = `
      <div class="video-thumb">
        🎬 This is a video.<br />Click to watch on YouTube.
      </div>
      <h2>${entry.title}</h2>
      <p>${entry.date}</p>
    `;
  } else {
    // Fallback for any unexpected media type
    item.innerHTML = `
      <div class="video-thumb">Unsupported media type</div>
      <h2>${entry.title}</h2>
      <p>${entry.date}</p>
    `;
  }

  item.addEventListener('click', () => openModal(entry));
  return item;
}

// Render the full gallery from an array of APOD entries
function renderGallery(entries) {
  gallery.innerHTML = '';

  if (!entries || entries.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>No images found for that date range. Try different dates!</p>
      </div>
    `;
    return;
  }

  entries.forEach((entry) => {
    gallery.appendChild(createGalleryItem(entry));
  });
}

// Convert any common YouTube URL shape into an embeddable /embed/ URL.
// Returns null if the URL isn't a recognizable YouTube link (e.g. Vimeo, direct .mp4, etc).
function getYouTubeEmbedUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);

    // Already in embeddable form, e.g. youtube.com/embed/VIDEO_ID
    if (u.hostname.includes('youtube.com') && u.pathname.startsWith('/embed/')) {
      return rawUrl;
    }

    // Standard watch link, e.g. youtube.com/watch?v=VIDEO_ID
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }

    // Short link, e.g. youtu.be/VIDEO_ID
    if (u.hostname.includes('youtu.be')) {
      const videoId = u.pathname.replace('/', '');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Open the modal with full details for a gallery entry
function openModal(entry) {
  modalTitle.textContent = entry.title;
  modalDate.textContent = entry.date;
  modalExplanation.textContent = entry.explanation;

  if (entry.media_type === 'image') {
    modalMedia.innerHTML = `<img src="${entry.hdurl || entry.url}" alt="${entry.title}" />`;
  } else if (entry.media_type === 'video') {
    const embedUrl = getYouTubeEmbedUrl(entry.url);

    if (embedUrl) {
      // Embed the video, but always include a direct link as a safety net
      // in case the host blocks embedding for this particular video.
      modalMedia.innerHTML = `
        <iframe
          src="${embedUrl}"
          title="${entry.title}"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
        <p class="video-fallback-link">
          <a href="${entry.url}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>
        </p>
      `;
    } else {
      // Not a recognizable/embeddable video link — link out instead of showing a broken frame
      modalMedia.innerHTML = `
        <div class="video-fallback">
          <p>🎬 This video can't be embedded here.</p>
          <a href="${entry.url}" target="_blank" rel="noopener noreferrer" class="video-link-btn">Watch the video ↗</a>
        </div>
      `;
    }
  } else {
    modalMedia.innerHTML = '';
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  modalMedia.innerHTML = ''; // stop any playing video
}


modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  // Close if the user clicks the dark overlay, not the modal card itself
  if (event.target === modal) {
    closeModal();
  }
});

// Fetch APOD data for the selected date range and display it
async function fetchSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  showLoading();

  try {
    const url = `${APOD_URL}?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NASA API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // The API can return a single object instead of an array if start === end
    const entries = Array.isArray(data) ? data : [data];

    // Sort so the gallery displays in chronological order
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    renderGallery(entries);
  } catch (error) {
    console.error('Error fetching APOD data:', error);
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>Something went wrong loading space photos. Please try again.</p>
      </div>
    `;
  }
}

getImagesBtn.addEventListener('click', fetchSpaceImages);

// Load the default 9-day range automatically when the page opens
fetchSpaceImages();
