import type { DocumentRequirement } from '../types/domain'

const D3 = { kind: 'real', ref: 'docs/04-up-reference.md Part D3' } as const
const LIVESTOCK = { kind: 'real', ref: 'docs/04-up-reference.md Part D3 (livestock)' } as const
const SEEDED = { kind: 'seeded', ref: 'Scheme-specific document not itemised in docs' } as const

export const documentRequirements: DocumentRequirement[] = [
  { id: 'aadhaar', appliesTo: 'all', digiLocker: true, provenance: D3,
    name: { en: 'Aadhaar card (self-attested)', hi: 'आधार कार्ड (स्व-सत्यापित)' },
    hint: { en: 'Mobile number must be linked to Aadhaar and active.', hi: 'मोबाइल नंबर आधार से जुड़ा और सक्रिय होना चाहिए।' } },
  { id: 'caste_certificate', appliesTo: 'all', digiLocker: true, provenance: D3,
    name: { en: 'Caste certificate', hi: 'जाति प्रमाण पत्र' },
    hint: { en: 'Issued by a competent authority and verified online.', hi: 'सक्षम अधिकारी द्वारा जारी और ऑनलाइन सत्यापित।' } },
  { id: 'income_certificate', appliesTo: 'all', digiLocker: true, provenance: D3,
    name: { en: 'Income certificate', hi: 'आय प्रमाण पत्र' },
    hint: { en: 'Verified online.', hi: 'ऑनलाइन सत्यापित।' } },
  { id: 'residence_certificate', appliesTo: 'all', digiLocker: true, provenance: D3,
    name: { en: 'Residence certificate', hi: 'निवास प्रमाण पत्र' },
    hint: { en: 'Must be of the district you apply in.', hi: 'जिस जिले में आवेदन कर रहे हैं वहीं का होना चाहिए।' } },
  { id: 'bank_passbook', appliesTo: 'all', digiLocker: false, provenance: D3,
    name: { en: 'Bank passbook copy or cancelled cheque', hi: 'बैंक पासबुक की प्रति या रद्द चेक' },
    hint: { en: 'Account is checked by penny-drop during pre-scrutiny.', hi: 'पूर्व-जांच में पेनी-ड्रॉप से खाते की पुष्टि होती है।' } },
  { id: 'photo', appliesTo: 'all', digiLocker: false, provenance: { kind: 'real', ref: 'docs/04-up-reference.md Part D1 field 14' },
    name: { en: 'Passport-size colour photo (self-attested)', hi: 'पासपोर्ट आकार की रंगीन फोटो (स्व-सत्यापित)' },
    hint: { en: 'Recent photo.', hi: 'हाल की फोटो।' } },
  { id: 'selection_letter', appliesTo: 'pmajay', digiLocker: false, provenance: D3,
    name: { en: 'Copy of the selection letter', hi: 'चयन पत्र की प्रति' },
    hint: { en: 'Issued after pre-scrutiny approval.', hi: 'पूर्व-जांच स्वीकृति के बाद जारी।' } },
  { id: 'affidavit_3yr', appliesTo: 'pmajay', digiLocker: false, provenance: D3,
    name: { en: 'Notarised affidavit to keep the asset for 3 years', hi: 'संपत्ति 3 वर्ष तक रखने का नोटरीकृत शपथ पत्र' },
    hint: { en: 'Selling early triggers recovery of the grant.', hi: 'समय से पहले बेचने पर अनुदान की वसूली होगी।' } },
  { id: 'livestock_bundle', appliesTo: 'livestock', digiLocker: false, provenance: LIVESTOCK,
    name: { en: 'Livestock records', hi: 'पशुधन अभिलेख' },
    hint: {
      en: 'Purchase receipt, transit insurance, transport receipt, 3-year livestock insurance, chaff-cutter and shed records, ear-tag certificate, vet health certificate naming the breed.',
      hi: 'क्रय रसीद, परिवहन बीमा, परिवहन रसीद, 3-वर्षीय पशुधन बीमा, चारा-कटर व शेड अभिलेख, ईयर-टैग प्रमाण पत्र, नस्ल सहित पशु-चिकित्सा प्रमाण पत्र।',
    } },
  { id: 'project_quotation', appliesTo: 'nsfdc', digiLocker: false, provenance: SEEDED,
    name: { en: 'Quotation for machinery / stock', hi: 'मशीनरी / सामान का कोटेशन' },
    hint: { en: 'From a registered vendor.', hi: 'पंजीकृत विक्रेता से।' } },
  { id: 'project_report', appliesTo: 'nsfdc', digiLocker: false, provenance: SEEDED,
    name: { en: 'Project report', hi: 'परियोजना रिपोर्ट' },
    hint: { en: 'Yojna Sarthi can draft this for you.', hi: 'योजना सारथी इसे आपके लिए तैयार कर सकता है।' } },
  { id: 'edp_certificate', appliesTo: 'nsfdc', digiLocker: false, provenance: { kind: 'real', ref: 'docs/01-the-system.md PMEGP (missing EDP certificate delays subsidy)' },
    name: { en: 'EDP training certificate', hi: 'EDP प्रशिक्षण प्रमाण पत्र' },
    hint: { en: 'A missing EDP certificate is a common reason subsidy gets stuck.', hi: 'EDP प्रमाण पत्र न होने से सब्सिडी अक्सर अटक जाती है।' } },
  { id: 'admission_proof', appliesTo: 'education', digiLocker: false, provenance: SEEDED,
    name: { en: 'Admission letter', hi: 'प्रवेश पत्र' },
    hint: { en: 'From the institution.', hi: 'संस्थान द्वारा जारी।' } },
  { id: 'fee_structure', appliesTo: 'education', digiLocker: false, provenance: SEEDED,
    name: { en: 'Fee structure', hi: 'शुल्क विवरण' },
    hint: { en: 'Official fee schedule for the full course.', hi: 'पूरे पाठ्यक्रम का आधिकारिक शुल्क विवरण।' } },
]

export const COMMON_DOCUMENT_IDS = documentRequirements.filter((d) => d.appliesTo === 'all').map((d) => d.id)
