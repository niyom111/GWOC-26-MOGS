
export interface CoffeeItem {
  id: string;
  name: string;
  notes: string;
  caffeine: string;
  intensity: number;
  image: string;
  price: number;
  description: string;
}

export interface CartItem extends CoffeeItem {
  quantity: number;
}

export interface ArtPiece {
  id: string;
  title: string;
  artist: string;
  price: string;
  image: string;
  available: boolean;
  stock: number;
}

export interface Workshop {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  seats: number;
  image: string;
}

export interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  date: string;
  pickupTime: string;
  status: string;
  payment_method?: string;
}

export enum Page {
  HOME = 'home',
  MENU = 'menu',
  CART = 'cart',
  WORKSHOPS = 'workshops',
  ART = 'art',
  PHILOSOPHY = 'philosophy',
  ROBUSTA_STORY = 'robusta-story',
  FIND_STORE = 'find_store',
  FAQ = 'faq',
  ADMIN = 'admin',
  LOGIN = 'login',
  PAYMENT_FAILURE = 'payment_failure',
  TRACK_ORDER = 'track_order',
  EMPLOYEE = 'employee',
  FRANCHISE = 'franchise'
}
