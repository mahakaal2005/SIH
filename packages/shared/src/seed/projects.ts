import type { Activity, ApprovalFunnel, PmAjayProject, ProjectApprovalStat } from '../types/domain'

const SOP = 'docs/04-up-reference.md Part C (UPSCFDC SOP Annexure-1)'
const GIA = 'docs/02-the-problem.md §2.1b (UP GIA public dashboard)'

type Row = Omit<PmAjayProject, 'provenance'>

const rows: Row[] = [
  {
    id: 'boutique', number: 1, structure: 'cluster', costPerPerson: 120000, womenOnly: true, trainingHours: 380,
    name: { en: 'Boutique (cluster)', hi: 'बुटीक व्यवसाय आधारित क्लस्टर' },
    skillCourses: [{ name: "Women's Tailor", code: 'NARQ40033' }, { name: 'General EDP', code: 'RSETI/403' }],
    conditions: [],
  },
  {
    id: 'beauty_parlour', number: 2, structure: 'cluster', costPerPerson: 150000, womenOnly: true, trainingHours: 460,
    name: { en: 'Beauty parlour (cluster)', hi: 'ब्यूटी पार्लर व्यवसाय आधारित क्लस्टर' },
    skillCourses: [
      { name: 'Beauty Therapist', code: 'BWS/Q0102' }, { name: 'Beauty Parlor Management', code: 'NARQ40007' },
      { name: 'General EDP', code: 'RSETI/403' }, { name: 'Advanced Beauty Parlour', code: 'RSETI/607' },
    ],
    conditions: [],
  },
  {
    id: 'solar_technician', number: 3, structure: 'service_cluster', costPerPerson: 100000, womenOnly: false, trainingHours: 300,
    name: { en: 'Solar panel installation technician (service cluster)', hi: 'सोलर पैनल इंस्टॉलेशन तकनीशियन (सेवा क्लस्टर)' },
    skillCourses: [{ name: 'Solar PV Installer (Suryamitra)', code: 'SGJ/Q0101' }],
    conditions: [{ en: 'UPNEDA registration required', hi: 'UPNEDA पंजीकरण अनिवार्य' }],
  },
  {
    id: 'logistics_driver', number: 4, structure: 'hybrid_group', costPerPerson: 630000, womenOnly: false, trainingHours: 200,
    name: { en: 'Logistics vehicle driver (hybrid group)', hi: 'लॉजिस्टिक्स वाहन चालक (हाइब्रिड समूह)' },
    skillCourses: [{ name: 'LMV Driving', code: 'RSETI/207' }, { name: 'General EDP', code: 'RSETI/403' }],
    conditions: [
      { en: '₹6,30,000 is the total unit cost for the group vehicle', hi: '₹6,30,000 समूह वाहन की कुल इकाई लागत है' },
      { en: 'Commercial licence, BS-6, N1 category vehicle (≤3.5 t)', hi: 'व्यावसायिक लाइसेंस, BS-6, N1 श्रेणी वाहन (≤3.5 टन)' },
    ],
  },
  {
    id: 'kirana', number: 5, structure: 'hybrid_group', costPerPerson: 200000, womenOnly: false, trainingHours: 300,
    name: { en: 'Kiosk / kirana / general store (hybrid group)', hi: 'किओस्क / किराना / जनरल स्टोर (हाइब्रिड समूह)' },
    skillCourses: [
      { name: 'Store Keeper', code: 'HYC/Q3501' }, { name: 'Individual Sales Professional', code: 'RAS/Q0201' },
      { name: 'Retail Sales Specialist cum Cashier', code: 'RAS/Q0109' },
    ],
    conditions: [{ en: 'No hazardous or tobacco items', hi: 'कोई खतरनाक या तंबाकू उत्पाद नहीं' }],
  },
  {
    id: 'photography', number: 6, structure: 'service_cluster', costPerPerson: 240000, womenOnly: false, trainingHours: 380,
    name: { en: 'Photography & videography (service cluster)', hi: 'फोटोग्राफी एवं वीडियोग्राफी (सेवा क्लस्टर)' },
    skillCourses: [
      { name: 'Entrepreneurial Skills', code: 'MEP/Q5103' }, { name: 'Basic Photography', code: 'RSETI/216' },
      { name: 'Advanced Digital Photography', code: 'RSETI/601' }, { name: 'Photo Editing', code: 'RSETI/612' },
    ],
    conditions: [{ en: 'Drones must be DGCA compliant', hi: 'ड्रोन DGCA मानकों के अनुरूप होने चाहिए' }],
  },
  {
    id: 'e_rickshaw', number: 7, structure: 'service_cluster', costPerPerson: 200000, womenOnly: false, trainingHours: 120,
    name: { en: 'Auto-rickshaw / e-rickshaw driver (service cluster)', hi: 'ऑटो-रिक्शा / ई-रिक्शा चालक (सेवा क्लस्टर)' },
    skillCourses: [{ name: 'LMV Driving', code: 'RSETI/207' }],
    conditions: [{ en: 'Commercial licence, L5M 3-wheeler passenger carrier', hi: 'व्यावसायिक लाइसेंस, L5M तिपहिया यात्री वाहन' }],
  },
  {
    id: 'poultry', number: 8, structure: 'group', costPerPerson: 130000, womenOnly: true, trainingHours: 200,
    name: { en: 'Poultry (group)', hi: 'मुर्गी पालन (समूह)' },
    skillCourses: [{ name: 'Poultry', code: 'NARQ30027' }],
    conditions: [
      { en: '500 birds; NRLM SHG women’s groups get priority', hi: '500 पक्षी; NRLM महिला स्वयं सहायता समूहों को प्राथमिकता' },
      { en: 'Livestock insurance mandatory; quarterly vet check for 1 year', hi: 'पशुधन बीमा अनिवार्य; 1 वर्ष तक त्रैमासिक पशु-चिकित्सा जांच' },
    ],
  },
  {
    id: 'dairy', number: 9, structure: 'group', costPerPerson: 140000, womenOnly: false, trainingHours: 200,
    name: { en: 'Dairy + vermicompost (group)', hi: 'डेयरी एवं वर्मी कम्पोस्ट (समूह)' },
    skillCourses: [{ name: 'Dairy Farming & Vermi Compost', code: 'NARQ30006' }],
    conditions: [
      { en: 'Cost is approximate (₹1,40,000+); ₹1L per cow (Sahiwal/Gir/Tharparkar), ₹70k Gangatiri', hi: 'लागत लगभग (₹1,40,000+); ₹1 लाख प्रति गाय (साहीवाल/गिर/थारपारकर), ₹70 हज़ार गंगातीरी' },
      { en: 'Cows must be bought outside UP; 3-year and transit insurance mandatory', hi: 'गायें उत्तर प्रदेश के बाहर से खरीदनी होंगी; 3-वर्षीय एवं परिवहन बीमा अनिवार्य' },
    ],
  },
  {
    id: 'goat', number: 10, structure: 'group', costPerPerson: 155000, womenOnly: true, trainingHours: 200,
    name: { en: 'Goat rearing (group)', hi: 'बकरी पालन (समूह)' },
    skillCourses: [{ name: 'Goat Rearing', code: 'NARQ30029' }],
    conditions: [{ en: '10 goats; Amul/Gyan/Parag-linked groups get priority', hi: '10 बकरियां; अमूल/ज्ञान/पराग से जुड़े समूहों को प्राथमिकता' }],
  },
  {
    id: 'construction', number: 11, structure: 'cluster', costPerPerson: null, womenOnly: false, trainingHours: 300,
    name: { en: 'Multi-skilled construction resource (cluster)', hi: 'बहु-कौशल निर्माण संसाधन (क्लस्टर)' },
    skillCourses: [], conditions: [],
  },
  {
    id: 'home_industry', number: 12, structure: 'group', costPerPerson: null, womenOnly: true, trainingHours: 300,
    name: { en: "Women's home industry / self-employment (group)", hi: 'महिला गृह उद्योग / स्वरोजगार (समूह)' },
    skillCourses: [], conditions: [],
  },
  {
    id: 'mechanic', number: 13, structure: 'group', costPerPerson: null, womenOnly: false, trainingHours: 300,
    name: { en: '2-wheeler / 3-wheeler mechanic service (group)', hi: 'दोपहिया / तिपहिया मैकेनिक सेवा (समूह)' },
    skillCourses: [], conditions: [],
  },
  {
    id: 'it_support', number: 14, structure: 'cluster', costPerPerson: null, womenOnly: false, trainingHours: 300,
    name: { en: 'IT support / hardware (cluster)', hi: 'आईटी सपोर्ट / हार्डवेयर (क्लस्टर)' },
    skillCourses: [], conditions: [],
  },
  {
    id: 'carpentry', number: 15, structure: 'cluster', costPerPerson: null, womenOnly: false, trainingHours: 300,
    name: { en: 'Modular furniture / carpentry (cluster)', hi: 'मॉड्यूलर फर्नीचर / बढ़ईगीरी (क्लस्टर)' },
    skillCourses: [], conditions: [],
  },
  {
    id: 'jan_suvidha', number: 16, structure: 'cluster', costPerPerson: null, womenOnly: false, trainingHours: 300,
    name: { en: 'Jan Suvidha Kendra (cluster)', hi: 'जन सुविधा केंद्र (क्लस्टर)' },
    skillCourses: [], conditions: [],
  },
]

