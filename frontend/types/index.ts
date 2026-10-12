export type RoleType = 'ROLE_SUPPLIER' | 'ROLE_BENEFICIARY' | 'ROLE_ADMIN';

export type UserStatus = 
  | 'PENDING_OTP_VERIFICATION'
  | 'PENDING_ADMIN_APPROVAL'
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'SUSPENDED' 
  | 'ACTIVE' 
  | 'PENDING_VERIFICATION' 
  | 'DELETED';

export type DonationStatus = 
  | 'DRAFT' 
  | 'AVAILABLE' 
  | 'RESERVED' 
  | 'READY_FOR_PICKUP' 
  | 'PICKUP_IN_PROGRESS' 
  | 'COLLECTED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'EXPIRED';

export type FoodCategory = 
  | 'RICE' 
  | 'BIRYANI' 
  | 'CURRY' 
  | 'ROTI_BREAD' 
  | 'SNACKS' 
  | 'DESSERTS' 
  | 'FRUITS' 
  | 'PACKAGED_FOOD' 
  | 'MIXED_MEAL' 
  | 'OTHER';

export type DietaryType = 'VEGETARIAN' | 'NON_VEGETARIAN' | 'VEGAN';

export type OrganizationType = 
  | 'RESTAURANT' 
  | 'BAKERY' 
  | 'CATERER' 
  | 'CORPORATE_CAFETERIA' 
  | 'OLD_AGE_HOME' 
  | 'ORPHANAGE' 
  | 'COMMUNITY_SHELTER' 
  | 'OTHER';

export type ReportStatus = 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';

export interface User {
  id: string;
  email: string;
  status: UserStatus;
  roles: RoleType[];
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  city?: string;
  organizationId?: string;
  organizationName?: string;
  organizationType?: OrganizationType;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  verificationMethod?: string;
  photoUrl?: string;
  streetAddress?: string;
  locality?: string;
  postalCode?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  publicPhone?: string;
  showPublicPhone?: boolean;
  contactPerson?: string;
  statusReason?: string;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  licenseNumber?: string;
  documentUrl?: string;
  residentCount?: number;
  foodCapacityServings?: number;
  dietaryPreferences?: string;
}

export interface AdminUserItem {
  id: string;
  email: string;
  status: UserStatus;
  statusReason?: string;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  roles: RoleType[];
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  city?: string;
  createdAt: string;
  organizationId?: string;
  organizationName?: string;
  organizationType?: OrganizationType;
  contactPerson?: string;
  publicPhone?: string;
  showPublicPhone?: boolean;
  photoUrl?: string;
  streetAddress?: string;
  locality?: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  licenseNumber?: string;
  documentUrl?: string;
  residentCount?: number;
  foodCapacityServings?: number;
  dietaryPreferences?: string;
}

export interface OrganizationDirectoryItem {
  id: string;
  name: string;
  type: OrganizationType;
  description?: string;
  logoUrl?: string;
  photoUrl?: string;
  city: string;
  locality?: string;
  contactPhone?: string;
  publicPhone?: string;
  showPublicPhone?: boolean;
  showContactPhone?: boolean;
  latitude: number;
  longitude: number;
  totalDonationsOrReceived: number;
  estimatedMealsSharedOrReceived: number;
  createdAt: string;
}

export interface DonationAcceptanceItem {
  id: string;
  donationId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryPhone?: string;
  beneficiaryPhotoUrl?: string;
  beneficiaryCity?: string;
  requestedServings?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COLLECTED' | 'CANCELLED';
  otpVerified: boolean;
  handoverConfirmed: boolean;
  createdAt: string;
}

export interface DonationItem {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierLogoUrl?: string;
  supplierPhone?: string;
  supplierPhotoUrl?: string;
  supplierAddress?: string;
  supplierLocality?: string;
  supplierCity?: string;
  supplierState?: string;
  supplierPostalCode?: string;
  supplierLatitude?: number;
  supplierLongitude?: number;
  title: string;
  description: string;
  foodCategory: FoodCategory;
  dietaryType: DietaryType;
  approximateQuantity: number;
  quantityUnit: string;
  estimatedServings: number;
  preparationTime: string;
  pickupAvailableFrom: string;
  pickupAvailableUntil: string;
  consumeBeforeTime: string;
  status: DonationStatus;
  packagingStatus?: string;
  allergens?: string;
  specialInstructions?: string;
  pickupInstructions?: string;
  images: { id: string; imageUrl: string; isPrimary: boolean }[];
  address: {
    streetAddress: string;
    areaLocality?: string;
    city: string;
    state?: string;
    postalCode?: string;
    latitude: number;
    longitude: number;
  };
  distanceKm?: number;
  createdAt: string;
  acceptedByBeneficiaryName?: string;
  acceptedAt?: string;
  completedAt?: string;
  pendingRequestsCount?: number;
  acceptances?: DonationAcceptanceItem[];
  currentAcceptance?: DonationAcceptanceItem;
  pickupOtp?: string;
  otpExpiresAt?: string;
  otpVerified?: boolean;
  handoverConfirmed?: boolean;
  acceptanceStatus?: string;
}

export type DonationDto = DonationItem;

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  targetUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorUserId: string;
  authorName: string;
  authorAvatarUrl?: string;
  organizationId?: string;
  organizationName?: string;
  donationId?: string;
  content: string;
  city?: string;
  tags?: string;
  likesCount: number;
  commentsCount: number;
  hasLiked: boolean;
  imageUrls: string[];
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorUserId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  totalSuppliers: number;
  totalBeneficiaries: number;
  pendingSupplierApprovals: number;
  pendingBeneficiaryApprovals: number;
  approvedAccounts: number;
  rejectedAccounts: number;
  suspendedAccounts: number;
  totalDonations: number;
  availableDonations: number;
  reservedDonations: number;
  completedDonations: number;
  cancelledDonations: number;
  expiredDonations: number;
  completedPickups: number;
  estimatedMealsShared: number;
  citiesCoveredCount: number;
}
