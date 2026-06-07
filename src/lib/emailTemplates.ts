// Centralised, production email templates for Websync Digital.
// {name} is replaced with the recipient's name at send time.
// The dashboard URL is the single source of truth for client-facing links.

export const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://app.websyncdigital.com.ng/dashboard';

export interface EmailTemplate {
  id: string;
  label: string;
  subject: string;
  body: string;
  trigger: string;
  auto: boolean;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    label: 'Welcome',
    subject: 'Welcome to Websync Digital!',
    body:
      `Dear {name},\n\nWelcome aboard! We're thrilled to have you as a valued client of Websync Digital. ` +
      `Your dashboard is ready at ${DASHBOARD_URL}.\n\nBest regards,\nWebsync Digital Team`,
    trigger: 'On signup',
    auto: true,
  },
  {
    id: 'invoice',
    label: 'Invoice',
    subject: 'Reminder: Invoice Payment Due',
    body:
      `Dear {name},\n\nThis is a friendly reminder that your invoice is due soon. ` +
      `Please process your payment from your dashboard at ${DASHBOARD_URL} to avoid any service interruption.\n\n` +
      `Websync Digital Team`,
    trigger: 'Invoice created',
    auto: true,
  },
  {
    id: 'ticket',
    label: 'Ticket Update',
    subject: 'Your Support Ticket Has Been Updated',
    body:
      `Dear {name},\n\nYour support ticket has received a response from our team. ` +
      `Log in to your dashboard at ${DASHBOARD_URL} to view the latest update.\n\nWebsync Digital Team`,
    trigger: 'Ticket reply',
    auto: true,
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    subject: 'Scheduled Website Maintenance Notice',
    body:
      `Dear {name},\n\nWe will be performing scheduled maintenance on your website. Duration: ~30 minutes. ` +
      `You can check status anytime from your dashboard at ${DASHBOARD_URL}.\n\nWebsync Digital Team`,
    trigger: 'Manual only',
    auto: false,
  },
];
