export type FieldType = "text" | "textarea" | "number" | "date" | "url" | "boolean" | "select";

export type HtmlComponent = "H1" | "H2" | "H3" | "P" | "Card" | "Table" | "Section" | "List" | "Button" | "Badge" | "InfoRow";

export type JobSection = "basic" | "dates" | "vacancy" | "qualification" | "experience" | "age" | "salary" | "fee" | "eligibility" | "description" | "private" | "government" | "application" | "links" | "contact" | "content" | "media" | "system";

export interface UniversalField {
  key: string;
  labelHi: string;
  labelEn: string;
  type: FieldType;
  section: JobSection;
  htmlComponent: HtmlComponent;
  jobProperty?: string;
  blockType?: string;
  blockDataKey?: string;
  seoSource?: boolean;
  required?: boolean;
  options?: string[];
}

export const UNIVERSAL_FIELD_MASTER: UniversalField[] = [  { key: "physical_eligibility", labelHi: "शारीरिक पात्रता", labelEn: "Physical Eligibility", type: "text", section: "eligibility", htmlComponent: "P", blockType: "eligibility", blockDataKey: "items" },
  { key: "medical_eligibility", labelHi: "चिकित्सा पात्रता", labelEn: "Medical Eligibility", type: "text", section: "eligibility", htmlComponent: "P", blockType: "eligibility", blockDataKey: "items" },
  { key: "other_eligibility", labelHi: "अन्य पात्रता", labelEn: "Other Eligibility", type: "text", section: "eligibility", htmlComponent: "P", blockType: "eligibility", blockDataKey: "items" },
  { key: "job_overview", labelHi: "नौकरी अवलोकन", labelEn: "Job Overview", type: "textarea", section: "description", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text", seoSource: true },
  { key: "job_description", labelHi: "नौकरी विवरण", labelEn: "Job Description", type: "textarea", section: "description", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text", seoSource: true },
  { key: "about_organization", labelHi: "संस्थान के बारे में", labelEn: "About Organization", type: "textarea", section: "description", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "about_company", labelHi: "कंपनी के बारे में", labelEn: "About Company", type: "textarea", section: "description", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "about_department", labelHi: "विभाग के बारे में", labelEn: "About Department", type: "textarea", section: "description", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "roles_and_responsibilities", labelHi: "भूमिकाएं और जिम्मेदारियां", labelEn: "Roles And Responsibilities", type: "textarea", section: "description", htmlComponent: "List", blockType: "bullet-list", blockDataKey: "items" },
  { key: "job_responsibilities", labelHi: "नौकरी की जिम्मेदारियां", labelEn: "Job Responsibilities", type: "textarea", section: "description", htmlComponent: "List", blockType: "bullet-list", blockDataKey: "items" },
  { key: "key_responsibilities", labelHi: "मुख्य जिम्मेदारियां", labelEn: "Key Responsibilities", type: "textarea", section: "description", htmlComponent: "List", blockType: "bullet-list", blockDataKey: "items" },
  { key: "key_duties", labelHi: "मुख्य कार्य", labelEn: "Key Duties", type: "textarea", section: "description", htmlComponent: "List", blockType: "bullet-list", blockDataKey: "items" },
  { key: "required_skills", labelHi: "आवश्यक कौशल", labelEn: "Required Skills", type: "textarea", section: "description", htmlComponent: "List", blockType: "bullet-list", blockDataKey: "items", seoSource: true },
  { key: "technical_skills", labelHi: "तकनीकी कौशल", labelEn: "Technical Skills", type: "textarea", section: "description", htmlComponent: "List", blockType: "bullet-list", blockDataKey: "items" },
  { key: "soft_skills", labelHi: "सॉफ्ट स्किल्स", labelEn: "Soft Skills", type: "textarea", section: "description", htmlComponent: "List", blockType: "bullet-list", blockDataKey: "items" },
  { key: "preferred_skills", labelHi: "पसंदीदा कौशल", labelEn: "Preferred Skills", type: "textarea", section: "description", htmlComponent: "List", blockType: "bullet-list", blockDataKey: "items" },
  { key: "candidate_profile", labelHi: "उम्मीदवार प्रोफाइल", labelEn: "Candidate Profile", type: "textarea", section: "description", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "job_requirements", labelHi: "नौकरी की आवश्यकताएं", labelEn: "Job Requirements", type: "textarea", section: "description", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "knowledge_required", labelHi: "आवश्यक ज्ञान", labelEn: "Knowledge Required", type: "textarea", section: "description", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "tools_and_technologies", labelHi: "टूल्स और टेक्नोलॉजी", labelEn: "Tools And Technologies", type: "textarea", section: "description", htmlComponent: "List", blockType: "bullet-list", blockDataKey: "items" },
  { key: "certifications_required", labelHi: "आवश्यक प्रमाणपत्र", labelEn: "Certifications Required", type: "textarea", section: "description", htmlComponent: "List", blockType: "bullet-list", blockDataKey: "items" },
  { key: "designation", labelHi: "पद", labelEn: "Designation", type: "text", section: "private", htmlComponent: "H3" },
  { key: "reporting_to", labelHi: "रिपोर्टिंग टू", labelEn: "Reporting To", type: "text", section: "private", htmlComponent: "P" },
  { key: "team", labelHi: "टीम", labelEn: "Team", type: "text", section: "private", htmlComponent: "P" },
  { key: "probation_period", labelHi: "परख काल", labelEn: "Probation Period", type: "text", section: "private", htmlComponent: "P" },
  { key: "notice_period", labelHi: "नोटिस पीरियड", labelEn: "Notice Period", type: "text", section: "private", htmlComponent: "P" },
  { key: "working_hours", labelHi: "कार्य समय", labelEn: "Working Hours", type: "text", section: "private", htmlComponent: "P" },
  { key: "shift", labelHi: "शिफ्ट", labelEn: "Shift", type: "text", section: "private", htmlComponent: "P" },
  { key: "travel_requirement", labelHi: "यात्रा आवश्यकता", labelEn: "Travel Requirement", type: "text", section: "private", htmlComponent: "P" },
  { key: "remote_work", labelHi: "रिमोट काम", labelEn: "Remote Work", type: "select", section: "private", htmlComponent: "Badge", options: ["Yes", "No"] },
  { key: "hybrid_work", labelHi: "हाइब्रिड काम", labelEn: "Hybrid Work", type: "select", section: "private", htmlComponent: "Badge", options: ["Yes", "No"] },
  { key: "office_work", labelHi: "ऑफिस काम", labelEn: "Office Work", type: "select", section: "private", htmlComponent: "Badge", options: ["Yes", "No"] },
  { key: "employee_benefits", labelHi: "कर्मचारी लाभ", labelEn: "Employee Benefits", type: "textarea", section: "private", htmlComponent: "List", blockType: "bullet-list", blockDataKey: "items" },
  { key: "career_growth", labelHi: "कैरियर ग्रोथ", labelEn: "Career Growth", type: "textarea", section: "private", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "training", labelHi: "प्रशिक्षण", labelEn: "Training", type: "textarea", section: "private", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "performance_incentive", labelHi: "परफॉर्मेंस इंसेंटिव", labelEn: "Performance Incentive", type: "text", section: "private", htmlComponent: "P" },
  { key: "joining_process", labelHi: "जोइनिंग प्रक्रिया", labelEn: "Joining Process", type: "textarea", section: "private", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "interview_process", labelHi: "इंटरव्यू प्रक्रिया", labelEn: "Interview Process", type: "textarea", section: "private", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "recruitment_authority", labelHi: "भर्ती प्राधिकरण", labelEn: "Recruitment Authority", type: "text", section: "government", htmlComponent: "P" },
  { key: "recruitment_board", labelHi: "भर्ती बोर्ड", labelEn: "Recruitment Board", type: "text", section: "government", htmlComponent: "P" },
  { key: "exam_name", labelHi: "परीक्षा का नाम", labelEn: "Exam Name", type: "text", section: "government", htmlComponent: "P" },
  { key: "exam_type", labelHi: "परीक्षा का प्रकार", labelEn: "Exam Type", type: "text", section: "government", htmlComponent: "P" },
  { key: "exam_mode", labelHi: "परीक्षा मोड", labelEn: "Exam Mode", type: "text", section: "government", htmlComponent: "P" },
  { key: "exam_pattern", labelHi: "परीक्षा पैटर्न", labelEn: "Exam Pattern", type: "textarea", section: "government", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "syllabus", labelHi: "पाठ्यक्रम", labelEn: "Syllabus", type: "textarea", section: "government", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "selection_process", labelHi: "चयन प्रक्रिया", labelEn: "Selection Process", type: "textarea", section: "government", htmlComponent: "Section", blockType: "selection-process", blockDataKey: "steps", seoSource: true },
  { key: "selection_stages", labelHi: "चयन स्टेज", labelEn: "Selection Stages", type: "textarea", section: "government", htmlComponent: "List", blockType: "numbered-list", blockDataKey: "items" },
  { key: "written_examination", labelHi: "लिखित परीक्षा", labelEn: "Written Examination", type: "text", section: "government", htmlComponent: "P" },
  { key: "computer_based_test", labelHi: "कंप्यूटर बेस्ड टेस्ट", labelEn: "Computer Based Test", type: "text", section: "government", htmlComponent: "P" },
  { key: "skill_test", labelHi: "स्किल टेस्ट", labelEn: "Skill Test", type: "text", section: "government", htmlComponent: "P" },
  { key: "typing_test", labelHi: "टाइपिंग टेस्ट", labelEn: "Typing Test", type: "text", section: "government", htmlComponent: "P" },
  { key: "physical_test", labelHi: "शारीरिक परीक्षा", labelEn: "Physical Test", type: "text", section: "government", htmlComponent: "P" },
  { key: "physical_standard_test", labelHi: "शारीरिक मानक परीक्षा", labelEn: "Physical Standard Test", type: "text", section: "government", htmlComponent: "P" },
  { key: "interview", labelHi: "इंटरव्यू", labelEn: "Interview", type: "text", section: "government", htmlComponent: "P" },
  { key: "document_verification", labelHi: "दस्तावेज सत्यापन", labelEn: "Document Verification", type: "text", section: "government", htmlComponent: "P" },
  { key: "medical_examination", labelHi: "चिकित्सा परीक्षा", labelEn: "Medical Examination", type: "text", section: "government", htmlComponent: "P" },
  { key: "application_mode", labelHi: "आवेदन मोड", labelEn: "Application Mode", type: "text", section: "application", htmlComponent: "P" },
  { key: "how_to_apply", labelHi: "आवेदन कैसे करें", labelEn: "How To Apply", type: "textarea", section: "application", htmlComponent: "Section", blockType: "how-to-apply", blockDataKey: "text" },
  { key: "registration_process", labelHi: "पंजीकरण प्रक्रिया", labelEn: "Registration Process", type: "textarea", section: "application", htmlComponent: "Section", blockType: "how-to-apply", blockDataKey: "text" },
  { key: "application_process", labelHi: "आवेदन प्रक्रिया", labelEn: "Application Process", type: "textarea", section: "application", htmlComponent: "Section", blockType: "how-to-apply", blockDataKey: "text" },
  { key: "documents_required", labelHi: "आवश्यक दस्तावेज", labelEn: "Documents Required", type: "textarea", section: "application", htmlComponent: "List", blockType: "documents-required", blockDataKey: "text" },
  { key: "photo_requirement", labelHi: "फोटो आवश्यकता", labelEn: "Photo Requirement", type: "text", section: "application", htmlComponent: "P" },
  { key: "signature_requirement", labelHi: "हस्ताक्षर आवश्यकता", labelEn: "Signature Requirement", type: "text", section: "application", htmlComponent: "P" },
  { key: "application_instructions", labelHi: "आवेदन निर्देश", labelEn: "Application Instructions", type: "textarea", section: "application", htmlComponent: "Section", blockType: "how-to-apply", blockDataKey: "text" },
  { key: "important_instructions", labelHi: "महत्वपूर्ण निर्देश", labelEn: "Important Instructions", type: "textarea", section: "application", htmlComponent: "Section", blockType: "important-instructions", blockDataKey: "text" },
  { key: "form_filling_instructions", labelHi: "फॉर्म भरने के निर्देश", labelEn: "Form Filling Instructions", type: "textarea", section: "application", htmlComponent: "Section", blockType: "how-to-apply", blockDataKey: "text" },
  { key: "apply_online_url", labelHi: "ऑनलाइन आवेदन URL", labelEn: "Apply Online URL", type: "url", section: "links", htmlComponent: "Button", jobProperty: "applyUrl", blockType: "important-links", blockDataKey: "links" },
  { key: "official_notification_url", labelHi: "अधिसूचना URL", labelEn: "Official Notification URL", type: "url", section: "links", htmlComponent: "Button", jobProperty: "notificationUrl", blockType: "important-links", blockDataKey: "links" },
  { key: "official_website_url", labelHi: "आधिकारिक वेबसाइट URL", labelEn: "Official Website URL", type: "url", section: "links", htmlComponent: "Button", blockType: "important-links", blockDataKey: "links" },
  { key: "admit_card_url", labelHi: "एडमिट कार्ड URL", labelEn: "Admit Card URL", type: "url", section: "links", htmlComponent: "Button", blockType: "important-links", blockDataKey: "links" },
  { key: "result_url", labelHi: "परिणाम URL", labelEn: "Result URL", type: "url", section: "links", htmlComponent: "Button", blockType: "important-links", blockDataKey: "links" },
  { key: "answer_key_url", labelHi: "उत्तर कुंजी URL", labelEn: "Answer Key URL", type: "url", section: "links", htmlComponent: "Button", blockType: "important-links", blockDataKey: "links" },
  { key: "syllabus_url", labelHi: "पाठ्यक्रम URL", labelEn: "Syllabus URL", type: "url", section: "links", htmlComponent: "Button", blockType: "important-links", blockDataKey: "links" },
  { key: "correction_url", labelHi: "सुधार URL", labelEn: "Correction URL", type: "url", section: "links", htmlComponent: "Button", blockType: "important-links", blockDataKey: "links" },
  { key: "interview_letter_url", labelHi: "इंटरव्यू लेटर URL", labelEn: "Interview Letter URL", type: "url", section: "links", htmlComponent: "Button", blockType: "important-links", blockDataKey: "links" },
  { key: "selection_list_url", labelHi: "चयन सूची URL", labelEn: "Selection List URL", type: "url", section: "links", htmlComponent: "Button", blockType: "important-links", blockDataKey: "links" },
  { key: "other_official_url", labelHi: "अन्य आधिकारिक URL", labelEn: "Other Official URL", type: "url", section: "links", htmlComponent: "Button", blockType: "important-links", blockDataKey: "links" },
  { key: "contact_name", labelHi: "संपर्क नाम", labelEn: "Contact Name", type: "text", section: "contact", htmlComponent: "P" },
  { key: "contact_person", labelHi: "संपर्क व्यक्ति", labelEn: "Contact Person", type: "text", section: "contact", htmlComponent: "P" },
  { key: "contact_email", labelHi: "संपर्क ईमेल", labelEn: "Contact Email", type: "text", section: "contact", htmlComponent: "P" },
  { key: "contact_phone", labelHi: "संपर्क फोन", labelEn: "Contact Phone", type: "text", section: "contact", htmlComponent: "P" },
  { key: "helpline_number", labelHi: "हेल्पलाइन नंबर", labelEn: "Helpline Number", type: "text", section: "contact", htmlComponent: "P" },
  { key: "official_email", labelHi: "आधिकारिक ईमेल", labelEn: "Official Email", type: "text", section: "contact", htmlComponent: "P" },
  { key: "official_phone", labelHi: "आधिकारिक फोन", labelEn: "Official Phone", type: "text", section: "contact", htmlComponent: "P" },
  { key: "office_address", labelHi: "कार्यालय पता", labelEn: "Office Address", type: "text", section: "contact", htmlComponent: "P" },
  { key: "important_information", labelHi: "महत्वपूर्ण जानकारी", labelEn: "Important Information", type: "textarea", section: "content", htmlComponent: "Section", blockType: "important-instructions", blockDataKey: "text" },
  { key: "important_note", labelHi: "महत्वपूर्ण नोट", labelEn: "Important Note", type: "textarea", section: "content", htmlComponent: "Section", blockType: "important-instructions", blockDataKey: "text" },
  { key: "disclaimer", labelHi: "डिस्क्लेमर", labelEn: "Disclaimer", type: "textarea", section: "content", htmlComponent: "Section", blockType: "important-instructions", blockDataKey: "text" },
  { key: "terms", labelHi: "नियम", labelEn: "Terms", type: "textarea", section: "content", htmlComponent: "Section", blockType: "important-instructions", blockDataKey: "text" },
  { key: "additional_information", labelHi: "अतिरिक्त जानकारी", labelEn: "Additional Information", type: "textarea", section: "content", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "other_information", labelHi: "अन्य जानकारी", labelEn: "Other Information", type: "textarea", section: "content", htmlComponent: "Section", blockType: "paragraph", blockDataKey: "text" },
  { key: "frequently_asked_questions", labelHi: "अक्सर पूछे जाने वाले प्रश्न", labelEn: "Frequently Asked Questions", type: "textarea", section: "content", htmlComponent: "Section", blockType: "faq", blockDataKey: "items" },
  { key: "faq_1", labelHi: "FAQ 1", labelEn: "FAQ 1", type: "textarea", section: "content", htmlComponent: "Section", blockType: "faq", blockDataKey: "items" },
  { key: "faq_2", labelHi: "FAQ 2", labelEn: "FAQ 2", type: "textarea", section: "content", htmlComponent: "Section", blockType: "faq", blockDataKey: "items" },
  { key: "faq_3", labelHi: "FAQ 3", labelEn: "FAQ 3", type: "textarea", section: "content", htmlComponent: "Section", blockType: "faq", blockDataKey: "items" },
  { key: "faq_4", labelHi: "FAQ 4", labelEn: "FAQ 4", type: "textarea", section: "content", htmlComponent: "Section", blockType: "faq", blockDataKey: "items" },
  { key: "faq_5", labelHi: "FAQ 5", labelEn: "FAQ 5", type: "textarea", section: "content", htmlComponent: "Section", blockType: "faq", blockDataKey: "items" },
  { key: "featured_image_url", labelHi: "फीचर्ड इमेज URL", labelEn: "Featured Image URL", type: "url", section: "media", htmlComponent: "Button" },
  { key: "organization_logo_url", labelHi: "संस्थान लोगो URL", labelEn: "Organization Logo URL", type: "url", section: "media", htmlComponent: "Button" },
  { key: "job_banner_url", labelHi: "जॉब बैनर URL", labelEn: "Job Banner URL", type: "url", section: "media", htmlComponent: "Button" },
  { key: "video_url", labelHi: "वीडियो URL", labelEn: "Video URL", type: "url", section: "media", htmlComponent: "Button" },
];

export const getFieldByKey = (key: string): UniversalField | undefined =>
  UNIVERSAL_FIELD_MASTER.find((f) => f.key === key);

export const getFieldsBySection = (section: JobSection): UniversalField[] =>
  UNIVERSAL_FIELD_MASTER.filter((f) => f.section === section);

export const getSections = (): JobSection[] =>
  Array.from(new Set(UNIVERSAL_FIELD_MASTER.map((f) => f.section)));
