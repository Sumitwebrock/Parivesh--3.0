export type ComplaintStatus = "submitted" | "under-review" | "resolved" | "closed";
export type ComplaintCategory =
  | "delay"
  | "technical"
  | "documentation"
  | "transparency"
  | "corruption"
  | "other";
export type ComplaintPriority = "low" | "medium" | "high" | "urgent";

export interface ComplaintRecord {
  id: string;
  title: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  description: string;
  date: string;
  responseTime: string;
  respondedBy?: string;
  response?: string;
  applicationType?: string;
  applicationId?: string;
  attachments?: number;
  complainantName: string;
  complainantEmail: string;
  complainantPhone?: string;
  assignedTo?: string;
}

export interface NewComplaintPayload {
  title: string;
  category: ComplaintCategory;
  description: string;
  applicationId?: string;
  applicationType?: string;
  attachments?: number;
  complainantName: string;
  complainantEmail: string;
  complainantPhone?: string;
}

export interface ComplaintEmailDraft {
  subject: string;
  body: string;
}

const STORAGE_KEY = "parivesh_complaints";

const defaultComplaints: ComplaintRecord[] = [
  {
    id: "CMP-2026-001245",
    title: "Excessive delay in environmental clearance processing",
    category: "delay",
    status: "under-review",
    priority: "high",
    description:
      "My application EC/2025/4589 has been pending for over 60 days without any update. The stipulated time frame has passed.",
    date: "2026-03-05",
    responseTime: "2 days",
    applicationId: "EC/2025/4589",
    applicationType: "Environmental Clearance",
    attachments: 3,
    complainantName: "Rajesh Kumar",
    complainantEmail: "rajesh.kumar@example.com",
    complainantPhone: "+91 98765 43210",
    assignedTo: "Priya Sharma (Scrutiny Team)",
  },
  {
    id: "CMP-2026-001244",
    title: "Technical issue in document upload portal",
    category: "technical",
    status: "resolved",
    priority: "urgent",
    description:
      "Unable to upload EIA report due to repeated server errors. Multiple attempts failed.",
    date: "2026-03-03",
    responseTime: "1 day",
    response:
      "The technical issue has been resolved. The upload portal is now functioning properly. Please try uploading your documents again.",
    respondedBy: "Technical Support Team",
    attachments: 2,
    complainantName: "Anjali Mehta",
    complainantEmail: "anjali.mehta@example.com",
    assignedTo: "Tech Support",
  },
  {
    id: "CMP-2026-001243",
    title: "Incomplete information on required documentation",
    category: "documentation",
    status: "resolved",
    priority: "medium",
    description:
      "The guidelines for wildlife clearance do not specify the exact format for biodiversity assessment report.",
    date: "2026-02-28",
    responseTime: "3 days",
    response:
      "Updated guidelines with detailed format specifications have been published. Please refer to the Downloads section.",
    respondedBy: "Documentation Team",
    complainantName: "Suresh Patel",
    complainantEmail: "suresh.patel@example.com",
  },
  {
    id: "CMP-2026-001242",
    title: "Request for public hearing information",
    category: "transparency",
    status: "under-review",
    priority: "medium",
    description:
      "Public hearing schedule for project FC/2025/3421 has not been published on the portal.",
    date: "2026-02-25",
    responseTime: "5 days",
    applicationId: "FC/2025/3421",
    applicationType: "Forest Clearance",
    attachments: 1,
    complainantName: "Kavita Singh",
    complainantEmail: "kavita.singh@example.com",
    assignedTo: "MoM Team Lead",
  },
  {
    id: "CMP-2026-001241",
    title: "Alleged corruption in clearance approval",
    category: "corruption",
    status: "submitted",
    priority: "urgent",
    description:
      "I have evidence of bribery demand by an official for expediting my forest clearance application.",
    date: "2026-02-20",
    responseTime: "Pending",
    applicationId: "FC/2025/3876",
    applicationType: "Forest Clearance",
    complainantName: "Anonymous",
    complainantEmail: "whistleblower@secure.com",
    attachments: 5,
  },
  {
    id: "CMP-2026-001240",
    title: "Discrepancy in scrutiny team feedback",
    category: "other",
    status: "submitted",
    priority: "low",
    description:
      "Received contradictory feedback from two different scrutiny officers on the same application.",
    date: "2026-02-18",
    responseTime: "Pending",
    applicationId: "EC/2025/3210",
    applicationType: "Environmental Clearance",
    complainantName: "Deepak Verma",
    complainantEmail: "deepak.verma@example.com",
    complainantPhone: "+91 98234 56789",
  },
];

function hasWindow() {
  return typeof window !== "undefined";
}

