/**
 * Full India-first seed for sarkari-portal (T3 / Prisma / MongoDB).
 *
 * Idempotent: everything is upserted on unique keys (or find-first +
 * update), and per-job detail rows are rebuilt, so re-running is safe.
 *
 * Usage (needs Atlas connectivity):
 *   npx prisma db push        # create collections first (one-time)
 *   npm run db:seed
 *
 * Default admin (CHANGE AFTER FIRST LOGIN):
 *   username: superadmin / password: Admin@123
 */
import "dotenv/config";
import { randomBytes, scrypt } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(password, salt, 64, (err, derived) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt}:${(derived as Buffer).toString("hex")}`);
    });
  });
}

const B = (id: string, type: string, data: Record<string, unknown>, order: number) => ({
  id,
  type,
  data,
  order,
});

/* ───────────────────────── settings ───────────────────────── */

const SETTINGS: Record<string, string> = {
  ticker:
    "आयुष्मान कार्ड, ई-श्रम कार्ड और PM सूर्य घर — नई सेवाएं जोड़ दी गई हैं • वोटर लिस्ट में नाम जोड़ने की तिथि जांचें • पोर्टल की सभी सेवाएं पूर्णतः निःशुल्क हैं",
  helpline: "1800-11-1551",
  email: "help@addiessarkari.in",
  about:
    "APPZENO Sarkari Portal भारत की सरकारी सेवाओं की एक निःशुल्क निर्देशिका है — आधार, पैन, वोटर ID, योजनाएं, बिल, लाइसेंस और लोन, सब कुछ एक ही जगह।",
  footerNote:
    "यह एक निजी सूचना निर्देशिका है। सभी लिंक संबंधित सरकारी विभागों की आधिकारिक वेबसाइटों की ओर ले जाते हैं। किसी भी सेवा के लिए शुल्क न दें — सरकारी पोर्टल पर आवेदन निःशुल्क होता है।",
  facebook: "",
  twitter: "",
  instagram: "",
  youtube: "",
  linkedin: "",
  telegram: "",
  whatsapp: "",
};

/* ───────────────────────── categories + services ───────────────────────── */

type CatSeed = {
  slug: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  icon: string;
  color: string;
  sortOrder: number;
};

const CATEGORIES: CatSeed[] = [
  { slug: "aadhaar-card", titleHi: "आधार कार्ड", titleEn: "Aadhaar Card", descriptionHi: "आधार डाउनलोड, अपडेट, PVC ऑर्डर और स्टेटस — UIDAI की सभी सेवाएं।", descriptionEn: "Download, update, PVC order and status — all UIDAI services.", icon: "fileText", color: "navy", sortOrder: 1 },
  { slug: "pan-card", titleHi: "पैन कार्ड", titleEn: "PAN Card", descriptionHi: "नया पैन, ई-पैन, आधार लिंक और सुधार — आयकर विभाग की सेवाएं।", descriptionEn: "New PAN, e-PAN, Aadhaar linking and corrections.", icon: "wallet", color: "saffron", sortOrder: 2 },
  { slug: "voter-id", titleHi: "वोटर ID", titleEn: "Voter ID", descriptionHi: "नया पंजीकरण, e-EPIC डाउनलोड और वोटर लिस्ट।", descriptionEn: "Registration, e-EPIC download and electoral roll search.", icon: "users", color: "leaf", sortOrder: 3 },
  { slug: "driving-license", titleHi: "ड्राइविंग लाइसेंस", titleEn: "Driving License", descriptionHi: "DL आवेदन, नवीनीकरण, चालान और RC सेवाएं।", descriptionEn: "Apply, renew, challan payment and RC services via Parivahan.", icon: "external", color: "sky", sortOrder: 4 },
  { slug: "passport", titleHi: "पासपोर्ट", titleEn: "Passport", descriptionHi: "पासपोर्ट आवेदन और ट्रैकिंग।", descriptionEn: "Passport application and tracking.", icon: "globe", color: "purple", sortOrder: 5 },
  { slug: "ration-card", titleHi: "राशन कार्ड", titleEn: "Ration Card", descriptionHi: "राशन सूची, नया आवेदन और NFSA जानकारी।", descriptionEn: "Ration list, new applications and NFSA details.", icon: "inbox", color: "amber", sortOrder: 6 },
  { slug: "epfo-pension", titleHi: "पीएफ व पेंशन", titleEn: "EPFO & Pension", descriptionHi: "PF खाता, क्लेम, e-Shram और PM-Kisan।", descriptionEn: "PF account, claims, e-Shram and PM-Kisan.", icon: "wallet", color: "leaf", sortOrder: 7 },
  { slug: "sarkari-yojana", titleHi: "सरकारी योजनाएं", titleEn: "Govt Schemes", descriptionHi: "आयुष्मान, सूर्य घर और कल्याणकारी योजनाएं।", descriptionEn: "Ayushman, Surya Ghar and welfare schemes.", icon: "star", color: "saffron", sortOrder: 8 },
  { slug: "income-tax", titleHi: "टैक्स व जीएसटी", titleEn: "Tax & GST", descriptionHi: "ITR दाखिल करना और GST पोर्टल।", descriptionEn: "ITR filing and the GST portal.", icon: "chart", color: "purple", sortOrder: 9 },
  { slug: "bijli-bill", titleHi: "बिल व उपयोगिताएं", titleEn: "Bills & Utilities", descriptionHi: "गैस बुकिंग, बिजली बिल और उपयोगिता सेवाएं।", descriptionEn: "LPG booking, electricity bills and utilities.", icon: "zap", color: "amber", sortOrder: 10 },
  { slug: "certificates", titleHi: "प्रमाणपत्र", titleEn: "Certificates", descriptionHi: "जन्म प्रमाणपत्र, डिजिलॉकर और उमंग।", descriptionEn: "Birth certificates, DigiLocker and UMANG.", icon: "shield", color: "navy", sortOrder: 11 },
  { slug: "court-post", titleHi: "कोर्ट व डाक", titleEn: "Court & Post", descriptionHi: "केस स्टेटस और डाक सेवाएं।", descriptionEn: "Case status and postal services.", icon: "mail", color: "sky", sortOrder: 12 },
];

type SvcSeed = {
  cat: string;
  titleHi: string;
  titleEn: string;
  url: string;
  descriptionHi: string;
  descriptionEn: string;
  tags: string;
  clickCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
};

const SERVICES: SvcSeed[] = [
  // Aadhaar
  { cat: "aadhaar-card", titleHi: "आधार कार्ड डाउनलोड करें", titleEn: "Download Aadhaar Card", url: "https://myaadhaar.uidai.gov.in/genricDownloadAadhaar", descriptionHi: "मास्क्ड या रेगुलर आधार PDF डाउनलोड करें।", descriptionEn: "Download masked or regular Aadhaar PDF.", tags: "aadhaar, download, uidai", clickCount: 45210, isFeatured: true },
  { cat: "aadhaar-card", titleHi: "आधार में पता अपडेट करें", titleEn: "Update Address in Aadhaar", url: "https://myaadhaar.uidai.gov.in/", descriptionHi: "ऑनलाइन दस्तावेज़ के साथ पता बदलें।", descriptionEn: "Change address online with documents.", tags: "aadhaar, address update", clickCount: 32180 },
  { cat: "aadhaar-card", titleHi: "आधार स्टेटस जांचें", titleEn: "Check Aadhaar Update Status", url: "https://myaadhaar.uidai.gov.in/checkStatus", descriptionHi: "अपडेट या नामांकन की स्थिति देखें।", descriptionEn: "Track enrolment or update requests.", tags: "aadhaar, status", clickCount: 18930 },
  { cat: "aadhaar-card", titleHi: "PVC आधार कार्ड ऑर्डर करें", titleEn: "Order Aadhaar PVC Card", url: "https://myaadhaar.uidai.gov.in/genricPVC", descriptionHi: "ATM-जैसा टिकाऊ PVC कार्ड मंगवाएं।", descriptionEn: "Order durable PVC Aadhaar card.", tags: "aadhaar, pvc", clickCount: 21450, isNew: true },
  // PAN
  { cat: "pan-card", titleHi: "तुरंत ई-पैन पाएं", titleEn: "Get Instant e-PAN", url: "https://www.incometax.gov.in/iec/foportal/", descriptionHi: "आधार OTP से मुफ्त ई-पैन मिनटों में।", descriptionEn: "Free e-PAN in minutes via Aadhaar OTP.", tags: "pan, epan, income tax", clickCount: 38900, isFeatured: true },
  { cat: "pan-card", titleHi: "नया पैन कार्ड आवेदन (NSDL)", titleEn: "Apply for New PAN (NSDL)", url: "https://www.proteantech.in/", descriptionHi: "फॉर्म 49A के साथ नया पैन आवेदन।", descriptionEn: "New PAN application with Form 49A.", tags: "pan, nsdl, apply", clickCount: 27400 },
  { cat: "pan-card", titleHi: "आधार-पैन लिंक करें", titleEn: "Link Aadhaar with PAN", url: "https://www.incometax.gov.in/iec/foportal/", descriptionHi: "पैन को आधार से लिंक करने की स्थिति।", descriptionEn: "Link status and request.", tags: "pan, aadhaar link", clickCount: 31200 },
  { cat: "pan-card", titleHi: "पैन सत्यापित करें", titleEn: "Verify PAN Details", url: "https://www.incometax.gov.in/iec/foportal/", descriptionHi: "पैन नंबर की वैधता जांचें।", descriptionEn: "Verify PAN validity.", tags: "pan, verify", clickCount: 12300 },
  // Voter
  { cat: "voter-id", titleHi: "नया वोटर पंजीकरण (फॉर्म 6)", titleEn: "New Voter Registration", url: "https://voters.eci.gov.in/", descriptionHi: "18+ नागरिक मतदाता सूची में नाम जुड़वाएं।", descriptionEn: "Enroll in the electoral roll.", tags: "voter, registration, eci", clickCount: 29800, isFeatured: true },
  { cat: "voter-id", titleHi: "e-EPIC डाउनलोड करें", titleEn: "Download e-EPIC Card", url: "https://voters.eci.gov.in/", descriptionHi: "डिजिटल वोटर कार्ड PDF पाएं।", descriptionEn: "Get digital voter ID PDF.", tags: "voter, epic, download", clickCount: 24500 },
  { cat: "voter-id", titleHi: "वोटर लिस्ट में नाम खोजें", titleEn: "Search Name in Voter List", url: "https://electoralsearch.eci.gov.in/", descriptionHi: "नाम या EPIC नंबर से खोजें।", descriptionEn: "Search by name or EPIC number.", tags: "voter, search", clickCount: 20100 },
  // DL / Parivahan
  { cat: "driving-license", titleHi: "ड्राइविंग लाइसेंस आवेदन", titleEn: "Driving Licence Application", url: "https://parivahan.gov.in/parivahan/", descriptionHi: "लर्नर व स्थायी DL के लिए आवेदन।", descriptionEn: "Learner and permanent DL services.", tags: "driving licence, parivahan", clickCount: 26700, isFeatured: true },
  { cat: "driving-license", titleHi: "चालान जांचें व भुगतान करें", titleEn: "Check & Pay Traffic Challan", url: "https://echallan.parivahan.gov.in/", descriptionHi: "ई-चालान देखें और ऑनलाइन भरें।", descriptionEn: "View and pay e-challans.", tags: "challan, traffic", clickCount: 19800, isNew: true },
  { cat: "driving-license", titleHi: "वाहन RC विवरण", titleEn: "Vehicle RC Details", url: "https://vahan.parivahan.gov.in/", descriptionHi: "गाड़ी नंबर से RC जानकारी।", descriptionEn: "RC info by vehicle number.", tags: "rc, vehicle", clickCount: 14600 },
  // Passport
  { cat: "passport", titleHi: "पासपोर्ट आवेदन", titleEn: "Passport Application", url: "https://www.passportindia.gov.in/", descriptionHi: "नया पासपोर्ट / पुनः जारी आवेदन।", descriptionEn: "Fresh and reissue applications.", tags: "passport", clickCount: 18900 },
  { cat: "passport", titleHi: "आवेदन ट्रैक करें", titleEn: "Track Passport Application", url: "https://www.passportindia.gov.in/", descriptionHi: "फाइल नंबर से स्टेटस देखें।", descriptionEn: "Status by file number.", tags: "passport, status", clickCount: 12700 },
  // Ration
  { cat: "ration-card", titleHi: "राशन कार्ड सूची देखें", titleEn: "View Ration Card List", url: "https://nfsa.gov.in/", descriptionHi: "NFSA लाभार्थी सूची में नाम जांचें।", descriptionEn: "Check NFSA beneficiary list.", tags: "ration, nfsa", clickCount: 22300, isFeatured: true },
  { cat: "ration-card", titleHi: "नया राशन कार्ड आवेदन", titleEn: "Apply for New Ration Card", url: "https://nfsa.gov.in/", descriptionHi: "राज्य खाद्य पोर्टल से आवेदन।", descriptionEn: "Apply via state food portal.", tags: "ration, apply", clickCount: 17600 },
  // EPFO & schemes
  { cat: "epfo-pension", titleHi: "EPFO मेंबर पोर्टल", titleEn: "EPFO Member Portal", url: "https://unifiedportal-mem.epfindia.gov.in/", descriptionHi: "PF बैलेंस, पासबुक और KYC।", descriptionEn: "Balance, passbook and KYC.", tags: "pf, epfo", clickCount: 25400, isFeatured: true },
  { cat: "epfo-pension", titleHi: "PF क्लेम स्टेटस", titleEn: "PF Claim Status", url: "https://unifiedportal-mem.epfindia.gov.in/", descriptionHi: "निकासी क्लेम की स्थिति।", descriptionEn: "Withdrawal claim status.", tags: "pf, claim", clickCount: 16800 },
  { cat: "epfo-pension", titleHi: "ई-श्रम कार्ड", titleEn: "e-Shram Card", url: "https://eshram.gov.in/", descriptionHi: "असंगठित श्रमिक पंजीकरण।", descriptionEn: "Unorganised worker registration.", tags: "eshram, labour", clickCount: 23100, isNew: true },
  { cat: "epfo-pension", titleHi: "PM-Kisan स्टेटस", titleEn: "PM-Kisan Status Check", url: "https://pmkisan.gov.in/", descriptionHi: "किस्त व लाभार्थी स्थिति देखें।", descriptionEn: "Instalment and beneficiary status.", tags: "pmkisan, farmer", clickCount: 28900, isFeatured: true },
  { cat: "sarkari-yojana", titleHi: "आयुष्मान कार्ड बनवाएं", titleEn: "Ayushman Card (PM-JAY)", url: "https://beneficiary.nha.gov.in/", descriptionHi: "₹5 लाख मुफ्त इलाज हेतु पात्रता जांचें।", descriptionEn: "Check eligibility for free treatment.", tags: "ayushman, health", clickCount: 27600, isFeatured: true, isNew: true },
  // Tax
  { cat: "income-tax", titleHi: "ITR दाखिल करें", titleEn: "File Income Tax Return", url: "https://www.incometax.gov.in/iec/foportal/", descriptionHi: "ऑनलाइन रिटर्न भरें व रिफंड ट्रैक करें।", descriptionEn: "File returns and track refunds.", tags: "itr, income tax", clickCount: 21500 },
  { cat: "income-tax", titleHi: "GST पोर्टल", titleEn: "GST Portal", url: "https://www.gst.gov.in/", descriptionHi: "रजिस्ट्रेशन, रिटर्न और भुगतान।", descriptionEn: "Registration, returns and payments.", tags: "gst", clickCount: 14200 },
  // Bills
  { cat: "bijli-bill", titleHi: "गैस सिलेंडर बुकिंग", titleEn: "LPG Cylinder Booking", url: "https://www.mylpg.in/", descriptionHi: "Indane/HP/Bharat गैस बुक करें।", descriptionEn: "Book Indane, HP or Bharat Gas.", tags: "lpg, gas", clickCount: 18700 },
  { cat: "sarkari-yojana", titleHi: "PM सूर्य घर आवेदन", titleEn: "PM Surya Ghar Application", url: "https://www.pmsuryaghar.gov.in/", descriptionHi: "रूफटॉप सोलर सब्सिडी हेतु आवेदन।", descriptionEn: "Rooftop solar subsidy.", tags: "solar, subsidy", clickCount: 16900, isNew: true },
  // Certificates
  { cat: "certificates", titleHi: "जन्म प्रमाणपत्र", titleEn: "Birth Certificate", url: "https://crsorgi.gov.in/", descriptionHi: "CRS पोर्टल से आवेदन व डाउनलोड।", descriptionEn: "Apply and download via CRS.", tags: "birth certificate", clickCount: 13400 },
  { cat: "certificates", titleHi: "डिजिलॉकर दस्तावेज़", titleEn: "DigiLocker Documents", url: "https://www.digilocker.gov.in/", descriptionHi: "डिजिटल दस्तावेज़ वॉल्ट।", descriptionEn: "Digital document wallet.", tags: "digilocker", clickCount: 20800, isFeatured: true },
  { cat: "certificates", titleHi: "UMANG ऐप सेवाएं", titleEn: "UMANG App Services", url: "https://web.umang.gov.in/", descriptionHi: "100+ सरकारी सेवाएं एक ऐप में।", descriptionEn: "100+ services in one app.", tags: "umang", clickCount: 15600 },
  // Court & post
  { cat: "court-post", titleHi: "केस स्टेटस (eCourts)", titleEn: "Case Status (eCourts)", url: "https://ecourts.gov.in/", descriptionHi: "CNR नंबर से केस की स्थिति।", descriptionEn: "Status by CNR number.", tags: "court, case", clickCount: 9800 },
  { cat: "court-post", titleHi: "डाक ट्रैकिंग", titleEn: "India Post Tracking", url: "https://www.indiapost.gov.in/", descriptionHi: "स्पीड पोस्ट व पार्सल ट्रैक करें।", descriptionEn: "Track speed post and parcels.", tags: "post, tracking", clickCount: 11900 },
];

/* ───────────────────────── job taxonomy ───────────────────────── */

const JOB_CATS = [
  { slug: "ssc", titleHi: "SSC भर्तियां", titleEn: "SSC Recruitment", icon: "building", color: "navy" },
  { slug: "upsc", titleHi: "UPSC भर्तियां", titleEn: "UPSC Recruitment", icon: "star", color: "saffron" },
  { slug: "railway", titleHi: "रेलवे भर्तियां", titleEn: "Railway Recruitment", icon: "external", color: "sky" },
  { slug: "banking", titleHi: "बैंक भर्तियां", titleEn: "Bank Recruitment", icon: "wallet", color: "purple" },
  { slug: "police", titleHi: "पुलिस व रक्षा", titleEn: "Police & Defence", icon: "shield", color: "leaf" },
  { slug: "teaching", titleHi: "शिक्षक भर्तियां", titleEn: "Teaching Jobs", icon: "users", color: "amber" },
  { slug: "medical", titleHi: "चिकित्सा भर्तियां", titleEn: "Medical Jobs", icon: "plus", color: "rose" },
  { slug: "state-govt", titleHi: "राज्य सरकार", titleEn: "State Govt Jobs", icon: "folder", color: "navy" },
  { slug: "court", titleHi: "कोर्ट भर्तियां", titleEn: "Court Jobs", icon: "fileText", color: "purple" },
  { slug: "engineering", titleHi: "इंजीनियरिंग", titleEn: "Engineering Jobs", icon: "settings", color: "sky" },
];

const JOB_ORGS = [
  { slug: "ssc", nameHi: "कर्मचारी चयन आयोग", nameEn: "Staff Selection Commission", abbreviation: "SSC", website: "https://ssc.gov.in/" },
  { slug: "upsc", nameHi: "संघ लोक सेवा आयोग", nameEn: "Union Public Service Commission", abbreviation: "UPSC", website: "https://upsc.gov.in/" },
  { slug: "rrb", nameHi: "रेलवे भर्ती बोर्ड", nameEn: "Railway Recruitment Board", abbreviation: "RRB", website: "https://www.rrbcdg.gov.in/" },
  { slug: "ibps", nameHi: "बैंकिंग कार्मिक चयन संस्थान", nameEn: "Institute of Banking Personnel Selection", abbreviation: "IBPS", website: "https://www.ibps.in/" },
  { slug: "up-police", nameHi: "उत्तर प्रदेश पुलिस", nameEn: "Uttar Pradesh Police", abbreviation: "UPPBPB", website: "https://uppbpb.gov.in/" },
  { slug: "upsssc", nameHi: "उप अधीनस्थ सेवा चयन आयोग", nameEn: "UP Subordinate Services Selection Commission", abbreviation: "UPSSSC", website: "https://upsssc.gov.in/" },
  { slug: "aiims", nameHi: "अखिल भारतीय आयुर्विज्ञान संस्थान", nameEn: "All India Institute of Medical Sciences", abbreviation: "AIIMS", website: "https://www.aiimsexams.ac.in/" },
  { slug: "indian-air-force", nameHi: "भारतीय वायु सेना", nameEn: "Indian Air Force", abbreviation: "IAF", website: "https://afcat.cdac.in/" },
  { slug: "sbi", nameHi: "भारतीय स्टेट बैंक", nameEn: "State Bank of India", abbreviation: "SBI", website: "https://www.sbi.co.in/" },
];

const JOB_LOCS = [
  { slug: "all-india", titleHi: "अखिल भारतीय", titleEn: "All India", state: "" },
  { slug: "uttar-pradesh", titleHi: "उत्तर प्रदेश", titleEn: "Uttar Pradesh", state: "Uttar Pradesh" },
  { slug: "bihar", titleHi: "बिहार", titleEn: "Bihar", state: "Bihar" },
  { slug: "madhya-pradesh", titleHi: "मध्य प्रदेश", titleEn: "Madhya Pradesh", state: "Madhya Pradesh" },
  { slug: "rajasthan", titleHi: "राजस्थान", titleEn: "Rajasthan", state: "Rajasthan" },
  { slug: "delhi", titleHi: "दिल्ली", titleEn: "Delhi", state: "Delhi" },
  { slug: "maharashtra", titleHi: "महाराष्ट्र", titleEn: "Maharashtra", state: "Maharashtra" },
  { slug: "haryana", titleHi: "हरियाणा", titleEn: "Haryana", state: "Haryana" },
  { slug: "uttarakhand", titleHi: "उत्तराखंड", titleEn: "Uttarakhand", state: "Uttarakhand" },
  { slug: "west-bengal", titleHi: "पश्चिम बंगाल", titleEn: "West Bengal", state: "West Bengal" },
];

const JOB_QUALS = [
  { slug: "10th-pass", titleHi: "10वीं पास", titleEn: "10th Pass", level: 1 },
  { slug: "12th-pass", titleHi: "12वीं पास", titleEn: "12th Pass", level: 2 },
  { slug: "iti", titleHi: "ITI", titleEn: "ITI", level: 3 },
  { slug: "diploma", titleHi: "डिप्लोमा", titleEn: "Diploma", level: 4 },
  { slug: "graduate", titleHi: "स्नातक", titleEn: "Graduate", level: 5 },
  { slug: "post-graduate", titleHi: "परास्नातक", titleEn: "Post Graduate", level: 6 },
  { slug: "bed", titleHi: "B.Ed", titleEn: "B.Ed", level: 5 },
  { slug: "nursing", titleHi: "नर्सिंग (GNM/B.Sc)", titleEn: "Nursing (GNM/B.Sc)", level: 5 },
  { slug: "engineering", titleHi: "B.Tech", titleEn: "B.Tech", level: 5 },
];

const JOB_TAGS = [
  { slug: "ssc", nameHi: "SSC", nameEn: "SSC" },
  { slug: "upsc", nameHi: "UPSC", nameEn: "UPSC" },
  { slug: "railway", nameHi: "रेलवे", nameEn: "Railway" },
  { slug: "banking", nameHi: "बैंक", nameEn: "Banking" },
  { slug: "police", nameHi: "पुलिस", nameEn: "Police" },
  { slug: "defence", nameHi: "रक्षा", nameEn: "Defence" },
  { slug: "medical", nameHi: "चिकित्सा", nameEn: "Medical" },
  { slug: "state-govt", nameHi: "राज्य सरकार", nameEn: "State Govt" },
];

/* ───────────────────────── jobs ───────────────────────── */

// getJobBySlug resolves job.tags as comma-separated tag ObjectIds.
const JOB_TAG_SLUGS: Record<string, string[]> = {
  "ssc-cgl-2026": ["ssc"],
  "upsc-cse-2026": ["upsc"],
  "rrb-ntpc-2026": ["railway"],
  "ibps-po-2026": ["banking"],
  "up-police-constable-2026": ["police"],
  "ssc-gd-2026": ["ssc", "police"],
  "upsssc-pet-2026": ["state-govt"],
  "aiims-norcet-2026": ["medical"],
  "afcat-2026": ["police", "defence"],
  "sbi-clerk-2026": ["banking"],
};

type JobSpec = {
  slug: string;
  titleHi: string;
  titleEn: string;
  shortHi: string;
  shortEn: string;
  org: string;
  cat: string;
  vacancies: number;
  qualHi: string;
  qualEn: string;
  ageMin: number;
  ageMax: number;
  feeGen: number;
  feeObc: number;
  feeSc: number;
  feeSt: number;
  start: string;
  last: string;
  state: string;
  locs: string[];
  applyUrl: string;
  notifUrl: string;
  featured?: boolean;
  urgent?: boolean;
  views: number;
  posts: Array<{ hi: string; en: string; vac: number; pay: string }>;
  descHi: string;
  descEn: string;
  selectionHi: string[];
  selectionEn: string[];
};

const JOBS: JobSpec[] = [
  {
    slug: "ssc-cgl-2026", titleHi: "SSC CGL 2026 — संयुक्त स्नातक स्तरीय परीक्षा", titleEn: "SSC CGL 2026 — Combined Graduate Level Exam",
    shortHi: "केंद्र सरकार के मंत्रालयों में ग्रुप B/C पदों हेतु SSC CGL 2026।", shortEn: "SSC CGL 2026 for Group B/C posts in central ministries.",
    org: "ssc", cat: "ssc", vacancies: 14500, qualHi: "किसी मान्यता प्राप्त विश्वविद्यालय से स्नातक", qualEn: "Bachelor's degree from a recognized university",
    ageMin: 18, ageMax: 32, feeGen: 100, feeObc: 100, feeSc: 0, feeSt: 0, start: "2026-09-20", last: "2026-10-19",
    state: "", locs: ["All India"], applyUrl: "https://ssc.gov.in/", notifUrl: "https://ssc.gov.in/", featured: true, views: 184500,
    posts: [
      { hi: "सहायक लेखा परीक्षा अधिकारी (AAO)", en: "Assistant Audit Officer (AAO)", vac: 1200, pay: "₹47,600 – ₹1,51,100" },
      { hi: "निरीक्षक (केंद्रीय उत्पाद शुल्क/आयकर)", en: "Inspector (CBIC/CBDT)", vac: 6800, pay: "₹44,900 – ₹1,42,400" },
      { hi: "सहायक अनुभाग अधिकारी (ASO)", en: "Assistant Section Officer (ASO)", vac: 3500, pay: "₹44,900 – ₹1,42,400" },
      { hi: "अन्य ग्रुप B/C पद", en: "Other Group B/C Posts", vac: 3000, pay: "₹25,500 – ₹81,100" },
    ],
    descHi: "कर्मचारी चयन आयोग ने संयुक्त स्नातक स्तरीय (CGL) परीक्षा 2026 का नोटिफिकेशन जारी कर दिया है। कुल 14,500 पदों पर भर्ती होगी।",
    descEn: "Staff Selection Commission has released the Combined Graduate Level (CGL) 2026 notification for 14,500 posts.",
    selectionHi: ["टियर-1 (CBT)", "टियर-2 (CBT)", "दस्तावेज़ सत्यापन", "चिकित्सा परीक्षण"],
    selectionEn: ["Tier-1 (CBT)", "Tier-2 (CBT)", "Document Verification", "Medical Examination"],
  },
  {
    slug: "upsc-cse-2026", titleHi: "UPSC CSE 2026 — सिविल सेवा परीक्षा (IAS/IPS)", titleEn: "UPSC CSE 2026 — Civil Services Exam (IAS/IPS)",
    shortHi: "IAS, IPS, IFS सहित 1056 पदों हेतु सिविल सेवा परीक्षा 2026।", shortEn: "Civil Services 2026 for 1056 posts including IAS, IPS, IFS.",
    org: "upsc", cat: "upsc", vacancies: 1056, qualHi: "किसी मान्यता प्राप्त विश्वविद्यालय से स्नातक", qualEn: "Bachelor's degree from a recognized university",
    ageMin: 21, ageMax: 32, feeGen: 100, feeObc: 100, feeSc: 0, feeSt: 0, start: "2026-09-25", last: "2026-10-14",
    state: "", locs: ["All India"], applyUrl: "https://upsc.gov.in/", notifUrl: "https://upsc.gov.in/", featured: true, urgent: true, views: 231000,
    posts: [
      { hi: "भारतीय प्रशासनिक सेवा (IAS)", en: "Indian Administrative Service", vac: 180, pay: "₹56,100 – ₹2,50,000" },
      { hi: "भारतीय पुलिस सेवा (IPS)", en: "Indian Police Service", vac: 150, pay: "₹56,100 – ₹2,25,000" },
      { hi: "अन्य ग्रुप A/B सेवाएं", en: "Other Group A/B Services", vac: 726, pay: "₹56,100 – ₹1,77,500" },
    ],
    descHi: "संघ लोक सेवा आयोग की सिविल सेवा (प्रारंभिक) परीक्षा 2026 हेतु ऑनलाइन आवेदन शुरू।",
    descEn: "Online applications open for UPSC Civil Services (Preliminary) Examination 2026.",
    selectionHi: ["प्रारंभिक परीक्षा", "मुख्य परीक्षा", "साक्षात्कार (Personality Test)"],
    selectionEn: ["Preliminary Exam", "Mains Exam", "Personality Test (Interview)"],
  },
  {
    slug: "rrb-ntpc-2026", titleHi: "RRB NTPC 2026 — रेलवे गैर-तकनीकी भर्ती", titleEn: "RRB NTPC 2026 — Railway Non-Technical Posts",
    shortHi: "रेलवे में 11,558 NTPC पदों (क्लर्क, टिकट कलेक्टर, स्टेशन मास्टर) पर भर्ती।", shortEn: "11,558 NTPC posts (clerk, TC, station master) in Indian Railways.",
    org: "rrb", cat: "railway", vacancies: 11558, qualHi: "12वीं / स्नातक (पद अनुसार)", qualEn: "12th / Graduate (post-wise)",
    ageMin: 18, ageMax: 33, feeGen: 500, feeObc: 500, feeSc: 250, feeSt: 250, start: "2026-09-18", last: "2026-10-27",
    state: "", locs: ["All India"], applyUrl: "https://www.rrbcdg.gov.in/", notifUrl: "https://www.rrbcdg.gov.in/", views: 156700,
    posts: [
      { hi: "वाणिज्यिक-सह-टिकट क्लर्क", en: "Commercial-cum-Ticket Clerk", vac: 3200, pay: "₹21,700 – ₹69,100" },
      { hi: "स्टेशन मास्टर", en: "Station Master", vac: 994, pay: "₹35,400 – ₹1,12,400" },
      { hi: "गुड्स गार्ड / अन्य", en: "Goods Guard / Others", vac: 7364, pay: "₹25,500 – ₹81,100" },
    ],
    descHi: "रेलवे भर्ती बोर्ड ने NTPC स्नातक व अंडर-ग्रेजुएट पदों का नोटिफिकेशन जारी किया है।",
    descEn: "Railway Recruitment Boards invite applications for NTPC graduate and under-graduate posts.",
    selectionHi: ["CBT-1", "CBT-2", "टाइपिंग/योग्यता परीक्षा", "दस्तावेज़ सत्यापन"],
    selectionEn: ["CBT-1", "CBT-2", "Typing/Aptitude Test", "Document Verification"],
  },
  {
    slug: "ibps-po-2026", titleHi: "IBPS PO 2026 — प्रोबेशनरी ऑफिसर भर्ती", titleEn: "IBPS PO 2026 — Probationary Officer Recruitment",
    shortHi: "11 सार्वजनिक बैंकों में 5,208 प्रोबेशनरी ऑफिसर पद।", shortEn: "5,208 Probationary Officer posts across 11 public sector banks.",
    org: "ibps", cat: "banking", vacancies: 5208, qualHi: "किसी मान्यता प्राप्त विश्वविद्यालय से स्नातक", qualEn: "Graduation in any discipline",
    ageMin: 20, ageMax: 30, feeGen: 850, feeObc: 850, feeSc: 175, feeSt: 175, start: "2026-09-15", last: "2026-10-21",
    state: "", locs: ["All India"], applyUrl: "https://www.ibps.in/", notifUrl: "https://www.ibps.in/", views: 98400,
    posts: [{ hi: "प्रोबेशनरी ऑफिसर / मैनेजमेंट ट्रेनी", en: "Probationary Officer / Management Trainee", vac: 5208, pay: "₹36,000 – ₹63,840" }],
    descHi: "IBPS CRP PO/MT-XV के तहत 11 बैंकों में प्रोबेशनरी ऑफिसर भर्ती।",
    descEn: "Probationary Officer recruitment across 11 banks under IBPS CRP PO/MT-XV.",
    selectionHi: ["प्रारंभिक परीक्षा", "मुख्य परीक्षा", "साक्षात्कार"],
    selectionEn: ["Prelims", "Mains", "Interview"],
  },
  {
    slug: "up-police-constable-2026", titleHi: "UP Police Constable 2026 — 19,220 पद", titleEn: "UP Police Constable 2026 — 19,220 Posts",
    shortHi: "उत्तर प्रदेश पुलिस में सिपाही (पुरुष/महिला) सीधी भर्ती।", shortEn: "Direct recruitment of constables (male/female) in UP Police.",
    org: "up-police", cat: "police", vacancies: 19220, qualHi: "12वीं (इंटरमीडिएट) उत्तीर्ण", qualEn: "Intermediate (12th) pass",
    ageMin: 18, ageMax: 25, feeGen: 400, feeObc: 400, feeSc: 160, feeSt: 160, start: "2026-09-22", last: "2026-11-11",
    state: "Uttar Pradesh", locs: ["Uttar Pradesh"], applyUrl: "https://uppbpb.gov.in/", notifUrl: "https://uppbpb.gov.in/", urgent: true, views: 203800,
    posts: [
      { hi: "सिपाही (पुरुष)", en: "Constable (Male)", vac: 15300, pay: "₹21,700 – ₹69,100" },
      { hi: "सिपाही (महिला)", en: "Constable (Female)", vac: 3920, pay: "₹21,700 – ₹69,100" },
    ],
    descHi: "UPPBPB ने आरक्षी नागरिक पुलिस सीधी भर्ती का विज्ञापन जारी किया है।",
    descEn: "UPPBPB invites applications for Civil Police constable direct recruitment.",
    selectionHi: ["लिखित परीक्षा", "PET/PST", "दस्तावेज़ सत्यापन", "चिकित्सा परीक्षण"],
    selectionEn: ["Written Exam", "PET/PST", "Document Verification", "Medical Test"],
  },
  {
    slug: "ssc-gd-2026", titleHi: "SSC GD Constable 2026 — 39,481 पद", titleEn: "SSC GD Constable 2026 — 39,481 Posts",
    shortHi: "CAPF, BSF, CISF, CRPF में GD कांस्टेबल भर्ती (10वीं पास)।", shortEn: "GD Constable in CAPFs for 10th pass candidates.",
    org: "ssc", cat: "ssc", vacancies: 39481, qualHi: "10वीं (मैट्रिक) उत्तीर्ण", qualEn: "Matriculation (10th) pass",
    ageMin: 18, ageMax: 23, feeGen: 100, feeObc: 100, feeSc: 0, feeSt: 0, start: "2026-09-01", last: "2026-10-15",
    state: "", locs: ["All India"], applyUrl: "https://ssc.gov.in/", notifUrl: "https://ssc.gov.in/", views: 178200,
    posts: [
      { hi: "BSF / CISF / CRPF / SSB / ITBP", en: "BSF / CISF / CRPF / SSB / ITBP", vac: 36000, pay: "₹21,700 – ₹69,100" },
      { hi: "असम राइफल्स", en: "Assam Rifles", vac: 3481, pay: "₹21,700 – ₹69,100" },
    ],
    descHi: "केंद्रीय सशस्त्र पुलिस बलों में GD कांस्टेबल के 39,481 पदों पर भर्ती।",
    descEn: "39,481 GD Constable posts across CAPFs and Assam Rifles.",
    selectionHi: ["CBT परीक्षा", "PET/PST", "चिकित्सा परीक्षण"],
    selectionEn: ["CBT Exam", "PET/PST", "Medical Examination"],
  },
  {
    slug: "upsssc-pet-2026", titleHi: "UPSSSC PET 2026 — प्रारंभिक अर्हता परीक्षा", titleEn: "UPSSSC PET 2026 — Preliminary Eligibility Test",
    shortHi: "UP समूह B/C भर्तियों हेतु अनिवार्य PET परीक्षा।", shortEn: "Mandatory PET for UP Group B/C recruitments.",
    org: "upsssc", cat: "state-govt", vacancies: 0, qualHi: "हाईस्कूल (10वीं) उत्तीर्ण", qualEn: "High School (10th) pass",
    ageMin: 18, ageMax: 40, feeGen: 185, feeObc: 185, feeSc: 95, feeSt: 95, start: "2026-09-28", last: "2026-10-28",
    state: "Uttar Pradesh", locs: ["Uttar Pradesh"], applyUrl: "https://upsssc.gov.in/", notifUrl: "https://upsssc.gov.in/", views: 87600,
    posts: [{ hi: "PET स्कोर (पात्रता हेतु)", en: "PET Score (for eligibility)", vac: 0, pay: "—" }],
    descHi: "UPSSSC समूह ख/ग भर्तियों के लिए PET 2026 अनिवार्य है।",
    descEn: "PET 2026 is mandatory for UPSSSC Group B/C recruitments.",
    selectionHi: ["लिखित परीक्षा (100 अंक)"], selectionEn: ["Written Exam (100 marks)"],
  },
  {
    slug: "aiims-norcet-2026", titleHi: "AIIMS NORCET 2026 — नर्सिंग ऑफिसर भर्ती", titleEn: "AIIMS NORCET 2026 — Nursing Officer Recruitment",
    shortHi: "एम्स व भागीदार संस्थानों में 3,500 नर्सिंग ऑफिसर पद।", shortEn: "3,500 Nursing Officer posts in AIIMS and participating institutes.",
    org: "aiims", cat: "medical", vacancies: 3500, qualHi: "GNM / B.Sc (नर्सिंग) + पंजीकरण", qualEn: "GNM / B.Sc Nursing with registration",
    ageMin: 18, ageMax: 30, feeGen: 3000, feeObc: 3000, feeSc: 2400, feeSt: 2400, start: "2026-09-16", last: "2026-10-16",
    state: "", locs: ["All India"], applyUrl: "https://www.aiimsexams.ac.in/", notifUrl: "https://www.aiimsexams.ac.in/", views: 65400,
    posts: [{ hi: "नर्सिंग ऑफिसर", en: "Nursing Officer", vac: 3500, pay: "₹44,900 – ₹1,42,400" }],
    descHi: "नर्सिंग ऑफिसर भर्ती हेतु NORCET 2026 का आयोजन।",
    descEn: "NORCET 2026 for Nursing Officer posts.",
    selectionHi: ["NORCET प्रारंभिक", "NORCET मुख्य"], selectionEn: ["NORCET Prelims", "NORCET Mains"],
  },
  {
    slug: "afcat-2026", titleHi: "AFCAT 2026 — वायु सेना अधिकारी भर्ती", titleEn: "AFCAT 2026 — Air Force Officer Entry",
    shortHi: "फ्लाइंग व ग्राउंड ड्यूटी शाखाओं में अधिकारी प्रवेश।", shortEn: "Officer entry in Flying and Ground Duty branches.",
    org: "indian-air-force", cat: "police", vacancies: 340, qualHi: "स्नातक (60% सहित, शाखा अनुसार)", qualEn: "Graduation with 60% (branch-wise)",
    ageMin: 20, ageMax: 24, feeGen: 550, feeObc: 550, feeSc: 550, feeSt: 550, start: "2026-09-19", last: "2026-10-30",
    state: "", locs: ["All India"], applyUrl: "https://afcat.cdac.in/", notifUrl: "https://afcat.cdac.in/", views: 54200,
    posts: [
      { hi: "फ्लाइंग शाखा", en: "Flying Branch", vac: 100, pay: "₹56,100 – ₹1,77,500" },
      { hi: "ग्राउंड ड्यूटी (तकनीकी/गैर-तकनीकी)", en: "Ground Duty (Tech/Non-Tech)", vac: 240, pay: "₹56,100 – ₹1,77,500" },
    ],
    descHi: "भारतीय वायु सेना में AFCAT 02/2026 के तहत अधिकारी भर्ती।",
    descEn: "Officer recruitment in the Indian Air Force under AFCAT 02/2026.",
    selectionHi: ["AFCAT परीक्षा", "AFSB परीक्षण", "चिकित्सा परीक्षण"], selectionEn: ["AFCAT Exam", "AFSB Testing", "Medicals"],
  },
  {
    slug: "sbi-clerk-2026", titleHi: "SBI Clerk 2026 — जूनियर एसोसिएट भर्ती", titleEn: "SBI Clerk 2026 — Junior Associates Recruitment",
    shortHi: "भारतीय स्टेट बैंक में 13,735 जूनियर एसोसिएट पद।", shortEn: "13,735 Junior Associate posts in State Bank of India.",
    org: "sbi", cat: "banking", vacancies: 13735, qualHi: "किसी मान्यता प्राप्त विश्वविद्यालय से स्नातक", qualEn: "Graduation in any discipline",
    ageMin: 20, ageMax: 28, feeGen: 750, feeObc: 750, feeSc: 0, feeSt: 0, start: "2026-09-23", last: "2026-10-23",
    state: "", locs: ["All India"], applyUrl: "https://www.sbi.co.in/", notifUrl: "https://www.sbi.co.in/", views: 112300,
    posts: [{ hi: "जूनियर एसोसिएट (क्लर्क)", en: "Junior Associate (Clerk)", vac: 13735, pay: "₹26,730 – ₹64,480" }],
    descHi: "SBI में जूनियर एसोसिएट (ग्राहक सहायता) के 13,735 पदों पर भर्ती।",
    descEn: "13,735 Junior Associate posts in SBI.",
    selectionHi: ["प्रारंभिक परीक्षा", "मुख्य परीक्षा", "स्थानीय भाषा परीक्षा"], selectionEn: ["Prelims", "Mains", "Local Language Test"],
  },
];

/* ───────────────────────── ads / pricing ───────────────────────── */

const AD_TYPES = [
  { code: "LINK", nameHi: "लिंक विज्ञापन", nameEn: "Link Advertisement", descriptionHi: "टेक्स्ट लिंक + छोटा विवरण", descriptionEn: "Text link + short description", basePrice: 100, billingUnit: "day", isActive: true, sortOrder: 1 },
  { code: "IMAGE", nameHi: "छवि विज्ञापन", nameEn: "Image Advertisement", descriptionHi: "फुल-विड्थ क्लिकेबल इमेज", descriptionEn: "Full-width clickable image", basePrice: 200, billingUnit: "day", isActive: true, sortOrder: 2 },
  { code: "BANNER", nameHi: "बैनर विज्ञापन", nameEn: "Banner Advertisement", descriptionHi: "शीर्षक + टेक्स्ट + CTA", descriptionEn: "Title + text + CTA", basePrice: 300, billingUnit: "day", isActive: true, sortOrder: 3 },
  { code: "INLINE", nameHi: "इनलाइन विज्ञापन", nameEn: "Inline Advertisement", descriptionHi: "छोटा टेक्स्ट विज्ञापन", descriptionEn: "Small text advertisement", basePrice: 150, billingUnit: "day", isActive: true, sortOrder: 4 },
  { code: "SPONSORED", nameHi: "स्पंसर कार्ड", nameEn: "Sponsored Card", descriptionHi: "सेवा-शैली प्रचार कार्ड", descriptionEn: "Service-style promotional card", basePrice: 250, billingUnit: "day", isActive: true, sortOrder: 5 },
];

// NOTE: placement codes MUST match the keys pages read:
// hero_below, categories_between, popular_above, footer_above,
// category_top, category_bottom, search_top.
const PLACEMENTS = [
  { code: "hero_below", nameHi: "होम हीरो नीचे", nameEn: "Hero Below Home", multiplier: 2.0, priority: 1, isActive: true },
  { code: "categories_between", nameHi: "होम श्रेणी के बीच", nameEn: "Categories Between Home", multiplier: 1.5, priority: 2, isActive: true },
  { code: "popular_above", nameHi: "लोकप्रिय सेवाएं ऊपर", nameEn: "Popular Services Above", multiplier: 1.75, priority: 3, isActive: true },
  { code: "footer_above", nameHi: "फुटर ऊपर", nameEn: "Footer Above", multiplier: 1.0, priority: 4, isActive: true },
  { code: "category_top", nameHi: "श्रेणी पेज टॉप", nameEn: "Category Page Top", multiplier: 1.5, priority: 5, isActive: true },
  { code: "category_bottom", nameHi: "श्रेणी पेज बॉटम", nameEn: "Category Page Bottom", multiplier: 0.8, priority: 6, isActive: true },
  { code: "search_top", nameHi: "सर्च पेज टॉप", nameEn: "Search Page Top", multiplier: 1.75, priority: 7, isActive: true },
];

// Legacy UPPERCASE codes from earlier seeds → rename in place.
const LEGACY_PLACEMENT_MAP: Record<string, string> = {
  HOME_HERO_BELOW: "hero_below",
  HOME_CATEGORY_BETWEEN: "categories_between",
  POPULAR_SERVICES_ABOVE: "popular_above",
  FOOTER_ABOVE: "footer_above",
  CATEGORY_TOP: "category_top",
  CATEGORY_BOTTOM: "category_bottom",
  SEARCH_TOP: "search_top",
};

const DURATION_PLANS = [
  { days: 1, discountPercent: 0, isActive: true },
  { days: 7, discountPercent: 5, isActive: true },
  { days: 15, discountPercent: 10, isActive: true },
  { days: 30, discountPercent: 15, isActive: true },
  { days: 60, discountPercent: 20, isActive: true },
  { days: 90, discountPercent: 25, isActive: true },
];

/* ───────────────────────── main ───────────────────────── */

async function main() {
  console.log("Seeding sarkari-portal...");

  // 1. admin
  const passwordHash = await hashPassword("Admin@123");
  await db.admin.upsert({
    where: { username: "superadmin" },
    update: {},
    create: { username: "superadmin", name: "Super Admin", passwordHash },
  });
  console.log("✓ admin: superadmin");

  // 2. settings
  for (const [key, value] of Object.entries(SETTINGS)) {
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  console.log(`✓ settings (${Object.keys(SETTINGS).length})`);

  // 3. categories
  const catIds: Record<string, string> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const row = await db.category.upsert({
      where: { slug: c.slug },
      update: { ...c },
      create: { ...c },
    });
    catIds[c.slug] = row.id;
    void i;
  }
  console.log(`✓ categories (${CATEGORIES.length})`);

  // 4. services
  let svcCount = 0;
  for (const [i, s] of SERVICES.entries()) {
    const data = {
      categoryIds: [catIds[s.cat]],
      titleHi: s.titleHi,
      titleEn: s.titleEn,
      url: s.url,
      descriptionHi: s.descriptionHi,
      descriptionEn: s.descriptionEn,
      tags: s.tags,
      isFeatured: s.isFeatured ?? false,
      isNew: s.isNew ?? false,
      isActive: true,
      sortOrder: i + 1,
      clickCount: s.clickCount,
    };
    const existing = await db.service.findFirst({ where: { url: s.url, titleEn: s.titleEn } });
    if (existing) await db.service.update({ where: { id: existing.id }, data });
    else await db.service.create({ data });
    svcCount++;
  }
  console.log(`✓ services (${svcCount})`);

  // 5. job taxonomy
  for (const [i, c] of JOB_CATS.entries()) {
    await db.jobCategory.upsert({
      where: { slug: c.slug },
      update: { ...c },
      create: { ...c, descriptionHi: "", descriptionEn: "", sortOrder: i + 1, isActive: true },
    });
  }
  const orgIds: Record<string, string> = {};
  const orgNames: Record<string, { hi: string; en: string }> = {};
  for (const [i, o] of JOB_ORGS.entries()) {
    const row = await db.jobOrganization.upsert({
      where: { slug: o.slug },
      update: { ...o },
      create: { ...o, descriptionHi: "", descriptionEn: "", sortOrder: i + 1, isActive: true },
    });
    orgIds[o.slug] = row.id;
    orgNames[o.slug] = { hi: o.nameHi, en: o.nameEn };
  }
  const catIds2: Record<string, string> = {};
  const catNames: Record<string, { hi: string; en: string }> = {};
  for (const c of JOB_CATS) {
    const row = await db.jobCategory.findUniqueOrThrow({ where: { slug: c.slug } });
    catIds2[c.slug] = row.id;
    catNames[c.slug] = { hi: row.titleHi, en: row.titleEn };
  }
  for (const [i, l] of JOB_LOCS.entries()) {
    await db.jobLocation.upsert({
      where: { slug: l.slug },
      update: { ...l },
      create: { ...l, sortOrder: i + 1, isActive: true },
    });
  }
  for (const [i, q] of JOB_QUALS.entries()) {
    await db.jobQualification.upsert({
      where: { slug: q.slug },
      update: { ...q },
      create: { ...q, sortOrder: i + 1, isActive: true },
    });
  }
  for (const [i, t] of JOB_TAGS.entries()) {
    await db.jobTag.upsert({
      where: { slug: t.slug },
      update: { ...t },
      create: { ...t, sortOrder: i + 1 },
    });
  }
  console.log("✓ job taxonomy");

  // 6. jobs (+ details)
  const tagIdBySlug: Record<string, string> = {};
  for (const t of await db.jobTag.findMany({ select: { id: true, slug: true } })) {
    tagIdBySlug[t.slug] = t.id;
  }
  for (const j of JOBS) {
    const focusKeyword = j.slug.replace(/-/g, " ");
    const tagIds = (JOB_TAG_SLUGS[j.slug] ?? []).map((s) => tagIdBySlug[s]).filter(Boolean);
    const seoTitle = `${j.titleEn} – Vacancy, Eligibility & Apply Online | APPZENO Sarkari Portal`;
    const blocks = [
      B(`block_${j.slug}_h`, "heading", { text: j.titleEn, hi: j.titleHi, en: j.titleEn }, 1),
      B(`block_${j.slug}_p`, "paragraph", { hi: j.descHi, en: j.descEn }, 2),
      B(`block_${j.slug}_dates`, "important-dates", {
        dates: [
          { eventHi: "आवेदन शुरू", eventEn: "Application Start", event: "Application Start", date: j.start },
          { eventHi: "अंतिम तिथि", eventEn: "Last Date", event: "Last Date", date: j.last },
          { eventHi: "परीक्षा तिथि", eventEn: "Exam Date", event: "Exam Date", date: "" },
        ],
      }, 3),
      B(`block_${j.slug}_vac`, "vacancy-details", {
        rows: j.posts.map((p) => ({ postHi: p.hi, postEn: p.en, post: p.en, vacancies: p.vac, payScale: p.pay })),
      }, 4),
      B(`block_${j.slug}_elig`, "eligibility", {
        items: [
          { hi: j.qualHi, en: j.qualEn, text: j.qualEn, required: true },
          { hi: "भारत का नागरिक होना आवश्यक", en: "Must be a citizen of India", text: "Must be a citizen of India", required: true },
        ],
      }, 5),
      B(`block_${j.slug}_age`, "age-limit", {
        minimum: j.ageMin,
        maximum: j.ageMax,
        relaxations: [
          { category: "SC/ST", years: 5 },
          { category: "OBC", years: 3 },
        ],
      }, 6),
      B(`block_${j.slug}_fee`, "application-fee", {
        fees: [
          { categoryHi: "सामान्य", categoryEn: "General", category: "General", amount: j.feeGen },
          { categoryHi: "OBC", categoryEn: "OBC", category: "OBC", amount: j.feeObc },
          { categoryHi: "SC", categoryEn: "SC", category: "SC", amount: j.feeSc },
          { categoryHi: "ST", categoryEn: "ST", category: "ST", amount: j.feeSt },
        ],
        exemption: j.feeSc === 0,
      }, 7),
      B(`block_${j.slug}_sel`, "selection-process", {
        steps: j.selectionHi.map((s, idx) => ({ hi: s, en: j.selectionEn[idx] ?? s, text: j.selectionEn[idx] ?? s })),
      }, 8),
      B(`block_${j.slug}_how`, "how-to-apply", {
        hi: `1. आधिकारिक वेबसाइट खोलें\n2. "${j.titleEn}" लिंक पर क्लिक करें\n3. पंजीकरण कर लॉगिन करें\n4. फॉर्म भरकर शुल्क जमा करें\n5. प्रिंट अवश्य लें`,
        en: `1. Open the official website\n2. Click "${j.titleEn}"\n3. Register and login\n4. Fill the form and pay the fee\n5. Take a printout`,
      }, 9),
      B(`block_${j.slug}_links`, "important-links", {
        links: [
          { hi: "ऑनलाइन आवेदन करें", en: "Apply Online", text: "Apply Online", url: j.applyUrl, type: "Apply", isActive: true },
          { hi: "नोटिफिकेशन डाउनलोड करें", en: "Download Notification", text: "Download Notification", url: j.notifUrl, type: "Notification", isActive: true },
          { hi: "आधिकारिक वेबसाइट", en: "Official Website", text: "Official Website", url: j.applyUrl, type: "Website", isActive: true },
        ],
      }, 10),
      B(`block_${j.slug}_faq`, "faq", {
        items: [
          { questionHi: `${j.titleHi} की अंतिम तिथि क्या है?`, questionEn: `What is the last date for ${j.titleEn}?`, question: `What is the last date?`, answerHi: `अंतिम तिथि ${j.last} है।`, answerEn: `The last date is ${j.last}.`, answer: `The last date is ${j.last}.` },
          { questionHi: "आवेदन शुल्क कितना है?", questionEn: "What is the application fee?", question: "What is the application fee?", answerHi: `सामान्य हेतु ₹${j.feeGen}, SC/ST हेतु छूट उपलब्ध।`, answerEn: `₹${j.feeGen} for General, exemptions for SC/ST.`, answer: `₹${j.feeGen} for General.` },
        ],
      }, 11),
    ];

    const job = await db.job.upsert({
      where: { slug: j.slug },
      update: { tags: tagIds.join(",") },
      create: {
        slug: j.slug,
        titleHi: j.titleHi,
        titleEn: j.titleEn,
        shortDescriptionHi: j.shortHi,
        shortDescriptionEn: j.shortEn,
        organizationId: orgIds[j.org] ?? null,
        organizationNameHi: orgNames[j.org]?.hi ?? "",
        organizationNameEn: orgNames[j.org]?.en ?? "",
        categoryId: catIds2[j.cat] ?? null,
        categoryNameHi: catNames[j.cat]?.hi ?? "",
        categoryNameEn: catNames[j.cat]?.en ?? "",
        jobType: "government",
        isGovernment: true,
        sector: "Government",
        state: j.state,
        locationNames: j.locs,
        applicationStartDate: j.start,
        applicationLastDate: j.last,
        notificationDate: j.start,
        totalVacancies: j.vacancies,
        minimumQualification: j.qualEn,
        maximumQualification: "",
        minimumAge: j.ageMin,
        maximumAge: j.ageMax,
        applicationFeeGeneral: j.feeGen,
        applicationFeeOBC: j.feeObc,
        applicationFeeSC: j.feeSc,
        applicationFeeST: j.feeSt,
        applyUrl: j.applyUrl,
        notificationUrl: j.notifUrl,
        status: "published",
        isFeatured: j.featured ?? false,
        isUrgent: j.urgent ?? false,
        isActive: true,
        template: "government",
        blocks: blocks as never,
        tags: tagIds.join(","),
        seoTitle,
        metaDescription: j.shortEn.slice(0, 160),
        focusKeyword,
        ogTitle: seoTitle,
        ogDescription: j.shortEn.slice(0, 160),
        canonicalUrl: `/job/${j.slug}`,
        robots: "index, follow",
        schemaType: "JobPosting",
        viewCount: j.views,
      },
    });

    // rebuild detail rows (idempotent)
    await db.jobVacancy.deleteMany({ where: { jobId: job.id } });
    await db.jobVacancy.createMany({
      data: j.posts.map((p, idx) => ({
        jobId: job.id, postNameHi: p.hi, postNameEn: p.en, total: p.vac, payScale: p.pay, eligibility: j.qualEn, sortOrder: idx + 1,
      })),
    });
    await db.jobDate.deleteMany({ where: { jobId: job.id } });
    await db.jobDate.createMany({
      data: [
        { jobId: job.id, event: "Application Start", date: j.start, description: "", sortOrder: 1 },
        { jobId: job.id, event: "Last Date", date: j.last, description: "", sortOrder: 2 },
      ],
    });
    await db.jobEligibility.deleteMany({ where: { jobId: job.id } });
    await db.jobEligibility.createMany({
      data: [{ jobId: job.id, qualification: j.qualEn, required: true, sortOrder: 1 }],
    });
    await db.jobFee.deleteMany({ where: { jobId: job.id } });
    await db.jobFee.createMany({
      data: [
        { jobId: job.id, category: "General", amount: j.feeGen, sortOrder: 1 },
        { jobId: job.id, category: "OBC", amount: j.feeObc, sortOrder: 2 },
        { jobId: job.id, category: "SC", amount: j.feeSc, sortOrder: 3 },
        { jobId: job.id, category: "ST", amount: j.feeSt, sortOrder: 4 },
      ],
    });
    await db.jobLink.deleteMany({ where: { jobId: job.id } });
    await db.jobLink.createMany({
      data: [
        { jobId: job.id, nameHi: "ऑनलाइन आवेदन", nameEn: "Apply Online", url: j.applyUrl, linkType: "apply", isActive: true, sortOrder: 1 },
        { jobId: job.id, nameHi: "नोटिफिकेशन", nameEn: "Notification", url: j.notifUrl, linkType: "notification", isActive: true, sortOrder: 2 },
      ],
    });
    await db.jobDocument.deleteMany({ where: { jobId: job.id } });
    await db.jobDocument.createMany({
      data: [
        { jobId: job.id, nameHi: "10वीं प्रमाणपत्र", nameEn: "10th Certificate", required: true, sortOrder: 1 },
        { jobId: job.id, nameHi: "फोटो व हस्ताक्षर", nameEn: "Photo & Signature", required: true, sortOrder: 2 },
        { jobId: job.id, nameHi: "जाति प्रमाणपत्र (यदि लागू)", nameEn: "Caste Certificate (if applicable)", required: false, sortOrder: 3 },
      ],
    });
    await db.jobSelectionStep.deleteMany({ where: { jobId: job.id } });
    await db.jobSelectionStep.createMany({
      data: j.selectionHi.map((s, idx) => ({
        jobId: job.id, stepNameHi: s, stepNameEn: j.selectionEn[idx] ?? s, description: "", sortOrder: idx + 1,
      })),
    });
    await db.jobFaq.deleteMany({ where: { jobId: job.id } });
    await db.jobFaq.createMany({
      data: [
        { jobId: job.id, questionHi: `${j.titleHi} की अंतिम तिथि क्या है?`, questionEn: `What is the last date for ${j.titleEn}?`, answerHi: `अंतिम तिथि ${j.last} है।`, answerEn: `The last date is ${j.last}.`, sortOrder: 1 },
        { jobId: job.id, questionHi: "आवेदन शुल्क कितना है?", questionEn: "What is the application fee?", answerHi: `सामान्य हेतु ₹${j.feeGen}।`, answerEn: `₹${j.feeGen} for General category.`, sortOrder: 2 },
      ],
    });
    console.log(`✓ job: ${j.slug}`);
  }

  // 7. ad pricing
  for (const t of AD_TYPES) {
    await db.adType.upsert({ where: { code: t.code }, update: { ...t }, create: { ...t, descriptionHi: t.descriptionHi, descriptionEn: t.descriptionEn } });
  }
  for (const p of PLACEMENTS) {
    await db.placement.upsert({ where: { code: p.code }, update: { ...p }, create: { ...p } });
  }
  for (const d of DURATION_PLANS) {
    await db.durationPlan.upsert({ where: { days: d.days }, update: { ...d }, create: { ...d } });
  }
  console.log("✓ ad pricing");

  // 8. house ads
  // Rename any legacy UPPERCASE placement rows/ads first.
  for (const [oldCode, newCode] of Object.entries(LEGACY_PLACEMENT_MAP)) {
    await db.ad.updateMany({ where: { placement: oldCode }, data: { placement: newCode } });
    await db.advertisement.updateMany({ where: { placementCode: oldCode }, data: { placementCode: newCode } });
    await db.placement.deleteMany({ where: { code: oldCode } });
  }
  const houseAds = [
    {
      placement: "hero_below", variant: "banner", titleHi: "पोर्टल पर विज्ञापन दें", titleEn: "Advertise on this portal",
      descriptionHi: "हजारों दैनिक पाठकों तक पहुंचें।", descriptionEn: "Reach thousands of daily readers.",
      linkUrl: "/advertise", buttonTextHi: "विज्ञापन दें", buttonTextEn: "Advertise", sortOrder: 1,
    },
    {
      placement: "footer_above", variant: "banner", titleHi: "नई भर्तियों की सूचना पाएं", titleEn: "Get new job alerts",
      descriptionHi: "न्यूज़लेटर से जुड़ें — बिल्कुल मुफ्त।", descriptionEn: "Join the newsletter — free forever.",
      linkUrl: "/newsletter/preferences", buttonTextHi: "जुड़ें", buttonTextEn: "Subscribe", sortOrder: 1,
    },
  ];
  for (const a of houseAds) {
    const existing = await db.ad.findFirst({ where: { placement: a.placement, titleEn: a.titleEn } });
    const data = { ...a, descriptionHi: a.descriptionHi, descriptionEn: a.descriptionEn, linkUrl: a.linkUrl, imageUrl: "", buttonTextHi: a.buttonTextHi, buttonTextEn: a.buttonTextEn, bgColor: "#122546", textColor: "#ffffff", isPublished: true, sortOrder: a.sortOrder };
    if (existing) await db.ad.update({ where: { id: existing.id }, data });
    else await db.ad.create({ data });
  }
  console.log("✓ house ads");

  // 9. payment settings
  await db.paymentSettings.upsert({
    where: { settingId: "default" },
    update: {},
    create: {
      settingId: "default", upiEnabled: true, upiId: "appzeno@upi", payeeName: "APPZENO Sarkari Portal",
      merchantName: "APPZENO", paymentInstructions: "UPI से भुगतान करें और स्क्रीनशॉट अपलोड करें।", gstPercent: 18, whatsappNumber: "919876543210",
    },
  });
  console.log("✓ payment settings");

  // 10. cookie settings + categories
  await db.cookieSettings.upsert({
    where: { settingId: "COOKIE-SETTINGS-001" },
    update: {},
    create: {
      settingId: "COOKIE-SETTINGS-001", bannerEnabled: true, bannerTitle: "हम कुकीज़ का उपयोग करते हैं",
      bannerDescription: "बेहतर अनुभव हेतु कुकीज़ स्वीकार करें। विवरण के लिए कुकी नीति पढ़ें।",
      position: "bottom", layout: "banner", policyVersion: "1.0", policyUrl: "/cookie-policy",
      privacyPolicyUrl: "/privacy-policy", updatedBy: "seed",
    },
  });
  const cookieCats = [
    { code: "necessary", name: "आवश्यक", description: "साइट संचालन हेतु अनिवार्य।", required: true, defaultEnabled: true, displayOrder: 1 },
    { code: "functional", name: "कार्यात्मक", description: "भाषा व प्राथमिकताएं याद रखती हैं।", required: false, defaultEnabled: true, displayOrder: 2 },
    { code: "analytics", name: "विश्लेषण", description: "उपयोग आंकड़े समझने हेतु।", required: false, defaultEnabled: false, displayOrder: 3 },
    { code: "marketing", name: "विपणन", description: "प्रासंगिक विज्ञापन हेतु।", required: false, defaultEnabled: false, displayOrder: 4 },
  ];
  for (const c of cookieCats) {
    await db.cookieCategory.upsert({
      where: { code: c.code },
      update: { ...c },
      create: { ...c, categoryId: c.code, status: "active" },
    });
  }
  console.log("✓ cookie settings");

  console.log("\nSeed complete.");
  console.log("Admin login → username: superadmin / password: Admin@123 (change it in admin settings!)");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
