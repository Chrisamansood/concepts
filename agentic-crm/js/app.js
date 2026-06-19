/* ============================================================
   Agentic CRM — app.js
   Complete SPA: routing, data, rendering, agents, typewriter.
   Zero dependencies. No imports/exports. Plain <script> tag.
   ============================================================ */

/* ----------------------------------------------------------
   1. EVENT BUS
   ---------------------------------------------------------- */
const Bus = {
  _h: {},
  on(e, fn) { (this._h[e] = this._h[e] || []).push(fn); },
  off(e, fn) { this._h[e] = (this._h[e] || []).filter(f => f !== fn); },
  emit(e, d) { (this._h[e] || []).forEach(fn => fn(d)); }
};

/* ----------------------------------------------------------
   2. PERSONA DATA
   ---------------------------------------------------------- */
let currentPersona = 'saas';

// -- Hero card stats --
const HERO_SAAS = [
  { label: 'Agents Active', value: '14', sub: '5 autonomous · 9 supervised', icon: 'A' },
  { label: 'Actions Today', value: '47', sub: '+12 vs yesterday', icon: 'Z' },
  { label: 'ARR Protected', value: '$4.9M', sub: '3 saves this week', icon: '$' },
  { label: 'AI Accuracy', value: '94%', sub: 'across 312 predictions', icon: '%' }
];
const HERO_TELECOM = [
  { label: 'Agents Active', value: '14', sub: '5 autonomous · 9 supervised', icon: 'A' },
  { label: 'Actions Today', value: '52', sub: '+8 vs yesterday', icon: 'Z' },
  { label: 'Revenue Protected', value: '€3.8M', sub: '2 saves this week', icon: '€' },
  { label: 'AI Accuracy', value: '91%', sub: 'across 287 predictions', icon: '%' }
];

// -- Customer spotlight --
const SPOTLIGHT_SAAS = {
  name: 'Acme Corp', initials: 'AC', type: 'Enterprise', contract: '3-yr contract',
  arr: '$2.4M', contractEnd: 'Aug \'26', issues: '3', churn: '81%',
  nba: 'Schedule CXO call · Deploy Retention Agent · 3 billing disputes unresolved'
};
const SPOTLIGHT_TELECOM = {
  name: 'James Whitfield', initials: 'JW', type: 'Consumer Premium', contract: '24-mo',
  arr: '€1,788/yr', contractEnd: 'Nov \'26', issues: '2', churn: '76%',
  nba: 'Trigger win-back offer · Resolve billing dispute · Upgrade to 5G bundle'
};

// -- Activity feed --
const FEED_SAAS = [
  { av:'OR', cls:'av-out', type:'Outreach', tcls:'ft-out', filter:'out', action:'Renewal proposal sent', account:'Acme Corp · $2.4M deal · Q3 window', time:'2m ago', status:'sb-done', slabel:'Completed' },
  { av:'CH', cls:'av-chu', type:'Churn', tcls:'ft-chu', filter:'chu', action:'High churn risk flagged', account:'DataVault Pro · Score 81% · ARR $3.1M', time:'8m ago', status:'sb-action', slabel:'Action needed' },
  { av:'BI', cls:'av-bil', type:'Revenue', tcls:'ft-bil', filter:'bil', action:'Invoice dispute resolved', account:'NexGen AI · Dispute #4421 · Auto-closed', time:'14m ago', status:'sb-done', slabel:'Completed' },
  { av:'PL', cls:'av-pln', type:'Pipeline', tcls:'ft-pln', filter:'pln', action:'Enterprise upgrade recommended', account:'CloudScale · 4 accounts flagged for upgrade', time:'22m ago', status:'sb-done', slabel:'Completed' },
  { av:'OR', cls:'av-out', type:'Outreach', tcls:'ft-out', filter:'out', action:'Executive QBR scheduled', account:'Pacific Systems · Jun 12 · 3 attendees confirmed', time:'31m ago', status:'sb-done', slabel:'Completed' },
  { av:'CH', cls:'av-chu', type:'Churn', tcls:'ft-chu', filter:'chu', action:'Retention offer deployed', account:'SignalWire · −10% discount + SLA uplift', time:'45m ago', status:'sb-done', slabel:'Completed' },
  { av:'BI', cls:'av-bil', type:'Revenue', tcls:'ft-bil', filter:'bil', action:'Monthly invoice generated & sent', account:'DataVault Pro · $847K · Auto-delivered', time:'1h ago', status:'sb-done', slabel:'Completed' },
  { av:'OR', cls:'av-out', type:'Outreach', tcls:'ft-out', filter:'out', action:'Partnership memo drafted', account:'NexGen AI · Awaiting review', time:'1.5h ago', status:'sb-review', slabel:'Pending review' }
];
const FEED_TELECOM = [
  { av:'OR', cls:'av-out', type:'Outreach', tcls:'ft-out', filter:'out', action:'Renewal proposal sent', account:'TeleCo Nordic · €1.2M deal · Q3 window', time:'2m ago', status:'sb-done', slabel:'Completed' },
  { av:'CH', cls:'av-chu', type:'Churn', tcls:'ft-chu', filter:'chu', action:'High churn risk flagged', account:'BlueWave Mobile · Score 81% · ARR €2.1M', time:'8m ago', status:'sb-action', slabel:'Action needed' },
  { av:'BI', cls:'av-bil', type:'Billing', tcls:'ft-bil', filter:'bil', action:'Invoice dispute resolved', account:'Apex Wireless · Dispute #4421 · Auto-closed', time:'14m ago', status:'sb-done', slabel:'Completed' },
  { av:'PL', cls:'av-pln', type:'Plan', tcls:'ft-pln', filter:'pln', action:'5G enterprise upgrade recommended', account:'SkyTel · 4 accounts flagged for upgrade', time:'22m ago', status:'sb-done', slabel:'Completed' },
  { av:'OR', cls:'av-out', type:'Outreach', tcls:'ft-out', filter:'out', action:'Executive QBR scheduled', account:'Pacific Carrier · Jun 12 · 3 attendees confirmed', time:'31m ago', status:'sb-done', slabel:'Completed' },
  { av:'CH', cls:'av-chu', type:'Churn', tcls:'ft-chu', filter:'chu', action:'Retention offer deployed', account:'Signal Mobile · −10% discount + SLA uplift', time:'45m ago', status:'sb-done', slabel:'Completed' },
  { av:'BI', cls:'av-bil', type:'Billing', tcls:'ft-bil', filter:'bil', action:'Monthly invoice generated & sent', account:'NovaTel · €847K · Auto-delivered', time:'1h ago', status:'sb-done', slabel:'Completed' },
  { av:'OR', cls:'av-out', type:'Outreach', tcls:'ft-out', filter:'out', action:'Partnership memo drafted', account:'TransLink Communications · Awaiting review', time:'1.5h ago', status:'sb-review', slabel:'Pending review' }
];

// -- Pipeline deals --
const PIPELINE_SAAS = [
  { id:'d1', company:'Acme Corp', value:'$2.4M', stage:'negotiation', confidence:72, risk:'high', tags:['Enterprise','3yr'], agents:['CH','OR'], daysInStage:18 },
  { id:'d2', company:'CloudScale Inc', value:'$1.8M', stage:'proposal', confidence:85, risk:'low', tags:['Mid-market','Annual'], agents:['PL','OR'], daysInStage:5 },
  { id:'d3', company:'DataVault Pro', value:'$3.1M', stage:'qualification', confidence:64, risk:'high', tags:['Enterprise','Multi-yr'], agents:['CH','BI'], daysInStage:12 },
  { id:'d4', company:'NexGen AI', value:'$890K', stage:'discovery', confidence:45, risk:'medium', tags:['Startup','Annual'], agents:['OR'], daysInStage:3 },
  { id:'d5', company:'SignalWire', value:'$1.2M', stage:'negotiation', confidence:78, risk:'medium', tags:['Mid-market','Renewal'], agents:['CH','OR','PL'], daysInStage:8 },
  { id:'d6', company:'Pacific Systems', value:'$2.7M', stage:'closed-won', confidence:98, risk:'low', tags:['Enterprise','5yr'], agents:['OR'], daysInStage:0 },
  { id:'d7', company:'Meridian Data', value:'$640K', stage:'proposal', confidence:71, risk:'medium', tags:['SMB','Annual'], agents:['OR','PL'], daysInStage:7 },
  { id:'d8', company:'Quantum Labs', value:'$1.5M', stage:'discovery', confidence:38, risk:'medium', tags:['Enterprise','Pilot'], agents:['OR'], daysInStage:1 }
];
const PIPELINE_TELECOM = [
  { id:'d1', company:'NovaTel BSS', value:'€3.1M', stage:'negotiation', confidence:72, risk:'high', tags:['Enterprise','BSS'], agents:['CH','OR'], daysInStage:18 },
  { id:'d2', company:'SkyTel 5G', value:'€1.8M', stage:'proposal', confidence:85, risk:'low', tags:['Carrier','5G'], agents:['PL','OR'], daysInStage:5 },
  { id:'d3', company:'BlueWave Mobile', value:'€2.1M', stage:'qualification', confidence:64, risk:'high', tags:['MVNO','Multi-yr'], agents:['CH','BI'], daysInStage:12 },
  { id:'d4', company:'Pacific Carrier', value:'€2.4M', stage:'closed-won', confidence:98, risk:'low', tags:['Tier-1','5yr'], agents:['OR'], daysInStage:0 },
  { id:'d5', company:'Signal Mobile', value:'€890K', stage:'discovery', confidence:45, risk:'medium', tags:['MVNO','Annual'], agents:['OR'], daysInStage:3 },
  { id:'d6', company:'TeleCo Nordic', value:'€1.2M', stage:'negotiation', confidence:78, risk:'medium', tags:['Regional','Renewal'], agents:['CH','OR','PL'], daysInStage:8 },
  { id:'d7', company:'Apex Wireless', value:'€640K', stage:'proposal', confidence:71, risk:'medium', tags:['SMB','OSS'], agents:['OR','PL'], daysInStage:7 },
  { id:'d8', company:'TransLink Comm', value:'€1.5M', stage:'discovery', confidence:38, risk:'medium', tags:['Enterprise','IoT'], agents:['OR'], daysInStage:1 }
];