function saveComplaints(complaints: ComplaintRecord[]) {
  if (!hasWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

function nextComplaintId(existing: ComplaintRecord[]) {
  const max = existing.reduce((highest, complaint) => {
    const match = complaint.id.match(/(\d+)$/);
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 0);
  return `CMP-${new Date().getFullYear()}-${String(max + 1).padStart(6, "0")}`;
}

export function getComplaints(): ComplaintRecord[] {
  if (!hasWindow()) return defaultComplaints;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveComplaints(defaultComplaints);
    return defaultComplaints;
  }

  try {
    const parsed = JSON.parse(raw) as ComplaintRecord[];
    if (!Array.isArray(parsed)) throw new Error("Invalid complaint payload");
    return parsed;
  } catch {
    saveComplaints(defaultComplaints);
    return defaultComplaints;
  }
}

export function submitComplaint(payload: NewComplaintPayload): ComplaintRecord {
  const complaints = getComplaints();
  const complaint: ComplaintRecord = {
    id: nextComplaintId(complaints),
    title: payload.title.trim(),
    category: payload.category,
    status: "submitted",
    priority: payload.category === "corruption" ? "urgent" : payload.category === "delay" ? "high" : "medium",
    description: payload.description.trim(),
    date: new Date().toISOString().slice(0, 10),
    responseTime: "Pending",
    applicationId: payload.applicationId?.trim() || undefined,
    applicationType: payload.applicationType?.trim() || undefined,
    attachments: payload.attachments || undefined,
    complainantName: payload.complainantName.trim(),
    complainantEmail: payload.complainantEmail.trim(),
    complainantPhone: payload.complainantPhone?.trim() || undefined,
  };

  const updated = [complaint, ...complaints];
  saveComplaints(updated);
  return complaint;
}

export function updateComplaint(id: string, updates: Partial<ComplaintRecord>): ComplaintRecord[] {
  const complaints = getComplaints().map((complaint) => {
    if (complaint.id !== id) return complaint;
    const nextStatus = updates.status ?? complaint.status;
    return {
      ...complaint,
      ...updates,
      responseTime:
        nextStatus === "submitted"
          ? "Pending"
          : complaint.responseTime === "Pending"
            ? "Updated just now"
            : complaint.responseTime,
    };
  });
  saveComplaints(complaints);
  return complaints;
}

function labelForStatus(status: ComplaintStatus) {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "under-review":
      return "Under Review";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
  }
}

function labelForCategory(category: ComplaintCategory) {
  switch (category) {
    case "delay":
      return "Processing Delay";
    case "technical":
      return "Technical Issue";
    case "documentation":
      return "Documentation";
    case "transparency":
      return "Transparency";
    case "corruption":
      return "Corruption / Misconduct";
    case "other":
      return "Other";
  }
}

export function generateComplaintEmailDraft(
  complaint: ComplaintRecord,
  overrides?: Partial<ComplaintRecord>
): ComplaintEmailDraft {
  const merged = { ...complaint, ...overrides };
  const subject = `PARIVESH Complaint Update: ${merged.id} - ${merged.title}`;
  const statusLine = labelForStatus(merged.status);
  const categoryLine = labelForCategory(merged.category);
  const assignmentLine = merged.assignedTo ? `This complaint is currently assigned to ${merged.assignedTo}.` : "Our grievance team is reviewing the matter.";
  const customResponse = String(merged.response || "").trim();
  const body = [
    `Dear ${merged.complainantName},`,
    "",
    `This is an official update regarding your complaint ${merged.id} submitted on ${merged.date}.`,
    `Subject: ${merged.title}`,
    `Category: ${categoryLine}`,
    `Current Status: ${statusLine}`,
    merged.applicationId ? `Related Application ID: ${merged.applicationId}` : "",
    "",
    customResponse || `We acknowledge your grievance and have reviewed the details shared for \"${merged.title}\". ${assignmentLine}`,
    "",
    merged.status === "resolved"
      ? "The matter has been marked as resolved in our records. If you still need assistance, please reply to this email with any supporting details."
      : merged.status === "closed"
        ? "This complaint has been closed in our records. If you believe further review is required, please submit additional supporting details."
        : "Our team will continue reviewing your complaint and will share the next update as soon as available.",
    "",
    "Regards,",
    "PARIVESH Grievance Redressal Team",
    "Ministry of Environment, Forest and Climate Change",
  ].filter(Boolean).join("\n");

  return { subject, body };
}

export function buildComplaintGmailComposeUrl(
  complaint: ComplaintRecord,
  overrides?: Partial<ComplaintRecord>
) {
  const draft = generateComplaintEmailDraft(complaint, overrides);
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: complaint.complainantEmail,
    su: draft.subject,
    body: draft.body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}