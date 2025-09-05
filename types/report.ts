export type BroadcastArea = 'city' | 'province' | 'nationwide';
export type ReportStatus = 'active' | 'found' | 'closed';

export interface MissingChildReport {
  id: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  childName: string;
  childAge: number;
  childPhoto: string;
  description: string;
  lastSeenLocation: string;
  lastSeenCoordinates?: {
    latitude: number;
    longitude: number;
  };
  broadcastArea: BroadcastArea;
  cost: number;
  status: ReportStatus;
  createdAt: string;
  foundAt?: string;
  sightings: Sighting[];
}

export interface Sighting {
  id: string;
  reportId: string;
  submitterId: string;
  submitterName: string;
  submitterPhone: string;
  photo?: string;
  description: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  tokensEarned: number;
  createdAt: string;
  isVerified: boolean;
}

export interface PaymentDetails {
  reportId: string;
  amount: number;
  tokensUsed: number;
  finalAmount: number;
  method: 'esewa' | 'khalti';
  transactionId: string;
}