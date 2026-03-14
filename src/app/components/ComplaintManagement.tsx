import { useEffect, useState } from "react";
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
  Mail,
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
import {
  buildComplaintGmailComposeUrl,
  generateComplaintEmailDraft,
  getComplaints,
  updateComplaint,
  type ComplaintCategory,
  type ComplaintPriority,
  type ComplaintRecord,
  type ComplaintStatus,
} from "../services/complaints";

export function ComplaintManagement() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRecord | null>(
    null
  );

  useEffect(() => {
    setComplaints(getComplaints());
  }, []);

  useEffect(() => {
    const onStorage = () => {
      setComplaints(getComplaints());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
                          <AdminComplaintDetails complaint={complaint} onSaved={setComplaints} />
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

function AdminComplaintDetails({
  complaint,
  onSaved,
}: {
  complaint: ComplaintRecord;
  onSaved: (complaints: ComplaintRecord[]) => void;
}) {
  const [status, setStatus] = useState(complaint.status);
  const [priority, setPriority] = useState(complaint.priority);
  const [response, setResponse] = useState(complaint.response || "");
  const [assignedTo, setAssignedTo] = useState(complaint.assignedTo || "");

  const draftComplaint = (): ComplaintRecord => ({
    ...complaint,
    status,
    priority,
    response,
    assignedTo,
  });

  const persistComplaint = (nextResponse?: string) => {
    const resolvedResponse = typeof nextResponse === "string" ? nextResponse : response;
    onSaved(
      updateComplaint(complaint.id, {
        status,
        priority,
        response: resolvedResponse,
        assignedTo,
        respondedBy: resolvedResponse.trim() ? "Admin Team" : complaint.respondedBy,
      })
    );
  };

  const handleUpdateStatus = () => {
    persistComplaint();
  };

  const handleGenerateMail = () => {
    const draft = generateComplaintEmailDraft(draftComplaint());
    setResponse(draft.body);
  };

  const handleOpenGmail = () => {
    const generatedDraft = generateComplaintEmailDraft(draftComplaint(), {
      response: response.trim() || undefined,
    });
    const finalResponse = response.trim() || generatedDraft.body;
    if (!response.trim()) {
      setResponse(finalResponse);
    }

    persistComplaint(finalResponse);

    const composeUrl = buildComplaintGmailComposeUrl(draftComplaint(), {
      response: finalResponse,
    });

    const popup = window.open(composeUrl, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.href = composeUrl;
    }
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
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 min-w-[180px]"
                onClick={handleGenerateMail}
              >
                <FileText className="w-4 h-4 mr-2" />
                Auto Generate Mail
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 min-w-[180px] border-[#003087] text-[#003087] hover:bg-blue-50"
                onClick={handleOpenGmail}
              >
                <Mail className="w-4 h-4 mr-2" />
                Open Gmail Draft
              </Button>
              <Button
                type="button"
                className="flex-1 bg-[#1A5C1A] hover:bg-[#145014]"
                onClick={handleUpdateStatus}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Save Response
              </Button>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Gmail opens with the complainant email, subject, and official response prefilled. You can review it and send it from your Gmail account.
            </p>
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