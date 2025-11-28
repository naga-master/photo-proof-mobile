/**
 * Core Types for Photo Proof Mobile App
 * Aligned with backend API and web app types
 */

// ============================================================================
// User & Authentication Types
// ============================================================================

export type UserRole = 'studio' | 'client' | 'studio_owner' | 'studio_admin' | 'studio_photographer';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  studio_id?: string | null;
  client_id?: string | null;
  is_active: boolean;
  email_verified: boolean;
  phone?: string | null;
  avatar_url?: string | null;
  consent_given?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  refresh_token?: string;
  user: User;
  client_id?: number | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// ============================================================================
// Studio Types
// ============================================================================

export interface Studio {
  id: string;
  studio_name: string;
  email: string;
  logo?: string | null;
  brand_color?: string;
  created_at: string;
  updated_at: string;
}

export interface StudioTheme {
  logo?: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

// ============================================================================
// Client Types
// ============================================================================

export interface Client {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  address?: string;
  avatar_url?: string | null;
  profile_picture?: string | null;
  whatsapp_opt_in?: boolean;
  email_opt_in?: boolean;
  total_projects?: number;
  last_activity?: string;
  status?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Project & Album Types
// ============================================================================

export interface Project {
  id: string;
  title: string;
  client_id?: string;
  studio_id: string;
  shoot_date?: string;
  cover_photo_id?: string | null;
  cover_photo_src?: string;
  photo_count: number;
  is_locked: boolean;
  has_folders: boolean;
  layout?: LayoutId;
  payment_status?: PaymentStatus;
  price?: number;
  package_id?: string;
  status?: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'draft' | 'active' | 'delivered' | 'archived';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Due';

export interface Folder {
  id: string;
  name: string;
  project_id: string;
  cover_photo_id?: string | null;
  cover_photo_src?: string;
  photo_count: number;
  order_index: number;
}

// ============================================================================
// Photo Types
// ============================================================================

export interface Photo {
  id: string;
  project_id: string;
  folder_id?: string | null;
  original_filename: string;
  src: string;
  thumbnail_path?: string;
  thumbnail_src?: string;
  width: number;
  height: number;
  file_size: number;
  mime_type: string;
  status: PhotoStatus;
  is_favorite?: boolean;
  is_selected?: boolean;
  order_index: number;
  version_count?: number;
  created_at: string;
  updated_at: string;
}

export type PhotoStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';

export interface PhotoVariant {
  quality: 'thumbnail' | 'low' | 'medium' | 'high' | 'print';
  url: string;
  width: number;
  height: number;
}

// ============================================================================
// Comment Types
// ============================================================================

export interface Comment {
  id: string;
  photo_id: string;
  user_id: string;
  author_name: string;
  author_role: 'Client' | 'Studio';
  text: string;
  parent_id?: string | null;
  replies?: Comment[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Contract Types
// ============================================================================

export interface Contract {
  id: string;
  studio_id: string;
  client_id: string;
  project_id?: string;
  template_id?: string;
  contract_number: string;
  title: string;
  content: string;
  terms?: Record<string, any>;
  status: ContractStatus;
  sent_at?: string;
  viewed_at?: string;
  signed_at?: string;
  expires_at?: string;
  pdf_url?: string;
  signed_pdf_url?: string;
  client_name?: string;
  project_name?: string;
  project_title?: string;
  created_at: string;
  updated_at: string;
}

export type ContractStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'expired' | 'cancelled' | 'pending';

export interface ContractTemplate {
  id: string;
  studio_id: string;
  name: string;
  category?: string;
  content: string;
  variables?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignatureData {
  signature: string;
  timestamp?: string;
  agreement: boolean;
}

// ============================================================================
// Invoice Types
// ============================================================================

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  client_id?: string;
  project_id?: string;
  client_name: string;
  client_address: string;
  items: InvoiceItem[];
  notes?: string;
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  template: InvoiceTemplateId;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Draft' | 'Overdue';
export type InvoiceTemplateId = 'modern' | 'classic' | 'minimalist';

// ============================================================================
// Service Package Types
// ============================================================================

export interface ServicePackage {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  is_predefined?: boolean;
  package_type_id?: string | null;
  features: ServicePackageFeature[];
  deliverables?: string[];
  restrictions?: Record<string, any> | null;
  lifecycle_config?: Record<string, any> | null;
}

export interface ServicePackageFeature {
  name: string;
  included: boolean;
  details?: string | null;
}

// ============================================================================
// Store & E-Commerce Types
// ============================================================================

export interface Product {
  id: string;
  name: string;
  short_description?: string;
  detailed_description?: string;
  description?: string;
  category?: string;
  image_url?: string;
  price: number;
  compare_price?: number;
  specs?: Record<string, string>;
  sizes?: ProductSizeOption[];
  types?: ProductTypeOption[];
  mockup_images?: string[];
  product_type?: string;
  base_price?: number;
}

export interface ProductSizeOption {
  size: string;
  price: number;
}

export interface ProductTypeOption {
  name: string;
}

export interface CartItem {
  id: string;
  photo: Photo;
  product: Product;
  selected_option: ProductSizeOption;
  selected_type?: ProductTypeOption;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  client_id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  payment_method?: string;
  payment_status?: string;
  shipping_address?: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// ============================================================================
// Layout Types
// ============================================================================

export type LayoutId =
  | 'layout1'
  | 'layout2'
  | 'layout3'
  | 'layout4'
  | 'layout5'
  | 'layout6'
  | 'layout7'
  | 'layout8'
  | 'layout9';

export interface LayoutTemplate {
  id: LayoutId;
  name: string;
  description: string;
  header: 'Cover' | 'Title Only';
  grid: 'Masonry' | 'Grid' | 'Stacked';
  aspect: 'Portrait' | 'Landscape';
  theme: 'White' | 'Gray' | 'Cream' | 'Black';
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = 'comment' | 'favorite' | 'order' | 'payment' | 'system' | 'contract';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  context?: string;
  is_read: boolean;
  avatar_url?: string;
  action_url?: string;
  created_at: string;
}

// ============================================================================
// Upload Types
// ============================================================================

export type UploadMode = 'new' | 'existing' | null;

export interface UploadFile {
  id: string;
  uri: string;
  name: string;
  size: number;
  type: string;
  status: UploadFileStatus;
  progress: number;
  photo_id?: string;
  folder_path?: string;
  error?: string;
}

export type UploadFileStatus = 'queued' | 'uploading' | 'processing' | 'success' | 'failed';

export interface UploadSession {
  id: string;
  project_id: string;
  total_files: number;
  completed_files: number;
  failed_files: number;
  status: 'active' | 'paused' | 'completed' | 'failed';
  created_at: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface DashboardStats {
  total_projects: number;
  total_clients: number;
  total_photos: number;
  total_revenue: number;
  pending_invoices: number;
  pending_contracts: number;
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user_name?: string;
  avatar_url?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface ApiError {
  detail: string;
  status_code?: number;
  errors?: Record<string, string[]>;
}

// ============================================================================
// App State Types
// ============================================================================

export interface AppState {
  isOnline: boolean;
  isInitialized: boolean;
  currentStudioId?: string;
  pendingSync: number;
}
