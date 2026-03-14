import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Globe,
  FileText,
  Clock,
  CheckCircle,
  ArrowRight,
  Download,
  BookOpen,
  AlertCircle,
  Building2,
  Factory,
  Wrench,
  Zap,
  ChevronDown,
  TrendingUp,
  Users,
  Calendar,
  Search,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";

export default function EnvironmentalClearance() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const stats = [
    {
      label: "Total EC Granted",
      value: "89,456",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Pending Applications",
      value: "12,347",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Avg Processing Time",
      value: "105 days",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Public Hearings",
      value: "2,456",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const categories = [
    {
      id: "category-a",
      name: "Category A",
      description:
        "Projects requiring mandatory appraisal at Central/State level",
      icon: Building2,
      color: "text-red-600",
      bgColor: "bg-red-50",
      examples: [
        "Mining (≥50 hectares)",
        "Thermal Power Plants (≥500 MW)",
        "River Valley Projects (≥10,000 hectares)",
        "Ports and Harbors (Major Ports)",
      ],
      timeline: "210 days",
      authority: "Central EAC",
    },
    {
      id: "category-b1",
      name: "Category B1",
      description: "Projects requiring appraisal at State level with EIA",
      icon: Factory,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      examples: [
        "Mining (5-50 hectares)",
        "Thermal Power (< 500 MW)",
        "Industrial Estates (50-500 hectares)",
        "Building & Construction (50,000-1,50,000 sqm)",
      ],
      timeline: "210 days",
      authority: "State SEIAA",
    },
    {
      id: "category-b2",
      name: "Category B2",
      description: "Projects requiring appraisal at State level without EIA",
      icon: Wrench,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      examples: [
        "Mining (< 5 hectares)",
        "Building Projects (20,000-50,000 sqm)",
        "Township development (< 50 hectares)",
        "Area development projects",
      ],
      timeline: "105 days",
      authority: "State SEIAA",
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Proposal Submission",
      description:
        "Submit Form 1 with project details and mandatory documents",
      duration: "Day 1",
      icon: FileText,
    },
    {
      step: 2,
      title: "Screening",
      description: "Screening committee determines Category B1/B2",
      duration: "Day 1-45",
      icon: Search,
    },
    {
      step: 3,
      title: "Scoping",
      description:
        "Terms of Reference (ToR) issued for EIA study (Category A & B1)",
      duration: "Day 46-105",
      icon: BookOpen,
    },
    {
      step: 4,
      title: "Public Consultation",
      description: "Public hearing and online comments collection",
      duration: "Day 106-135",
      icon: Users,
    },
    {
      step: 5,
      title: "Appraisal",
      description: "EAC/SEAC reviews EIA report and public consultation",
      duration: "Day 136-195",
      icon: CheckCircle,
    },
    {
      step: 6,
      title: "Final Decision",
      description: "Grant/Rejection of Environmental Clearance",
      duration: "Day 196-210",
      icon: Globe,
    },
  ];

  const documents = [
    {
      category: "Mandatory Documents",
      items: [
        "Form 1 (Application Form)",
        "Form 1A (Expansion/Modernization)",
        "Pre-feasibility Report/Feasibility Report",
        "Conceptual Plan",
        "Land ownership documents",
        "Location map with coordinates",
        "Project cost details",
      ],
    },
    {
      category: "For Category A & B1",
      items: [
        "Environmental Impact Assessment Report",
        "Environmental Management Plan",
        "Risk Assessment Report (if applicable)",
        "Public Hearing proceedings",
        "Online responses to public comments",
        "Details of Compliance of Earlier EC",
      ],
    },
    {
      category: "Sector Specific",
      items: [
        "Mining Plan (for mining projects)",
        "Consent to Establish (from SPCB)",
        "Forest Clearance (if applicable)",
        "Wildlife Clearance (if applicable)",
        "CRZ Clearance (if applicable)",
        "NOC from local authorities",
      ],
    },
  ];

  const faqs = [
    {
      question: "What is Environmental Clearance (EC)?",
      answer:
        "Environmental Clearance (EC) is a mandatory statutory clearance required under the Environment (Protection) Act, 1986 and EIA Notification 2006 for specified developmental activities that may have potential environmental impacts.",
    },
    {
      question: "Who needs Environmental Clearance?",
      answer:
        "Any project or activity listed in the Schedule of EIA Notification 2006 (as amended) requires EC. This includes mining, thermal power plants, river valley projects, infrastructure, industrial estates, and building/construction projects above specified thresholds.",
    },
    {
      question: "What is the validity period of EC?",
      answer:
        "Environmental Clearance is typically valid for the life of the project for mining, river valley, and infrastructure projects. For construction projects, it's generally valid until project completion or as specified in the clearance letter.",
    },
    {
      question: "Can EC be transferred?",
      answer:
        "Yes, EC can be transferred to another person/entity with prior approval from the authority that granted the clearance. The transferee must submit an application with requisite documents and undertake all conditions of the original EC.",
    },
    {
      question: "What happens if a project operates without EC?",
      answer:
        "Operating without EC is a violation of environmental laws and can result in closure directions, penalties under the Environment Protection Act, 1986, and prosecution. The project may need to apply for EC through the violation procedure with penalties.",
    },
    {
      question: "How long does it take to get EC?",
      answer:
        "The timeline varies: Category A projects take approximately 210 days, Category B1 projects take 210 days, and Category B2 projects take around 105 days from the date of receipt of complete application.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1A5C1A] to-[#2E7D32] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64">
            <Globe className="w-full h-full" />
          </div>
          <div className="absolute bottom-10 left-10 w-48 h-48">
            <Factory className="w-full h-full" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-12 h-12" />
              <h1 className="text-4xl font-bold">Environmental Clearance</h1>
            </div>
            <p className="text-xl text-green-100 max-w-3xl mb-6">
              Statutory clearance for developmental projects under the
              Environment (Protection) Act, 1986 and EIA Notification 2006
            </p>
            <div className="flex gap-4">
              <Link to="/login">
                <Button className="bg-white text-[#1A5C1A] hover:bg-green-50">
                  <FileText className="w-4 h-4 mr-2" />
                  Apply for EC
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Guidelines
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
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="process">Process</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>What is Environmental Clearance?</CardTitle>
                <CardDescription>
                  Understanding the EC framework in India
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Environmental Clearance (EC) is a mandatory statutory process
                  required under the Environment (Protection) Act, 1986. The EIA
                  Notification 2006 (with subsequent amendments) mandates that
                  certain developmental projects undergo environmental impact
                  assessment and obtain clearance before commencing construction
                  or operation.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Important</p>
                      <p>
                        Projects are categorized as Category A or B based on
                        spatial extent, potential impacts, and location in
                        ecologically sensitive areas. Category B is further
                        sub-divided into B1 and B2.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Project Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div
                          className={`${category.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}
                        >
                          <category.icon
                            className={`w-6 h-6 ${category.color}`}
                          />
                        </div>
                        <CardTitle>{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Examples:
                          </p>
                          <ul className="space-y-1">
                            {category.examples.map((example, i) => (
                              <li
                                key={i}
                                className="text-sm text-gray-600 flex items-start gap-2"
                              >
                                <span className="text-green-600 mt-1">•</span>
                                <span>{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-4 border-t space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Timeline:</span>
                            <span className="font-semibold">
                              {category.timeline}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Authority:</span>
                            <span className="font-semibold">
                              {category.authority}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle>Key Features of EC Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Online Process</p>
                        <p className="text-sm text-gray-600">
                          Complete application submission and tracking through
                          PARIVESH portal
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Public Consultation</p>
                        <p className="text-sm text-gray-600">
                          Mandatory for Category A & B1 projects with public
                          hearing
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Expert Appraisal</p>
                        <p className="text-sm text-gray-600">
                          Review by EAC/SEAC consisting of domain experts
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Monitoring & Compliance</p>
                        <p className="text-sm text-gray-600">
                          Six-monthly compliance reports and surprise
                          inspections
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Integrated Clearance</p>
                        <p className="text-sm text-gray-600">
                          Single window for Forest, Wildlife, and CRZ clearances
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Validity Extension</p>
                        <p className="text-sm text-gray-600">
                          EC can be extended with proper justification
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Process Tab */}
          <TabsContent value="process" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Clearance Process</CardTitle>
                <CardDescription>
                  Step-by-step guide for obtaining EC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {processSteps.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-[#1A5C1A] text-white rounded-full flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        {index < processSteps.length - 1 && (
                          <div className="w-0.5 h-full bg-green-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold">
                              {step.title}
                            </h3>
                            <Badge variant="outline">{step.duration}</Badge>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Timeline Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Category A</span>
                      <span className="text-sm text-gray-600">210 days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-red-600 h-3 rounded-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Category B1</span>
                      <span className="text-sm text-gray-600">210 days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-orange-600 h-3 rounded-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Category B2</span>
                      <span className="text-sm text-gray-600">105 days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: "50%" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
                <CardDescription>
                  Comprehensive list of documents for EC application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {documents.map((docGroup, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold mb-3 text-[#1A5C1A]">
                        {docGroup.category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {docGroup.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Download Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Download Forms & Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Form 1 - Application for EC",
                    "Form 1A - Expansion/Modernization",
                    "EIA Report Template",
                    "EMP Format",
                    "Public Hearing Format",
                    "Half Yearly Compliance Report",
                  ].map((form, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {form}
                      </span>
                      <Download className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Common queries about Environmental Clearance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-gradient-to-br from-[#1A5C1A] to-[#2E7D32] text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
                <p className="mb-6">
                  For technical assistance or queries regarding Environmental
                  Clearance, please contact:
                </p>
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Email:</span>
                    ec-moefcc@gov.in
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Helpdesk:</span>
                    1800-11-1360 (Toll Free)
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Timings:</span>
                    Monday to Friday, 9:30 AM - 6:00 PM
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-12 border-2 border-[#1A5C1A]">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Apply for Environmental Clearance?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Submit your application online through PARIVESH portal. Ensure you
              have all required documents before starting the application
              process.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/login">
                <Button className="bg-[#1A5C1A] hover:bg-[#145014]">
                  <FileText className="w-4 h-4 mr-2" />
                  Start New Application
                </Button>
              </Link>
              <Link to="/complaints">
                <Button variant="outline">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Report an Issue
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
