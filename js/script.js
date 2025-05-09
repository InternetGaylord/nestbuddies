// ========== CONFIG ========== //
const CONFIG = {
  postsPerPage: 6,
  priceStep: 100000, // Làm tròn 100k
  districts: [
    'Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Long Biên', 'Cầu Giấy',
    'Đống Đa', 'Hai Bà Trưng', 'Hoàng Mai', 'Thanh Xuân',
    'Hà Đông', 'Bắc Từ Liêm', 'Nam Từ Liêm'
  ],
  streets: [
    'Phố Huế', 'Nguyễn Trãi', 'Giải Phóng', 'Lê Duẩn', 'Tôn Đức Thắng',
    'Trần Duy Hưng', 'Phạm Hùng', 'Xuân Thủy', 'Cầu Giấy', 'Láng Hạ',
    'Kim Mã', 'Đội Cấn', 'Bà Triệu', 'Hai Bà Trưng', 'Lò Đúc',
    'Minh Khai', 'Nguyễn Văn Cừ', 'Long Biên', 'Nguyễn Văn Linh'
  ],
  totalPosts: 100
};

// ========== STATE ========== //
let state = {
  posts: [],
  filteredPosts: [],
  currentPage: 1,
  sortType: '',
  filters: {
    search: '',
    district: '',
    price: '',
    rooms: '',
    rating: ''
  },
  isLoading: false
};

// ========== DOM HELPERS ========== //
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

// ========== UTILITY FUNCTIONS ========== //
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), timeout);
  };
}

function getSavedPosts() {
  try {
    return JSON.parse(localStorage.getItem('savedPosts')) || [];
  } catch (e) {
    console.error('Lỗi đọc localStorage:', e);
    return [];
  }
}

// ========== INITIALIZATION ========== //
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    showLoading(true);
    await loadData();
    setupDistrictOptions();
    setupEventListeners();
    renderFilteredPosts();
  } catch (error) {
    console.error('Khởi tạo ứng dụng thất bại:', error);
    showErrorUI();
  } finally {
    showLoading(false);
  }
}

// ========== DATA FUNCTIONS ========== //
async function loadData() {
  return new Promise(resolve => {
    setTimeout(() => {
      state.posts = generateMockData(CONFIG.totalPosts);
      console.log('Dữ liệu đã tải:', state.posts);
      resolve();
    }, 800);
  });
}

function generateMockData(count) {
  const descriptions = [
    'Gần trường ĐH, thuận tiện đi lại',
    'Có điều hòa, nóng lạnh đầy đủ',
    'An ninh tốt, camera 24/7',
    'Khu vực yên tĩnh, thoáng mát',
    'Gần chợ siêu thị, tiện ích xung quanh',
    'Nội thất cao cấp, đầy đủ tiện nghi'
  ];

  return Array.from({ length: count }, (_, i) => {
    const minPrice = Math.round((2000000 + Math.random() * 3000000) / CONFIG.priceStep) * CONFIG.priceStep;
    const maxPrice = minPrice + Math.round(Math.random() * 2000000 / CONFIG.priceStep) * CONFIG.priceStep;
    
    return {
      id: i + 1,
      district: CONFIG.districts[i % CONFIG.districts.length],
      street: CONFIG.streets[i % CONFIG.streets.length],
      streetNumber: Math.floor(Math.random() * 100) + 1,
      minPrice: minPrice,
      maxPrice: maxPrice,
      availableRooms: Math.floor(Math.random() * 15) + 1,
      description: descriptions[i % descriptions.length],
      imageIndex: i + 1,
      liked: checkSavedStatus(i + 1),
      reviews: generateReviews(),
      comments: []
    };
  });
}

function generateReviews() {
  const reviewCount = Math.floor(Math.random() * 5);
  const reviews = [];
  
  for (let i = 0; i < reviewCount; i++) {
    reviews.push({
      rating: Math.floor(Math.random() * 5) + 1,
      content: ["Rất tốt", "Hài lòng", "Bình thường"][Math.floor(Math.random() * 3)],
      author: ["Nguyễn Văn A", "Trần Thị B", "Khách"][Math.floor(Math.random() * 3)]
    });
  }
  
  return reviews;
}

function checkSavedStatus(postId) {
  const saved = getSavedPosts();
  return saved.some(item => item.id === postId);
}

