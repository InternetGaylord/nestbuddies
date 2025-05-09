// Hàm hiển thị toast
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Hàm lấy danh sách đã lưu
function getSavedPosts() {
  try {
    const saved = localStorage.getItem('savedPosts');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Lỗi đọc localStorage:', e);
    return [];
  }
}

// Hàm xóa bài đăng khỏi danh sách lưu
function removeSavedPost(postId) {
  let savedPosts = getSavedPosts();
  savedPosts = savedPosts.filter(post => post.id !== postId);
  
  try {
    localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
    document.querySelectorAll(`.post[data-id="${postId}"]`).forEach(el => el.remove());
    document.getElementById('resultCount').textContent = `${savedPosts.length} kết quả`;
    
    if (savedPosts.length === 0) {
      document.getElementById('savedPostsContainer').innerHTML = `
        <div class="no-results">
          <i class="fas fa-heart-broken"></i>
          <p>Bạn chưa lưu phòng trọ nào</p>
        </div>
      `;
    }
    
    showToast('Đã xóa khỏi danh sách lưu', 'info');
  } catch (e) {
    console.error('Lỗi cập nhật danh sách:', e);
    showToast('Có lỗi xảy ra', 'error');
  }
}

// Hàm hiển thị modal chi tiết
function showPostDetail(post) {
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <h2>${post.district}</h2>
    <img src="https://picsum.photos/600/400?random=${post.imageIndex || 1}" 
         alt="Ảnh phòng trọ ${post.district}" 
         loading="lazy">
    <p><strong>Giá:</strong> ${post.price || 'Liên hệ'}</p>
    ${post.rooms ? `<p><strong>Phòng trống:</strong> ${post.rooms}</p>` : ''}
    ${post.description ? `<p><strong>Mô tả:</strong> ${post.description}</p>` : ''}
    ${post.address ? `<p><strong>Địa chỉ:</strong> ${post.address}</p>` : ''}
  `;
  document.getElementById('modal').style.display = 'flex';
}

// Hàm đóng modal
function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
  const savedPosts = getSavedPosts();
  const container = document.getElementById('savedPostsContainer');
  
  console.log('Saved posts data:', savedPosts); // Debug log

  if (!savedPosts || savedPosts.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-heart-broken"></i>
        <p>Bạn chưa lưu phòng trọ nào</p>
      </div>
    `;
    document.getElementById('resultCount').textContent = '0 kết quả';
    return;
  }

  document.getElementById('resultCount').textContent = `${savedPosts.length} kết quả`;
  
  container.innerHTML = savedPosts.map(post => `
    <div class="post" data-id="${post.id}">
      <img src="https://picsum.photos/400/300?random=${post.imageIndex || 1}" 
           alt="Phòng trọ ${post.district}" 
           loading="lazy"
           onload="this.classList.add('loaded')">
      <div class="post-content">
        <h2>${post.district}</h2>
        <p>Giá: <strong>${post.price || 'Liên hệ'}</strong></p>
        ${post.rooms ? `<p>Phòng trống: <strong>${post.rooms}</strong></p>` : ''}
        <div class="actions">
          <button class="btn-detail" data-id="${post.id}">
            <i class="fas fa-info-circle"></i> Chi tiết
          </button>
          <button class="btn-remove" onclick="removeSavedPost(${post.id})">
            <i class="fas fa-trash-alt"></i> Xóa
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Thêm event listener cho nút chi tiết
  document.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const postId = parseInt(btn.dataset.id);
      const post = savedPosts.find(p => p.id === postId);
      if (post) showPostDetail(post);
    });
  });
});

// Thêm hàm vào global scope
window.removeSavedPost = removeSavedPost;
window.closeModal = closeModal;