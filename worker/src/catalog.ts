// Shared catalogue: cities, categories, neighbourhoods. Mirrors src/lib/analyzeData.js in the web app.

export const CITY_COORDS: Record<string, string> = {
  hcmc: '10.776,106.703',
  hanoi: '21.028,105.852',
  danang: '16.047,108.218'
};
export const CITY_NAMES: Record<string, string> = { hcmc: 'Ho Chi Minh City', hanoi: 'Hanoi', danang: 'Da Nang' };

export const CATEGORIES: Record<string, { label: string; brandTerm: string; placeTerm: string }> = {
  food_beverage: { label: 'Food & Beverage', brandTerm: 'restaurant chain', placeTerm: 'restaurant' },
  coffee_tea: { label: 'Coffee & Tea', brandTerm: 'specialty coffee', placeTerm: 'specialty coffee' },
  fashion: { label: 'Fashion & Apparel', brandTerm: 'fashion apparel brand', placeTerm: 'fashion boutique' },
  beauty: { label: 'Beauty & Personal Care', brandTerm: 'skincare brand', placeTerm: 'beauty salon' },
  electronics: { label: 'Consumer Electronics', brandTerm: 'consumer electronics brand', placeTerm: 'electronics store' },
  wellness: { label: 'Health & Wellness', brandTerm: 'fitness brand', placeTerm: 'gym' },
  home_living: { label: 'Home & Living', brandTerm: 'home furnishing brand', placeTerm: 'furniture store' }
};

export const NEIGHBORHOODS: Record<string, { name: string; lat: number; lng: number }[]> = {
  hcmc: [
    { name: 'District 1', lat: 10.776, lng: 106.703 },
    { name: 'District 3', lat: 10.77, lng: 106.69 },
    { name: 'District 5', lat: 10.752, lng: 106.667 },
    { name: 'District 7', lat: 10.733, lng: 106.721 },
    { name: 'District 10', lat: 10.775, lng: 106.662 },
    { name: 'Binh Thanh', lat: 10.812, lng: 106.71 },
    { name: 'Thu Duc', lat: 10.847, lng: 106.768 },
    { name: 'Phu Nhuan', lat: 10.799, lng: 106.665 },
    { name: 'Tan Binh', lat: 10.799, lng: 106.652 },
    { name: 'Go Vap', lat: 10.828, lng: 106.678 }
  ],
  hanoi: [
    { name: 'Hoan Kiem', lat: 21.028, lng: 105.852 },
    { name: 'Ba Dinh', lat: 21.036, lng: 105.818 },
    { name: 'Dong Da', lat: 21.02, lng: 105.827 },
    { name: 'Hai Ba Trung', lat: 21.005, lng: 105.852 },
    { name: 'Cau Giay', lat: 21.031, lng: 105.793 },
    { name: 'Tay Ho', lat: 21.065, lng: 105.83 },
    { name: 'Nam Tu Liem', lat: 21.016, lng: 105.763 },
    { name: 'Long Bien', lat: 21.043, lng: 105.885 },
    { name: 'Hoang Mai', lat: 20.985, lng: 105.842 },
    { name: 'Ha Dong', lat: 20.971, lng: 105.775 }
  ],
  danang: [
    { name: 'Hai Chau', lat: 16.047, lng: 108.218 },
    { name: 'Thanh Khe', lat: 16.062, lng: 108.197 },
    { name: 'Son Tra', lat: 16.085, lng: 108.242 },
    { name: 'Ngu Hanh Son', lat: 16.037, lng: 108.265 },
    { name: 'Lien Chieu', lat: 16.093, lng: 108.14 },
    { name: 'Cam Le', lat: 16.02, lng: 108.199 }
  ]
};

/** Accepts ids ("hcmc") or human names ("Ho Chi Minh City", "Saigon", "Hà Nội"). */
export function normalizeCity(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const s = input.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  if (CITY_COORDS[s]) return s;
  if (/(ho chi minh|hcm|saigon|sai gon)/.test(s)) return 'hcmc';
  if (/(ha ?noi)/.test(s)) return 'hanoi';
  if (/(da ?nang)/.test(s)) return 'danang';
  return null;
}

/** Accepts ids ("coffee_tea") or loose names ("Coffee", "F&B", "skincare"). */
export function normalizeCategory(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const s = input.trim().toLowerCase();
  if (CATEGORIES[s]) return s;
  if (/(coffee|tea|cafe|café|ca phe)/.test(s)) return 'coffee_tea';
  if (/(food|f&b|restaurant|beverage|bakery|dessert|burger|pizza)/.test(s)) return 'food_beverage';
  if (/(fashion|apparel|clothing|shoe|sneaker)/.test(s)) return 'fashion';
  if (/(beauty|skin|cosmetic|personal care)/.test(s)) return 'beauty';
  if (/(electronic|gadget|tech)/.test(s)) return 'electronics';
  if (/(wellness|fitness|gym|health|yoga)/.test(s)) return 'wellness';
  if (/(home|living|furniture|decor)/.test(s)) return 'home_living';
  return null;
}