// -- Account intel --
const ACCOUNT_SAAS = {
  name: 'Acme Corp',
  initials: 'AC',
  type: 'Enterprise · 3-yr contract · Mid-market segment',
  plan: 'Enterprise Pro · $200K/mo · Annual billing',
  stats: { arr: '$2.4M', contract: 'Aug \'26', nps: '32', issues: '3', churn: '81%' },
  tags: ['Enterprise', 'At Risk', '4yr tenure', 'Strategic'],
  signals: [
    { title: 'Churn threshold breached', sub: 'Score passed 70% trigger today', severity: 'red' },
    { title: 'No platform login 14 days', sub: 'Disengagement pattern detected', severity: 'red' },
    { title: 'Billing dispute open', sub: '$14.2K overcharge · 6 days', severity: 'orange' },
    { title: 'Support tickets spike', sub: '3 critical tickets this month', severity: 'orange' },
    { title: 'Renewal window open', sub: '120 days to contract expiry', severity: 'blue' }
  ],
  profile: [
    { label: 'Status', value: 'At Risk', cls: 'or' },
    { label: 'Churn score', value: '81% HIGH', cls: 'red' },
    { label: 'Plan', value: 'Enterprise Pro' },
    { label: 'ARR', value: '$2.4M' },
    { label: 'Contract end', value: 'Aug 2026', cls: 'or' },
    { label: 'Tenure', value: '4 years', cls: 'gr' },
    { label: 'Open tickets', value: '3 (1 billing)', cls: 'or' },
    { label: 'Last meeting', value: '3 days ago' },
    { label: 'NPS score', value: '32 / 100 ↓', cls: 'red' }
  ]
};
const ACCOUNT_TELECOM = {
  name: 'James Whitfield',
  initials: 'JW',
  type: 'Consumer Premium · 24-mo contract · High-value segment',
  plan: '5G Unlimited Pro · €149/mo · Monthly billing',
  stats: { arr: '€1,788/yr', contract: 'Nov \'26', nps: '28', issues: '2', churn: '76%' },
  tags: ['Premium', 'At Risk', '3yr tenure', 'High ARPU'],
  signals: [
    { title: 'Churn threshold breached', sub: 'Score passed 70% trigger today', severity: 'red' },
    { title: 'Billing dispute escalated', sub: '€214 overcharge · pending 8 days', severity: 'red' },
    { title: 'Data usage drop 60%', sub: 'Possible SIM swap to competitor', severity: 'orange' },
    { title: 'NPS score declining', sub: '45 → 34 → 28 over 3 surveys', severity: 'orange' },
    { title: 'Contract renewal window', sub: '150 days to expiry', severity: 'blue' }
  ],
  profile: [
    { label: 'Status', value: 'At Risk', cls: 'or' },
    { label: 'Churn score', value: '76% HIGH', cls: 'red' },
    { label: 'Plan', value: '5G Unlimited Pro' },
    { label: 'ARPU', value: '€149/mo' },
    { label: 'Contract end', value: 'Nov 2026', cls: 'or' },
    { label: 'Tenure', value: '3 years', cls: 'gr' },
    { label: 'Open tickets', value: '2 (1 billing)', cls: 'or' },
    { label: 'Last contact', value: '5 days ago' },
    { label: 'NPS score', value: '28 / 100 ↓', cls: 'red' }
  ]
};

// -- Account feed items --
const ACCT_FEED_SAAS = [
  { av:'CH', cls:'av-chu', action:'Churn score updated to 81%', detail:'Pattern: engagement drop + billing friction', time:'12m ago', status:'sb-action' },
  { av:'OR', cls:'av-out', action:'Renewal proposal drafted', detail:'Early renewal offer with 15% uplift', time:'28m ago', status:'sb-review' },
  { av:'BI', cls:'av-bil', action:'Billing dispute #4421 escalated', detail:'$14.2K overcharge flagged by Revenue Guard', time:'1h ago', status:'sb-action' },
  { av:'PL', cls:'av-pln', action:'Account health recalculated', detail:'Score dropped from 64 to 42 in 7 days', time:'2h ago', status:'sb-done' },
  { av:'OR', cls:'av-out', action:'QBR meeting prep generated', detail:'Deck includes usage trends + ROI analysis', time:'3h ago', status:'sb-done' },
  { av:'CH', cls:'av-chu', action:'Similar-account analysis complete', detail:'68% of similar profiles churned within 90 days', time:'4h ago', status:'sb-done' },
  { av:'BI', cls:'av-bil', action:'Invoice audit triggered', detail:'3 invoices flagged for review', time:'5h ago', status:'sb-done' },
  { av:'OR', cls:'av-out', action:'Stakeholder map updated', detail:'Added VP Eng and Head of Product', time:'6h ago', status:'sb-done' }
];
const ACCT_FEED_TELECOM = [
  { av:'CH', cls:'av-chu', action:'Churn score updated to 76%', detail:'Pattern: usage drop + billing dispute', time:'15m ago', status:'sb-action' },
  { av:'BI', cls:'av-bil', action:'Billing dispute escalated', detail:'€214 overcharge · auto-credit pending', time:'32m ago', status:'sb-action' },
  { av:'OR', cls:'av-out', action:'Win-back offer generated', detail:'5G bundle upgrade + 3-mo discount', time:'1h ago', status:'sb-review' },
  { av:'PL', cls:'av-pln', action:'Usage pattern analysed', detail:'Data usage down 60% in 14 days', time:'2h ago', status:'sb-done' },
  { av:'CH', cls:'av-chu', action:'Competitor port-out risk detected', detail:'SIM activity matches churn signature', time:'3h ago', status:'sb-action' },
  { av:'OR', cls:'av-out', action:'Retention call scheduled', detail:'Agent booked slot for Thu 2pm', time:'4h ago', status:'sb-done' },
  { av:'BI', cls:'av-bil', action:'Invoice history audited', detail:'2 billing errors found in last 6 months', time:'5h ago', status:'sb-done' },
  { av:'PL', cls:'av-pln', action:'Network quality check', detail:'No service issues in subscriber area', time:'6h ago', status:'sb-done' }
];

// -- Approval cards --
const APPROVALS_SAAS = [
  { id:'ap1', agent:'Pipeline Optimizer', agentAv:'PL', title:'Send early renewal offer to Acme Corp', confidence:87,
    reasoning:'Acme Corp\'s contract expires in 120 days. Historical data shows that early renewal offers sent 90+ days before expiry have a 73% acceptance rate. The account is showing churn signals, so proactive engagement reduces risk by an estimated 40%.',
    actions:['Approve','Modify','Decline'] },
  { id:'ap2', agent:'Churn Sentinel', agentAv:'CH', title:'Escalate Acme to Senior Account Manager', confidence:81,
    reasoning:'Churn score has risen from 52% to 81% in 21 days. The primary drivers are a billing dispute ($14.2K unresolved for 6 days) and a 14-day platform login gap. Accounts with this signature have a 68% churn rate within 90 days unless escalated.',
    actions:['Approve','Decline'] },
  { id:'ap3', agent:'Outreach Agent', agentAv:'OR', title:'Offer 3-month free premium tier as goodwill', confidence:74,
    reasoning:'NPS score has dropped from 52 to 32 over three quarters. A goodwill gesture at this stage has shown to recover NPS by 15-20 points in similar accounts. The cost ($60K) is justified against the $2.4M ARR at risk.',
    actions:['Approve','Modify','Decline'] }
];
const APPROVALS_TELECOM = [
  { id:'ap1', agent:'Renewal Pilot', agentAv:'PL', title:'Send 5G bundle upgrade offer to James Whitfield', confidence:84,
    reasoning:'James\'s usage pattern indicates strong data consumption needs despite recent decline. A 5G upgrade with bundled discount addresses both retention risk and ARPU growth. Similar offers have a 67% conversion rate.',
    actions:['Approve','Modify','Decline'] },
  { id:'ap2', agent:'Churn Sentinel', agentAv:'CH', title:'Escalate James Whitfield to retention team', confidence:79,
    reasoning:'Churn score at 76% with a billing dispute open for 8 days and data usage dropping 60%. This matches the pre-port-out signature seen in 71% of churned premium subscribers.',
    actions:['Approve','Decline'] },
  { id:'ap3', agent:'Billing Guard', agentAv:'BI', title:'Auto-credit €214 and waive late fee', confidence:88,
    reasoning:'Billing audit confirmed €214 overcharge due to a system error. Auto-crediting removes a key churn driver. The late fee waiver costs €12 but signals goodwill to a high-value subscriber.',
    actions:['Approve','Modify','Decline'] }
];

// -- Agent config --
const AGENTS_SAAS = [
  { id:'ag-churn', name:'Churn Sentinel', status:'active', desc:'Monitors engagement, billing, and NPS signals to predict churn risk.' },
  { id:'ag-pipeline', name:'Pipeline Optimizer', status:'active', desc:'Scores deals, recommends stage moves, and identifies bottlenecks.' },
  { id:'ag-outreach', name:'Outreach Agent', status:'active', desc:'Drafts personalized emails, proposals, and meeting agendas.' },
  { id:'ag-revenue', name:'Revenue Guard', status:'idle', desc:'Audits invoices, flags anomalies, and protects revenue leakage.' },
  { id:'ag-analyst', name:'Deal Analyst', status:'active', desc:'Analyses win/loss patterns and provides confidence scoring.' }
];
const AGENTS_TELECOM = [
  { id:'ag-churn', name:'Churn Sentinel', status:'active', desc:'Monitors usage, billing, and NPS signals to predict subscriber churn.' },
  { id:'ag-billing', name:'Billing Guard', status:'active', desc:'Audits invoices, resolves disputes, and prevents revenue leakage.' },
  { id:'ag-renewal', name:'Renewal Pilot', status:'active', desc:'Generates renewal and upgrade offers based on subscriber behaviour.' },
  { id:'ag-reach', name:'Reach Agent', status:'idle', desc:'Sends win-back campaigns and personalised subscriber outreach.' },
  { id:'ag-fraud', name:'Fraud Shield', status:'active', desc:'Detects SIM swap fraud, unusual porting, and account takeover.' }
];

