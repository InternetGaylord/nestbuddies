export const formatPrice = (price) => 
  new Intl.NumberFormat('vi-VN').format(price) + 'đ';

export const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), timeout);
  };
};

export const getSavedPosts = () => {
  try {
    return JSON.parse(localStorage.getItem('savedPosts')) || [];
  } catch (e) {
    console.error('Lỗi đọc localStorage:', e);
    return [];
  }
};