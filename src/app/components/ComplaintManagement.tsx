import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  FileText,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Send,
  X,
  Eye,
  Download,
  Calendar,
  Tag,
  ArrowRight,
  User,
  AlertTriangle,
  CheckCheck,
  XCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

type ComplaintStatus = "submitted" | "under-review" | "resolved" | "closed";
type ComplaintCategory =
  | "delay"
  | "technical"
  | "documentation"
  | "transparency"
  | "corruption"
  | "other";
type ComplaintPriority = "low" | "medium" | "high" | "urgent";

interface Complaint {
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

export function ComplaintManagement() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );

  // Mock complaints data with admin fields
  const complaints: Complaint[] = [
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

  const stats = [
    {
      label: "Total Complaints",
      value: complaints.length,
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Pending",
      value: complaints.filter((c) => c.status === "submitted").length,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Under Review",
      value: complaints.filter((c) => c.status === "under-review").length,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Resolved",
      value: complaints.filter((c) => c.status === "resolved").length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "delay", label: "Processing Delay" },
    { value: "technical", label: "Technical Issues" },
    { value: "documentation", label: "Documentation" },
    { value: "transparency", label: "Transparency" },
    { value: "corruption", label: "Corruption/Misconduct" },
    { value: "other", label: "Other" },
  ];

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case "submitted":
        return "bg-red-100 text-red-700 border-red-200";
      case "under-review":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority: ComplaintPriority) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200";
    }
  };

  const getCategoryIcon = (category: ComplaintCategory) => {
    switch (category) {
      case "delay":
        return <Clock className="w-4 h-4" />;
      case "technical":
        return <AlertCircle className="w-4 h-4" />;
      case "documentation":
        return <FileText className="w-4 h-4" />;
      case "transparency":
        return <Eye className="w-4 h-4" />;
      case "corruption":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const categoryMatch =
      selectedCategory === "all" || complaint.category === selectedCategory;
    const statusMatch =
      selectedStatus === "all" || complaint.status === selectedStatus;
    const priorityMatch =
      selectedPriority === "all" || complaint.priority === selectedPriority;
    const searchMatch =
      searchQuery === "" ||
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.complainantName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return categoryMatch && statusMatch && priorityMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search complaints..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredComplaints.map((complaint, index) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={getStatusColor(complaint.status)}
                        >
                          {complaint.status.replace("-", " ").toUpperCase()}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(complaint.priority)}
                        >
                          {complaint.priority.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {getCategoryIcon(complaint.category)}
                          <span className="capitalize">
                            {complaint.category}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-[#003087] transition-colors">
                        {complaint.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {complaint.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {complaint.id}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {complaint.complainantName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(complaint.date).toLocaleDateString("en-IN")}
                        </div>
                        {complaint.assignedTo && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            Assigned: {complaint.assignedTo}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col gap-2">
                      <div className="text-sm text-gray-500">Response Time</div>
                      <div
                        className={`text-lg font-semibold ${
                          complaint.responseTime === "Pending"
                            ? "text-red-600"
                            : "text-[#003087]"
                        }`}
                      >
                        {complaint.responseTime}
                      </div>
                      <Dialog>
                        <DialogTrigger>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedComplaint(complaint)}
                          >
                            Manage
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <AdminComplaintDetails complaint={complaint} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredComplaints.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No complaints found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or search criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function AdminComplaintDetails({ complaint }: { complaint: Complaint }) {
  const [status, setStatus] = useState(complaint.status);
  const [priority, setPriority] = useState(complaint.priority);
  const [response, setResponse] = useState(complaint.response || "");
  const [assignedTo, setAssignedTo] = useState(complaint.assignedTo || "");

  const handleUpdateStatus = () => {
    // Handle status update
    console.log("Updating status to:", status);
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={
                status === "resolved"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : status === "under-review"
                  ? "bg-orange-100 text-orange-700 border-orange-200"
                  : "bg-red-100 text-red-700 border-red-200"
              }
            >
              {status.replace("-", " ").toUpperCase()}
            </Badge>
            <Badge
              variant="outline"
              className={
                priority === "urgent"
                  ? "bg-red-100 text-red-700 border-red-200"
                  : priority === "high"
                  ? "bg-orange-100 text-orange-700 border-orange-200"
                  : priority === "medium"
                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                  : "bg-blue-100 text-blue-700 border-blue-200"
              }
            >
              {priority.toUpperCase()} PRIORITY
            </Badge>
          </div>
          <span className="text-sm text-gray-500">{complaint.id}</span>
        </div>
        <DialogTitle className="text-2xl">{complaint.title}</DialogTitle>
        <DialogDescription>
          Filed on {new Date(complaint.date).toLocaleDateString("en-IN")}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Complaint Details */}
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-gray-700">
              Complainant Information
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium">
                  {complaint.complainantName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">
                  {complaint.complainantEmail}
                </span>
              </div>
              {complaint.complainantPhone && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm font-medium">
                    {complaint.complainantPhone}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-gray-700">
              Complaint Details
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">{complaint.description}</p>
            </div>
          </div>

          {complaint.applicationId && (
            <div>
              <h4 className="font-semibold mb-2 text-gray-700">
                Related Application
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Application ID:</span>
                  <span className="text-sm font-medium">
                    {complaint.applicationId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium">
                    {complaint.applicationType}
                  </span>
                </div>
              </div>
            </div>
          )}

          {complaint.attachments && (
            <div>
              <h4 className="font-semibold mb-2 text-gray-700">Attachments</h4>
              <div className="space-y-2">
                {[...Array(complaint.attachments)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Evidence_{i + 1}.pdf</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Admin Actions */}
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-gray-700">
              Update Complaint Status
            </h4>
            <div className="space-y-3">
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assign To</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scrutiny-1">
                      Priya Sharma (Scrutiny)
                    </SelectItem>
                    <SelectItem value="scrutiny-2">
                      Amit Patel (Scrutiny)
                    </SelectItem>
                    <SelectItem value="mom-1">Kavita Singh (MoM)</SelectItem>
                    <SelectItem value="tech-1">
                      Tech Support Team
                    </SelectItem>
                    <SelectItem value="admin-1">Admin Team Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-gray-700">
              Official Response
            </h4>
            <Textarea
              placeholder="Enter your official response to this complaint..."
              rows={6}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="mb-3"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-[#1A5C1A] hover:bg-[#145014]"
                onClick={handleUpdateStatus}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Save & Send Response
              </Button>
            </div>
          </div>

          {complaint.response && (
            <div>
              <h4 className="font-semibold mb-2 text-green-700">
                Previous Response
              </h4>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  {complaint.response}
                </p>
                <p className="text-xs text-gray-600">— {complaint.respondedBy}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Action Timeline</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Acknowledge within 24 hours</li>
                  <li>• Respond within 7 working days</li>
                  <li>• Escalate urgent cases immediately</li>
                  <li>• Document all communications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}