// -- Tickets --
const TICKETS_SAAS = [
  { id:'TKT-9941', title:'Mass billing anomaly — Invoice Nov 2026', sub:'Zone A · 24 accounts affected', type:'combined', priority:'critical', status:'escalated', aiConf:95, aiLabel:'high', age:'2 hrs', ageUrgent:true, children:[
    { id:'TKT-9941a', title:'Acme Corp — $14.2K dispute #4421', sub:'Pending credit', type:'customer', priority:'high', status:'in-progress', aiConf:91, aiLabel:'high', age:'2 hrs', ageUrgent:false },
    { id:'TKT-9941b', title:'NexGen AI — $8.4K dispute', sub:'Credit applied', type:'customer', priority:'high', status:'resolved', aiConf:88, aiLabel:'high', age:'4 hrs', ageUrgent:false }
  ]},
  { id:'TKT-9938', title:'API integration failure — CloudScale cluster', sub:'12 endpoints · Service degradation', type:'technical', priority:'critical', status:'in-progress', aiConf:87, aiLabel:'high', age:'45 min', ageUrgent:true, children:[
    { id:'TKT-9938a', title:'Endpoint /api/v3/sync — timeout errors', sub:'Auto-diagnosed', type:'technical', priority:'critical', status:'in-progress', aiConf:92, aiLabel:'high', age:'45 min', ageUrgent:true }
  ]},
  { id:'TKT-9930', title:'SSO authentication degradation — North region', sub:'Engineer assigned · ETA 2hrs', type:'technical', priority:'high', status:'in-progress', aiConf:78, aiLabel:'med', age:'6 hrs', ageUrgent:false, children:[] },
  { id:'TKT-9918', title:'Data migration error — bulk import', sub:'346 records failed · Rollback pending', type:'combined', priority:'high', status:'open', aiConf:84, aiLabel:'high', age:'1 day', ageUrgent:false, children:[] },
  { id:'TKT-9901', title:'Subscription billing — incorrect rate applied', sub:'7 enterprise accounts · Billing feed', type:'customer', priority:'medium', status:'open', aiConf:65, aiLabel:'med', age:'2 days', ageUrgent:false, children:[] },
  { id:'TKT-9895', title:'Unauthorized API access — flagged by AI', sub:'ACC-778455 · Verification required', type:'security', priority:'high', status:'open', aiConf:89, aiLabel:'high', age:'3 hrs', ageUrgent:false, children:[] }
];
const TICKETS_TELECOM = [
  { id:'TKT-6601', title:'Mass billing anomaly — Prepaid top-ups Nov 2026', sub:'Zone B · 18 subscribers affected', type:'combined', priority:'critical', status:'escalated', aiConf:93, aiLabel:'high', age:'1 hr', ageUrgent:true, children:[
    { id:'TKT-6601a', title:'James Whitfield — €214 overcharge', sub:'Pending credit', type:'customer', priority:'high', status:'in-progress', aiConf:90, aiLabel:'high', age:'1 hr', ageUrgent:false },
    { id:'TKT-6601b', title:'Sarah Thompson — €89 overcharge', sub:'Credit applied', type:'customer', priority:'high', status:'resolved', aiConf:87, aiLabel:'high', age:'3 hrs', ageUrgent:false }
  ]},
  { id:'TKT-6598', title:'5G handover failure — Sector 12 North', sub:'Signal degradation · 42 users impacted', type:'technical', priority:'critical', status:'in-progress', aiConf:85, aiLabel:'high', age:'30 min', ageUrgent:true, children:[
    { id:'TKT-6598a', title:'eNodeB config mismatch — auto-diagnosed', sub:'Rollback initiated', type:'technical', priority:'critical', status:'in-progress', aiConf:91, aiLabel:'high', age:'30 min', ageUrgent:true }
  ]},
  { id:'TKT-6590', title:'SIM swap fraud attempt — ACC-778455', sub:'Fraud Shield blocked · Verification required', type:'security', priority:'high', status:'open', aiConf:92, aiLabel:'high', age:'2 hrs', ageUrgent:false, children:[] },
  { id:'TKT-6585', title:'Number porting delay — BlueWave Mobile', sub:'3 business lines pending 48hrs', type:'customer', priority:'high', status:'in-progress', aiConf:76, aiLabel:'med', age:'2 days', ageUrgent:false, children:[] },
  { id:'TKT-6580', title:'Roaming charge dispute — EU zone', sub:'12 subscribers · Auto-credit review', type:'customer', priority:'medium', status:'open', aiConf:68, aiLabel:'med', age:'1 day', ageUrgent:false, children:[] },
  { id:'TKT-6575', title:'Voicemail system outage — Region West', sub:'Partial restore · ETA 4hrs', type:'technical', priority:'high', status:'in-progress', aiConf:80, aiLabel:'high', age:'5 hrs', ageUrgent:false, children:[] }
];

// -- Research typewriter lines --
const RESEARCH_LINES_SAAS = [
  "▸ Scanning CRM activity for Acme Corp...",
  "▸ Last login: 14 days ago (baseline: daily)",
  "▸ Support tickets: 3 open (1 critical billing dispute)",
  "▸ NPS trend: 52 → 38 → 32 (declining 3 consecutive quarters)",
  "▸ Contract renewal: 120 days remaining",
  "",
  "◆ RISK ASSESSMENT",
  "  Churn probability: 81% (HIGH)",
  "  Primary drivers: engagement drop + billing friction",
  "  Similar accounts: 68% churned within 90 days",
  "",
  "◆ RECOMMENDED ACTIONS",
  "  1. Schedule executive sponsor call within 7 days",
  "  2. Resolve billing dispute #4421 ($14.2K overcharge)",
  "  3. Deploy early renewal offer (save $600K/yr)",
  "  4. Assign senior CSM for white-glove treatment",
  "",
  "▸ Drafting outreach email...",
  "",
  "Subject: Partnership review — let’s get ahead of Q3",
  "",
  "Hi Sarah,",
  "",
  "I noticed your team hasn’t logged into the platform recently, and",
  "I wanted to reach out personally. We’ve also identified a billing",
  "discrepancy that we’re resolving as a priority.",
  "",
  "I’d love to schedule 30 minutes to discuss how we can better",
  "support your team’s goals for Q3. We have some new features",
  "launching that align well with your use case.",
  "",
  "Would Thursday at 2pm work?",
  "",
  "Best,",
  "AgentCRM Outreach Agent"
];
const RESEARCH_LINES_TELECOM = [
  "▸ Scanning subscriber profile for James Whitfield...",
  "▸ Last data session: 5 days ago (baseline: daily heavy user)",
  "▸ Open tickets: 2 (1 billing dispute €214)",
  "▸ NPS trend: 45 → 34 → 28 (declining 3 consecutive surveys)",
  "▸ Contract renewal: 150 days remaining",
  "",
  "◆ RISK ASSESSMENT",
  "  Churn probability: 76% (HIGH)",
  "  Primary drivers: billing dispute + usage decline",
  "  Similar subscribers: 71% ported out within 60 days",
  "",
  "◆ RECOMMENDED ACTIONS",
  "  1. Auto-credit €214 overcharge immediately",
  "  2. Offer 5G Unlimited bundle upgrade with 3-mo discount",
  "  3. Schedule retention call within 48 hours",
  "  4. Flag for premium win-back campaign",
  "",
  "▸ Drafting win-back message...",
  "",
  "Subject: James — we’d like to make this right",
  "",
  "Hi James,",
  "",
  "We’ve identified a billing error on your account and have",
  "applied a €214 credit effective immediately. We sincerely",
  "apologise for the inconvenience.",
  "",
  "As a valued premium subscriber, we’d also like to offer you",
  "an exclusive upgrade to our 5G Unlimited bundle at 25% off",
  "for the next 3 months.",
  "",
  "Would you have 10 minutes this week for a quick call?",
  "",
  "Best regards,",
  "AgentCRM Retention Team"
];

// -- Toast messages --
const TOASTS_SAAS = [
  { msg: 'Churn Sentinel detected risk pattern on DataVault Pro', agent: 'Churn Sentinel' },
  { msg: 'Pipeline Optimizer moved CloudScale to next stage', agent: 'Pipeline Optimizer' },
  { msg: 'Outreach Agent sent follow-up to Acme Corp', agent: 'Outreach Agent' },
  { msg: 'Revenue Guard flagged invoice anomaly on NexGen AI', agent: 'Revenue Guard' },
  { msg: 'Deal Analyst updated confidence score for SignalWire', agent: 'Deal Analyst' }
];
const TOASTS_TELECOM = [
  { msg: 'Churn Sentinel: James Whitfield risk score → 76%', agent: 'Churn Sentinel' },
  { msg: 'Billing Guard: Auto-resolved dispute #4421 for €14.20', agent: 'Billing Guard' },
  { msg: 'Renewal Pilot: Offer generated for BlueWave Mobile', agent: 'Renewal Pilot' },
  { msg: 'Reach Agent: Win-back email opened by Sarah Thompson', agent: 'Reach Agent' },
  { msg: 'Fraud Shield: SIM swap attempt blocked on ACC-778455', agent: 'Fraud Shield' }
];

