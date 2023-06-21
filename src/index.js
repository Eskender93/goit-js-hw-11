import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '37550168-30032e01c9d272bcc53c0e6a4';
const BASE_URL = 'https://pixabay.com/api/';
const perPage = 20;

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let currentQuery = '';

// Function to display a notification
function showNotification(message) {
  Notiflix.Notify.info(message, {
    position: 'bottom-right',
    timeout: 3000,
  });
}

// Function to fetch images from Pixabay API
async function fetchImages(query) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        order: 'popular',
        page: page,
        per_page: perPage,
      },
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch images');
  }
}

// Function to render images in the gallery
function renderImages(images) {
  const fragment = document.createDocumentFragment();
  images.forEach(image => {
    const card = createImageCard(image);
    fragment.appendChild(card);
  });
  gallery.appendChild(fragment);

  // Initialize SimpleLightbox
  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.on('shown.simplelightbox', function () {
    // Handle event after lightbox is shown
    console.log('Lightbox is shown');
  });

  // Check if Load More button should be shown
  if (images.length === perPage) {
    showLoadMoreBtn();
  } else {
    hideLoadMoreBtn();
  }
}

// Function to create a single image card
function createImageCard(image) {
  const card = document.createElement('div');
  card.classList.add('photo-card');

  const link = document.createElement('a');
  link.href = image.largeImageURL;

  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';

  const info = document.createElement('div');
  info.classList.add('info');

  const likes = createInfoItem('Likes', image.likes);
  const views = createInfoItem('Views', image.views);
  const comments = createInfoItem('Comments', image.comments);
  const downloads = createInfoItem('Downloads', image.downloads);

  info.append(likes, views, comments, downloads);
  link.appendChild(img);
  card.append(link, info);

  return card;
}

// Function to create an info item
function createInfoItem(label, value) {
  const item = document.createElement('p');
  item.classList.add('info-item');
  item.innerHTML = `<b>${label}:</b> ${value}`;
  return item;
}

// Function to clear the gallery
function clearGallery() {
  gallery.innerHTML = '';
}

// Function to handle form submit
function handleFormSubmit(event) {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value.trim();
  if (searchQuery === '') {
    return;
  }
  currentQuery = searchQuery;
  page = 1;
  clearGallery();
  searchImages(currentQuery);
}

// Function to handle load more button click
function handleLoadMoreBtnClick() {
  page += 1;
  loadMoreImages(currentQuery);
}

// Function to search images based on the query
async function searchImages(query) {
  showLoader();
  try {
    const data = await fetchImages(query);
    const images = data.hits;
    hideLoader();
    if (images.length > 0) {
      renderImages(images);
    } else {
      showNotification(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      hideLoadMoreBtn();
    }
  } catch (error) {
    hideLoader();
    showError();
  }
}

// Function to load more images based on the query
async function loadMoreImages(query) {
  showLoader();
  try {
    const data = await fetchImages(query);
    const images = data.hits;
    hideLoader();
    if (images.length > 0) {
      renderImages(images);
    } else {
      showNotification('No more images to load.');
      hideLoadMoreBtn();
    }
  } catch (error) {
    hideLoader();
    showError();
  }
}

// Function to show the loader
function showLoader() {
  document.body.classList.add('loading');
}

// Function to hide the loader
function hideLoader() {
  document.body.classList.remove('loading');
}

// Function to show the load more button
function showLoadMoreBtn() {
  loadMoreBtn.style.display = 'block';
}

// Function to hide the load more button
function hideLoadMoreBtn() {
  loadMoreBtn.style.display = 'none';
}

// Function to show the error message
function showError() {
  const errorMessage = document.querySelector('.error-message');
  errorMessage.classList.add('visible');
}

// Function to hide the error message
function hideError() {
  const errorMessage = document.querySelector('.error-message');
  errorMessage.classList.remove('visible');
}

// Event listeners
searchForm.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', handleLoadMoreBtnClick);

// Initial setup
hideLoadMoreBtn();
