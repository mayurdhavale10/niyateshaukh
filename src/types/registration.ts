// src/types/registration.ts
export type RegistrationType = 'audience' | 'performer';
export type PerformanceType = 'shayari' | 'poetry' | 'singer';

export interface Registration {
  userId: string;
  eventId: string;
  name: string;
  phone: string;
  email?: string | null;
  registrationType: RegistrationType;
  performanceType?: PerformanceType | null;
  qrCode: string;

  registeredAt?: Date;
  emailSent?: boolean;
  emailSentAt?: Date | null;
  checkedIn?: boolean;
  checkedInAt?: Date | null;
  checkedInBy?: string | null;
}
