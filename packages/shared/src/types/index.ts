export type Role = 'owner' | 'admin' | 'editor' | 'viewer';
export type PostType = 'job' | 'sales' | 'other';
export type PostStatus = 'draft' | 'ready' | 'archived';
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'done';
export type TargetStatus =
  | 'pending'
  | 'queued'
  | 'in_progress'
  | 'posted'
  | 'skipped'
  | 'failed';
export type Framework = 'AIDA' | 'PAS' | 'BAB' | 'FAB' | '4U' | 'PASTOR';
export type Privacy = 'public' | 'private' | 'unknown';

export interface BrandContext {
  name: string;
  oneLiner: string;
  usp: string[];
  tone: 'konkretny' | 'empatyczny' | 'profesjonalny' | 'konwersacyjny' | 'prowokacyjny';
  bannedWords?: string[];
  preferredWords?: string[];
}

export interface AdBrief {
  goal: 'leady' | 'rejestracje' | 'wiadomosci' | 'aplikacje' | 'sprzedaz' | 'swiadomosc';
  audience: string;
  postType: PostType;
  framework: Framework;
  platform: 'facebook_group';
  brand: BrandContext;
  offer: string;
  proof?: string;
  cta: string;
  region?: string;
  budget?: string;
  contact?: string;
}

export interface GeneratedAd {
  primaryText: string;
  variants: string[];
  humanScore: number;
  warnings: string[];
}
