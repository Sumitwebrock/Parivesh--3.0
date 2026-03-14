import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Download,
  FileText,
  Search,
  Filter,
  Calendar,
  TrendingDown,
  File,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Eye,
  Star,
  FolderOpen,
  Bookmark,
  Globe,
  Trees,
  Footprints,
  Waves,
  Building,
  Scale,
  Award,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

type DocumentCategory =
  | "forms"
  | "guidelines"
  | "notifications"
  | "templates"
  | "manuals"
  | "reports"
  | "acts";

type ClearanceType = "all" | "ec" | "fc" | "wlc" | "crz";

interface Document {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  clearanceType: ClearanceType[];
  fileSize: string;
  format: string;
  publishDate: string;
  version?: string;
  downloads: number;
  isFeatured?: boolean;
  isNew?: boolean;
  language: string[];
}

export default function Downloads() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedClearance, setSelectedClearance] = useState<ClearanceType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");

  const stats = [
    {
      label: "Total Documents",
      value: "248",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Monthly Downloads",
      value: "45,678",
      icon: TrendingDown,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Updated This Month",
      value: "23",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Languages",
      value: "12",
      icon: Globe,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const documents: Document[] = [
    // Environmental Clearance
    {
      id: "DOC-EC-001",
      title: "Form 1 - Application for Environmental Clearance",
      description:
        "Standard application form for seeking environmental clearance under EIA Notification 2006",
      category: "forms",
      clearanceType: ["ec"],
      fileSize: "2.4 MB",
      format: "PDF",
      publishDate: "2026-02-15",
      version: "v3.2",
      downloads: 15420,
      isFeatured: true,
      isNew: false,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-EC-002",
      title: "Form 1A - Expansion/Modernization Projects",
      description:
        "Application form for expansion, modernization or change in product mix",
      category: "forms",
      clearanceType: ["ec"],
      fileSize: "1.8 MB",
      format: "PDF",
      publishDate: "2026-02-15",
      version: "v3.2",
      downloads: 8934,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-EC-003",
      title: "EIA Notification 2006 (Amended 2024)",
      description:
        "Complete notification with all amendments for environmental impact assessment",
      category: "notifications",
      clearanceType: ["ec"],
      fileSize: "5.6 MB",
      format: "PDF",
      publishDate: "2024-11-20",
      downloads: 23456,
      isFeatured: true,
      language: ["English", "Hindi", "Bengali", "Tamil"],
    },
    {
      id: "DOC-EC-004",
      title: "EIA Report Template (Mining Sector)",
      description:
        "Standardized template for preparing EIA reports for mining projects",
      category: "templates",
      clearanceType: ["ec"],
      fileSize: "3.2 MB",
      format: "DOCX",
      publishDate: "2025-12-10",
      downloads: 5678,
      language: ["English"],
    },
    {
      id: "DOC-EC-005",
      title: "EIA Report Template (Infrastructure)",
      description:
        "Template for infrastructure projects including highways, airports, ports",
      category: "templates",
      clearanceType: ["ec"],
      fileSize: "2.9 MB",
      format: "DOCX",
      publishDate: "2025-12-10",
      downloads: 4523,
      language: ["English"],
    },
    {
      id: "DOC-EC-006",
      title: "Environmental Management Plan Format",
      description: "Standard format for preparing comprehensive EMP documents",
      category: "templates",
      clearanceType: ["ec"],
      fileSize: "1.5 MB",
      format: "DOCX",
      publishDate: "2025-11-05",
      downloads: 6789,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-EC-007",
      title: "Public Consultation Guidelines",
      description:
        "Detailed guidelines for conducting public hearings and consultations",
      category: "guidelines",
      clearanceType: ["ec"],
      fileSize: "4.1 MB",
      format: "PDF",
      publishDate: "2025-10-20",
      downloads: 3421,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-EC-008",
      title: "Half-Yearly Compliance Report Format",
      description: "Template for submitting six-monthly compliance reports",
      category: "templates",
      clearanceType: ["ec"],
      fileSize: "800 KB",
      format: "XLSX",
      publishDate: "2026-01-15",
      downloads: 9876,
      isFeatured: true,
      language: ["English"],
    },
    {
      id: "DOC-EC-009",
      title: "Sector-Specific Guidelines (Thermal Power)",
      description: "Guidelines for environmental clearance of thermal power plants",
      category: "guidelines",
      clearanceType: ["ec"],
      fileSize: "3.8 MB",
      format: "PDF",
      publishDate: "2025-09-12",
      downloads: 2345,
      language: ["English"],
    },

    // Forest Clearance
    {
      id: "DOC-FC-001",
      title: "Forest Clearance Application Formats",
      description:
        "Comprehensive package of all forms required for FC application",
      category: "forms",
      clearanceType: ["fc"],
      fileSize: "4.5 MB",
      format: "PDF",
      publishDate: "2026-02-01",
      version: "v4.0",
      downloads: 12340,
      isFeatured: true,
      isNew: true,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-FC-002",
      title: "Forest (Conservation) Act, 1980",
      description: "Complete text of FCA 1980 with latest amendments",
      category: "acts",
      clearanceType: ["fc"],
      fileSize: "2.1 MB",
      format: "PDF",
      publishDate: "2024-08-15",
      downloads: 18765,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-FC-003",
      title: "Compensatory Afforestation Guidelines",
      description:
        "Guidelines for CA/pCA scheme preparation and implementation",
      category: "guidelines",
      clearanceType: ["fc"],
      fileSize: "3.4 MB",
      format: "PDF",
      publishDate: "2025-11-25",
      downloads: 7654,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-FC-004",
      title: "Net Present Value Calculation Manual",
      description: "Methodology and rates for NPV calculation (Updated 2024)",
      category: "manuals",
      clearanceType: ["fc"],
      fileSize: "2.8 MB",
      format: "PDF",
      publishDate: "2024-07-10",
      downloads: 5432,
      isFeatured: true,
      language: ["English"],
    },
    {
      id: "DOC-FC-005",
      title: "CAMPA Guidelines and Fund Management",
      description:
        "Guidelines for Compensatory Afforestation Fund Management and Planning",
      category: "guidelines",
      clearanceType: ["fc"],
      fileSize: "4.2 MB",
      format: "PDF",
      publishDate: "2025-09-20",
      downloads: 4321,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-FC-006",
      title: "Forest Rights Act - Settlement Guidelines",
      description: "Guidelines for FRA compliance and Gram Sabha consent",
      category: "guidelines",
      clearanceType: ["fc"],
      fileSize: "3.1 MB",
      format: "PDF",
      publishDate: "2025-08-15",
      downloads: 3210,
      language: ["English", "Hindi", "Marathi", "Odiya"],
    },
    {
      id: "DOC-FC-007",
      title: "Working Plan and Management Plan Format",
      description: "Format for preparing forest working plans",
      category: "templates",
      clearanceType: ["fc"],
      fileSize: "1.9 MB",
      format: "DOCX",
      publishDate: "2025-10-05",
      downloads: 2987,
      language: ["English"],
    },

    // Wildlife Clearance
    {
      id: "DOC-WL-001",
      title: "Wildlife (Protection) Act, 1972",
      description: "Complete Wildlife Protection Act with all amendments",
      category: "acts",
      clearanceType: ["wlc"],
      fileSize: "6.2 MB",
      format: "PDF",
      publishDate: "2024-06-30",
      downloads: 14567,
      isFeatured: true,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-WL-002",
      title: "Application for Wildlife Clearance",
      description:
        "Standard application form for projects in protected areas and ESZ",
      category: "forms",
      clearanceType: ["wlc"],
      fileSize: "1.6 MB",
      format: "PDF",
      publishDate: "2026-01-20",
      downloads: 6789,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-WL-003",
      title: "Eco-Sensitive Zone Notification Guidelines",
      description: "Guidelines for activities in ESZ around protected areas",
      category: "guidelines",
      clearanceType: ["wlc"],
      fileSize: "4.8 MB",
      format: "PDF",
      publishDate: "2025-10-15",
      downloads: 4567,
      isNew: true,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-WL-004",
      title: "Biodiversity Assessment Template",
      description:
        "Template for conducting biodiversity impact assessment studies",
      category: "templates",
      clearanceType: ["wlc"],
      fileSize: "2.3 MB",
      format: "DOCX",
      publishDate: "2025-09-10",
      downloads: 3456,
      language: ["English"],
    },
    {
      id: "DOC-WL-005",
      title: "Tiger Reserve and Elephant Corridor Guidelines",
      description:
        "Special guidelines for projects near tiger reserves and elephant corridors",
      category: "guidelines",
      clearanceType: ["wlc"],
      fileSize: "5.1 MB",
      format: "PDF",
      publishDate: "2025-07-20",
      downloads: 2345,
      language: ["English", "Hindi"],
    },

    // CRZ Clearance
    {
      id: "DOC-CRZ-001",
      title: "CRZ Notification 2019 (Complete)",
      description:
        "Coastal Regulation Zone Notification with all amendments",
      category: "notifications",
      clearanceType: ["crz"],
      fileSize: "7.3 MB",
      format: "PDF",
      publishDate: "2024-12-01",
      downloads: 19876,
      isFeatured: true,
      language: ["English", "Hindi", "Tamil", "Malayalam"],
    },
    {
      id: "DOC-CRZ-002",
      title: "CRZ Clearance Application Form",
      description: "Application form for projects in coastal regulation zones",
      category: "forms",
      clearanceType: ["crz"],
      fileSize: "2.1 MB",
      format: "PDF",
      publishDate: "2026-01-10",
      downloads: 8765,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-CRZ-003",
      title: "Coastal Zone Management Plan Guidelines",
      description: "Guidelines for preparation of CZMP by coastal states",
      category: "guidelines",
      clearanceType: ["crz"],
      fileSize: "5.4 MB",
      format: "PDF",
      publishDate: "2025-11-05",
      downloads: 5678,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-CRZ-004",
      title: "HTL/LTL Demarcation Methodology",
      description:
        "Standard operating procedure for demarcating High Tide Line and Low Tide Line",
      category: "manuals",
      clearanceType: ["crz"],
      fileSize: "3.9 MB",
      format: "PDF",
      publishDate: "2025-08-22",
      downloads: 4321,
      language: ["English"],
    },
    {
      id: "DOC-CRZ-005",
      title: "Island CRZ - Special Provisions",
      description:
        "Guidelines for CRZ clearance in Andaman & Nicobar and Lakshadweep",
      category: "guidelines",
      clearanceType: ["crz"],
      fileSize: "2.7 MB",
      format: "PDF",
      publishDate: "2025-09-15",
      downloads: 2987,
      language: ["English", "Hindi"],
    },

    // General/Common Documents
    {
      id: "DOC-GEN-001",
      title: "PARIVESH User Manual (Complete)",
      description: "Comprehensive user guide for PARIVESH 3.0 portal",
      category: "manuals",
      clearanceType: ["all"],
      fileSize: "12.5 MB",
      format: "PDF",
      publishDate: "2026-03-01",
      version: "v3.0",
      downloads: 34567,
      isFeatured: true,
      isNew: true,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-GEN-002",
      title: "Environment (Protection) Act, 1986",
      description: "Parent act for all environmental clearances in India",
      category: "acts",
      clearanceType: ["all"],
      fileSize: "3.4 MB",
      format: "PDF",
      publishDate: "2024-05-10",
      downloads: 28765,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-GEN-003",
      title: "Standard Terms of Reference (ToR) - All Sectors",
      description: "Sector-wise standard ToR for EIA study preparation",
      category: "guidelines",
      clearanceType: ["ec"],
      fileSize: "6.8 MB",
      format: "PDF",
      publishDate: "2025-12-20",
      downloads: 11234,
      language: ["English"],
    },
    {
      id: "DOC-GEN-004",
      title: "Annual Report 2025 - MoEFCC",
      description:
        "Annual report on environmental clearances and conservation activities",
      category: "reports",
      clearanceType: ["all"],
      fileSize: "15.3 MB",
      format: "PDF",
      publishDate: "2026-01-30",
      downloads: 9876,
      isNew: true,
      language: ["English", "Hindi"],
    },
    {
      id: "DOC-GEN-005",
      title: "Right to Information - Standard Formats",
      description: "RTI application formats for environmental clearance related queries",
      category: "forms",
      clearanceType: ["all"],
      fileSize: "1.2 MB",
      format: "PDF",
      publishDate: "2025-10-01",
      downloads: 7654,
      language: ["English", "Hindi"],
    },
  ];

  const categories = [
    { value: "all", label: "All Documents", icon: FolderOpen },
    { value: "forms", label: "Application Forms", icon: FileText },
    { value: "guidelines", label: "Guidelines", icon: BookOpen },
    { value: "notifications", label: "Notifications", icon: AlertCircle },
    { value: "templates", label: "Templates", icon: File },
    { value: "manuals", label: "User Manuals", icon: BookOpen },
    { value: "reports", label: "Reports", icon: FileText },
    { value: "acts", label: "Acts & Rules", icon: Scale },
  ];

  const clearanceTypes = [
    { value: "all", label: "All Clearances", icon: FolderOpen },
    { value: "ec", label: "Environmental", icon: Globe },
    { value: "fc", label: "Forest", icon: Trees },
    { value: "wlc", label: "Wildlife", icon: Footprints },
    { value: "crz", label: "CRZ", icon: Waves },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const categoryMatch =
      selectedCategory === "all" || doc.category === selectedCategory;
    const clearanceMatch =
      selectedClearance === "all" ||
      doc.clearanceType.includes(selectedClearance) ||
      doc.clearanceType.includes("all");
    const languageMatch =
      selectedLanguage === "all" || doc.language.includes(selectedLanguage);
    const searchMatch =
      searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && clearanceMatch && languageMatch && searchMatch;
  });

  const featuredDocuments = documents.filter((doc) => doc.isFeatured);
  const newDocuments = documents.filter((doc) => doc.isNew);

  const handleDownload = (doc: Document) => {
    // Simulate download
    console.log("Downloading:", doc.title);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1A5C1A] to-[#2E7D32] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64">
            <Download className="w-full h-full" />
          </div>
          <div className="absolute bottom-10 left-10 w-48 h-48">
            <FileText className="w-full h-full" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-12 h-12" />
              <h1 className="text-4xl font-bold">Downloads Center</h1>
            </div>
            <p className="text-xl text-green-100 max-w-3xl mb-6">
              Access all forms, templates, guidelines, notifications, and
              documents required for environmental clearance applications
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
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
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="grid w-full max-w-3xl grid-cols-3">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="new">New Uploads</TabsTrigger>
          </TabsList>

          {/* All Documents Tab */}
          <TabsContent value="all" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search documents..."
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
                    value={selectedClearance}
                    onValueChange={(value) =>
                      setSelectedClearance(value as ClearanceType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Clearance Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {clearanceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Bengali">Bengali</SelectItem>
                      <SelectItem value="Tamil">Tamil</SelectItem>
                      <SelectItem value="Telugu">Telugu</SelectItem>
                      <SelectItem value="Malayalam">Malayalam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow group">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex gap-1">
                          {doc.isNew && (
                            <Badge className="bg-green-600">New</Badge>
                          )}
                          {doc.isFeatured && (
                            <Badge className="bg-orange-600">
                              <Star className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-[#1A5C1A] transition-colors">
                        {doc.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {doc.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {doc.clearanceType.map((type, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {type === "all" ? "General" : type.toUpperCase()}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-xs capitalize">
                          {doc.category}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                        <div>
                          <p className="text-xs text-gray-500">Format</p>
                          <p className="font-semibold">{doc.format}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Size</p>
                          <p className="font-semibold">{doc.fileSize}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Published</p>
                          <p className="font-semibold">
                            {new Date(doc.publishDate).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Downloads</p>
                          <p className="font-semibold">
                            {doc.downloads.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {doc.version && (
                        <div className="bg-gray-50 px-3 py-2 rounded text-xs">
                          <span className="text-gray-600">Version: </span>
                          <span className="font-semibold">{doc.version}</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          className="flex-1 bg-[#1A5C1A] hover:bg-[#145014]"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>

                      {doc.language.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Available in: {doc.language.join(", ")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredDocuments.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No documents found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or search criteria
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-2 border-orange-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="bg-orange-50 p-2 rounded-lg">
                          <Star className="w-6 h-6 text-orange-600" />
                        </div>
                        <Badge className="bg-orange-600">Featured</Badge>
                      </div>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription>{doc.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <div className="flex justify-between mb-2">
                          <span>Format:</span>
                          <span className="font-semibold">{doc.format}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Size:</span>
                          <span className="font-semibold">{doc.fileSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Downloads:</span>
                          <span className="font-semibold">
                            {doc.downloads.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-[#FF6B00] hover:bg-[#E55D00]"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* New Uploads Tab */}
          <TabsContent value="new" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-2 border-green-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="bg-green-50 p-2 rounded-lg">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <Badge className="bg-green-600">New</Badge>
                      </div>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription>{doc.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <div className="flex justify-between mb-2">
                          <span>Published:</span>
                          <span className="font-semibold">
                            {new Date(doc.publishDate).toLocaleDateString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Format:</span>
                          <span className="font-semibold">{doc.format}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span className="font-semibold">{doc.fileSize}</span>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-[#1A5C1A] hover:bg-[#145014]"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Links Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>
              Frequently accessed documents and resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "All Application Forms",
                  icon: FileText,
                  count: "24 forms",
                },
                {
                  title: "User Manuals",
                  icon: BookOpen,
                  count: "8 manuals",
                },
                {
                  title: "Legal Framework",
                  icon: Scale,
                  count: "12 documents",
                },
                {
                  title: "Video Tutorials",
                  icon: Award,
                  count: "15 videos",
                },
              ].map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex-col items-start hover:bg-green-50 hover:border-green-300"
                >
                  <item.icon className="w-6 h-6 text-[#1A5C1A] mb-2" />
                  <div className="text-left">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.count}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-12 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                <p className="text-gray-700 mb-4">
                  Can't find the document you're looking for? Our support team
                  is here to help you.
                </p>
                <div className="flex gap-3">
                  <Button className="bg-[#003087] hover:bg-[#002060]">
                    Contact Support
                  </Button>
                  <Button variant="outline">View FAQs</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
