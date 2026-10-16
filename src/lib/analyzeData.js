export const cities = [
  { id: "hcmc", name: { en: "Ho Chi Minh City", vi: "TP. Hồ Chí Minh" } },
  { id: "hanoi", name: { en: "Hanoi", vi: "Hà Nội" } },
  { id: "danang", name: { en: "Da Nang", vi: "Đà Nẵng" } },
];

export const categories = [
  { id: "food_beverage", name: { en: "Food & Beverage", vi: "Đồ ăn & Thức uống" } },
  { id: "coffee_tea", name: { en: "Coffee & Tea", vi: "Cà phê & Trà" } },
  { id: "fashion", name: { en: "Fashion & Apparel", vi: "Thời trang" } },
  { id: "beauty", name: { en: "Beauty & Personal Care", vi: "Làm đẹp & Chăm sóc cá nhân" } },
  { id: "electronics", name: { en: "Consumer Electronics", vi: "Điện tử tiêu dùng" } },
  { id: "wellness", name: { en: "Health & Wellness", vi: "Sức khỏe & Lối sống" } },
  { id: "home_living", name: { en: "Home & Living", vi: "Nhà cửa & Nội thất" } },
];

export const cityMeta = {
  hcmc: { center: [10.795, 106.69], zoom: 11 },
  hanoi: { center: [21.022, 105.825], zoom: 11 },
  danang: { center: [16.05, 108.21], zoom: 12 },
};

export const neighborhoods = {
  hcmc: [
    { name: "District 1", vi: "Quận 1", lat: 10.776, lng: 106.703 },
    { name: "District 3", vi: "Quận 3", lat: 10.77, lng: 106.69 },
    { name: "District 5", vi: "Quận 5", lat: 10.752, lng: 106.667 },
    { name: "District 7", vi: "Quận 7", lat: 10.733, lng: 106.721 },
    { name: "District 10", vi: "Quận 10", lat: 10.775, lng: 106.662 },
    { name: "Binh Thanh", vi: "Bình Thạnh", lat: 10.812, lng: 106.71 },
    { name: "Thu Duc", vi: "Thủ Đức", lat: 10.847, lng: 106.768 },
    { name: "Phu Nhuan", vi: "Phú Nhuận", lat: 10.799, lng: 106.665 },
    { name: "Tan Binh", vi: "Tân Bình", lat: 10.799, lng: 106.652 },
    { name: "Go Vap", vi: "Gò Vấp", lat: 10.828, lng: 106.678 },
  ],
  hanoi: [
    { name: "Hoan Kiem", vi: "Hoàn Kiếm", lat: 21.028, lng: 105.852 },
    { name: "Ba Dinh", vi: "Ba Đình", lat: 21.036, lng: 105.818 },
    { name: "Dong Da", vi: "Đống Đa", lat: 21.02, lng: 105.827 },
    { name: "Hai Ba Trung", vi: "Hai Bà Trưng", lat: 21.005, lng: 105.852 },
    { name: "Cau Giay", vi: "Cầu Giấy", lat: 21.031, lng: 105.793 },
    { name: "Tay Ho", vi: "Tây Hồ", lat: 21.065, lng: 105.83 },
    { name: "Nam Tu Liem", vi: "Nam Từ Liêm", lat: 21.016, lng: 105.763 },
    { name: "Long Bien", vi: "Long Biên", lat: 21.043, lng: 105.885 },
    { name: "Hoang Mai", vi: "Hoàng Mai", lat: 20.985, lng: 105.842 },
    { name: "Ha Dong", vi: "Hà Đông", lat: 20.971, lng: 105.775 },
  ],
  danang: [
    { name: "Hai Chau", vi: "Hải Châu", lat: 16.047, lng: 108.218 },
    { name: "Thanh Khe", vi: "Thanh Khê", lat: 16.062, lng: 108.197 },
    { name: "Son Tra", vi: "Sơn Trà", lat: 16.085, lng: 108.242 },
    { name: "Ngu Hanh Son", vi: "Ngũ Hành Sơn", lat: 16.037, lng: 108.265 },
    { name: "Lien Chieu", vi: "Liên Chiểu", lat: 16.093, lng: 108.14 },
    { name: "Cam Le", vi: "Cẩm Lệ", lat: 16.02, lng: 108.199 },
  ],
};