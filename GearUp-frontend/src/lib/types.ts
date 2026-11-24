export type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export type RentalStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PAID'
  | 'PICKED_UP'
  | 'RETURNED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type PaymentMethod = 'STRIPE' | 'SSLCOMMERZ';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface GearItem {
  id: string;
  name: string;
  description: string;
  brand?: string | null;
  /** Prisma Decimal is serialised as a string. */
  pricePerDay: string | number;
  stock: number;
  images: string[];
  specifications?: Record<string, unknown> | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  providerId: string;
  categoryId: string;
  category?: Category;
  provider?: Pick<User, 'id' | 'name'> & { email?: string; phone?: string | null };
  reviews?: Review[];
}

export interface RentalOrderItem {
  id: string;
  quantity: number;
  price: string | number;
  rentalOrderId: string;
  gearItemId: string;
  gearItem?: GearItem;
}

export interface RentalOrder {
  id: string;
  status: RentalStatus;
  startDate: string;
  endDate: string;
  totalAmount: string | number;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  customer?: Pick<User, 'id' | 'name' | 'email'>;
  items?: RentalOrderItem[];
  payments?: Payment[];
  reviews?: Review[];
}

export interface Payment {
  id: string;
  transactionId: string;
  amount: string | number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  rentalOrderId: string;
  rentalOrder?: RentalOrder;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customerId: string;
  gearItemId: string;
  rentalOrderId: string;
  customer?: Pick<User, 'id' | 'name'>;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface PaymentSession {
  paymentUrl: string;
  transactionId: string;
  payment: Payment;
}

/** Envelope returned by every backend endpoint. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errorDetails?: unknown;
}