// ========== FILTER FUNCTIONS ========== //
function applyFilters(posts, filters) {
  return posts.filter(post => {
    const matchesSearch = !filters.search || 
      post.district.toLowerCase().includes(filters.search) ||
      post.street.toLowerCase().includes(filters.search) ||
      post.description.toLowerCase().includes(filters.search);

    const matchesDistrict = !filters.district || 
      post.district.toLowerCase() === filters.district;

    const avgPrice = (post.minPrice + post.maxPrice) / 2;
    const matchesPrice = !filters.price || (
      (filters.price === 'low' && avgPrice < 3000000) ||
      (filters.price === 'mid' && avgPrice >= 3000000 && avgPrice <= 4000000) ||
      (filters.price === 'high' && avgPrice > 4000000)
    );

    const matchesRooms = !filters.rooms || (
      (filters.rooms === '1-5' && post.availableRooms <= 5) ||
      (filters.rooms === '6-10' && post.availableRooms <= 10)
    );

    const matchesRating = !filters.rating || 
      post.reviews.some(review => review.rating >= parseInt(filters.rating));

    return matchesSearch && matchesDistrict && matchesPrice && matchesRooms && matchesRating;
  });
}

function applySorting(posts, sortType) {
  if (!sortType) return posts;
  
  return [...posts].sort((a, b) => {
    const avgPriceA = (a.minPrice + a.maxPrice) / 2;
    const avgPriceB = (b.minPrice + b.maxPrice) / 2;
    return sortType === 'price-asc' ? avgPriceA - avgPriceB : avgPriceB - avgPriceA;
  });
}

// ========== RENDER FUNCTIONS ========== //
function renderPosts(posts) {
  const container = $('#postContainer');
  if (!container) return;

  if (state.isLoading) {
    container.innerHTML = Array(CONFIG.postsPerPage).fill('<div class="post skeleton"></div>').join('');
    return;
  }

  container.innerHTML = posts.map((post, index) => `
    <div class="post" data-id="${post.id}" style="animation-delay: ${index * 0.1}s">
      <img src="https://picsum.photos/400/300?random=${post.imageIndex}" 
           alt="Phòng trọ ${post.district}" 
           loading="lazy"
           onload="this.classList.add('loaded')">
      <div class="post-content">
        <h2>${post.district}</h2>
        <p>${post.street}</p>
        <p>Giá: <strong>${formatPrice(post.minPrice)} - ${formatPrice(post.maxPrice)}</strong></p>
        <p>Phòng trống: <strong>${post.availableRooms}</strong></p>
        <div class="actions">
          <button class="btn-detail" data-id="${post.id}">
            <i class="fas fa-info-circle"></i> Chi tiết
          </button>
          <button class="btn-like ${post.liked ? 'liked' : ''}" data-id="${post.id}">
            ${post.liked ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'}
          </button>
        </div>
      </div>
    </div>
  `).join('') || '<div class="no-results">Không có kết quả phù hợp</div>';

  $$('.btn-detail').forEach(btn => {
    btn.addEventListener('click', () => showDetail(parseInt(btn.dataset.id)));
  });

  $$('.btn-like').forEach(btn => {
    btn.addEventListener('click', () => toggleLike(parseInt(btn.dataset.id)));
  });
}

function renderPagination(totalItems) {
  const pagination = $('#pagination');
  if (!pagination) return;

  const totalPages = Math.ceil(totalItems / CONFIG.postsPerPage);
  pagination.innerHTML = '';

  // Previous button
  if (state.currentPage > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.addEventListener('click', () => {
      state.currentPage--;
      renderFilteredPosts();
    });
    pagination.appendChild(prevBtn);
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = i === state.currentPage ? 'active' : '';
    btn.addEventListener('click', () => {
      state.currentPage = i;
      renderFilteredPosts();
    });
    pagination.appendChild(btn);
  }

  // Next button
  if (state.currentPage < totalPages) {
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.addEventListener('click', () => {
      state.currentPage++;
      renderFilteredPosts();
    });
    pagination.appendChild(nextBtn);
  }
}

function renderFilteredPosts() {
  const filtered = filterPosts();
  state.filteredPosts = filtered;
  updateResultCount(filtered.length);
  renderPagination(filtered.length);
  renderPosts(getPaginatedPosts(filtered));
}

function filterPosts() {
  let filtered = applyFilters(state.posts, state.filters);
  return applySorting(filtered, state.sortType);
}

function getPaginatedPosts(posts) {
  const start = (state.currentPage - 1) * CONFIG.postsPerPage;
  return posts.slice(start, start + CONFIG.postsPerPage);
}

// ========== EVENT HANDLERS ========== //
function setupEventListeners() {
  // Search input
  $('#searchInput')?.addEventListener('input', debounce(() => {
    state.filters.search = $('#searchInput').value.toLowerCase();
    state.currentPage = 1;
    renderFilteredPosts();
  }, 300));

  // Filter changes
  ['districtSelect', 'priceSelect', 'roomSelect', 'filterRating'].forEach(id => {
    $(`#${id}`)?.addEventListener('change', () => {
      state.filters[id.replace('Select', '')] = $(`#${id}`).value;
      state.currentPage = 1;
      renderFilteredPosts();
    });
  });

  // Sort change
  $('#sortSelect')?.addEventListener('change', (e) => {
    state.sortType = e.target.value;
    state.currentPage = 1;
    renderFilteredPosts();
  });

  // Reset filters
  $('#resetFilters')?.addEventListener('click', () => {
    resetFilters();
  });

  // Modal close
  $('.close')?.addEventListener('click', closeModal);
}