export const pmajayProjects: PmAjayProject[] = rows.map((r) => ({ ...r, provenance: { kind: 'real', ref: SOP } }))

/** Training hours are seeded (not in the transcribed SOP); cost uses Category-III ₹35.10/hr. */
export const TRAINING_RATE_PER_HOUR = 35.1

const stat = (projectId: string, approved: number, applied: number): ProjectApprovalStat => ({
  projectId,
  approved,
  applied,
  provenance: { kind: 'real', ref: GIA },
})

export const approvalStats: ProjectApprovalStat[] = [
  stat('home_industry', 2538, 5726),
  stat('kirana', 4470, 11356),
  stat('beauty_parlour', 4030, 10351),
  stat('boutique', 3097, 8004),
  stat('carpentry', 1356, 3578),
  stat('e_rickshaw', 1837, 4891),
  stat('photography', 790, 2425),
  stat('jan_suvidha', 1909, 6312),
  stat('mechanic', 1354, 4542),
  stat('dairy', 949, 3457),
  stat('solar_technician', 406, 1613),
  stat('construction', 331, 1412),
  stat('it_support', 1327, 5991),
  stat('goat', 316, 2145),
  stat('logistics_driver', 273, 1864),
  stat('poultry', 17, 221),
]

export const approvalFunnel: ApprovalFunnel = {
  applied: 73888,
  approved: 25000,
  rejected: 2443,
  noDecision: 46445,
  mostApplicationsDistrict: { districtId: 'rampur', count: 2297 },
  mostApprovalsDistrict: { districtId: 'bahraich', count: 1246 },
  provenance: { kind: 'real', ref: GIA },
}

