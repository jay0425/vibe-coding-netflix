const API_KEY = '8ebbd22f987ddde5d819ba11f2dd7050';
const API_URL = 'https://api.themoviedb.org/3/movie/now_playing';
const SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';
const DETAIL_URL = 'https://api.themoviedb.org/3/movie';
const CREDITS_URL = 'https://api.themoviedb.org/3/movie';
const VIDEOS_URL = 'https://api.themoviedb.org/3/movie';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const POPULAR_URL = 'https://api.themoviedb.org/3/movie/popular';
const TOP_RATED_URL = 'https://api.themoviedb.org/3/movie/top_rated';
const UPCOMING_URL = 'https://api.themoviedb.org/3/movie/upcoming';

const gridElement = document.getElementById('now-playing');
const popularElement = document.getElementById('popular');
const topRatedElement = document.getElementById('top-rated');
const upcomingElement = document.getElementById('upcoming');
const searchResultsElement = document.getElementById('search-results');
const carouselsWrapper = document.getElementById('carousels');
const template = document.getElementById('movie-card-template');
const toast = document.getElementById('toast');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const sectionTitle = document.getElementById('section-title');
const viewport = document.getElementById('carousel-viewport');
const viewportPopular = document.getElementById('popular-viewport');
const viewportTopRated = document.getElementById('top-rated-viewport');
const viewportUpcoming = document.getElementById('upcoming-viewport');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnPrevPop = document.getElementById('btn-prev-pop');
const btnNextPop = document.getElementById('btn-next-pop');
const btnPrevTop = document.getElementById('btn-prev-top');
const btnNextTop = document.getElementById('btn-next-top');
const btnPrevUp = document.getElementById('btn-prev-up');
const btnNextUp = document.getElementById('btn-next-up');
const modal = document.getElementById('movie-modal');
const modalTitle = document.getElementById('modal-title');
const modalReleaseDate = document.getElementById('modal-release-date');
const modalRating = document.getElementById('modal-rating');
const modalOverview = document.getElementById('modal-overview');
const modalGenres = document.getElementById('modal-genres');
const modalAdultBadge = document.getElementById('modal-adult-badge');
const modalCastList = document.getElementById('modal-cast-list');
const modalVideoContainer = document.getElementById('modal-video-container');
const modalClose = document.querySelector('.modal__close');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add('hidden'), 3000);
}

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function createSkeletonCardsFor(container, count) {
  clearChildren(container);
  for (let i = 0; i < count; i++) {
    const card = document.createElement('article');
    card.className = 'card';
    const posterWrap = document.createElement('div');
    posterWrap.className = 'poster-wrap skeleton';
    card.appendChild(posterWrap);
    const title = document.createElement('div');
    title.className = 'title skeleton';
    title.style.height = '16px';
    title.style.margin = '10px';
    card.appendChild(title);
    container.appendChild(card);
  }
}

function createMovieCard(movie) {
  const { title, original_title, poster_path, id, adult } = movie;
  const node = template.content.firstElementChild.cloneNode(true);
  const img = node.querySelector('.poster');
  const heading = node.querySelector('.title');
  const cardAdultBadge = node.querySelector('.card__badge');

  heading.textContent = title || original_title || '제목 없음';

  if (poster_path) {
    img.src = `${IMAGE_BASE}${poster_path}`;
    img.alt = `${heading.textContent} 포스터`;
  } else {
    img.alt = `${heading.textContent} 포스터 이미지 없음`;
    img.style.background = '#333';
  }

  if (adult) {
    cardAdultBadge?.classList.remove('hidden');
  } else {
    cardAdultBadge?.classList.add('hidden');
  }

  node.addEventListener('click', () => openMovieModal(id));
  node.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMovieModal(id);
    }
  });

  return node;
}

function renderInto(container, viewportEl, movies) {
  clearChildren(container);
  const fragment = document.createDocumentFragment();
  movies.forEach((m) => fragment.appendChild(createMovieCard(m)));
  container.appendChild(fragment);
  viewportEl?.scrollTo({ left: 0, behavior: 'auto' });
}