function resetFilters() {
  state.filters = { search: '', district: '', price: '', rooms: '', rating: '' };
  state.sortType = '';
  $('#searchInput').value = '';
  $('#districtSelect').value = '';
  $('#priceSelect').value = '';
  $('#roomSelect').value = '';
  $('#filterRating').value = '';
  $('#sortSelect').value = '';
  state.currentPage = 1;
  renderFilteredPosts();
}

// ========== UI FUNCTIONS ========== //
function setupDistrictOptions() {
  const select = $('#districtSelect');
  if (!select) return;
  
  select.innerHTML = '<option value="">-- Quận --</option>';
  CONFIG.districts.forEach(district => {
    const option = document.createElement('option');
    option.value = district.toLowerCase();
    option.textContent = district;
    select.appendChild(option);
  });
}

function showLoading(show) {
  const spinner = $('#loadingSpinner');
  if (spinner) spinner.style.display = show ? 'block' : 'none';
}

function updateResultCount(count) {
  const resultCount = $('#resultCount');
  if (resultCount) {
    resultCount.textContent = count > 0 
      ? `Tìm thấy ${count} kết quả` 
      : 'Không có kết quả phù hợp';
  }
}

function showErrorUI() {
  const container = $('#postContainer');
  if (!container) return;
  
  container.innerHTML = `
    <div class="error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>Không thể tải dữ liệu</p>
      <button id="reloadBtn">Tải lại trang</button>
    </div>
  `;
  $('#reloadBtn')?.addEventListener('click', () => window.location.reload());
}

function showToast(message, type = 'success') {
  const toast = $('#toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ========== MODAL FUNCTIONS ========== //
window.showDetail = function(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;

  const modalBody = $('#modal-body');
  if (!modalBody) return;

  const avgRating = post.reviews.length > 0 
    ? (post.reviews.reduce((acc, cur) => acc + cur.rating, 0) / post.reviews.length)
    : 0;

  modalBody.innerHTML = `
    <h2>${post.district}</h2>
    <img src="https://picsum.photos/600/400?random=${post.imageIndex}" 
         alt="Ảnh phòng trọ ${post.district}" 
         loading="lazy">
    <p><strong>Địa chỉ:</strong> Số ${post.streetNumber}, ${post.street}</p>
    <p><strong>Giá:</strong> ${formatPrice(post.minPrice)} - ${formatPrice(post.maxPrice)}</p>
    <p><strong>Phòng trống:</strong> ${post.availableRooms}</p>
    <p><strong>Mô tả:</strong> ${post.description}</p>

    ${post.reviews.length > 0 ? `
    <div class="rating-section">
      <h3><i class="fas fa-star"></i> Đánh giá (${post.reviews.length})</h3>
      <p>Điểm trung bình: <strong>${avgRating.toFixed(1)}/5</strong></p>
      
      <div class="reviews-list">
        ${post.reviews.map(review => `
          <div class="review-item">
            <div class="rating">${'⭐'.repeat(review.rating)}</div>
            <p class="review-content">"${review.content}"</p>
            <p class="review-author">- ${review.author}</p>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
  `;
  $('#modal').classList.add('show');
};

window.closeModal = function() {
  $('#modal').classList.remove('show');
};

// ========== LIKE FUNCTION ========== //
window.toggleLike = function(postId) {
  const postIndex = state.posts.findIndex(p => p.id === postId);
  if (postIndex === -1) return;

  let savedPosts = getSavedPosts();
  const isLiked = state.posts[postIndex].liked;

  if (isLiked) {
    savedPosts = savedPosts.filter(p => p.id !== postId);
    showToast('Đã xóa khỏi danh sách lưu', 'info');
  } else {
    const post = state.posts[postIndex];
    savedPosts.push({
      id: post.id,
      district: post.district,
      street: post.street,
      price: `${formatPrice(post.minPrice)} - ${formatPrice(post.maxPrice)}`,
      rooms: post.availableRooms,
      description: post.description,
      imageIndex: post.imageIndex
    });
    showToast('Đã lưu vào danh sách');
  }

  localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
  state.posts[postIndex].liked = !isLiked;
  
  // Update UI immediately
  const likeBtn = $(`.btn-like[data-id="${postId}"]`);
  if (likeBtn) {
    likeBtn.classList.toggle('liked', state.posts[postIndex].liked);
    likeBtn.innerHTML = state.posts[postIndex].liked 
      ? '<i class="fas fa-heart"></i>' 
      : '<i class="far fa-heart"></i>';
  }
};

// ========== DARK MODE ========== //
window.toggleTheme = function() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
};

// Initialize dark mode
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}