// -- Customer 360 data --
const C360_SAAS = {
  timeline: [
    { date: 'Jun 15', event: 'QBR meeting completed', type: 'meeting' },
    { date: 'Jun 10', event: 'Billing dispute #4421 opened', type: 'ticket' },
    { date: 'Jun 3', event: 'NPS survey: score 32', type: 'survey' },
    { date: 'May 28', event: 'Last platform login', type: 'activity' },
    { date: 'May 15', event: 'Feature request: API v3 access', type: 'request' },
    { date: 'Apr 20', event: 'Contract amendment signed', type: 'contract' }
  ],
  services: [
    { name: 'Enterprise Pro Platform', status: 'active', value: '$180K/mo' },
    { name: 'Premium Support SLA', status: 'active', value: '$15K/mo' },
    { name: 'API Integration Suite', status: 'active', value: '$5K/mo' },
    { name: 'Training Package', status: 'expired', value: '$12K (one-time)' }
  ],
  billing: [
    { period: 'Jun 2026', amount: '$200,000', status: 'Pending', flag: true },
    { period: 'May 2026', amount: '$200,000', status: 'Paid', flag: false },
    { period: 'Apr 2026', amount: '$200,000', status: 'Paid', flag: false },
    { period: 'Mar 2026', amount: '$195,000', status: 'Paid', flag: false }
  ],
  npsMonths: ['Jan','Feb','Mar','Apr','May','Jun'],
  npsData: [52, 48, 45, 40, 36, 32],
  usageMonths: ['Jan','Feb','Mar','Apr','May','Jun'],
  usageData: [18, 19, 17, 14, 10, 7],
  usageLabel: 'API Calls (M)',
  billingMonths: ['Mar','Apr','May','Jun'],
  billingAmounts: [195, 200, 200, 200],
  billingFlags: [false, false, false, true],
  billingSymbol: '$',
  billingUnit: 'K'
};
const C360_TELECOM = {
  timeline: [
    { date: 'Jun 14', event: 'Billing dispute opened (€214)', type: 'ticket' },
    { date: 'Jun 10', event: 'Data usage dropped 60%', type: 'activity' },
    { date: 'Jun 5', event: 'NPS survey: score 28', type: 'survey' },
    { date: 'May 30', event: 'Roaming data session (EU)', type: 'activity' },
    { date: 'May 20', event: 'Plan change request declined', type: 'request' },
    { date: 'Apr 15', event: 'Contract renewal reminder sent', type: 'contract' }
  ],
  services: [
    { name: '5G Unlimited Pro', status: 'active', value: '€99/mo' },
    { name: 'Device Protection Plus', status: 'active', value: '€12/mo' },
    { name: 'International Roaming', status: 'active', value: '€25/mo' },
    { name: 'Cloud Storage 100GB', status: 'active', value: '€13/mo' }
  ],
  billing: [
    { period: 'Jun 2026', amount: '€149.00', status: 'Disputed', flag: true },
    { period: 'May 2026', amount: '€149.00', status: 'Paid', flag: false },
    { period: 'Apr 2026', amount: '€149.00', status: 'Paid', flag: false },
    { period: 'Mar 2026', amount: '€149.00', status: 'Paid', flag: false }
  ],
  npsMonths: ['Jan','Feb','Mar','Apr','May','Jun'],
  npsData: [48, 44, 40, 35, 31, 28],
  usageMonths: ['Jan','Feb','Mar','Apr','May','Jun'],
  usageData: [45, 48, 42, 35, 28, 18],
  usageLabel: 'Data (GB)',
  billingMonths: ['Mar','Apr','May','Jun'],
  billingAmounts: [149, 149, 149, 149],
  billingFlags: [false, false, false, true],
  billingSymbol: '€',
  billingUnit: ''
};

/* ----------------------------------------------------------
   KANBAN STAGES
   ---------------------------------------------------------- */
const STAGES = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed-won'];
const STAGE_LABELS = { 'discovery': 'Discovery', 'qualification': 'Qualification', 'proposal': 'Proposal', 'negotiation': 'Negotiation', 'closed-won': 'Closed Won' };

/* ----------------------------------------------------------
   HELPERS
   ---------------------------------------------------------- */
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function getPersonaData(saas, telecom) { return currentPersona === 'saas' ? saas : telecom; }

/* ----------------------------------------------------------
   3. TYPEWRITER
   ---------------------------------------------------------- */
class Typewriter {
  constructor(container, options) {
    this.el = container;
    this.speed = (options && options.speed) || 25;
    this.lineDelay = (options && options.lineDelay) || 400;
    this.cursor = null;
    this.running = false;
  }
  async stream(lines) {
    this.running = true;
    this.el.innerHTML = '';
    this._addCursor();
    for (const line of lines) {
      if (!this.running) break;
      var lineEl = document.createElement('div');
      lineEl.className = 'typewriter-line';
      this.el.insertBefore(lineEl, this.cursor);
      for (const char of line) {
        if (!this.running) break;
        lineEl.textContent += char;
        this.el.scrollTop = this.el.scrollHeight;
        await this._wait(this.speed + Math.random() * 15);
      }
      await this._wait(this.lineDelay);
    }
    this.running = false;
    if (this.cursor) this.cursor.remove();
  }
  stop() { this.running = false; }
  _addCursor() {
    this.cursor = document.createElement('span');
    this.cursor.className = 'typewriter-cursor';
    this.cursor.textContent = '▌';
    this.el.appendChild(this.cursor);
  }
  _wait(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
}

/* ----------------------------------------------------------
   4. SPA ROUTER
   ---------------------------------------------------------- */
const VIEW_TITLES = {
  dashboard: 'Command Center',
  pipeline: 'Deal Pipeline',
  account: 'Account Intelligence',
  tickets: 'Ticket Queue',
  inbox: 'Agent Inbox'
};

var _activeView = 'dashboard';
var _accountDealId = null;

function navigateTo(viewName, opts) {
  opts = opts || {};
  _activeView = viewName;
  if (opts.dealId) _accountDealId = opts.dealId;

  // Toggle view visibility
  $$('.view').forEach(function(v) { v.classList.remove('active'); });
  var target = document.getElementById('view-' + viewName);
  if (target) target.classList.add('active');

  // Toggle nav highlight
  $$('.ni').forEach(function(n) { n.classList.remove('on'); });
  var navItem = document.querySelector('.ni[data-view="' + viewName + '"]');
  if (navItem) navItem.classList.add('on');

  // Update topnav title
  var titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = VIEW_TITLES[viewName] || 'Agentic CRM';

  Bus.emit('navigate', { view: viewName, opts: opts });

  // Render the target view
  switch (viewName) {
    case 'dashboard': renderDashboard(); break;
    case 'pipeline': renderPipeline(); break;
    case 'account': renderAccount(); break;
    case 'tickets': renderTickets(); break;
    case 'inbox': renderInbox(); break;
  }
}

function initRouter() {
  // Sidebar nav clicks
  $$('.ni[data-view]').forEach(function(el) {
    el.addEventListener('click', function() {
      navigateTo(el.dataset.view);
    });
  });
}

/* ----------------------------------------------------------
   5. DASHBOARD RENDERING
   ---------------------------------------------------------- */
var _dashFilter = 'all';

function renderDashboard() {
  var el = document.getElementById('view-dashboard');
  if (!el) return;

  var heroes = getPersonaData(HERO_SAAS, HERO_TELECOM);
  var spot = getPersonaData(SPOTLIGHT_SAAS, SPOTLIGHT_TELECOM);

  el.innerHTML =
    '<div class="hero-grid">' +
      heroes.map(function(h) {
        return '<div class="hero-card">' +
          '<div class="hero-label">' + h.label + '</div>' +
          '<div class="hero-value">' + h.value + '</div>' +
          '<div class="hero-sub">' + h.sub + '</div>' +
        '</div>';
      }).join('') +
    '</div>' +

    '<div class="dash-body">' +
      // Spotlight
      '<div class="spot-card">' +
        '<div class="spot-header">' +
          '<div class="spot-av">' + spot.initials + '</div>' +
          '<div>' +
            '<div class="spot-name">' + spot.name + '</div>' +
            '<div class="spot-type">' + spot.type + ' · ' + spot.contract + ' · <span class="risk-tag">At Risk</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="spot-stats">' +
          '<div class="spot-stat"><span class="spot-stat-label">ARR</span><span class="spot-stat-value">' + spot.arr + '</span></div>' +
          '<div class="spot-stat"><span class="spot-stat-label">Contract</span><span class="spot-stat-value">' + spot.contractEnd + '</span></div>' +
          '<div class="spot-stat"><span class="spot-stat-label">Open issues</span><span class="spot-stat-value">' + spot.issues + '</span></div>' +
        '</div>' +
        '<div class="spot-churn">' +
          '<div class="spot-churn-label">Churn score</div>' +
          '<div class="spot-churn-bar"><div class="spot-churn-fill" style="width:' + spot.churn + '"></div></div>' +
          '<div class="spot-churn-val">' + spot.churn + '</div>' +
        '</div>' +
        '<div class="spot-nba">' +
          '<div class="spot-nba-label">Next best action</div>' +
          '<div class="spot-nba-text">' + spot.nba + '</div>' +
        '</div>' +
        '<button class="btn btn-sm btn-accent spot-btn" onclick="navigateTo(\'account\')">View account →</button>' +
      '</div>' +

      // Activity feed
      '<div class="feed-panel">' +
        '<div class="feed-header">' +
          '<span class="feed-title">Agent Activity</span>' +
          '<span class="feed-live"><span class="live-dot"></span> LIVE</span>' +
        '</div>' +
        '<div class="dash-tabs" id="dash-tabs">' +
          '<button class="tab on" data-filter="all">All</button>' +
          '<button class="tab" data-filter="out">Outreach</button>' +
          '<button class="tab" data-filter="chu">Churn</button>' +
          '<button class="tab" data-filter="pln">Pipeline</button>' +
          '<button class="tab" data-filter="bil">Billing</button>' +
        '</div>' +
        '<div class="feed-list" id="dash-feed"></div>' +
      '</div>' +
    '</div>';

  renderDashboardFeed('all');

  // Tab handlers
  $$('#dash-tabs .tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      $$('#dash-tabs .tab').forEach(function(t) { t.classList.remove('on'); });
      tab.classList.add('on');
      _dashFilter = tab.dataset.filter;
      renderDashboardFeed(_dashFilter);
    });
  });
}

