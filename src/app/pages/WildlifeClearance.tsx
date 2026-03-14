import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { motion } from "motion/react";
import {
  Footprints,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Shield,
  MapPin,
  Eye,
  Calendar,
  Users,
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

export default function WildlifeClearance() {
  const stats = [
    { label: "Protected Areas", value: "981", icon: Shield, color: "text-green-600", bgColor: "bg-green-50" },
    { label: "WLC Granted", value: "2,456", icon: CheckCircle, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Tiger Reserves", value: "54", icon: Footprints, color: "text-orange-600", bgColor: "bg-orange-50" },
    { label: "ESZ Notified", value: "658", icon: MapPin, color: "text-purple-600", bgColor: "bg-purple-50" },
  ];

  const protectedCategories = [
    {
      name: "National Parks",
      count: "108",
      description: "Highest level of protection",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      name: "Wildlife Sanctuaries",
      count: "567",
      description: "Protected for flora and fauna",
      icon: Footprints,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      name: "Conservation Reserves",
      count: "92",
      description: "Community-based conservation",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Community Reserves",
      count: "214",
      description: "Village/private land conservation",
      icon: MapPin,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const faqs = [
    {
      question: "What is Wildlife Clearance?",
      answer: "Wildlife Clearance is required under the Wildlife (Protection) Act, 1972 for any project or activity within protected areas (National Parks, Wildlife Sanctuaries) or their Eco-Sensitive Zones (ESZ). It ensures that developmental activities do not adversely affect wildlife habitat and biodiversity.",
    },
    {
      question: "What is an Eco-Sensitive Zone (ESZ)?",
      answer: "ESZ is a buffer zone around protected areas with a width up to 10 km, where certain activities are prohibited, regulated, or promoted to protect the wildlife habitat. Projects in ESZ require Wildlife Board clearance.",
    },
    {
      question: "Is WLC different from Forest Clearance?",
      answer: "Yes. Forest Clearance is for diversion of forest land, while Wildlife Clearance is for activities in or affecting protected areas. A project may require both clearances if it involves forest land within a protected area.",
    },
    {
      question: "How long does WLC take?",
      answer: "The timeline varies: NBWL (National Board) cases typically take 120-180 days, while SBWL (State Board) cases may take 90-120 days, depending on the complexity and location of the project.",
    },
    {
      question: "Can any activity be permitted in National Parks?",
      answer: "National Parks have the highest level of protection. Only activities absolutely essential for wildlife conservation, research, or tourism as per approved management plans are generally permitted. Commercial activities are strictly regulated.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#FF6B00] to-[#D35400] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Footprints className="absolute top-10 right-10 w-64 h-64" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <Footprints className="w-12 h-12" />
              <h1 className="text-4xl font-bold">Wildlife Clearance</h1>
            </div>
            <p className="text-xl text-orange-100 max-w-3xl mb-6">
              Statutory approval for projects in protected areas under Wildlife (Protection) Act, 1972
            </p>
            <div className="flex gap-4">
              <Link to="/login">
                <Button className="bg-white text-[#FF6B00] hover:bg-orange-50">
                  <FileText className="w-4 h-4 mr-2" />
                  Apply for WLC
                </Button>
              </Link>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                Guidelines
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="process">Process</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Protected Areas in India</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {protectedCategories.map((cat, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-lg">
                      <div className={`${cat.bgColor} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                        <cat.icon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <h3 className="font-semibold mb-1">{cat.name}</h3>
                      <p className="text-2xl font-bold mb-2">{cat.count}</p>
                      <p className="text-xs text-gray-600">{cat.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>When is WLC Required?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Projects within National Parks/Sanctuaries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Activities in Eco-Sensitive Zones (ESZ)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Projects affecting wildlife corridors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Activities impacting critical wildlife habitat</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Authorities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm mb-1">National Board for Wildlife (NBWL)</p>
                      <p className="text-xs text-gray-600">For National Parks, Sanctuaries, and critical wildlife habitats</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">State Board for Wildlife (SBWL)</p>
                      <p className="text-xs text-gray-600">For state-level protected areas and ESZ activities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="process" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Application Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { step: 1, title: "Proposal Submission", desc: "Submit application with project details and impact assessment" },
                    { step: 2, title: "Site Inspection", desc: "Field verification by Wildlife authorities" },
                    { step: 3, title: "SBWL/NBWL Review", desc: "Appraisal by Wildlife Board" },
                    { step: 4, title: "Clearance Decision", desc: "Approval with conditions or rejection" },
                  ].map((s, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {s.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{s.title}</h4>
                        <p className="text-sm text-gray-600">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-12 border-2 border-[#FF6B00]">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Apply?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Ensure your project complies with Wildlife Protection Act guidelines
            </p>
            <Link to="/login">
              <Button className="bg-[#FF6B00] hover:bg-[#D35400]">
                <Footprints className="w-4 h-4 mr-2" />
                Start Application
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
