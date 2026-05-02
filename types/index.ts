export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  degree: string;
  dob: string;
  clinic: string;
  phone: string;
  address: string;
  specialty: string;
  notes: string;
  medicalStore: string;
  prescribedProducts: string[];
  createdAt: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  category: string;
  composition: string;
  description: string;
  catalogSlide: number;
  isSeeded: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  items: OrderItem[];
  date: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  doctorClinic: string;
  date: string;
  time: string;                // "HH:MM" 24-hour format
  completed: boolean;
  showProducts: string[];      // product IDs to demo during this visit
  acceptedProducts: string[];  // product IDs doctor approved/liked
  notificationId?: string;     // expo notification identifier for cancellation
  createdAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  text: string;
  date: string;
  done: boolean;
  createdAt: string;
}
