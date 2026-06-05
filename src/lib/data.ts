import type { Client, Site, Invoice, Ticket, PortfolioItem, Notification, RevData } from '@/types';

export const CLIENTS_DATA: Client[] = [
  { id:1, name:'Amaka Okonkwo',   company:"Amaka's Bakery",       email:'amaka@amakasbakery.com.ng',    phone:'+234 801 234 5678', websites:2, status:'active',  plan:'Monthly', mrr:9999,  since:'Jan 2025' },
  { id:2, name:'Emeka Nwosu',     company:'Lagos Tech Hub',        email:'emeka@lagostechhub.ng',        phone:'+234 805 987 6543', websites:1, status:'active',  plan:'Monthly', mrr:9999,  since:'Mar 2025' },
  { id:3, name:'Adaobi Bright',   company:'Bright Futures School', email:'admin@brightfutures.edu.ng',   phone:'+234 809 111 2222', websites:1, status:'pending', plan:'Monthly', mrr:9999,  since:'Nov 2024' },
  { id:4, name:'Kemi Adeyemi',    company:"Kemi's Fashion",        email:'kemi@kemisfashion.com.ng',     phone:'+234 803 445 6677', websites:1, status:'active',  plan:'Monthly', mrr:9999,  since:'Feb 2025' },
];

export const SITES_DATA: Site[] = [
  { id:1, name:"Amaka's Bakery",      url:'amakasbakery.com.ng',      cid:1, cname:"Amaka's Bakery",       status:'live',        domExp:'Aug 12, 2026', seo:78, visits:[820,940,1080,1150,1240,1320,1280], forms:34, plan:'Monthly', fee:9999  },
  { id:2, name:'Bakery Online Store', url:'shop.amakasbakery.com.ng', cid:1, cname:"Amaka's Bakery",       status:'live',        domExp:'Aug 12, 2026', seo:65, visits:[600,720,780,850,890,920,890],   forms:12, plan:'Monthly', fee:0     },
  { id:3, name:'Lagos Tech Hub',      url:'lagostechhub.ng',          cid:2, cname:'Lagos Tech Hub',       status:'maintenance', domExp:'Mar 15, 2027', seo:82, visits:[2200,2800,3100,3300,3450,3200,3600],forms:67, plan:'Monthly', fee:9999  },
  { id:4, name:'Bright Futures',      url:'brightfutures.edu.ng',     cid:3, cname:'Bright Futures School',status:'live',        domExp:'Nov 20, 2026', seo:71, visits:[320,410,450,480,510,490,520],   forms:28, plan:'Monthly', fee:9999  },
  { id:5, name:"Kemi's Fashion",      url:'kemisfashion.com.ng',      cid:4, cname:"Kemi's Fashion",       status:'live',        domExp:'Feb 28, 2027', seo:69, visits:[450,520,680,720,810,890,950],   forms:22, plan:'Monthly', fee:9999  },
];

export const INV_DATA: Invoice[] = [
  { id:'INV-005', desc:'Monthly Retainer — Domain & Management', amount:9999,   due:'Jun 10, 2026', status:'unpaid', cid:1 },
  { id:'INV-004', desc:'Monthly Retainer — Domain & Management', amount:9999,   due:'May 10, 2026', status:'paid',   cid:1 },
  { id:'INV-003', desc:'Monthly Retainer — Domain & Management', amount:9999,   due:'Apr 10, 2026', status:'paid',   cid:1 },
  { id:'INV-002', desc:'Website Build — Bakery Online Store',    amount:120000, due:'Mar 01, 2026', status:'paid',   cid:1 },
  { id:'INV-001', desc:"Website Build — Amaka's Bakery",         amount:150000, due:'Jan 15, 2026', status:'paid',   cid:1 },
];

