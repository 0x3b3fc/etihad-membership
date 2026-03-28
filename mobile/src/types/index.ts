export interface Member {
  id: string;
  memberNumber: string;
  nationalId: string;
  fullNameAr: string;
  fullNameEn: string;
  governorate: string;
  memberType: "student" | "graduate";
  entityName: string;
  role: string;
  address?: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  academicYear?: string;
  postgraduateStudy?: string;
  employmentStatus?: string;
  jobTitle?: string;
  employer?: string;
  previousExperiences?: string;
  skills?: string;
  profileImage: string;
  qrCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  fullName: string;
  nationalId: string;
  phone?: string;
  email?: string;
  address: string;
  birthDate: string;
  memberType: string;
  universityName?: string;
  facultyName?: string;
  employmentStatus: string;
  jobTitle?: string;
  employer?: string;
  previousExperiences?: string;
  skills?: string;
  photoUrl?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  adminNote?: string;
  submittedAt: string;
  decidedAt?: string;
  governorate: { id: string; name: string };
  assignedUnit?: { id: string; name: string } | null;
}

export interface Governorate {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  _count: { units: number; applications: number };
}

export interface Unit {
  id: string;
  name: string;
  governorateId?: string;
  governorate?: { id: string; name: string } | null;
  whatsappLink?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  _count: { users: number; applications: number };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface DashboardStats {
  totalMembers: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  totalGovernorates: number;
  totalUnits: number;
  latestApplications: Application[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
