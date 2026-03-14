import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

type TranslationMap = Record<string, string>;

const translations: Record<Language, TranslationMap> = {
  en: {
    // Header
    "header.trackProposal": "Track Your Proposal",
    "header.learnMore": "Learn More",
    "header.trackModal.title": "Track Your Proposal",
    "header.trackModal.description":
      "Enter your Application ID or Proposal Number to track the status of your environmental clearance application.",
    "header.trackModal.label": "Application ID / Proposal Number",
    "header.trackModal.placeholder": "e.g., ENV/2024/001234",
    "header.trackModal.trackNow": "Track Now",
    "header.trackModal.cancel": "Cancel",

    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.clearances": "Clearances",
    "nav.clearances.environmental": "Environmental Clearance",
    "nav.clearances.forest": "Forest Clearance",
    "nav.clearances.wildlife": "Wildlife Clearance",
    "nav.clearances.crz": "CRZ Clearance",
    "nav.services": "Services",
    "nav.downloads": "Downloads",
    "nav.vacancies": "Vacancies",
    "nav.complaints": "Grievance Portal",
    "nav.guide": "Guide",
    "nav.contact": "Contact Us",
    "nav.login": "Login",
    "nav.language": "हिंदी",

    // Proponent Dashboard
    "proponent.welcome": "Welcome back",
    "proponent.subtitle": "Manage your environmental clearance applications",
    "proponent.sidebar.myApplications": "My Applications",
    "proponent.sidebar.newApplication": "New Application",
    "proponent.sidebar.documents": "Documents",
    "proponent.sidebar.payment": "Payment",
    "proponent.sidebar.trackStatus": "Track Status",
    "proponent.sidebar.notifications": "Notifications",
    "proponent.sidebar.logout": "Logout",
    "proponent.role": "Project Proponent",
    "proponent.applicationProcess": "Application Process",
    "proponent.activeApplications": "Active Applications",
    "proponent.fileNew": "File New Application",
    "proponent.notificationsTitle": "Notifications",
    "proponent.viewDetails": "View Details →",
    "proponent.submitted": "Submitted",
    "proponent.stage.draft": "Draft",
    "proponent.stage.submitted": "Submitted",
    "proponent.stage.scrutiny": "Under Scrutiny",
    "proponent.stage.eds": "EDS",
    "proponent.stage.referred": "Referred",
    "proponent.stage.mom": "MoM Generated",
    "proponent.stage.finalized": "Finalized",

    // Documents Page
    "documents.title": "Document Management",
    "documents.subtitle": "Upload, manage, and track all your application documents",
    "documents.upload.title": "Upload New Document",
    "documents.upload.description":
      "Drag and drop files here, or click to browse",
    "documents.upload.button": "Select Files",
    "documents.upload.formats": "Supported formats: PDF, DOC, DOCX (Max size: 10MB)",
    "documents.search": "Search documents...",
    "documents.filter.allApps": "All Applications",
    "documents.filter.allStatus": "All Status",
    "documents.filter.verified": "Verified",
    "documents.filter.pending": "Pending Review",
    "documents.filter.rejected": "Rejected",
    "documents.table.name": "Document Name",
    "documents.table.appId": "Application ID",
    "documents.table.type": "Type",
    "documents.table.size": "Size",
    "documents.table.uploadDate": "Upload Date",
    "documents.table.status": "Status",
    "documents.table.actions": "Actions",
    "documents.stats.total": "Total Documents",
    "documents.stats.verified": "Verified",
    "documents.stats.pending": "Pending Review",

    // Payment Page
    "payment.title": "Payment Management",
    "payment.subtitle": "Track and manage your application fee payments",
    "payment.stats.totalPaid": "Total Paid",
    "payment.stats.pending": "Pending",
    "payment.stats.transactions": "Transactions",
    "payment.pending.title": "Pending Payments",
    "payment.pending.amount": "Amount",
    "payment.pending.dueDate": "Due Date",
    "payment.pending.payNow": "Pay Now",
    "payment.history.title": "Payment History",
    "payment.history.paymentId": "Payment ID",
    "payment.history.application": "Application",
    "payment.history.amount": "Amount",
    "payment.history.date": "Date",
    "payment.history.method": "Method",
    "payment.history.transactionId": "Transaction ID",
    "payment.history.status": "Status",
    "payment.history.receipt": "Receipt",
    "payment.methods.title": "Accepted Payment Methods",
    "payment.methods.netBanking": "Online Banking (Net Banking)",
    "payment.methods.neft": "NEFT/RTGS Transfer",
    "payment.methods.card": "Debit/Credit Card",
    "payment.methods.upi": "UPI Payment",
    "payment.methods.dd": "Demand Draft (DD)",
    "payment.methods.challan": "Challan Payment",

    // Track Page
    "track.title": "Track Application Status",
    "track.subtitle": "Monitor the progress of your applications in real-time",
    "track.currentStage": "Current Stage",
    "track.lastUpdated": "Last Updated",
    "track.progress": "Progress",
    "track.assignedOfficer": "Assigned Officer",
    "track.lastUpdate": "Last Update",
    "track.expectedCompletion": "Expected Completion",
    "track.timeline": "Application Timeline",
    "track.viewFullDetails": "View Full Details",
    "track.respondToEDS": "Respond to EDS",
    "track.help.title": "Understanding Application Stages",
    "track.help.draft": "Application being prepared",
    "track.help.submitted": "Application received by system",
    "track.help.scrutiny": "Documents being verified",
    "track.help.eds": "Additional information required",
    "track.help.referred": "Sent to expert committee",
    "track.help.mom": "Meeting minutes prepared",
    "track.help.finalized": "Decision communicated",

    // Notifications Page
    "notifications.title": "Notifications",
    "notifications.subtitle":
      "Stay updated with your application progress and important alerts",
    "notifications.markAllRead": "Mark All as Read",
    "notifications.clearAll": "Clear All",
    "notifications.stats.total": "Total",
    "notifications.stats.unread": "Unread",
    "notifications.stats.alerts": "Alerts",
    "notifications.stats.updates": "Updates",
    "notifications.filter.all": "All",
    "notifications.filter.unread": "Unread",
    "notifications.filter.alerts": "Alerts",
    "notifications.filter.success": "Success",
    "notifications.filter.info": "Info",
    "notifications.viewDetails": "View Details",
    "notifications.markAsRead": "Mark as Read",
    "notifications.delete": "Delete",
    "notifications.application": "Application",
    "notifications.preferences.title": "Notification Preferences",
    "notifications.preferences.statusUpdates": "Application status updates",
    "notifications.preferences.paymentConfirmations": "Payment confirmations",
    "notifications.preferences.documentAlerts": "Document verification alerts",
    "notifications.preferences.meetingSchedules": "Meeting schedules",
    "notifications.preferences.edsRequests": "EDS requests",
    "notifications.preferences.systemAnnouncements": "System announcements",
    "notifications.preferences.save": "Save Preferences",
    "notifications.empty.title": "No Notifications",
    "notifications.empty.description":
      "You're all caught up! Check back later for updates.",

    // Common
    "common.status.completed": "Completed",
    "common.status.pending": "Pending",
    "common.status.inProgress": "In Progress",
    "common.status.verified": "Verified",
    "common.status.underReview": "Under Review",
  },
  hi: {
    // Header
    "header.trackProposal": "अपने प्रस्ताव को ट्रैक करें",
    "header.learnMore": "और जानें",
    "header.trackModal.title": "अपने प्रस्ताव को ट्रैक करें",
    "header.trackModal.description":
      "अपने पर्यावरण अनुमोदन वेदन की स्थिति को ट्रैक करने के लिए अपनी आवेदन आईडी या प्रस्ताव संख्या दर्ज करें।",
    "header.trackModal.label": "आवेदन आईडी / प्रस्ताव संख्या",
    "header.trackModal.placeholder": "उदा., ENV/2024/001234",
    "header.trackModal.trackNow": "अभी ट्रैक करें",
    "header.trackModal.cancel": "रद्द करें",

    // Navigation
    "nav.home": "होम",
    "nav.about": "हमारे बारे में",
    "nav.clearances": "अनुमति",
    "nav.clearances.environmental": "पर्यावरण अनुमति",
    "nav.clearances.forest": "वन अनुमति",
    "nav.clearances.wildlife": "वन्यजीव अनुमति",
    "nav.clearances.crz": "सीआरज़ेड अनुमति",
    "nav.services": "सेवाएं",
    "nav.downloads": "डाउनलोड",
    "nav.vacancies": "रिक्तियां",
    "nav.complaints": "शिकायत पोर्टल",
    "nav.guide": "गाइड",
    "nav.contact": "संपर्क करें",
    "nav.login": "लॉगिन",
    "nav.language": "English",

    // Proponent Dashboard
    "proponent.welcome": "वापसी पर स्वागत है",
    "proponent.subtitle": "अपने पर्यावरण अनुमोदन आवेदनों का प्रबंधन करें",
    "proponent.sidebar.myApplications": "मेरे आवेदन",
    "proponent.sidebar.newApplication": "नया आवेदन",
    "proponent.sidebar.documents": "दस्तावेज़",
    "proponent.sidebar.payment": "भुगतान",
    "proponent.sidebar.trackStatus": "स्थिति ट्रैक करें",
    "proponent.sidebar.notifications": "सूचनाएं",
    "proponent.sidebar.logout": "लॉगआउट",
    "proponent.role": "परियोजना प्रस्तावक",
    "proponent.applicationProcess": "आवेदन प्रक्रिया",
    "proponent.activeApplications": "सक्रिय आवेदन",
    "proponent.fileNew": "नया आवेदन फ़ाइल करें",
    "proponent.notificationsTitle": "सूचनाएं",
    "proponent.viewDetails": "विवरण देखें →",
    "proponent.submitted": "प्रस्तुत",
    "proponent.stage.draft": "प्रारूप",
    "proponent.stage.submitted": "प्रस्तुत",
    "proponent.stage.scrutiny": "जांच में",
    "proponent.stage.eds": "ईडीएस",
    "proponent.stage.referred": "संदर्भित",
    "proponent.stage.mom": "एमओएम जेनरेट",
    "proponent.stage.finalized": "अंतिम रूप",

    // Documents Page
    "documents.title": "दस्तावेज़ प्रबंधन",
    "documents.subtitle": "अपने सभी आवेदन दस्तावेज़ों को अपलोड, प्रबंधित और ट्रैक करें",
    "documents.upload.title": "नया दस्तावेज़ अपलोड करें",
    "documents.upload.description":
      "फ़ाइलों को यहां ड्रैग और ड्रॉप करें, या ब्राउज़ करने के लिए क्लिक करें",
    "documents.upload.button": "फ़ाइलें चुनें",
    "documents.upload.formats":
      "समर्थित प्रारूप: PDF, DOC, DOCX (अधिकतम आकार: 10MB)",
    "documents.search": "दस्तावेज़ खोजें...",
    "documents.filter.allApps": "सभी आवेदन",
    "documents.filter.allStatus": "सभी स्थिति",
    "documents.filter.verified": "सत्यापित",
    "documents.filter.pending": "समीक्षा लंबित",
    "documents.filter.rejected": "अस्वीकृत",
    "documents.table.name": "दस्तावेज़ नाम",
    "documents.table.appId": "आवेदन आईडी",
    "documents.table.type": "प्रकार",
    "documents.table.size": "आकार",
    "documents.table.uploadDate": "अपलोड तिथि",
    "documents.table.status": "स्थिति",
    "documents.table.actions": "कार्रवाई",
    "documents.stats.total": "कुल दस्तावेज़",
    "documents.stats.verified": "सत्यापित",
    "documents.stats.pending": "समीक्षा लंबित",

    // Payment Page
    "payment.title": "भुगतान प्रबंधन",
    "payment.subtitle": "अपने आवेदन शुल्क भुगतान को ट्रैक और प्रबंधित करें",
    "payment.stats.totalPaid": "कुल भुगतान",
    "payment.stats.pending": "लंबित",
    "payment.stats.transactions": "लेनदेन",
    "payment.pending.title": "लंबित भुगतान",
    "payment.pending.amount": "राशि",
    "payment.pending.dueDate": "नियत तारीख",
    "payment.pending.payNow": "अभी भुगतान करें",
    "payment.history.title": "भुगतान इतिहास",
    "payment.history.paymentId": "भुगतान आईडी",
    "payment.history.application": "आवेदन",
    "payment.history.amount": "राशि",
    "payment.history.date": "तिथि",
    "payment.history.method": "विधि",
    "payment.history.transactionId": "लेनदेन आईडी",
    "payment.history.status": "स्थिति",
    "payment.history.receipt": "रसीद",
    "payment.methods.title": "स्वीकृत भुगतान विधियां",
    "payment.methods.netBanking": "ऑनलाइन बैंकिंग (नेट बैंकिंग)",
    "payment.methods.neft": "एनईएफटी/आरटीजीएस स्थानांतरण",
    "payment.methods.card": "डेबिट/क्रेडिट कार्ड",
    "payment.methods.upi": "यूपीआई भुगतान",
    "payment.methods.dd": "डिमांड ड्राफ्ट (डीडी)",
    "payment.methods.challan": "चालान भुगतान",

    // Track Page
    "track.title": "आवेदन स्थिति ट्रैक करें",
    "track.subtitle": "अपने आवेदनों की प्रगति को वास्तविक समय में मॉनिटर करें",
    "track.currentStage": "वर्तमान चरण",
    "track.lastUpdated": "अंतिम अपडेट",
    "track.progress": "प्रगति",
    "track.assignedOfficer": "नियुक्त अधिकारी",
    "track.lastUpdate": "अंतिम अपडेट",
    "track.expectedCompletion": "अपेक्षित पूर्णता",
    "track.timeline": "आवेदन समयरेखा",
    "track.viewFullDetails": "पूरा विवरण देखें",
    "track.respondToEDS": "ईडीएस का जवाब दें",
    "track.help.title": "आवेदन चरणों को समझना",
    "track.help.draft": "आवेदन तैयार किया जा रहा है",
    "track.help.submitted": "आवेदन सिस्टम द्वारा प्राप्त",
    "track.help.scrutiny": "दस्तावेज़ सत्यापित किए जा रहे हैं",
    "track.help.eds": "अतिरिक्त जानकारी आवश्यक",
    "track.help.referred": "विशेषज्ञ समिति को भेजा गया",
    "track.help.mom": "बैठक कार्यवृत्त तैयार",
    "track.help.finalized": "निर्णय सूचित किया गया",

    // Notifications Page
    "notifications.title": "सूचनाएं",
    "notifications.subtitle":
      "अपने आवेदन की प्रगति और महत्वपूर्ण अलर्ट के साथ अपडेट रहें",
    "notifications.markAllRead": "सभी को पढ़ा हुआ चिह्नित करें",
    "notifications.clearAll": "सभी साफ़ करें",
    "notifications.stats.total": "कुल",
    "notifications.stats.unread": "अपठित",
    "notifications.stats.alerts": "अलर्ट",
    "notifications.stats.updates": "अपडेट",
    "notifications.filter.all": "सभी",
    "notifications.filter.unread": "अपठित",
    "notifications.filter.alerts": "अलर्ट",
    "notifications.filter.success": "सफलता",
    "notifications.filter.info": "जानकारी",
    "notifications.viewDetails": "विवरण देखें",
    "notifications.markAsRead": "पढ़ा हुआ चिह्नित करें",
    "notifications.delete": "हटाएं",
    "notifications.application": "आवेदन",
    "notifications.preferences.title": "सूचना प्राथमिकताएं",
    "notifications.preferences.statusUpdates": "आवेदन स्थिति अपडेट",
    "notifications.preferences.paymentConfirmations": "भुगतान पुष्टि",
    "notifications.preferences.documentAlerts": "दस्तावेज़ सत्यापन अलर्ट",
    "notifications.preferences.meetingSchedules": "बैठक अनुसूची",
    "notifications.preferences.edsRequests": "ईडीएस अनुरोध",
    "notifications.preferences.systemAnnouncements": "सिस्टम घोषणाएं",
    "notifications.preferences.save": "प्राथमिकताएं सहेजें",
    "notifications.empty.title": "कोई सूचना नहीं",
    "notifications.empty.description":
      "आप सभी को देख चुके हैं! अपडेट के लिए बाद में वापस देखें।",

    // Common
    "common.status.completed": "पूर्ण",
    "common.status.pending": "लंबित",
    "common.status.inProgress": "प्रगति में",
    "common.status.verified": "सत्यापित",
    "common.status.underReview": "समीक्षा में",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}