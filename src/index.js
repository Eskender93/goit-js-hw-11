import axios from 'axios';
import Notiflix from 'notiflix';

const API_KEY = '37550168-30032e01c9d272bcc53c0e6a4';
const BASE_URL = 'https://pixabay.com/api/';
const ITEMS_PER_PAGE = 20;

const searchForm = document.querySelector('#search-form');
const loadMoreBtn = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');

let currentPage = 1;
let currentQuery = '';

// Event listener for search form submission
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const searchQuery = e.target.elements.searchQuery.value.trim();
  if (searchQuery === '') {
    return;
  }
  currentQuery = searchQuery;
  currentPage = 1;
  clearGallery();
  searchImages(currentQuery, currentPage);
});

// Event listener for load more button click
loadMoreBtn.addEventListener('click', () => {
  currentPage += 1;
  searchImages(currentQuery, currentPage);
});

// Function to search images based on query and page
async function searchImages(query, page) {
  showLoader();
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: ITEMS_PER_PAGE,
        page: page,
      },
    });
    const { hits, totalHits } = response.data;
    if (hits.length === 0) {
      if (page === 1) {
        showError(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        showEndMessage(
          "We're sorry, but you've reached the end of search results."
        );
      }
    } else {
      renderImages(hits);
      if (hits.length < totalHits) {
        showLoadMoreButton();
      } else {
        hideLoadMoreButton();
      }
      if (page === 1) {
        showSuccess(`Hooray! We found ${totalHits} images.`);
      }
      scrollToNextPage();
    }
  } catch (error) {
    showError('Oops! Something went wrong. Please try again.');
    console.error(error);
  }
  hideLoader();
}

// Function to render images in the gallery
function renderImages(images) {
  const fragment = document.createDocumentFragment();
  images.forEach(image => {
    const card = createImageCard(image);
    fragment.appendChild(card);
  });
  gallery.appendChild(fragment);
}

// Function to create a single image card
function createImageCard(image) {
  const card = document.createElement('div');
  card.classList.add('photo-card');

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
  card.append(img, info);

  return card;
}

// Function to create a single info item
function createInfoItem(label, value) {
  const item = document.createElement('p');
  item.classList.add('info-item');
  item.innerHTML = `<b>${label}: </b>${value}`;
  return item;
}

// Function to clear the gallery
function clearGallery() {
  gallery.innerHTML = '';
}

// Function to show the loader
function showLoader() {
  Notiflix.Loading.arrows('Loading data, please wait...');
}

// Function to hide the loader
function hideLoader() {
  Notiflix.Loading.remove();
}

// Function to show the load more button
function showLoadMoreButton() {
  loadMoreBtn.style.display = 'block';
}

// Function to hide the load more button
function hideLoadMoreButton() {
  loadMoreBtn.style.display = 'none';
}

// Function to scroll to the next page
function scrollToNextPage() {
  const cardHeight = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect().height;
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

// Function to show a success message
function showSuccess(message) {
  Notiflix.Notify.success(message);
}

// Function to show an error message
function showError(message) {
  Notiflix.Notify.failure(message);
}

// Function to show the end message
function showEndMessage(message) {
  Notiflix.Notify.info(message);
}
