export interface Client {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  websites: number;
  status: 'active' | 'pending' | 'inactive';
  plan: string;
  mrr: number;
  since: string;
}

export interface Site {
  id: number;
  name: string;
  url: string;
  cid: number;
  cname: string;
  status: 'live' | 'maintenance' | 'down';
  domExp: string;
  seo: number;
  visits: number[];
  forms: number;
  plan: string;
  fee: number;
}

export interface Invoice {
  id: string;
  desc: string;
  amount: number;
  due: string;
  status: 'paid' | 'unpaid' | 'overdue';
  cid: number;
}

export interface TicketMsg {
  f: 'client' | 'admin';
  t: string;
  time: string;
}

export interface Ticket {
  id: string;
  subj: string;
  site: string;
  status: 'open' | 'resolved';
  pri: 'high' | 'medium' | 'low';
  date: string;
  cid: number;
  cname: string;
  msgs: TicketMsg[];
}

export interface PortfolioItem {
  id: number;
  name: string;
  url: string | null;
  cat: string;
  year: number;
  vis: 'public' | 'internal';
  desc: string;
}

export interface Notification {
  id: number;
  type: string;
  text: string;
  time: string;
  read: boolean;
}

export interface RevData {
  m: string;
  r: number;
}

export type ProjectStatus = 'submitted' | 'processing' | 'active' | 'cancelled';

export interface ProjectFile {
  id: string;
  project_id: string;
  kind: 'logo' | 'image';
  path: string;
  url?: string;          // signed URL, filled in when fetched
}

export type InvoiceKind = 'domain' | 'email' | 'other';

export interface WsInvoice {
  id: string;
  description?: string;
  amount: number;            // in kobo
  due_date?: string;
  status: 'unpaid' | 'paid' | 'overdue';
  client_id: string;
  project_id?: string | null;
  kind?: InvoiceKind | null;
  paystack_reference?: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  status: ProjectStatus;
  business_name?: string;
  about?: string;
  extra_info?: string;
  socials?: string;
  address?: string;
  phone?: string;
  business_email?: string;
  brand_colors?: string;
  whatsapp?: string;
  paystack_subscription_code?: string;
  paystack_customer_code?: string;
  created_at: string;
  updated_at?: string;
  files?: ProjectFile[];
}