export const TICKET_DATA: Ticket[] = [
  { id:'TK-004', subj:'Contact form not sending emails',    site:'shop.amakasbakery.com.ng', status:'open',     pri:'high',   date:'Jun 01, 2026', cid:1, cname:'Amaka Okonkwo', msgs:[{f:'client',t:"The contact form on my online store stopped sending emails yesterday.", time:'10:24 AM'}] },
  { id:'TK-003', subj:'Hero image not loading on homepage', site:'amakasbakery.com.ng',      status:'resolved', pri:'medium', date:'May 28, 2026', cid:1, cname:'Amaka Okonkwo', msgs:[{f:'client',t:'The hero banner image on my homepage is broken.', time:'2:00 PM'},{f:'admin',t:'Fixed! We cleared the cache and re-uploaded the image.', time:'4:30 PM'}] },
  { id:'TK-002', subj:'Update phone number on contact page', site:'lagostechhub.ng',         status:'resolved', pri:'low',    date:'May 20, 2026', cid:2, cname:'Emeka Nwosu',   msgs:[{f:'client',t:'Please update our phone number to +234 805 000 1111.', time:'9:00 AM'},{f:'admin',t:'Done — the update is now live on your site.', time:'11:15 AM'}] },
  { id:'TK-001', subj:'Admissions form not submitting',     site:'brightfutures.edu.ng',     status:'open',     pri:'high',   date:'Jun 01, 2026', cid:3, cname:'Adaobi Bright', msgs:[{f:'client',t:'Parents are unable to submit the admissions form. This is very urgent!', time:'8:40 AM'}] },
];

export const PORTFOLIO_DATA: PortfolioItem[] = [
  { id:1, name:"Amaka's Bakery",       url:'amakasbakery.com.ng',  cat:'Food & Restaurant', year:2025, vis:'public',   desc:"E-commerce bakery site with online ordering, menu and contact." },
  { id:2, name:'Lagos Tech Hub',       url:'lagostechhub.ng',      cat:'Technology',        year:2025, vis:'public',   desc:'Hub site for Lagos tech community — events, blog and directory.' },
  { id:3, name:'Bright Futures School',url:'brightfutures.edu.ng', cat:'Education',         year:2024, vis:'public',   desc:'School portal with admissions, announcements and photo gallery.' },
  { id:4, name:"Kemi's Fashion",       url:'kemisfashion.com.ng',  cat:'Fashion & Retail',  year:2025, vis:'public',   desc:'Fashion brand site with lookbook, collections and online contact.' },
  { id:5, name:'SME Starter Template', url:null,                   cat:'Internal',          year:2026, vis:'internal', desc:'Reusable starter for rapid SME website launches.' },
];

export const NOTIF_DATA: Notification[] = [
  { id:1, type:'billing', text:'Invoice INV-005 (₦9,999) is due in 7 days',        time:'2 hours ago', read:false },
  { id:2, type:'domain',  text:'Domain amakasbakery.com.ng expires in 73 days',     time:'1 day ago',   read:false },
  { id:3, type:'system',  text:'Your website was updated successfully by our team', time:'3 days ago',  read:true  },
  { id:4, type:'system',  text:'Scheduled maintenance completed — all sites live',  time:'5 days ago',  read:true  },
];

export const REV_DATA: RevData[] = [
  {m:'Jan',r:285000},{m:'Feb',r:320000},{m:'Mar',r:415000},{m:'Apr',r:375000},{m:'May',r:442000},{m:'Jun',r:390000},
];

export const EMAIL_TEMPLATES = [
  { id:'welcome',     label:'Welcome',      subj:'Welcome to Websync Digital!',          body:"Dear {name},\n\nWelcome aboard! We're thrilled to have you as a valued client of Websync Digital. Your dashboard is ready at websyncdigital.com.ng/dashboard.\n\nBest regards,\nWebsync Digital Team", trigger:'On signup',       auto:true  },
  { id:'invoice',     label:'Invoice',      subj:'Reminder: Invoice Payment Due',        body:"Dear {name},\n\nThis is a friendly reminder that your invoice is due soon. Please process your payment at your earliest convenience to avoid any service interruption.\n\nWebsync Digital Team", trigger:'Invoice created', auto:true  },
  { id:'ticket',      label:'Ticket Update',subj:'Your Support Ticket Has Been Updated', body:"Dear {name},\n\nYour support ticket has received a response from our team. Log in to your dashboard to view the latest update.\n\nWebsync Digital Team", trigger:'Ticket reply',    auto:true  },
  { id:'maintenance', label:'Maintenance',  subj:'Scheduled Website Maintenance Notice', body:"Dear {name},\n\nWe will be performing scheduled maintenance on your website. Duration: ~30 minutes.\n\nWebsync Digital Team", trigger:'Manual only',     auto:false },
];
