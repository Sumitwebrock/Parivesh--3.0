import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { useState } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Download,
  Search,
  ChevronRight,
  PlayCircle,
  Workflow,
  Users,
  Building,
  Shield,
  Settings,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  GraduationCap,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  Zap,
  FileQuestion,
  BookMarked,
  ScrollText,
  HeadphonesIcon,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

type GuideCategory = "getting-started" | "user-guides" | "tutorials" | "faqs" | "troubleshooting";

interface GuideItem {
  id: string;
  title: string;
  description: string;
  category: GuideCategory;
  icon: any;
  duration?: string;
  level: "beginner" | "intermediate" | "advanced";
  fileUrl?: string;
  videoUrl?: string;
  content?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

export default function Guide() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const stats = [
    {
      label: "User Guides",
      value: "45+",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Video Tutorials",
      value: "28",
      icon: Video,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "FAQs",
      value: "150+",
      icon: HelpCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Downloads",
      value: "60+",
      icon: Download,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const guides: GuideItem[] = [
    {
      id: "guide-001",
      title: "Getting Started with PARIVESH 3.0",
      description:
        "A comprehensive introduction to the PARIVESH portal, covering registration, navigation, and basic features.",
      category: "getting-started",
      icon: Zap,
      duration: "15 min",
      level: "beginner",
      fileUrl: "/guides/getting-started.pdf",
    },
    {
      id: "guide-002",
      title: "How to Register and Login",
      description:
        "Step-by-step guide for creating an account and accessing the portal using digital signature.",
      category: "getting-started",
      icon: Users,
      duration: "10 min",
      level: "beginner",
      videoUrl: "https://example.com/registration",
    },
    {
      id: "guide-003",
      title: "Project Proponent User Manual",
      description:
        "Complete guide for project proponents on submitting clearance applications and tracking status.",
      category: "user-guides",
      icon: Building,
      duration: "30 min",
      level: "intermediate",
      fileUrl: "/guides/proponent-manual.pdf",
    },
    {
      id: "guide-004",
      title: "Environmental Impact Assessment Guidelines",
      description:
        "Detailed guidelines on preparing EIA reports as per the latest notification and templates.",
      category: "user-guides",
      icon: FileText,
      duration: "45 min",
      level: "advanced",
      fileUrl: "/guides/eia-guidelines.pdf",
    },
    {
      id: "guide-005",
      title: "Submitting New Application - Video Tutorial",
      description:
        "Watch how to fill and submit a new environmental clearance application online.",
      category: "tutorials",
      icon: PlayCircle,
      duration: "20 min",
      level: "beginner",
      videoUrl: "https://example.com/new-application",
    },
    {
      id: "guide-006",
      title: "Document Upload and Management",
      description:
        "Learn how to upload, manage, and organize required documents for your application.",
      category: "tutorials",
      icon: FileText,
      duration: "12 min",
      level: "beginner",
      videoUrl: "https://example.com/document-upload",
    },
    {
      id: "guide-007",
      title: "Forest Clearance Application Process",
      description:
        "Step-by-step guide for applying forest clearance under Forest Conservation Act.",
      category: "user-guides",
      icon: Workflow,
      duration: "25 min",
      level: "intermediate",
      fileUrl: "/guides/forest-clearance.pdf",
    },
    {
      id: "guide-008",
      title: "Wildlife Clearance Procedures",
      description:
        "Comprehensive guide for obtaining wildlife clearance for projects in protected areas.",
      category: "user-guides",
      icon: Shield,
      duration: "30 min",
      level: "intermediate",
      fileUrl: "/guides/wildlife-clearance.pdf",
    },
    {
      id: "guide-009",
      title: "CRZ Clearance - Coastal Regulations",
      description:
        "Understanding CRZ notification and application process for coastal zone projects.",
      category: "user-guides",
      icon: Globe,
      duration: "35 min",
      level: "advanced",
      fileUrl: "/guides/crz-clearance.pdf",
    },
    {
      id: "guide-010",
      title: "Using Digital Signature Certificate",
      description:
        "How to obtain and use DSC for signing and submitting applications securely.",
      category: "getting-started",
      icon: Lock,
      duration: "15 min",
      level: "beginner",
      videoUrl: "https://example.com/dsc-guide",
    },
    {
      id: "guide-011",
      title: "Scrutiny Team Operations Manual",
      description:
        "Guide for scrutiny officers on reviewing applications and conducting site visits.",
      category: "user-guides",
      icon: Settings,
      duration: "40 min",
      level: "advanced",
      fileUrl: "/guides/scrutiny-manual.pdf",
    },
    {
      id: "guide-012",
      title: "Tracking Application Status",
      description:
        "Learn how to track your application status and view comments from authorities.",
      category: "tutorials",
      icon: Monitor,
      duration: "8 min",
      level: "beginner",
      videoUrl: "https://example.com/tracking",
    },
  ];

  const faqs: FAQ[] = [
    {
      id: "faq-001",
      question: "What is PARIVESH and who can use it?",
      answer:
        "PARIVESH is an integrated online portal for environmental clearances in India. It can be used by project proponents seeking environmental, forest, wildlife, or CRZ clearances; government officials for reviewing applications; and the general public for viewing project information.",
      category: "General",
      tags: ["about", "registration", "access"],
    },
    {
      id: "faq-002",
      question: "How do I register on the PARIVESH portal?",
      answer:
        "To register: 1) Visit the PARIVESH portal, 2) Click on 'Register' or 'Sign Up', 3) Select your user type (Project Proponent, Consultant, etc.), 4) Fill in required details including organization information, 5) Upload necessary documents, 6) Verify email/mobile, 7) Complete registration with Digital Signature Certificate (DSC).",
      category: "Registration",
      tags: ["registration", "account", "signup"],
    },
    {
      id: "faq-003",
      question: "Is Digital Signature Certificate (DSC) mandatory?",
      answer:
        "Yes, DSC is mandatory for submitting applications and uploading important documents. Class 2 or Class 3 DSC issued by licensed Certifying Authorities is acceptable. DSC ensures authenticity and legally binding nature of submitted applications.",
      category: "Technical",
      tags: ["dsc", "signature", "authentication"],
    },
    {
      id: "faq-004",
      question: "What types of clearances can I apply for?",
      answer:
        "You can apply for: 1) Environmental Clearance (EC) under EIA Notification 2006, 2) Forest Clearance (FC) under Forest Conservation Act 1980, 3) Wildlife Clearance under Wildlife Protection Act 1972, 4) CRZ Clearance under CRZ Notification 2019. Some projects may require multiple clearances.",
      category: "Applications",
      tags: ["clearance", "types", "application"],
    },
    {
      id: "faq-005",
      question: "How long does the clearance process take?",
      answer:
        "The timeline varies by clearance type: Environmental Clearance (EC) - typically 105-210 days; Forest Clearance - 60-120 days depending on forest area; Wildlife Clearance - 90-180 days; CRZ Clearance - 90-120 days. Timelines depend on completeness of application and complexity of project.",
      category: "Process",
      tags: ["timeline", "duration", "processing"],
    },
    {
      id: "faq-006",
      question: "What documents are required for Environmental Clearance?",
      answer:
        "Required documents include: 1) Project proposal with location details, 2) EIA Report prepared by accredited consultant, 3) EMP (Environmental Management Plan), 4) Public hearing proceedings, 5) CTE/CTO from State Pollution Control Board, 6) Forest clearance (if applicable), 7) Land documents, 8) Financial details, 9) NOC from local authorities.",
      category: "Documents",
      tags: ["documents", "eia", "requirements"],
    },
    {
      id: "faq-007",
      question: "Can I edit my application after submission?",
      answer:
        "Once submitted, you cannot directly edit the application. However, if the scrutiny team requests additional information or corrections, you can upload revised documents and submit clarifications through the portal. For major changes, you may need to withdraw and resubmit the application.",
      category: "Applications",
      tags: ["edit", "modification", "changes"],
    },
    {
      id: "faq-008",
      question: "How do I track my application status?",
      answer:
        "Login to your dashboard and go to 'My Applications' section. You'll see real-time status updates including: Under Scrutiny, Site Visit Scheduled, EAC Meeting Scheduled, Pending Clarification, Approved, or Rejected. You'll also receive email and SMS notifications for major status changes.",
      category: "Tracking",
      tags: ["status", "tracking", "updates"],
    },
    {
      id: "faq-009",
      question: "What is Form 1 and when is it required?",
      answer:
        "Form 1 is a standard application form prescribed under EIA Notification 2006. It contains basic project information including location, category, investment, environmental aspects, etc. It must be submitted at the initial stage of Environmental Clearance application for all projects requiring EC.",
      category: "Forms",
      tags: ["form1", "documents", "application"],
    },
    {
      id: "faq-010",
      question: "Who prepares the EIA Report?",
      answer:
        "EIA Report must be prepared by accredited EIA consultants approved by MoEFCC/NABET. The consultant organization should have relevant expertise and accreditation in the specific sector (mining, infrastructure, industry, etc.). Project proponents can view list of accredited consultants on the portal.",
      category: "EIA",
      tags: ["eia", "consultant", "report"],
    },
    {
      id: "faq-011",
      question: "Is public hearing mandatory for all projects?",
      answer:
        "Public hearing is mandatory for Category A and Category B1 projects (except specific exempted categories). Public hearing involves informing local communities, receiving their feedback, and addressing concerns. The proceedings must be submitted as part of EC application. Category B2 projects are exempt from public hearing.",
      category: "Process",
      tags: ["public-hearing", "consultation", "requirements"],
    },
    {
      id: "faq-012",
      question: "What happens if my application is rejected?",
      answer:
        "If rejected, you'll receive detailed reasons for rejection. You can: 1) Address the concerns and reapply with a fresh application, 2) File an appeal to the MoEFCC within 30 days of rejection, 3) Make necessary project modifications and resubmit. The portal provides rejection reasons and recommendations for reapplication.",
      category: "Process",
      tags: ["rejection", "appeal", "reapplication"],
    },
  ];

  const troubleshootingGuides = [
    {
      issue: "Cannot login to the portal",
      solution:
        "Ensure you're using correct credentials. Check if DSC is properly configured. Clear browser cache and cookies. Try different browser (Chrome/Firefox recommended). Contact helpdesk if issue persists.",
    },
    {
      issue: "Document upload failing",
      solution:
        "Check file size (should be < 10MB). Ensure file format is PDF. Verify file is not password protected. Check internet connection. Try uploading during off-peak hours.",
    },
    {
      issue: "DSC not detected",
      solution:
        "Install DSC drivers from manufacturer. Check USB connection. Ensure DSC is not expired. Register DSC in portal settings. Use Internet Explorer or install browser plugin.",
    },
    {
      issue: "Application status not updating",
      solution:
        "Status updates may take 24-48 hours to reflect. Refresh the page. Clear browser cache. Check notifications section. Contact scrutiny team for urgent queries.",
    },
    {
      issue: "Payment gateway issues",
      solution:
        "Ensure sufficient balance in account. Try different payment method. Check bank transaction status. Save payment receipt. Contact technical support with transaction ID.",
    },
    {
      issue: "Email notifications not received",
      solution:
        "Check spam/junk folder. Verify email address in profile. Add noreply@parivesh.nic.in to contacts. Enable notifications in settings. Update email preferences.",
    },
  ];

  const quickLinks = [
    {
      title: "User Manual (English)",
      description: "Complete user manual in English",
      icon: BookOpen,
      size: "5.2 MB",
      type: "PDF",
    },
    {
      title: "User Manual (Hindi)",
      description: "Complete user manual in Hindi",
      icon: BookMarked,
      size: "5.5 MB",
      type: "PDF",
    },
    {
      title: "Application Forms & Templates",
      description: "Download all required forms",
      icon: FileText,
      size: "2.1 MB",
      type: "ZIP",
    },
    {
      title: "Video Tutorial Series",
      description: "Complete video guide playlist",
      icon: Video,
      size: "Online",
      type: "Video",
    },
  ];

  const filteredGuides = guides.filter((guide) => {
    const categoryMatch =
      selectedCategory === "all" || guide.category === selectedCategory;
    const searchMatch =
      searchQuery === "" ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const filteredFaqs = faqs.filter(
    (faq) =>
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getLevelBadgeColor = (level: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-700",
      intermediate: "bg-blue-100 text-blue-700",
      advanced: "bg-purple-100 text-purple-700",
    };
    return colors[level as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1A5C1A] to-[#2D7A2D] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64">
            <BookOpen className="w-full h-full" />
          </div>
          <div className="absolute bottom-10 left-10 w-48 h-48">
            <GraduationCap className="w-full h-full" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-12 h-12" />
              <h1 className="text-4xl font-bold">User Guide & Help Center</h1>
            </div>
            <p className="text-xl text-green-100 max-w-3xl mb-6">
              Comprehensive guides, tutorials, and resources to help you navigate the
              PARIVESH 3.0 portal and complete your clearance applications successfully
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search guides, FAQs, tutorials..."
                  className="pl-12 h-14 text-lg bg-white text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
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
        <Tabs defaultValue="guides" className="space-y-8">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="guides">
              <BookOpen className="w-4 h-4 mr-2" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="w-4 h-4 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="faqs">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="support">
              <HeadphonesIcon className="w-4 h-4 mr-2" />
              Support
            </TabsTrigger>
          </TabsList>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                size="sm"
              >
                All Guides
              </Button>
              <Button
                variant={selectedCategory === "getting-started" ? "default" : "outline"}
                onClick={() => setSelectedCategory("getting-started")}
                size="sm"
              >
                Getting Started
              </Button>
              <Button
                variant={selectedCategory === "user-guides" ? "default" : "outline"}
                onClick={() => setSelectedCategory("user-guides")}
                size="sm"
              >
                User Guides
              </Button>
              <Button
                variant={selectedCategory === "tutorials" ? "default" : "outline"}
                onClick={() => setSelectedCategory("tutorials")}
                size="sm"
              >
                Tutorials
              </Button>
            </div>

            {/* Guide Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide, index) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <guide.icon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{guide.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {guide.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              className={getLevelBadgeColor(guide.level)}
                              variant="outline"
                            >
                              {guide.level}
                            </Badge>
                            {guide.duration && (
                              <Badge variant="outline" className="text-xs">
                                {guide.duration}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {guide.fileUrl && (
                          <Button size="sm" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                        )}
                        {guide.videoUrl && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Watch Video
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Tutorial Library</CardTitle>
                <CardDescription>
                  Watch step-by-step video guides to learn how to use PARIVESH 3.0
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {guides
                    .filter((g) => g.videoUrl)
                    .map((guide) => (
                      <div
                        key={guide.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-purple-100 p-3 rounded-lg">
                            <PlayCircle className="w-8 h-8 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">{guide.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {guide.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{guide.duration}</Badge>
                              <Badge
                                className={getLevelBadgeColor(guide.level)}
                                variant="outline"
                              >
                                {guide.level}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Video Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">For Project Proponents</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Learn how to submit and manage applications
                    </p>
                    <Button variant="outline" size="sm">
                      View Tutorials
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">For Officials</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Guides for scrutiny and approval processes
                    </p>
                    <Button variant="outline" size="sm">
                      View Tutorials
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold mb-2">For Consultants</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      EIA preparation and submission guidelines
                    </p>
                    <Button variant="outline" size="sm">
                      View Tutorials
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about PARIVESH 3.0
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start gap-3">
                          <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-8">
                          <p className="text-gray-700 mb-3">{faq.answer}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {faq.category}
                            </Badge>
                            {faq.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs bg-gray-50"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Troubleshooting */}
            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting Common Issues</CardTitle>
                <CardDescription>
                  Quick solutions to frequently encountered problems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {troubleshootingGuides.map((item, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold mb-2">{item.issue}</h4>
                          <p className="text-sm text-gray-700">{item.solution}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            {/* Contact Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Support</CardTitle>
                  <CardDescription>
                    Get help with technical issues and portal navigation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Helpline</p>
                      <p className="text-sm text-gray-600">
                        1800-11-5678 (Toll Free)
                      </p>
                      <p className="text-xs text-gray-500">
                        Mon-Fri, 9:30 AM - 5:30 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-50 p-2 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Email Support</p>
                      <p className="text-sm text-gray-600">
                        support.parivesh@nic.in
                      </p>
                      <p className="text-xs text-gray-500">
                        Response within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Live Chat</p>
                      <p className="text-sm text-gray-600">Chat with our support team</p>
                      <Button size="sm" className="mt-2">
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Application Support</CardTitle>
                  <CardDescription>
                    Help with clearance applications and processes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-50 p-2 rounded-lg">
                      <Phone className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Regional Offices</p>
                      <p className="text-sm text-gray-600">
                        Contact your regional MoEFCC office
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Find Office
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-red-50 p-2 rounded-lg">
                      <Mail className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Application Queries</p>
                      <p className="text-sm text-gray-600">
                        application.support@nic.in
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-teal-50 p-2 rounded-lg">
                      <FileQuestion className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Submit a Ticket</p>
                      <p className="text-sm text-gray-600">
                        Raise a support ticket for tracking
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Create Ticket
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Download Resources</CardTitle>
                <CardDescription>
                  Download essential guides and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickLinks.map((link, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <link.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">{link.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {link.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {link.type}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {link.size}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Download className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>System Requirements</CardTitle>
                <CardDescription>
                  Ensure your system meets these requirements for optimal performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Monitor className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold">Supported Browsers</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Chrome 90+
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Firefox 88+
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Edge 90+
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Safari 14+
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Smartphone className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold">Minimum Requirements</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Internet: 2 Mbps or higher</li>
                      <li>• RAM: 4 GB minimum</li>
                      <li>• Screen: 1366x768 resolution</li>
                      <li>• PDF Reader installed</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lock className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold">Required Software</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Digital Signature (Class 2/3)</li>
                      <li>• DSC Driver & Middleware</li>
                      <li>• PDF Reader (Adobe/Foxit)</li>
                      <li>• Enable JavaScript & Cookies</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help CTA */}
        <Card className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Can't find what you're looking for?</h3>
                <p className="text-gray-700 mb-4">
                  Our support team is here to help. Contact us via phone, email, or live
                  chat for personalized assistance with your queries.
                </p>
                <div className="flex gap-3">
                  <Button className="bg-[#1A5C1A] hover:bg-[#145014]">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Support
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Us
                  </Button>
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