function renderDashboardFeed(filter) {
  var container = document.getElementById('dash-feed');
  if (!container) return;

  var items = getPersonaData(FEED_SAAS, FEED_TELECOM);
  var filtered = filter === 'all' ? items : items.filter(function(it) { return it.filter === filter; });

  container.innerHTML = filtered.map(function(it, i) {
    return '<div class="feed-item stagger-item" style="animation-delay:' + (i * 0.05) + 's">' +
      '<div class="feed-av ' + it.cls + '">' + it.av + '</div>' +
      '<div class="feed-content">' +
        '<div class="feed-action">' + it.action + '</div>' +
        '<div class="feed-account">' + it.account + '</div>' +
      '</div>' +
      '<div class="feed-right">' +
        '<span class="feed-type ' + it.tcls + '">' + it.type + '</span>' +
        '<span class="feed-time">' + it.time + '</span>' +
        '<span class="sb ' + it.status + '">' + it.slabel + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ----------------------------------------------------------
   6. PIPELINE RENDERING
   ---------------------------------------------------------- */
function renderPipeline() {
  var el = document.getElementById('view-pipeline');
  if (!el) return;

  var deals = getPersonaData(PIPELINE_SAAS, PIPELINE_TELECOM);

  el.innerHTML =
    '<div class="pipeline-topbar">' +
      '<div class="pipeline-summary-row">' +
        STAGES.map(function(stage) {
          var stageDeals = deals.filter(function(d) { return d.stage === stage; });
          var total = stageDeals.reduce(function(s, d) { return s + stageDeals.length; }, 0);
          return '<div class="pipeline-stage-pill">' +
            '<span class="psp-label">' + STAGE_LABELS[stage] + '</span>' +
            '<span class="psp-count">' + stageDeals.length + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div class="kanban">' +
      STAGES.map(function(stage) {
        var stageDeals = deals.filter(function(d) { return d.stage === stage; });
        return '<div class="kanban-col">' +
          '<div class="kanban-col-header">' +
            '<span class="kanban-col-title">' + STAGE_LABELS[stage] + '</span>' +
            '<span class="kanban-col-count">' + stageDeals.length + '</span>' +
          '</div>' +
          '<div class="kanban-col-body">' +
            stageDeals.map(function(deal) {
              var riskCls = deal.risk === 'high' ? 'risk-high' : deal.risk === 'medium' ? 'risk-med' : 'risk-low';
              var confCls = deal.confidence >= 75 ? 'conf-high' : deal.confidence >= 50 ? 'conf-med' : 'conf-low';
              return '<div class="deal-card card-hover ' + riskCls + '" data-deal-id="' + deal.id + '" onclick="navigateTo(\'account\', {dealId:\'' + deal.id + '\'})">' +
                '<div class="dc-top">' +
                  '<span class="dc-company">' + deal.company + '</span>' +
                  '<span class="dc-risk-dot ' + riskCls + '"></span>' +
                '</div>' +
                '<div class="dc-value">' + deal.value + '</div>' +
                '<div class="dc-tags">' +
                  deal.tags.map(function(t) { return '<span class="dc-tag">' + t + '</span>'; }).join('') +
                '</div>' +
                '<div class="dc-conf">' +
                  '<div class="dc-conf-bar"><div class="dc-conf-fill ' + confCls + '" style="width:' + deal.confidence + '%"></div></div>' +
                  '<span class="dc-conf-val">' + deal.confidence + '%</span>' +
                '</div>' +
                '<div class="dc-bottom">' +
                  '<span class="dc-days">' + deal.daysInStage + 'd in stage</span>' +
                  '<div class="dc-agents">' +
                    deal.agents.map(function(a) { return '<span class="dc-agent-av">' + a + '</span>'; }).join('') +
                  '</div>' +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
}

/* ----------------------------------------------------------
   7. ACCOUNT INTEL VIEW
   ---------------------------------------------------------- */
var _activeC360Tab = 'timeline';
var _twInstance = null;

function renderAccount() {
  var el = document.getElementById('view-account');
  if (!el) return;

  var acct = getPersonaData(ACCOUNT_SAAS, ACCOUNT_TELECOM);
  var feedItems = getPersonaData(ACCT_FEED_SAAS, ACCT_FEED_TELECOM);
  var approvals = getPersonaData(APPROVALS_SAAS, APPROVALS_TELECOM);
  var agents = getPersonaData(AGENTS_SAAS, AGENTS_TELECOM);
  var activeCount = agents.filter(function(a) { return a.status === 'active'; }).length;

  el.innerHTML =
    '<div class="acct-outer">' +

      // ── HERO STRIP ──
      '<div class="acct-hero-strip">' +
        '<div class="ahs-av">' + acct.initials + '</div>' +
        '<div class="ahs-info">' +
          '<div class="ahs-name">' + acct.name + '</div>' +
          '<div class="ahs-sub">' + acct.type + '</div>' +
        '</div>' +
        '<div class="ahs-divider"></div>' +
        '<div class="ahs-kpis">' +
          '<div class="ahs-kpi"><div class="ahs-kpi-val ahs-risk">' + acct.stats.churn + '</div><div class="ahs-kpi-label">Churn Risk</div></div>' +
          '<div class="ahs-kpi"><div class="ahs-kpi-val">' + acct.stats.arr + '</div><div class="ahs-kpi-label">ARR / ARPU</div></div>' +
          '<div class="ahs-kpi"><div class="ahs-kpi-val ahs-warn">' + acct.stats.contract + '</div><div class="ahs-kpi-label">Contract End</div></div>' +
          '<div class="ahs-kpi"><div class="ahs-kpi-val ahs-risk">' + acct.stats.nps + '</div><div class="ahs-kpi-label">NPS Score</div></div>' +
          '<div class="ahs-kpi"><div class="ahs-kpi-val ahs-warn">' + acct.stats.issues + '</div><div class="ahs-kpi-label">Open Tickets</div></div>' +
        '</div>' +
        '<div class="ahs-live"><div class="ahs-live-dot"></div>' + activeCount + ' agents active</div>' +
      '</div>' +

      // ── 2-COLUMN LAYOUT ──
      '<div class="acct-layout">' +

        // Left column: profile + signals
        '<div class="acct-left">' +
          '<div class="acct-profile-card">' +
            '<div class="acct-av">' + acct.initials + '</div>' +
            '<div class="acct-name">' + acct.name + '</div>' +
            '<div class="acct-type">' + acct.type + '</div>' +
            '<div class="acct-plan">' + acct.plan + '</div>' +
            '<div class="acct-tags">' +
              acct.tags.map(function(t) {
                var cls = t === 'At Risk' ? 'tag-risk' : t === 'Strategic' || t === 'High ARPU' ? 'tag-strat' : '';
                return '<span class="acct-tag ' + cls + '">' + t + '</span>';
              }).join('') +
            '</div>' +
            '<div class="acct-stats">' +
              acct.profile.map(function(p) {
                return '<div class="acct-stat-row">' +
                  '<span class="acct-stat-label">' + p.label + '</span>' +
                  '<span class="acct-stat-value ' + (p.cls || '') + '">' + p.value + '</span>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="acct-signals">' +
            '<div class="acct-section-title">Risk Signals</div>' +
            acct.signals.map(function(sig) {
              return '<div class="signal-row signal-' + sig.severity + '">' +
                '<div class="signal-dot signal-dot-' + sig.severity + '"></div>' +
                '<div>' +
                  '<div class="signal-title">' + sig.title + '</div>' +
                  '<div class="signal-sub">' + sig.sub + '</div>' +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>' +

        // Right column
        '<div class="acct-right">' +

          // ── Orchestration map ──
          '<div class="acct-panel orch-panel">' +
            '<div class="acct-panel-header">' +
              '<span class="acct-panel-title">Agent Orchestration</span>' +
              '<span class="orch-live-badge"><span class="orch-badge-dot"></span>Live · ' + activeCount + ' active</span>' +
            '</div>' +
            buildOrchMap(agents, acct) +
          '</div>' +

          // Research panel
          '<div class="acct-panel">' +
            '<div class="acct-panel-header">' +
              '<span class="acct-panel-title">Agent Research</span>' +
              '<button class="btn btn-sm btn-accent" id="btn-run-research">Run Research</button>' +
            '</div>' +
            '<div class="acct-research-output" id="research-output"></div>' +
          '</div>' +

          // Activity feed
          '<div class="acct-panel">' +
            '<div class="acct-panel-header">' +
              '<span class="acct-panel-title">Account Activity</span>' +
            '</div>' +
            '<div class="acct-feed">' +
              feedItems.map(function(it, i) {
                return '<div class="feed-item stagger-item" style="animation-delay:' + (i * 0.04) + 's">' +
                  '<div class="feed-av ' + it.cls + '">' + it.av + '</div>' +
                  '<div class="feed-content">' +
                    '<div class="feed-action">' + it.action + '</div>' +
                    '<div class="feed-account">' + it.detail + '</div>' +
                  '</div>' +
                  '<div class="feed-right">' +
                    '<span class="feed-time">' + it.time + '</span>' +
                    '<span class="sb ' + it.status + '">' + (it.status === 'sb-action' ? 'Action' : it.status === 'sb-review' ? 'Review' : 'Done') + '</span>' +
                  '</div>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>' +

          // Approval cards
          '<div class="acct-panel">' +
            '<div class="acct-panel-header">' +
              '<span class="acct-panel-title">Pending Approvals</span>' +
              '<span class="approval-count">' + approvals.length + ' actions</span>' +
            '</div>' +
            '<div class="approval-list" id="approval-list">' +
              approvals.map(function(ap) {
                return '<div class="approval-card" id="approval-' + ap.id + '">' +
                  '<div class="ap-header">' +
                    '<div class="ap-av">' + ap.agentAv + '</div>' +
                    '<div class="ap-info">' +
                      '<div class="ap-agent">' + ap.agent + '</div>' +
                      '<div class="ap-title">' + ap.title + '</div>' +
                    '</div>' +
                    '<div class="ap-conf">' + ap.confidence + '%</div>' +
                  '</div>' +
                  '<div class="ap-reasoning">' + ap.reasoning + '</div>' +
                  '<div class="ap-actions" id="ap-actions-' + ap.id + '">' +
                    ap.actions.map(function(a) {
                      var cls = a === 'Approve' ? 'btn-accent' : a === 'Decline' ? 'btn-danger' : 'btn-ghost';
                      return '<button class="btn btn-sm ' + cls + '" onclick="handleApproval(\'' + ap.id + '\',\'' + a.toLowerCase() + '\')">' + a + '</button>';
                    }).join('') +
                  '</div>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>' +

          // Agent config
          '<div class="acct-panel">' +
            '<div class="acct-panel-header">' +
              '<span class="acct-panel-title">Agent Configuration</span>' +
            '</div>' +
            '<div class="agent-config-list">' +
              agents.map(function(ag) {
                return '<div class="agent-config-card" id="agcfg-' + ag.id + '">' +
                  '<div class="agcfg-header" onclick="toggleExpand(\'' + ag.id + '\')">' +
                    '<div class="agcfg-status-dot ' + ag.status + '"></div>' +
                    '<div class="agcfg-name">' + ag.name + '</div>' +
                    '<div class="agcfg-toggle" onclick="event.stopPropagation(); toggleAgent(event, \'' + ag.id + '\')">' +
                      '<div class="toggle-track ' + (ag.status === 'active' ? 'on' : '') + '" id="toggle-' + ag.id + '">' +
                        '<div class="toggle-thumb"></div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="agcfg-chevron" id="chevron-' + ag.id + '">▸</div>' +
                  '</div>' +
                  '<div class="agcfg-expand" id="expand-' + ag.id + '">' +
                    '<div class="agcfg-desc">' + ag.desc + '</div>' +
                    '<div class="agcfg-controls">' +
                      '<div class="agcfg-slider-row">' +
                        '<span class="agcfg-slider-label">Sensitivity</span>' +
                        '<input type="range" min="0" max="100" value="70" class="agcfg-slider" oninput="updateSlider(this)">' +
                        '<span class="agcfg-slider-val">70</span>' +
                      '</div>' +
                      '<div class="agcfg-mini-row">' +
                        '<span>Auto-approve low risk</span>' +
                        '<div class="mini-toggle on" onclick="toggleMini(this)"><div class="mini-thumb"></div></div>' +
                      '</div>' +
                      '<div class="agcfg-mini-row">' +
                        '<span>Send notifications</span>' +
                        '<div class="mini-toggle on" onclick="toggleMini(this)"><div class="mini-thumb"></div></div>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>' +

          // Customer 360 — with graph tabs
          '<div class="acct-panel">' +
            '<div class="acct-panel-header">' +
              '<span class="acct-panel-title">Customer 360</span>' +
            '</div>' +
            '<div class="c360-tabs">' +
              '<button class="c360-tab on" onclick="switchC360Tab(\'timeline\', this)">Timeline</button>' +
              '<button class="c360-tab" onclick="switchC360Tab(\'nps\', this)">NPS Trend</button>' +
              '<button class="c360-tab" onclick="switchC360Tab(\'usage\', this)">Usage</button>' +
              '<button class="c360-tab" onclick="switchC360Tab(\'billing\', this)">Billing</button>' +
            '</div>' +
            '<div class="c360-body" id="c360-body"></div>' +
          '</div>' +

        '</div>' +
      '</div>' +
    '</div>';

  var resBtn = document.getElementById('btn-run-research');
  if (resBtn) {
    resBtn.addEventListener('click', function() {
      runResearch();
      resBtn.disabled = true;
      resBtn.textContent = 'Running...';
    });
  }

  renderC360Tab('timeline');
}

function runResearch() {
  var output = document.getElementById('research-output');
  if (!output) return;
  if (_twInstance) _twInstance.stop();
  var lines = getPersonaData(RESEARCH_LINES_SAAS, RESEARCH_LINES_TELECOM);
  _twInstance = new Typewriter(output, { speed: 20, lineDelay: 300 });
  _twInstance.stream(lines);
}

// -- Approval handling --
function handleApproval(cardId, action) {
  var actionsEl = document.getElementById('ap-actions-' + cardId);
  var card = document.getElementById('approval-' + cardId);
  if (!actionsEl || !card) return;

  if (action === 'approve') {
    actionsEl.innerHTML = '<span class="ap-result ap-approved">Approved</span>';
  } else if (action === 'decline') {
    actionsEl.innerHTML = '<span class="ap-result ap-declined">Declined</span>';
  } else {
    actionsEl.innerHTML = '<span class="ap-result ap-modified">Modification requested</span>';
  }

  setTimeout(function() {
    card.style.opacity = '0.5';
    card.style.pointerEvents = 'none';
  }, 1200);
}

// -- Agent config interactions --
function toggleExpand(id) {
  var panel = document.getElementById('expand-' + id);
  var chevron = document.getElementById('chevron-' + id);
  if (!panel) return;
  var isOpen = panel.classList.contains('open');
  panel.classList.toggle('open');
  if (chevron) chevron.textContent = isOpen ? '▸' : '▾';
}

function toggleAgent(event, id) {
  event.stopPropagation();
  var track = document.getElementById('toggle-' + id);
  var dot = document.querySelector('#agcfg-' + id + ' .agcfg-status-dot');
  if (!track) return;
  track.classList.toggle('on');
  if (dot) {
    dot.classList.toggle('active');
    dot.classList.toggle('idle');
  }
}

function toggleMini(el) {
  el.classList.toggle('on');
}

function updateSlider(el) {
  var val = el.nextElementSibling;
  if (val) val.textContent = el.value;
}

// -- Customer 360 --
function switchC360Tab(tabId, el) {
  _activeC360Tab = tabId;
  $$('.c360-tab').forEach(function(t) { t.classList.remove('on'); });
  if (el) el.classList.add('on');
  renderC360Tab(tabId);
}

function renderC360Tab(tabId) {
  var body = document.getElementById('c360-body');
  if (!body) return;
  var data = getPersonaData(C360_SAAS, C360_TELECOM);

  if (tabId === 'timeline') {
    body.innerHTML = data.timeline.map(function(item) {
      var icon = item.type === 'meeting' ? '📅' : item.type === 'ticket' ? '🎫' : item.type === 'survey' ? '📊' : item.type === 'contract' ? '📝' : item.type === 'request' ? '💡' : '•';
      return '<div class="c360-timeline-item">' +
        '<span class="c360-date">' + item.date + '</span>' +
        '<span class="c360-icon">' + icon + '</span>' +
        '<span class="c360-event">' + item.event + '</span>' +
      '</div>';
    }).join('');
  } else if (tabId === 'nps') {
    body.innerHTML = buildNPSChart(data.npsData, data.npsMonths);
  } else if (tabId === 'usage') {
    body.innerHTML = buildUsageChart(data.usageData, data.usageMonths, data.usageLabel);
  } else if (tabId === 'billing') {
    body.innerHTML =
      buildBillingChart(data.billingAmounts, data.billingMonths, data.billingSymbol, data.billingUnit) +
      '<table class="c360-table" style="margin-top:10px"><thead><tr><th>Period</th><th>Amount</th><th>Status</th></tr></thead><tbody>' +
      data.billing.map(function(b) {
        return '<tr class="' + (b.flag ? 'billing-flag' : '') + '"><td>' + b.period + '</td><td>' + b.amount + '</td><td><span class="sb ' + (b.flag ? 'sb-action' : 'sb-done') + '">' + b.status + '</span></td></tr>';
      }).join('') +
      '</tbody></table>';
  }
}

// ── Orchestration Map SVG ──────────────────────────────────
function buildOrchMap(agents, acct) {
  var pos = [
    { x: 280, y: 30 },
    { x: 82, y: 74 },
    { x: 478, y: 74 },
    { x: 82, y: 162 },
    { x: 478, y: 162 }
  ];
  var colors = ['#EF4444', '#22C55E', '#F59E0B', '#3B82F6', '#8B5CF6'];
  var cx = 280, cy = 108;

  var defs =
    '<defs>' +
      '<radialGradient id="orchG" cx="40%" cy="35%" r="65%">' +
        '<stop offset="0%" stop-color="#FF9A4C"/>' +
        '<stop offset="100%" stop-color="#E63946"/>' +
      '</radialGradient>' +
    '</defs>';

  var lines = agents.slice(0, 5).map(function(ag, i) {
    var p = pos[i];
    var isActive = ag.status === 'active';
    return '<line x1="' + p.x + '" y1="' + p.y + '" x2="' + cx + '" y2="' + cy + '" ' +
      'stroke="' + colors[i] + '" stroke-width="1.5" ' +
      (isActive
        ? 'stroke-dasharray="6 4" class="orch-line"'
        : 'stroke-dasharray="3 5" opacity="0.18"') +
      '/>';
  }).join('');

  var nodes = agents.slice(0, 5).map(function(ag, i) {
    var p = pos[i];
    var col = colors[i];
    var isActive = ag.status === 'active';
    var w = ag.name.split(' ');
    var initials = (w[0][0] + (w[1] ? w[1][0] : '')).toUpperCase();
    var labelY = p.y < cy ? Math.max(8, p.y - 28) : p.y + 30;
    return '<circle cx="' + p.x + '" cy="' + p.y + '" r="20" fill="#111827" stroke="' + col + '" stroke-width="' + (isActive ? '2.5' : '1.5') + '"/>' +
      '<text x="' + p.x + '" y="' + (p.y + 4) + '" text-anchor="middle" dominant-baseline="middle" font-size="9" font-weight="700" fill="' + col + '">' + initials + '</text>' +
      (isActive
        ? '<circle cx="' + (p.x + 13) + '" cy="' + (p.y - 13) + '" r="5" fill="' + col + '" class="orch-pulse"/>'
        : '<circle cx="' + (p.x + 13) + '" cy="' + (p.y - 13) + '" r="4" fill="#374151"/>') +
      '<text x="' + p.x + '" y="' + labelY + '" text-anchor="middle" font-size="8" fill="' + (isActive ? col : '#6B7280') + '">' + w[0] + '</text>';
  }).join('');

  var center =
    '<circle cx="' + cx + '" cy="' + cy + '" r="34" fill="url(#orchG)"/>' +
    '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" font-size="9" font-weight="800" fill="white">AI</text>' +
    '<text x="' + cx + '" y="' + (cy + 10) + '" text-anchor="middle" font-size="6.5" fill="rgba(255,255,255,0.8)">ORCHESTRATOR</text>';

  var goalName = acct ? acct.name : 'Account';
  var goal =
    '<div class="orch-goal">' +
      '<span class="orch-goal-icon">◎</span>' +
      '<span class="orch-goal-text">Goal · Retain <strong>' + goalName + '</strong> · Resolve billing dispute · Close renewal</span>' +
    '</div>';

  return '<div class="orch-map-wrap">' +
    '<svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg" class="orch-map-svg" style="aspect-ratio:560/200">' +
      defs + lines + center + nodes +
    '</svg>' +
    goal +
  '</div>';
}

// ── NPS Trend Line Chart ───────────────────────────────────
function buildNPSChart(npsData, months) {
  var PL = 42, PT = 16, PR = 14, PB = 26;
  var W = 460, H = 140;
  var CW = W - PL - PR, CH = H - PT - PB;
  var MAX = 80, n = npsData.length;
  var STEP = n > 1 ? CW / (n - 1) : 0;
  function xAt(i) { return Math.round(PL + i * STEP); }
  function yAt(v) { return Math.round(PT + CH - (v / MAX * CH)); }

  var pts = npsData.map(function(v, i) { return xAt(i) + ',' + yAt(v); });
  var polyPts = pts.join(' ') + ' ' + xAt(n-1) + ',' + (PT+CH) + ' ' + PL + ',' + (PT+CH);
  var y50 = yAt(50), y30 = yAt(30);

  var body =
    '<line x1="' + PL + '" y1="' + PT + '" x2="' + PL + '" y2="' + (PT+CH) + '" stroke="#334155" stroke-width="1"/>' +
    '<line x1="' + PL + '" y1="' + (PT+CH) + '" x2="' + (PL+CW) + '" y2="' + (PT+CH) + '" stroke="#334155" stroke-width="1"/>' +
    '<line x1="' + PL + '" y1="' + y50 + '" x2="' + (PL+CW) + '" y2="' + y50 + '" stroke="#22C55E" stroke-width="1" stroke-dasharray="4 3" opacity="0.7"/>' +
    '<text x="' + (PL-4) + '" y="' + (y50+4) + '" text-anchor="end" font-size="9" fill="#22C55E">50</text>' +
    '<line x1="' + PL + '" y1="' + y30 + '" x2="' + (PL+CW) + '" y2="' + y30 + '" stroke="#EF4444" stroke-width="1" stroke-dasharray="4 3" opacity="0.7"/>' +
    '<text x="' + (PL-4) + '" y="' + (y30+4) + '" text-anchor="end" font-size="9" fill="#EF4444">30</text>' +
    '<rect x="' + PL + '" y="' + y30 + '" width="' + CW + '" height="' + (PT+CH-y30) + '" fill="#EF4444" fill-opacity="0.05"/>' +
    '<polygon points="' + polyPts + '" fill="#EF4444" fill-opacity="0.08"/>' +
    '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    npsData.map(function(v, i) {
      var x = xAt(i), y = yAt(v);
      return '<circle cx="' + x + '" cy="' + y + '" r="4" fill="#EF4444" stroke="white" stroke-width="2"/>' +
        '<text x="' + x + '" y="' + (y-10) + '" text-anchor="middle" font-size="9" fill="#EF4444" font-weight="600">' + v + '</text>';
    }).join('') +
    months.map(function(m, i) {
      return '<text x="' + xAt(i) + '" y="' + (H-2) + '" text-anchor="middle" font-size="9" fill="#64748B">' + m + '</text>';
    }).join('');

  var isDown = npsData[n-1] < npsData[0];
  return '<div class="c360-chart-wrap">' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" class="c360-chart-svg" style="aspect-ratio:' + W + '/' + H + '">' + body + '</svg>' +
    '<div class="c360-chart-footer">' +
      '<span class="c360-chart-meta" style="color:' + (isDown ? '#EF4444' : '#22C55E') + '">' + (isDown ? '↓ Declining' : '↑ Improving') + ' over 6 months</span>' +
      '<span class="c360-chart-meta">Current: <strong>' + npsData[n-1] + '</strong></span>' +
    '</div>' +
  '</div>';
}

// ── Usage Area Chart ───────────────────────────────────────
function buildUsageChart(usageData, months, label) {
  var PL = 42, PT = 16, PR = 14, PB = 26;
  var W = 460, H = 140;
  var CW = W - PL - PR, CH = H - PT - PB;
  var MAX = Math.max.apply(null, usageData) * 1.18;
  var n = usageData.length;
  var STEP = n > 1 ? CW / (n - 1) : 0;
  function xAt(i) { return Math.round(PL + i * STEP); }
  function yAt(v) { return Math.round(PT + CH - (v / MAX * CH)); }

  var pts = usageData.map(function(v, i) { return xAt(i) + ',' + yAt(v); });
  var polyPts = pts.join(' ') + ' ' + xAt(n-1) + ',' + (PT+CH) + ' ' + PL + ',' + (PT+CH);

  var body =
    '<line x1="' + PL + '" y1="' + PT + '" x2="' + PL + '" y2="' + (PT+CH) + '" stroke="#334155" stroke-width="1"/>' +
    '<line x1="' + PL + '" y1="' + (PT+CH) + '" x2="' + (PL+CW) + '" y2="' + (PT+CH) + '" stroke="#334155" stroke-width="1"/>' +
    '<polygon points="' + polyPts + '" fill="#3B82F6" fill-opacity="0.12"/>' +
    '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    usageData.map(function(v, i) {
      var x = xAt(i), y = yAt(v);
      return '<circle cx="' + x + '" cy="' + y + '" r="4" fill="#3B82F6" stroke="white" stroke-width="2"/>' +
        '<text x="' + x + '" y="' + (y-10) + '" text-anchor="middle" font-size="9" fill="#3B82F6" font-weight="600">' + v + '</text>';
    }).join('') +
    months.map(function(m, i) {
      return '<text x="' + xAt(i) + '" y="' + (H-2) + '" text-anchor="middle" font-size="9" fill="#64748B">' + m + '</text>';
    }).join('');

  var isDown = usageData[n-1] < usageData[0];
  return '<div class="c360-chart-wrap">' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" class="c360-chart-svg" style="aspect-ratio:' + W + '/' + H + '">' + body + '</svg>' +
    '<div class="c360-chart-footer">' +
      '<span class="c360-chart-meta" style="color:' + (isDown ? '#F59E0B' : '#22C55E') + '">' + label + ' ' + (isDown ? '↓ Declining' : '↑ Growing') + '</span>' +
      '<span class="c360-chart-meta">Latest: <strong>' + usageData[n-1] + '</strong></span>' +
    '</div>' +
  '</div>';
}

// ── Billing Bar Chart ──────────────────────────────────────
function buildBillingChart(amounts, months, symbol, unit) {
  var PL = 46, PT = 24, PR = 16, PB = 28;
  var W = 460, H = 120;
  var CW = W - PL - PR, CH = H - PT - PB;
  var MAX = Math.max.apply(null, amounts) * 1.2;
  var n = amounts.length;
  var SLOT = Math.floor(CW / n);
  var BAR_W = Math.floor(SLOT * 0.55);
  var BAR_PAD = Math.floor((SLOT - BAR_W) / 2);

  var bars = amounts.map(function(v, i) {
    var isNewest = i === n - 1;
    var x = PL + i * SLOT + BAR_PAD;
    var bh = Math.max(2, Math.round(v / MAX * CH));
    var by = PT + CH - bh;
    var col = isNewest ? '#F97316' : '#3B82F6';
    var op = isNewest ? '0.9' : '0.55';
    var lbl = symbol + v + unit;
    return '<rect x="' + x + '" y="' + by + '" width="' + BAR_W + '" height="' + bh + '" rx="4" fill="' + col + '" fill-opacity="' + op + '"/>' +
      '<text x="' + (x + BAR_W/2) + '" y="' + (by-6) + '" text-anchor="middle" font-size="9" fill="' + col + '" font-weight="600">' + lbl + '</text>' +
      '<text x="' + (x + BAR_W/2) + '" y="' + (H-2) + '" text-anchor="middle" font-size="9" fill="#64748B">' + months[i] + '</text>';
  }).join('');

  return '<div class="c360-chart-wrap">' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" class="c360-chart-svg" style="aspect-ratio:' + W + '/' + H + '">' +
      '<line x1="' + PL + '" y1="' + PT + '" x2="' + PL + '" y2="' + (PT+CH) + '" stroke="#334155" stroke-width="1"/>' +
      '<line x1="' + PL + '" y1="' + (PT+CH) + '" x2="' + (PL+CW) + '" y2="' + (PT+CH) + '" stroke="#334155" stroke-width="1"/>' +
      bars +
    '</svg>' +
  '</div>';
}

/* ----------------------------------------------------------
   8. TICKET MANAGEMENT
   ---------------------------------------------------------- */
var _ticketPriorityFilter = 'all';
var _expandedTickets = {};

function renderTickets() {
  var el = document.getElementById('view-tickets');
  if (!el) return;

  var tickets = getPersonaData(TICKETS_SAAS, TICKETS_TELECOM);

  el.innerHTML =
    '<div class="tickets-header">' +
      '<span class="tickets-title">Ticket Queue</span>' +
      '<div class="ticket-filters" id="ticket-filters">' +
        '<button class="tfil on" data-filter="all" onclick="filterPriority(this, \'all\')">All</button>' +
        '<button class="tfil" data-filter="critical" onclick="filterPriority(this, \'critical\')">Critical</button>' +
        '<button class="tfil" data-filter="high" onclick="filterPriority(this, \'high\')">High</button>' +
        '<button class="tfil" data-filter="medium" onclick="filterPriority(this, \'medium\')">Medium</button>' +
      '</div>' +
    '</div>' +
    '<div class="ticket-list" id="ticket-list"></div>';

  renderTicketList();
}

function renderTicketList() {
  var container = document.getElementById('ticket-list');
  if (!container) return;

  var tickets = getPersonaData(TICKETS_SAAS, TICKETS_TELECOM);
  var filtered = _ticketPriorityFilter === 'all' ? tickets : tickets.filter(function(t) { return t.priority === _ticketPriorityFilter; });

  container.innerHTML = filtered.map(function(t) {
    var priCls = 'pri-' + t.priority;
    var hasChildren = t.children && t.children.length > 0;
    var isExpanded = _expandedTickets[t.id];

    return '<div class="ticket-row ' + priCls + ' ' + (t.ageUrgent ? 'age-urgent' : '') + '">' +
      '<div class="ticket-main" onclick="' + (hasChildren ? 'toggleRow(\'' + t.id + '\', false)' : '') + '">' +
        (hasChildren ? '<span class="ticket-expand-icon">' + (isExpanded ? '▾' : '▸') + '</span>' : '<span class="ticket-expand-icon">·</span>') +
        '<span class="ticket-id">' + t.id + '</span>' +
        '<div class="ticket-info">' +
          '<div class="ticket-title">' + t.title + '</div>' +
          '<div class="ticket-sub">' + t.sub + '</div>' +
        '</div>' +
        '<span class="ticket-type tt-' + t.type + '">' + t.type + '</span>' +
        '<span class="ticket-pri ' + priCls + '">' + t.priority + '</span>' +
        '<span class="ticket-status ts-' + t.status + '">' + t.status + '</span>' +
        '<span class="ticket-ai ai-' + t.aiLabel + '">AI ' + t.aiConf + '%</span>' +
        '<span class="ticket-age ' + (t.ageUrgent ? 'age-urgent' : '') + '">' + t.age + '</span>' +
      '</div>' +
      (hasChildren && isExpanded ?
        t.children.map(function(ch) {
          return '<div class="ticket-child">' +
            '<span class="ticket-expand-icon">·</span>' +
            '<span class="ticket-id">' + ch.id + '</span>' +
            '<div class="ticket-info">' +
              '<div class="ticket-title">' + ch.title + '</div>' +
              '<div class="ticket-sub">' + ch.sub + '</div>' +
            '</div>' +
            '<span class="ticket-type tt-' + ch.type + '">' + ch.type + '</span>' +
            '<span class="ticket-pri pri-' + ch.priority + '">' + ch.priority + '</span>' +
            '<span class="ticket-status ts-' + ch.status + '">' + ch.status + '</span>' +
            '<span class="ticket-ai ai-' + ch.aiLabel + '">AI ' + ch.aiConf + '%</span>' +
            '<span class="ticket-age">' + ch.age + '</span>' +
          '</div>';
        }).join('')
      : '') +
    '</div>';
  }).join('');
}

function toggleRow(id, isChild) {
  _expandedTickets[id] = !_expandedTickets[id];
  renderTicketList();
}

function filterPriority(btn, filter) {
  _ticketPriorityFilter = filter;
  $$('.tfil').forEach(function(b) { b.classList.remove('on'); });
  btn.classList.add('on');
  renderTicketList();
}

/* ----------------------------------------------------------
   9. INBOX RENDERING
   ---------------------------------------------------------- */
function renderInbox() {
  var el = document.getElementById('view-inbox');
  if (!el) return;

  var approvals = getPersonaData(APPROVALS_SAAS, APPROVALS_TELECOM);

  el.innerHTML =
    '<div class="inbox-header">' +
      '<span class="inbox-title">Agent Inbox</span>' +
      '<span class="inbox-count">' + approvals.length + ' pending actions</span>' +
    '</div>' +
    '<div class="inbox-list">' +
      approvals.map(function(ap) {
        return '<div class="inbox-card" id="inbox-' + ap.id + '">' +
          '<div class="ap-header">' +
            '<div class="ap-av">' + ap.agentAv + '</div>' +
            '<div class="ap-info">' +
              '<div class="ap-agent">' + ap.agent + '</div>' +
              '<div class="ap-title">' + ap.title + '</div>' +
            '</div>' +
            '<div class="ap-conf">' + ap.confidence + '%</div>' +
          '</div>' +
          '<div class="ap-reasoning">' + ap.reasoning + '</div>' +
          '<div class="ap-actions" id="inbox-actions-' + ap.id + '">' +
            ap.actions.map(function(a) {
              var cls = a === 'Approve' ? 'btn-accent' : a === 'Decline' ? 'btn-danger' : 'btn-ghost';
              return '<button class="btn btn-sm ' + cls + '" onclick="handleInboxApproval(\'' + ap.id + '\',\'' + a.toLowerCase() + '\')">' + a + '</button>';
            }).join('') +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
}

function handleInboxApproval(cardId, action) {
  var actionsEl = document.getElementById('inbox-actions-' + cardId);
  var card = document.getElementById('inbox-' + cardId);
  if (!actionsEl || !card) return;

  if (action === 'approve') {
    actionsEl.innerHTML = '<span class="ap-result ap-approved">Approved</span>';
    showToast('Action approved: ' + cardId, 'Inbox');
  } else if (action === 'decline') {
    actionsEl.innerHTML = '<span class="ap-result ap-declined">Declined</span>';
  } else {
    actionsEl.innerHTML = '<span class="ap-result ap-modified">Modification requested</span>';
  }

  setTimeout(function() {
    card.style.opacity = '0.4';
    card.style.pointerEvents = 'none';
  }, 1200);
}

/* ----------------------------------------------------------
   10. AGENT SIMULATION
   ---------------------------------------------------------- */
var AgentSim = {
  agents: [],
  interval: null,
  toastInterval: null,
  toastIndex: 0,
  agentCycleIndex: 0,

  start: function() {
    this.agents = getPersonaData(AGENTS_SAAS, AGENTS_TELECOM).map(function(a) {
      return { id: a.id, name: a.name, status: a.status };
    });

    var self = this;

    // Cycle agent statuses every 8-15 seconds
    this.interval = setInterval(function() {
      self.cycleAgent();
    }, 8000 + Math.random() * 7000);

    // Show toast every 20-30 seconds
    this.toastInterval = setInterval(function() {
      self.fireToast();
    }, 20000 + Math.random() * 10000);

    // Initial toast after 6 seconds
    setTimeout(function() { self.fireToast(); }, 6000);
  },

  stop: function() {
    if (this.interval) clearInterval(this.interval);
    if (this.toastInterval) clearInterval(this.toastInterval);
  },

  cycleAgent: function() {
    if (this.agents.length === 0) return;
    var idx = this.agentCycleIndex % this.agents.length;
    var agent = this.agents[idx];

    // Cycle: active -> thinking -> idle -> active
    if (agent.status === 'active') agent.status = 'thinking';
    else if (agent.status === 'thinking') agent.status = 'idle';
    else agent.status = 'active';

    // Update sidebar dots
    var dots = $$('.sidebar-agent-dot');
    if (dots[idx]) {
      dots[idx].className = 'sidebar-agent-dot ' + agent.status;
    }
    var labels = $$('.sidebar-agent-status-label');
    if (labels[idx]) {
      labels[idx].textContent = agent.status;
    }

    Bus.emit('agent-status', { agent: agent });
    this.agentCycleIndex++;
  },

  fireToast: function() {
    var toasts = getPersonaData(TOASTS_SAAS, TOASTS_TELECOM);
    if (toasts.length === 0) return;
    var t = toasts[this.toastIndex % toasts.length];
    showToast(t.msg, t.agent);
    this.toastIndex++;
  }
};

function showToast(message, agentName) {
  var container = document.getElementById('toast-container');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML =
    '<div class="toast-agent">' + (agentName || 'Agent') + '</div>' +
    '<div class="toast-msg">' + message + '</div>';

  container.appendChild(toast);

  // Auto-dismiss after 4s
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(function() { toast.remove(); }, 400);
  }, 4000);
}

/* ----------------------------------------------------------
   11. PERSONA TOGGLE
   ---------------------------------------------------------- */
function initPersonaToggle() {
  $$('.persona-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var newPersona = btn.dataset.persona;
      if (newPersona === currentPersona) return;
      currentPersona = newPersona;
      $$('.persona-btn').forEach(function(b) { b.classList.remove('on'); });
      btn.classList.add('on');

      // Restart agent sim with new persona data
      AgentSim.stop();
      AgentSim.start();

      // Re-render sidebar agents
      renderSidebarAgents();

      Bus.emit('persona-changed', currentPersona);
      renderAll();
    });
  });
}

function renderSidebarAgents() {
  var container = document.getElementById('sidebar-agents');
  if (!container) return;
  var agents = getPersonaData(AGENTS_SAAS, AGENTS_TELECOM);
  container.innerHTML = agents.map(function(ag) {
    return '<div class="sidebar-agent-row">' +
      '<div class="sidebar-agent-dot ' + ag.status + '"></div>' +
      '<span class="sidebar-agent-name">' + ag.name + '</span>' +
      '<span class="sidebar-agent-status-label">' + ag.status + '</span>' +
    '</div>';
  }).join('');
}

/* ----------------------------------------------------------
   12. RENDER ALL
   ---------------------------------------------------------- */
function renderAll() {
  renderDashboard();
  renderPipeline();
  renderAccount();
  renderTickets();
  renderInbox();
}

/* ----------------------------------------------------------
   13. INITIALIZATION
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
  initRouter();
  initPersonaToggle();
  renderSidebarAgents();
  navigateTo('dashboard');
  AgentSim.start();
});
