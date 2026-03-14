import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
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
  Users,
  Send,
  Upload,
  X,
  ChevronDown,
  Eye,
  Download,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Tag,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  getComplaints,
  submitComplaint,
  type ComplaintCategory,
  type ComplaintRecord,
  type ComplaintStatus,
} from "../services/complaints";

export default function Complaints() {
  const [activeTab, setActiveTab] = useState("new");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [complaints, setComplaints] = useState<ComplaintRecord[]>(() => getComplaints());
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRecord | null>(
    null
  );

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key) {
        setComplaints(getComplaints());
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const stats = [
    {
      label: "Total Complaints",
      value: complaints.length.toLocaleString("en-IN"),
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Under Review",
      value: complaints.filter((complaint) => complaint.status === "under-review").length.toLocaleString("en-IN"),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Resolved",
      value: complaints.filter((complaint) => complaint.status === "resolved").length.toLocaleString("en-IN"),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Avg Response Time",
      value: complaints.length
        ? `${(
            complaints.filter((complaint) => complaint.responseTime !== "Pending").length / complaints.length
          ).toFixed(1)} tracked`
        : "0 tracked",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
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
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "under-review":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-700 border-gray-200";
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
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const categoryMatch =
      selectedCategory === "all" || complaint.category === selectedCategory;
    const statusMatch =
      selectedStatus === "all" || complaint.status === selectedStatus;
    const searchMatch =
      searchQuery === "" ||
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && statusMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#003087] to-[#0047AB] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
            <circle
              cx="100"
              cy="100"
              r="60"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
            <path
              d="M100 20 L180 100 L100 180 L20 100 Z"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Grievance Portal</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mb-6">
              Submit complaints, track grievances, and ensure transparent
              resolution of issues related to environmental clearance processes
            </p>
            <div className="flex gap-4">
              <Dialog open={isNewComplaintOpen} onOpenChange={setIsNewComplaintOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#FF6B00] hover:bg-[#E55D00] text-white">
                    <Send className="w-4 h-4 mr-2" />
                    File New Complaint
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>File a New Complaint</DialogTitle>
                    <DialogDescription>
                      Please provide detailed information about your grievance.
                      All complaints are tracked and responded to within 7
                      working days.
                    </DialogDescription>
                  </DialogHeader>
                  <NewComplaintForm
                    onClose={() => setIsNewComplaintOpen(false)}
                    onSubmitted={() => setComplaints(getComplaints())}
                  />
                </DialogContent>
              </Dialog>
              <Button
                className="bg-[#FF6B00] hover:bg-[#E55D00] text-white border-0"
              >
                <FileText className="w-4 h-4 mr-2" />
                Track Complaint
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="new">Browse Complaints</TabsTrigger>
            <TabsTrigger value="my">My Complaints</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-6">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by ID or title..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
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
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
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
                            <div className="flex items-center gap-3 mb-2">
                              <Badge
                                variant="outline"
                                className={getStatusColor(complaint.status)}
                              >
                                {complaint.status.replace("-", " ")}
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
                                <Calendar className="w-4 h-4" />
                                {new Date(complaint.date).toLocaleDateString(
                                  "en-IN"
                                )}
                              </div>
                              {complaint.applicationId && (
                                <div className="flex items-center gap-1">
                                  <Tag className="w-4 h-4" />
                                  {complaint.applicationId}
                                </div>
                              )}
                              {complaint.attachments && (
                                <div className="flex items-center gap-1">
                                  <Upload className="w-4 h-4" />
                                  {complaint.attachments} attachments
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-2">
                              Response Time
                            </div>
                            <div className="text-lg font-semibold text-[#003087]">
                              {complaint.responseTime}
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => setSelectedComplaint(complaint)}
                                >
                                  View Details
                                  <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <ComplaintDetails complaint={complaint} />
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
                    <h3 className="text-lg font-semibold mb-2">
                      No complaints found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your filters or search criteria
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my" className="mt-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Login Required
                </h3>
                <p className="text-gray-600 mb-6">
                  Please login to view your complaints
                </p>
                <Button className="bg-[#003087] hover:bg-[#002060]">
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

function NewComplaintForm({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "delay" as ComplaintCategory,
    applicationId: "",
    applicationType: "",
    title: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitComplaint({
      complainantName: form.name,
      complainantEmail: form.email,
      complainantPhone: form.phone,
      category: form.category,
      applicationId: form.applicationId,
      applicationType: form.applicationType || undefined,
      title: form.title,
      description: form.description,
      attachments: attachments.length,
    });
    onSubmitted();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" placeholder="Enter your full name" required value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input id="email" type="email" placeholder="your.email@example.com" required value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Complaint Category *</Label>
          <Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: value as ComplaintCategory }))}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delay">Processing Delay</SelectItem>
              <SelectItem value="technical">Technical Issues</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="transparency">Transparency</SelectItem>
              <SelectItem value="corruption">Corruption/Misconduct</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="applicationId">Related Application ID (if any)</Label>
        <Input id="applicationId" placeholder="e.g., EC/2025/4589" value={form.applicationId} onChange={(e) => setForm((current) => ({ ...current, applicationId: e.target.value }))} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="applicationType">Application Type</Label>
        <Input id="applicationType" placeholder="e.g., Environmental Clearance" value={form.applicationType} onChange={(e) => setForm((current) => ({ ...current, applicationType: e.target.value }))} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Complaint Title *</Label>
        <Input id="title" placeholder="Brief summary of your complaint" required value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Detailed Description *</Label>
        <Textarea id="description" placeholder="Provide detailed information about your complaint including dates, reference numbers, and specific issues..." rows={6} required value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
      </div>

      <div className="space-y-2">
        <Label>Supporting Documents</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#003087] transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PDF, DOC, JPG up to 10MB (Max 5 files)
          </p>
          <Input
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => {
              if (e.target.files) {
                setAttachments(Array.from(e.target.files));
              }
            }}
          />
        </div>
        {attachments.length > 0 && (
          <div className="space-y-2 mt-3">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <span className="text-sm">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setAttachments(attachments.filter((_, i) => i !== index))
                  }
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Important Information</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>All complaints are reviewed within 7 working days</li>
              <li>You will receive updates via email and SMS</li>
              <li>Ensure all information provided is accurate</li>
              <li>
                False complaints may lead to legal action as per IT Act 2000
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-[#1A5C1A] hover:bg-[#145014]"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Complaint
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ComplaintDetails({ complaint }: { complaint: ComplaintRecord }) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge
            variant="outline"
            className={`${
              complaint.status === "resolved"
                ? "bg-green-100 text-green-700 border-green-200"
                : complaint.status === "under-review"
                ? "bg-orange-100 text-orange-700 border-orange-200"
                : "bg-blue-100 text-blue-700 border-blue-200"
            }`}
          >
            {complaint.status.replace("-", " ").toUpperCase()}
          </Badge>
          <span className="text-sm text-gray-500">{complaint.id}</span>
        </div>
        <DialogTitle className="text-2xl">{complaint.title}</DialogTitle>
        <DialogDescription>
          Filed on {new Date(complaint.date).toLocaleDateString("en-IN")} •
          Response Time: {complaint.responseTime}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Complaint Details</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{complaint.description}</p>
          </div>
        </div>

        {complaint.applicationId && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Application ID</p>
              <p className="font-semibold">{complaint.applicationId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Application Type</p>
              <p className="font-semibold">{complaint.applicationType}</p>
            </div>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-600 mb-1">Category</p>
          <p className="font-semibold capitalize">{complaint.category}</p>
        </div>

        {complaint.attachments && (
          <div>
            <h4 className="font-semibold mb-2">Attachments</h4>
            <div className="space-y-2">
              {[...Array(complaint.attachments)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Document_{i + 1}.pdf</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {complaint.response && (
          <div>
            <h4 className="font-semibold mb-2 text-green-700">
              Official Response
            </h4>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">{complaint.response}</p>
              <p className="text-sm text-gray-600">
                — {complaint.respondedBy}
              </p>
            </div>
          </div>
        )}

        {complaint.status === "under-review" && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="text-sm text-orange-900">
                <p className="font-semibold mb-1">Under Review</p>
                <p>
                  Your complaint is currently being reviewed by our team. You
                  will receive an update within the next 2-3 working days.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}