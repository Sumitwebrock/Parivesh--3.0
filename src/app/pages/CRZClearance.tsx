import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { motion } from "motion/react";
import {
  Waves,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Ship,
  Anchor,
  MapPin,
  Building,
  Factory,
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

export default function CRZClearance() {
  const stats = [
    { label: "Coastline", value: "7,516 km", icon: Waves, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "CRZ Clearances", value: "3,245", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
    { label: "Major Ports", value: "13", icon: Anchor, color: "text-purple-600", bgColor: "bg-purple-50" },
    { label: "Coastal States", value: "9", icon: MapPin, color: "text-orange-600", bgColor: "bg-orange-50" },
  ];

  const crzCategories = [
    {
      name: "CRZ-I",
      description: "Ecologically sensitive and important areas",
      icon: Waves,
      color: "text-red-600",
      bgColor: "bg-red-50",
      features: [
        "High tide line to low tide line",
        "Mangroves, coral reefs, mudflats",
        "National parks, marine parks",
        "Breeding grounds of marine life",
      ],
      restrictions: "Highly restricted - only eco-tourism and conservation activities",
    },
    {
      name: "CRZ-II",
      description: "Developed areas up to or close to the shoreline",
      icon: Building,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      features: [
        "Substantially built-up areas",
        "Existing authorized structures",
        "Legally approved coastal facilities",
        "Areas within municipal/panchayat limits",
      ],
      restrictions: "Regulated - no new construction in NDZ, existing rules apply",
    },
    {
      name: "CRZ-III",
      description: "Relatively undisturbed coastal areas",
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      features: [
        "Rural and urban areas not in CRZ-II",
        "Beaches, sand dunes",
        "Open spaces, agricultural land",
        "Green belt areas",
      ],
      restrictions: "Regulated - development permitted with restrictions, NDZ applies",
    },
    {
      name: "CRZ-IV",
      description: "Water area from low tide line to territorial waters",
      icon: Ship,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      features: [
        "Aquatic area extending to 12 nautical miles",
        "Andaman & Nicobar, Lakshadweep islands",
        "Marine water body",
        "Coral reefs, breeding grounds",
      ],
      restrictions: "Regulated - fishing, coastal zone management activities permitted",
    },
  ];

  const faqs = [
    {
      question: "What is CRZ Clearance?",
      answer: "CRZ (Coastal Regulation Zone) Clearance is mandatory under CRZ Notification 2019 for developmental activities within 500m from High Tide Line (HTL) on landward side and entire area between Low Tide Line (LTL) and HTL. It aims to protect coastal ecology and livelihoods of fisher communities.",
    },
    {
      question: "What is No Development Zone (NDZ)?",
      answer: "NDZ is the area from High Tide Line where no construction is permitted. In CRZ-III, NDZ is 20m for densely populated areas and 50m for other areas. In CRZ-II, there is no NDZ as it's already developed. Critical infrastructure like roads, bridges are exempted with conditions.",
    },
    {
      question: "Are islands treated differently?",
      answer: "Yes. Andaman & Nicobar, Lakshadweep islands have special provisions. The entire union territory is considered CRZ. Specific guidelines exist for tourism, fishing communities, and strategic/defense activities with minimal environmental impact.",
    },
    {
      question: "Can existing structures be renovated?",
      answer: "Yes. Existing authorized structures can be repaired, renovated, or reconstructed within the existing plinth area. For expansion or change of use, CRZ clearance is required. Unauthorized structures are subject to removal.",
    },
    {
      question: "What about traditional fishing communities?",
      answer: "Traditional fishing communities and their activities are protected. Construction/reconstruction of dwelling units, community facilities, and fishing-related activities are permitted subject to conditions and approval by local coastal zone management authority.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#003087] to-[#0047AB] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Waves className="absolute top-10 right-10 w-64 h-64" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <Waves className="w-12 h-12" />
              <h1 className="text-4xl font-bold">CRZ Clearance</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mb-6">
              Approval for development activities in Coastal Regulation Zone under CRZ Notification 2019
            </p>
            <div className="flex gap-4">
              <Link to="/login">
                <Button className="bg-white text-[#003087] hover:bg-blue-50">
                  <FileText className="w-4 h-4 mr-2" />
                  Apply for CRZ
                </Button>
              </Link>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                CRZ Notification
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
            <TabsTrigger value="categories">CRZ Categories</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Understanding CRZ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  The Coastal Regulation Zone (CRZ) is the area up to 500 meters from the High Tide Line (HTL) and the area between the Low Tide Line (LTL) and the HTL. The CRZ Notification 2019 regulates development activities in these areas to protect coastal ecosystems.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Important</p>
                      <p>All coastal states and union territories must prepare Coastal Zone Management Plans (CZMP) demarcating CRZ categories based on environmental sensitivity.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activities Permitted</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Eco-tourism facilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Traditional fishing activities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Salt manufacture</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Desalination plants (specific zones)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Defense strategic projects</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prohibited Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Construction in NDZ (except exempted)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Land reclamation, bunding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Discharge of untreated effluents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Mining of sand, rocks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Cutting of mangroves</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-8">
            <div className="space-y-6">
              {crzCategories.map((cat, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="overflow-hidden">
                    <div className={`${cat.bgColor} p-6 border-b`}>
                      <div className="flex items-start gap-4">
                        <div className="bg-white p-3 rounded-lg">
                          <cat.icon className={`w-8 h-8 ${cat.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                          <p className="text-gray-700">{cat.description}</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-gray-700">Features:</h4>
                          <ul className="space-y-2">
                            {cat.features.map((f, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 text-gray-700">Development Restrictions:</h4>
                          <p className="text-sm text-gray-600">{cat.restrictions}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle>No Development Zone (NDZ)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-3 bg-white rounded-lg">
                    <span className="font-medium">CRZ-I</span>
                    <span className="text-gray-600">No construction permitted</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white rounded-lg">
                    <span className="font-medium">CRZ-II</span>
                    <span className="text-gray-600">No NDZ (already developed)</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white rounded-lg">
                    <span className="font-medium">CRZ-III (Densely Populated)</span>
                    <span className="text-gray-600">20 meters from HTL</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white rounded-lg">
                    <span className="font-medium">CRZ-III (Other Areas)</span>
                    <span className="text-gray-600">50 meters from HTL</span>
                  </div>
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

        <Card className="mt-12 border-2 border-[#003087]">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Apply for CRZ Clearance?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Ensure your project complies with CRZ Notification 2019 and CZMP of your state
            </p>
            <Link to="/login">
              <Button className="bg-[#003087] hover:bg-[#002060]">
                <Waves className="w-4 h-4 mr-2" />
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