function renderSearchResults(movies) {
  clearChildren(searchResultsElement);
  const fragment = document.createDocumentFragment();
  movies.forEach((m) => fragment.appendChild(createMovieCard(m)));
  searchResultsElement.appendChild(fragment);
}

function enterSearchMode() {
  carouselsWrapper?.classList.add('hidden');
  searchResultsElement?.classList.remove('hidden');
}
function exitSearchMode() {
  carouselsWrapper?.classList.remove('hidden');
  searchResultsElement?.classList.add('hidden');
}

async function fetchNowPlaying(page = 1) {
  const url = `${API_URL}?api_key=${API_KEY}&language=ko-KR&region=KR&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API 오류(${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

async function fetchPopular(page = 1) {
  const url = `${POPULAR_URL}?api_key=${API_KEY}&language=ko-KR&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`인기 영화 오류(${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

async function fetchTopRated(page = 1) {
  const url = `${TOP_RATED_URL}?api_key=${API_KEY}&language=ko-KR&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`랭킹 영화 오류(${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

async function fetchUpcoming(page = 1) {
  const url = `${UPCOMING_URL}?api_key=${API_KEY}&language=ko-KR&region=KR&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`개봉 예정 오류(${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

async function searchMovies(query, page = 1) {
  const url = `${SEARCH_URL}?api_key=${API_KEY}&language=ko-KR&query=${encodeURIComponent(
    query
  )}&page=${page}&include_adult=false`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`검색 오류(${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

async function fetchMovieDetails(movieId) {
  const url = `${DETAIL_URL}/${movieId}?api_key=${API_KEY}&language=ko-KR`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`영화 상세 오류(${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

async function fetchMovieCredits(movieId) {
  const url = `${CREDITS_URL}/${movieId}/credits?api_key=${API_KEY}&language=ko-KR`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`출연진 오류(${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

async function fetchMovieVideos(movieId) {
  const url = `${VIDEOS_URL}/${movieId}/videos?api_key=${API_KEY}&language=ko-KR`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`예고편 오류(${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

function handleSearchSubmit(e) {
  e.preventDefault();
  const q = (searchInput?.value || '').trim();
  if (!q) {
    sectionTitle.textContent = '현재 상영 중';
    init();
    return;
  }
  performSearch(q);
}

async function performSearch(query) {
  try {
    sectionTitle.textContent = `"${query}" 검색 결과`;
    enterSearchMode();
    clearChildren(searchResultsElement);
    // 스켈레톤 몇 개 표시
    createSkeletonCardsFor(searchResultsElement, 12);
    const data = await searchMovies(query, 1);
    const movies = Array.isArray(data.results) ? data.results : [];
    if (movies.length === 0) showToast('검색 결과가 없습니다.');
    renderSearchResults(movies);
  } catch (err) {
    console.error(err);
    showToast('검색에 실패했어요. 잠시 후 다시 시도해 주세요.');
  }
}

function getScrollAmountFor(viewportEl, trackEl) {
  const firstCard = trackEl.querySelector('.card');
  if (!firstCard) return viewportEl.clientWidth;
  const cardWidth = firstCard.getBoundingClientRect().width;
  const gap = 16; // --gap 과 동일
  return cardWidth * 7 + gap * 6; // 7개 카드 + 6개 갭
}

function bindCarouselButtons(prevBtn, nextBtn, viewportEl, trackEl) {
  nextBtn?.addEventListener('click', () => {
    viewportEl?.scrollBy({ left: getScrollAmountFor(viewportEl, trackEl), behavior: 'smooth' });
  });
  prevBtn?.addEventListener('click', () => {
    viewportEl?.scrollBy({ left: -getScrollAmountFor(viewportEl, trackEl), behavior: 'smooth' });
  });
}

bindCarouselButtons(btnPrev, btnNext, viewport, gridElement);
bindCarouselButtons(btnPrevPop, btnNextPop, viewportPopular, popularElement);
bindCarouselButtons(btnPrevTop, btnNextTop, viewportTopRated, topRatedElement);
bindCarouselButtons(btnPrevUp, btnNextUp, viewportUpcoming, upcomingElement);

async function init() {
  try {
    exitSearchMode();
    // 현재 상영작
    createSkeletonCardsFor(gridElement, 12);
    const now = await fetchNowPlaying(1);
    renderInto(gridElement, viewport, Array.isArray(now.results) ? now.results : []);

    // 인기 / 랭킹 / 개봉예정은 병렬로 로드
    createSkeletonCardsFor(popularElement, 12);
    createSkeletonCardsFor(topRatedElement, 12);
    createSkeletonCardsFor(upcomingElement, 12);

    const [pop, top, up] = await Promise.all([fetchPopular(1), fetchTopRated(1), fetchUpcoming(1)]);

    renderInto(popularElement, viewportPopular, Array.isArray(pop.results) ? pop.results : []);
    renderInto(topRatedElement, viewportTopRated, Array.isArray(top.results) ? top.results : []);
    renderInto(upcomingElement, viewportUpcoming, Array.isArray(up.results) ? up.results : []);
  } catch (err) {
    console.error(err);
    showToast('목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
  }
}

document.addEventListener('DOMContentLoaded', init);

searchForm?.addEventListener('submit', handleSearchSubmit);
searchInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    searchInput.blur();
    searchInput.value = '';
    sectionTitle.textContent = '현재 상영 중';
    init();
  }
});

// Modal functions
async function openMovieModal(movieId) {
  try {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    modalTitle.textContent = '로딩 중...';
    modalReleaseDate.textContent = '';
    modalRating.textContent = '';
    modalOverview.textContent = '';
    modalGenres.innerHTML = '';
    modalCastList.innerHTML = '';
    modalVideoContainer.innerHTML = '';

    const [details, credits, videos] = await Promise.all([
      fetchMovieDetails(movieId),
      fetchMovieCredits(movieId),
      fetchMovieVideos(movieId),
    ]);

    modalTitle.textContent = details.title || details.original_title || '제목 없음';
    modalReleaseDate.textContent = details.release_date ? `개봉: ${details.release_date}` : '';
    modalRating.textContent = details.vote_average ? `평점: ${details.vote_average.toFixed(1)}/10` : '';
    modalOverview.textContent = details.overview || '줄거리 정보가 없습니다.';

    // 청불 배지 토글
    if (details.adult) {
      modalAdultBadge?.classList.remove('hidden');
    } else {
      modalAdultBadge?.classList.add('hidden');
    }

    // 장르 뱃지 렌더
    if (Array.isArray(details.genres) && details.genres.length > 0) {
      modalGenres.innerHTML = details.genres.map((g) => `<span class="modal__genre-badge">${g.name}</span>`).join('');
    } else {
      modalGenres.innerHTML = '';
    }

    // 출연진
    if (credits.cast && credits.cast.length > 0) {
      const castHtml = credits.cast
        .slice(0, 20)
        .map((actor) => `<span class="modal__cast-badge">${actor.name}</span>`)
        .join('');
      modalCastList.innerHTML = castHtml;
    } else {
      modalCastList.innerHTML = '<div class="modal__cast-item">출연진 정보가 없습니다.</div>';
    }

    if (videos.results && videos.results.length > 0) {
      const trailer = videos.results.find((video) => video.type === 'Trailer' && video.site === 'YouTube');
      if (trailer) {
        modalVideoContainer.innerHTML = `
          <iframe
            class="modal__video-iframe"
            src="https://www.youtube.com/embed/${trailer.key}"
            allowfullscreen>
          </iframe>
        `;
      } else {
        modalVideoContainer.innerHTML = '<p>예고편이 없습니다.</p>';
      }
    } else {
      modalVideoContainer.innerHTML = '<p>예고편이 없습니다.</p>';
    }
  } catch (err) {
    console.error(err);
    showToast('영화 정보를 불러오지 못했어요.');
    closeModal();
  }
}

function closeModal() {
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

modalClose?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});
