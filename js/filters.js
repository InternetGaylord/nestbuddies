export const applySorting = (posts, sortType) => {
  return [...posts].sort((a, b) => {
    const avgPriceA = (a.minPrice + a.maxPrice) / 2;
    const avgPriceB = (b.minPrice + b.maxPrice) / 2;
    return sortType === 'price-asc' ? avgPriceA - avgPriceB : avgPriceB - avgPriceA;
  });
};

export const applyFilters = (posts, filters) => {
  return posts.filter(post => {
    const matchesSearch = !filters.search || 
      post.district.toLowerCase().includes(filters.search) ||
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
};