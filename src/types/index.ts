export interface Client {
  id?: number;
  name: string;
  brand: string;
  platforms: ('Instagram' | 'TikTok' | 'Facebook' | 'LinkedIn' | 'YouTube' | 'Telegram' | 'Pinterest')[];
  status: 'active' | 'inactive';
  priority: boolean;
  notes: string;
  createdAt: Date;
}

export interface Task {
  id?: number;
  clientId: number;
  title: string;
  type: 'post' | 'story' | 'reel' | 'content-plan' | 'other';
  deadline: Date;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  description: string;
  needsApproval: boolean;
  createdAt: Date;
}

export interface Payment {
  id?: number;
  clientId: number;
  amount: number;
  currency: 'MDL' | 'USD';
  month: number;    // 1-12
  year: number;     // ex: 2026
  status: 'paid' | 'unpaid' | 'partial';
  date: Date;
  notes: string;
}