const projectIcon: Record<string, string> = {
  boutique: 'scissors', beauty_parlour: 'sparkles', solar_technician: 'sun', logistics_driver: 'truck', kirana: 'store',
  photography: 'camera', e_rickshaw: 'car', poultry: 'egg', dairy: 'milk', goat: 'paw-print', construction: 'hard-hat',
  home_industry: 'home', mechanic: 'wrench', it_support: 'laptop', carpentry: 'hammer', jan_suvidha: 'landmark',
}

const projectCategory: Record<string, Activity['category']> = {
  boutique: 'service', beauty_parlour: 'service', solar_technician: 'service', logistics_driver: 'service', kirana: 'trade',
  photography: 'service', e_rickshaw: 'service', poultry: 'livestock', dairy: 'livestock', goat: 'livestock',
  construction: 'service', home_industry: 'manufacturing', mechanic: 'service', it_support: 'service',
  carpentry: 'manufacturing', jan_suvidha: 'service',
}

export const activities: Activity[] = [
  ...pmajayProjects.map((p) => ({
    id: p.id,
    name: { en: p.name.en.replace(/\s*\(.*\)$/, ''), hi: p.name.hi.replace(/\s*\(.*\)$/, '') },
    category: projectCategory[p.id]!,
    pmajayProjectId: p.id,
    icon: projectIcon[p.id]!,
  })),
  { id: 'other_manufacturing', name: { en: 'Other manufacturing unit', hi: 'अन्य विनिर्माण इकाई' }, category: 'manufacturing', icon: 'factory' },
  { id: 'other_service', name: { en: 'Other service business', hi: 'अन्य सेवा व्यवसाय' }, category: 'service', icon: 'briefcase' },
  { id: 'other_trade', name: { en: 'Other shop / trading', hi: 'अन्य दुकान / व्यापार' }, category: 'trade', icon: 'shopping-bag' },
  { id: 'higher_education', name: { en: 'Higher / professional education', hi: 'उच्च / व्यावसायिक शिक्षा' }, category: 'education', icon: 'graduation-cap' },
]
