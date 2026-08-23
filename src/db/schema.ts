export type Admin = {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
};

export type Category = {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robots: string;
  schemaType: string;
  createdAt: Date;
};

export type Service = {
  id: string;
  categoryIds: string[];
  titleHi: string;
  titleEn: string;
  url: string;
  descriptionHi: string;
  descriptionEn: string;
  tags: string;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  sortOrder: number;
  clickCount: number;
  createdAt: Date;
};

export type Ad = {
  id: string;
  variant: string;
  placement: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  linkUrl: string;
  imageUrl: string;
  buttonTextHi: string;
  buttonTextEn: string;
  bgColor: string;
  textColor: string;
  isPublished: boolean;
  publishAt: Date | null;
  expiresAt: Date | null;
  sortOrder: number;
  clickCount: number;
  impressionCount: number;
  createdAt: Date;
};

export type AdRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  adType: string;
  preferredPlacement: string;
  duration: string;
  budget: string;
  message: string;
  status: string;
  adminNotes: string;
  createdAt: Date;
};

export type AdType = {
  id: string;
  code: string;
  nameHi: string;
  nameEn: string;
  descriptionHi: string;
  descriptionEn: string;
  basePrice: number;
  billingUnit: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Placement = {
  id: string;
  code: string;
  nameHi: string;
  nameEn: string;
  multiplier: number;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DurationPlan = {
  id: string;
  days: number;
  discountPercent: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Advertisement = {
  id: string;
  requestId: string;
  advertiserName: string;
  contactPerson: string;
  email: string;
  mobile: string;
  websiteUrl: string;
  businessCategory: string;
  adTypeCode: string;
  placementCode: string;
  durationDays: number;
  startDate: string;
  targetPage: string;
  adTitle: string;
  shortDescription: string;
  ctaText: string;
  destinationUrl: string;
  creativeType: string;
  imageUrl: string;
  bannerImageUrl: string;
  logoUrl: string;
  altText: string;
  basePrice: number;
  placementMultiplier: number;
  grossAmount: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  utrNumber: string;
  paymentScreenshot: string;
  paymentDate: string;
  paymentTime: string;
  adminReply: string;
  internalNotes: string;
  rejectionReason: string;
  approvedAt: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  expiredAt: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Payment = {
  id: string;
  advertisementId: string;
  requestId: string;
  amount: number;
  method: string;
  utrNumber: string;
  screenshot: string;
  status: string;
  verifiedAt: string | null;
  verifiedBy: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentSettings = {
  id: string;
  upiEnabled: boolean;
  upiId: string;
  payeeName: string;
  merchantName: string;
  paymentInstructions: string;
  gstPercent: number;
  whatsappNumber: string;
  updatedAt: Date;
};

export type ServiceClick = {
  id: string;
  serviceId: string;
  createdAt: Date;
};

export type Session = {
  id: string;
  token: string;
  adminId: string;
  expiresAt: Date;
  createdAt: Date;
};

export type Setting = {
  id: string;
  key: string;
  value: string;
};

export type CookieSettings = {
  id: string;
  settingId: string;
  bannerEnabled: boolean;
  bannerTitle: string;
  bannerDescription: string;
  position: "bottom" | "top";
  layout: "banner" | "modal";
  policyVersion: string;
  policyUrl: string;
  privacyPolicyUrl: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CookieCategory = {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  description: string;
  required: boolean;
  defaultEnabled: boolean;
  status: "active" | "inactive";
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CookieConsent = {
  id: string;
  userId: string | null;
  anonymousId: string;
  sessionId: string;
  consentStatus: "PENDING" | "ACCEPTED_ALL" | "REJECTED_OPTIONAL" | "CUSTOMIZED" | "WITHDRAWN";
  preferences: Record<string, boolean>;
  policyVersion: string;
  consentMethod: string;
  consentTimestamp: Date;
  consentUpdatedAt: Date;
  ipHash: string;
  userAgent: string;
  deviceType: string;
  browser: string;
  os: string;
  withdrawn: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CookieConsentHistory = {
  id: string;
  consentId: string;
  userId: string | null;
  anonymousId: string;
  previousPreferences: Record<string, boolean>;
  newPreferences: Record<string, boolean>;
  action: string;
  policyVersion: string;
  timestamp: Date;
  source: string;
  createdAt: Date;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  name: string;
  status: "active" | "unsubscribed" | "bounced" | "blocked";
  source: string;
  preferences: Record<string, boolean>;
  isVerified: boolean;
  verificationToken: string | null;
  verifiedAt: Date | null;
  lastEmailAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PrivacyRequest = {
  id: string;
  requestId: string;
  userId: string | null;
  fullName: string;
  email: string;
  mobile: string;
  accountId: string;
  requestType: string;
  subject: string;
  description: string;
  requestedDataCategories: string[];
  currentInformation: string;
  correctInformation: string;
  correctionReason: string;
  deletionScope: string[];
  consentCategories: string[];
  communicationPreferences: string[];
  complaintCategory: string;
  incidentDate: string;
  relatedUrl: string;
  attachment: string;
  verificationMethod: string;
  verificationStatus: string;
  status: "RECEIVED" | "VERIFICATION_REQUIRED" | "VERIFICATION_PENDING" | "VERIFIED" | "UNDER_REVIEW" | "ADDITIONAL_INFORMATION_REQUIRED" | "PROCESSING" | "PARTIALLY_COMPLETED" | "COMPLETED" | "REJECTED" | "CANCELLED" | "CLOSED";
  priority: string;
  assignedTo: string;
  internalNotes: string;
  reply: string;
  submittedAt: Date;
  verifiedAt: Date | null;
  reviewStartedAt: Date | null;
  completedAt: Date | null;
  closedAt: Date | null;
  resolution: string;
  rejectionReason: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ContactRequest = {
  id: string;
  ticketId: string;
  fullName: string;
  email: string;
  requestType: string;
  subject: string;
  message: string;
  attachment: string;
  status: string;
  priority: string;
  assignedTo: string;
  internalNotes: string;
  reply: string;
  resolution: string;
  submittedAt: Date;
  reviewedAt: Date | null;
  completedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type JobCategory = {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robots: string;
  schemaType: string;
  createdAt: Date;
};

export type JobOrganization = {
  id: string;
  slug: string;
  nameHi: string;
  nameEn: string;
  abbreviation: string;
  website: string;
  descriptionHi: string;
  descriptionEn: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
};

export type JobLocation = {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  state: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
};

export type JobQualification = {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  level: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
};

export type Job = {
  id: string;
  slug: string;

  titleHi: string;
  titleEn: string;
  shortDescriptionHi: string;
  shortDescriptionEn: string;

  organizationId: string;
  organizationNameHi: string;
  organizationNameEn: string;

  categoryId: string;
  categoryNameHi: string;
  categoryNameEn: string;

  jobType: string;
  sector: string;
  state: string;
  locationNames: string[];

  applicationStartDate: string;
  applicationLastDate: string;
  notificationDate: string;

  totalVacancies: number;

  minimumQualification: string;
  maximumQualification: string;

  minimumAge: number;
  maximumAge: number;

  applicationFeeGeneral: number;
  applicationFeeOBC: number;
  applicationFeeSC: number;
  applicationFeeST: number;

  applyUrl: string;
  notificationUrl: string;

  status: string;
  isFeatured: boolean;
  isUrgent: boolean;
  isActive: boolean;

  template: string;

  blocks: JobBlock[];

  tags: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
   canonicalUrl: string;
   robots: string;
   schemaType: string;

   viewCount: number;
   applyClickCount: number;
   notificationClickCount: number;
   websiteClickCount: number;

   createdAt: Date;
   updatedAt: Date;
   publishedAt: Date | null;
   expiredAt: Date | null;

  // Private job fields
  companyNameEn?: string;
  companyNameHi?: string;
  companyLogo?: string;
  companyWebsite?: string;
  companyIndustry?: string;
  companySize?: string;
  companyLocation?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  employmentType?: string;
  workMode?: string;
  vacancies?: number;
  experienceFrom?: number;
  experienceTo?: number;
  qualifications?: string[];
  salaryType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: string;
  salaryNotDisclose?: boolean;
  salaryNegotiable?: boolean;
  incentives?: string;
  benefits?: string[];
  applyMethod?: string;
  externalUrl?: string;
  applicationEmail?: string;
  applicationInstructions?: string;
  walkInDate?: string;
  walkInStartTime?: string;
  walkInEndTime?: string;
  walkInVenue?: string;
  walkInAddress?: string;
  walkInContactPerson?: string;
  walkInContactNumber?: string;
  walkInDocuments?: string;
  walkInInstructions?: string;
  genderPreference?: string;
  ageFrom?: number;
  ageTo?: number;
  languageRequirement?: string;
  travelRequired?: boolean;
  willingToRelocate?: boolean;
  drivingLicenseRequired?: boolean;
  vehicleRequired?: boolean;
  shiftType?: string;
  workingHours?: string;
  applicationLimit?: number;
};

export type Company = {
  id: string;
  name: string;
  website: string;
  industry: string;
  size: string;
  location: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone: string;
  createdAt: Date;
  updatedAt: Date;
};

export type JobBlock = {
  id: string;
  type: JobBlockType;
  data: Record<string, any>;
  order: number;
};

export type JobBlockType =
  | "heading"
  | "paragraph"
  | "bullet-list"
  | "numbered-list"
  | "checklist"
  | "table"
  | "important-dates"
  | "vacancy-details"
  | "eligibility"
  | "age-limit"
  | "application-fee"
  | "salary"
  | "selection-process"
  | "how-to-apply"
  | "documents-required"
  | "important-links"
  | "faq"
  | "notice"
  | "image"
  | "video"
  | "quote"
  | "divider"
  | "spacer";

export type JobVacancy = {
  id: string;
  jobId: string;
  postNameHi: string;
  postNameEn: string;
  totalVacancies: number;
  payScale: string;
  eligibility: string;
  sortOrder: number;
};

export type JobDate = {
  id: string;
  jobId: string;
  event: string;
  date: string;
  description: string;
  sortOrder: number;
};

export type JobEligibility = {
  id: string;
  jobId: string;
  qualification: string;
  required: boolean;
  sortOrder: number;
};

export type JobFee = {
  id: string;
  jobId: string;
  category: string;
  amount: number;
  sortOrder: number;
};

export type JobLink = {
  id: string;
  jobId: string;
  nameHi: string;
  nameEn: string;
  url: string;
  linkType: string;
  isActive: boolean;
  sortOrder: number;
};

export type JobDocument = {
  id: string;
  jobId: string;
  nameHi: string;
  nameEn: string;
  required: boolean;
  sortOrder: number;
};

export type JobSelectionProcess = {
  id: string;
  jobId: string;
  stepNameHi: string;
  stepNameEn: string;
  description: string;
  sortOrder: number;
};

export type JobFAQ = {
  id: string;
  jobId: string;
  questionHi: string;
  questionEn: string;
  answerHi: string;
  answerEn: string;
  sortOrder: number;
};

export type JobTag = {
  id: string;
  nameHi: string;
  nameEn: string;
  slug: string;
  sortOrder: number;
  createdAt: Date;
};

export type JobClick = {
  id: string;
  jobId: string;
  linkId: string | null;
  linkType: string;
  source: string;
  device: string;
  browser: string;
  country: string;
  state: string;
  timestamp: Date;
};

export type JobView = {
  id: string;
  jobId: string;
  source: string;
  device: string;
  browser: string;
  country: string;
  state: string;
  timestamp: Date;
};

export type JobHistory = {
  id: string;
  jobId: string;
  changedBy: string;
  changedField: string;
  oldValue: string;
  newValue: string;
  ip: string;
  timestamp: Date;
};

export type JobSocialPost = {
  id: string;
  jobId: string;
  platform: string;
  postContent: string;
  postUrl: string;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
};

export type JobWithDetails = Job & {
  vacancies: JobVacancy[];
  dates: JobDate[];
  eligibility: JobEligibility[];
  fees: JobFee[];
  links: JobLink[];
  documents: JobDocument[];
  selectionProcess: JobSelectionProcess[];
  faqs: JobFAQ[];
  categories: Array<Pick<JobCategory, "slug" | "titleHi" | "titleEn" | "color" | "icon">>;
  organizations: Array<Pick<JobOrganization, "slug" | "nameHi" | "nameEn">>;
  locations: Array<Pick<JobLocation, "slug" | "titleHi" | "titleEn">>;
  tagsList: Array<Pick<JobTag, "nameHi" | "nameEn" | "slug">>;
};

export type PublicJob = Job & {
  category: "government" | "private";
  organizationHi: string;
  organizationEn: string;
  qualification: string;
  ageLimit: string;
  salary: string;
  location: string;
  applicationFee: string;
  startDate: string | null;
  lastDate: string | null;
  applyUrl: string;
  notificationUrl: string;
  isPublished: boolean;
  clickCount: number;
  blocks: JobBlock[];
};

export type CategoryWithCount = Category & {
  serviceCount: number;
};

export type ServiceWithCategory = Service & {
  categories: Array<Pick<Category, "slug" | "titleHi" | "titleEn" | "color" | "icon">>;
};

/* ───────────────────────── Newsletter ───────────────────────── */

export type NewsletterContentBlock = {
  id: string;
  type:
    | "heading"
    | "paragraph"
    | "image"
    | "button"
    | "link"
    | "list"
    | "divider"
    | "job_card"
    | "scheme_card"
    | "result_card"
    | "important_update"
    | "custom_html";
  data: Record<string, unknown>;
  order: number;
};

export type NewsletterCampaign = {
  id: string;
  title: string;
  subject: string;
  previewText: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "cancelled" | "failed";
  contentBlocks: NewsletterContentBlock[];
  audience: "all" | "active";
  scheduledAt: Date | null;
  sentAt: Date | null;
  senderName: string;
  senderEmail: string;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  createdAt: Date;
  updatedAt: Date;
  templateVersion: string;
};

export type NewsletterSendLog = {
  id: string;
  campaignId: string;
  subscriberId: string;
  email: string;
  status: "pending" | "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed" | "unsubscribed";
  sentAt: Date | null;
  deliveredAt: Date | null;
  openedAt: Date | null;
  clickedAt: Date | null;
  bouncedAt: Date | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewsletterSetting = {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
};
