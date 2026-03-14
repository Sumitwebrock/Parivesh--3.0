import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Trees,
  FileText,
  Clock,
  CheckCircle,
  Download,
  BookOpen,
  AlertCircle,
  MapPin,
  Leaf,
  TrendingUp,
  Users,
  Landmark,
  ArrowRight,
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

export default function ForestClearance() {
  const stats = [
    {
      label: "FC Granted",
      value: "45,892",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Forest Diverted",
      value: "1.2 Lakh Ha",
      icon: Trees,
      color: "text-brown-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "CAF Collected",
      value: "₹45,000 Cr",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Afforestation Done",
      value: "2.4 Lakh Ha",
      icon: Leaf,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Stage-I Approval",
      description: "In-principle approval for diversion of forest land",
      duration: "60-90 days",
      requirements: [
        "Proposal submission in prescribed format",
        "Site inspection by State Forest Department",
        "Recommendation by State Government",
        "Appraisal by Forest Advisory Committee (FAC)",
      ],
    },
    {
      step: 2,
      title: "Compliance of Conditions",
      description: "Fulfill conditions stipulated in Stage-I",
      duration: "Variable",
      requirements: [
        "Payment of Net Present Value (NPV)",
        "Payment of Compensatory Afforestation Fund (CAF)",
        "Submission of CA/pCA scheme",
        "Clearance from other agencies (Wildlife, CRZ if applicable)",
        "Rehabilitation and Resettlement plan (if required)",
      ],
    },
    {
      step: 3,
      title: "Stage-II Approval",
      description: "Final approval for forest land diversion",
      duration: "30-45 days",
      requirements: [
        "Compliance report by State Forest Department",
        "Verification of payments",
        "Execution of legal agreements",
        "Final approval by MoEFCC",
      ],
    },
  ];

  const nvpRates = [
    { state: "Andhra Pradesh", rate: "₹10.43 - ₹13.86 Lakh/Ha" },
    { state: "Bihar", rate: "₹8.95 - ₹11.94 Lakh/Ha" },
    { state: "Gujarat", rate: "₹9.97 - ₹13.29 Lakh/Ha" },
    { state: "Karnataka", rate: "₹11.24 - ₹14.99 Lakh/Ha" },
    { state: "Maharashtra", rate: "₹9.62 - ₹12.82 Lakh/Ha" },
    { state: "Odisha", rate: "₹10.79 - ₹14.39 Lakh/Ha" },
    { state: "Rajasthan", rate: "₹7.29 - ₹9.72 Lakh/Ha" },
    { state: "Tamil Nadu", rate: "₹13.23 - ₹17.64 Lakh/Ha" },
  ];

  const faqs = [
    {
      question: "What is Forest Clearance?",
      answer:
        "Forest Clearance (FC) is mandatory under the Forest (Conservation) Act, 1980 for any non-forest activity requiring diversion of forest land. This includes mining, infrastructure, irrigation, transmission lines, and other developmental projects.",
    },
    {
      question: "What is Net Present Value (NPV)?",
      answer:
        "NPV is the economic value of forests calculated based on ecosystem services like carbon sequestration, biodiversity, water conservation, etc. It is charged to compensate for the loss of forest ecosystem and varies by state and forest type.",
    },
    {
      question: "What is Compensatory Afforestation?",
      answer:
        "Compensatory Afforestation (CA) requires afforestation over equivalent non-forest land to compensate for forest land diverted for non-forest use. If equivalent non-forest land is not available, double the area must be afforested on degraded forest land (pCA).",
    },
    {
      question: "Can forest land be transferred permanently?",
      answer:
        "No. Forest clearance is granted for a specific project and purpose. The land remains forest land even after clearance. Any change in land use or transfer requires fresh approval from MoEFCC.",
    },
    {
      question: "What happens if a project is abandoned?",
      answer:
        "If a project is abandoned or not implemented within the stipulated time, the diverted forest land must be restored and returned to the Forest Department. The payments made (NPV, CAF) are not refundable.",
    },
    {
      question: "How is forest land measured?",
      answer:
        "Forest land is measured in hectares as per revenue records and verified through GPS survey. The area includes all types of forests - recorded forests, deemed forests, and unclassed forests falling under the Forest (Conservation) Act.",
    },
  ];

  const documents = [
    {
      category: "Basic Documents",
      items: [
        "Legal status of land (Forest/Revenue records)",
        "Proof of land ownership",
        "Map showing forest land proposed for diversion",
        "Details of trees to be felled",
        "Land use plan of the area",
        "Justification for forest land requirement",
      ],
    },
    {
      category: "Project Details",
      items: [
        "Detailed Project Report",
        "Cost-benefit analysis",
        "Alternative site analysis",
        "Details of non-forest land available",
        "Project layout plan",
        "Environmental Management Plan",
      ],
    },
    {
      category: "Clearances",
      items: [
        "Wildlife Clearance (if in protected area)",
        "Environmental Clearance",
        "Gram Sabha consent (for tribal areas)",
        "NOC from State Forest Department",
        "Site inspection report",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64">
            <Trees className="w-full h-full" />
          </div>
          <div className="absolute bottom-10 left-10 w-48 h-48">
            <Leaf className="w-full h-full" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Trees className="w-12 h-12" />
              <h1 className="text-4xl font-bold">Forest Clearance</h1>
            </div>
            <p className="text-xl text-green-100 max-w-3xl mb-6">
              Approval for diversion of forest land for non-forest purposes under
              the Forest (Conservation) Act, 1980
            </p>
            <div className="flex gap-4">
              <Link to="/login">
                <Button className="bg-white text-[#2E7D32] hover:bg-green-50">
                  <FileText className="w-4 h-4 mr-2" />
                  Apply for FC
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Handbook
              </Button>
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
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="process">Process</TabsTrigger>
            <TabsTrigger value="fees">Fees & Charges</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Understanding Forest Clearance</CardTitle>
                <CardDescription>
                  Legal framework and requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  The Forest (Conservation) Act, 1980 prohibits the use of forest
                  land for non-forest purposes without prior approval of the
                  Central Government. Forest clearance is required for any project
                  involving diversion of forest land, irrespective of ownership
                  (Government or private).
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900">
                      <p className="font-semibold mb-1">Important</p>
                      <p>
                        Forest clearance is processed in two stages: Stage-I
                        (in-principle approval) and Stage-II (final approval) after
                        compliance of stipulated conditions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Components */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Key Components of Forest Clearance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                      <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle>Compensatory Afforestation (CA)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      Afforestation must be done over equivalent non-forest land.
                      If not available, double the area must be afforested on
                      degraded forest land (penal CA).
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>Must be identified by State Government</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>To be managed by Forest Department</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>Survival monitoring for minimum 7 years</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle>Net Present Value (NPV)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      Economic compensation for loss of forest ecosystem services.
                      Rates vary by state and zone, calculated per hectare of
                      forest diverted.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>Deposited in CAMPA fund</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>Non-refundable payment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>Updated periodically by MoEFCC</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle>Rights of Forest Dwellers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      Recognition and settlement of rights under the Forest Rights
                      Act, 2006 is mandatory before forest land diversion.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>Gram Sabha consent required</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>Rehabilitation & Resettlement plan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>Alternative livelihood provisions</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                      <Landmark className="w-6 h-6 text-orange-600" />
                    </div>
                    <CardTitle>CAMPA Fund</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      Compensatory Afforestation Fund Management and Planning
                      Authority manages funds for afforestation and conservation.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>National and State level funds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>Used for forest regeneration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>Transparent fund utilization</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Documents Required */}
            <Card>
              <CardHeader>
                <CardTitle>Documents Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {documents.map((docGroup, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold mb-3 text-[#2E7D32]">
                        {docGroup.category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {docGroup.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
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
          </TabsContent>

          {/* Process Tab */}
          <TabsContent value="process" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Two-Stage Forest Clearance Process</CardTitle>
                <CardDescription>
                  Detailed workflow from application to final approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {processSteps.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <div className="relative">
                        <div className="flex items-start gap-6">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-[#2E7D32] text-white rounded-full flex items-center justify-center font-bold text-xl">
                              {step.step}
                            </div>
                            {index < processSteps.length - 1 && (
                              <div className="w-1 flex-1 bg-green-200 min-h-[100px]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="bg-white border-2 border-green-200 rounded-lg p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-xl font-bold mb-2">
                                    {step.title}
                                  </h3>
                                  <p className="text-gray-600">
                                    {step.description}
                                  </p>
                                </div>
                                <Badge className="bg-[#2E7D32]">
                                  {step.duration}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <p className="font-semibold text-sm text-gray-700">
                                  Requirements:
                                </p>
                                <ul className="space-y-2">
                                  {step.requirements.map((req, i) => (
                                    <li
                                      key={i}
                                      className="flex items-start gap-2 text-sm text-gray-600"
                                    >
                                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                      <span>{req}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>NPV Rates (2022 Revision)</CardTitle>
                <CardDescription>
                  Net Present Value rates vary by state and forest type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          State
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          NPV Rate Range
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {nvpRates.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium">
                            {item.state}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.rate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Rates vary based on forest density
                    (Very Dense/Moderately Dense/Open Forest). The ranges shown
                    are indicative. Exact rates depend on forest type and location.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compensatory Afforestation Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex justify-between border-b pb-2">
                      <span>CA on Non-Forest Land</span>
                      <span className="font-semibold">As per actuals</span>
                    </li>
                    <li className="flex justify-between border-b pb-2">
                      <span>pCA on Degraded Forest</span>
                      <span className="font-semibold">2x CA cost</span>
                    </li>
                    <li className="flex justify-between border-b pb-2">
                      <span>Catchment Area Treatment</span>
                      <span className="font-semibold">₹1-5 Lakh/Ha</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Additional Levies</span>
                      <span className="font-semibold">As applicable</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Other Charges</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex justify-between border-b pb-2">
                      <span>Trees Felling Cost</span>
                      <span className="font-semibold">As per stumpage</span>
                    </li>
                    <li className="flex justify-between border-b pb-2">
                      <span>Wildlife Conservation</span>
                      <span className="font-semibold">If in PA buffer</span>
                    </li>
                    <li className="flex justify-between border-b pb-2">
                      <span>Safety Zone Treatment</span>
                      <span className="font-semibold">₹0.5-2 Lakh/Ha</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Legal Documentation</span>
                      <span className="font-semibold">As applicable</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
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
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="mt-12 border-2 border-[#2E7D32]">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Apply for Forest Clearance?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Ensure all documents are ready and requirements are met before
              starting your FC application.
            </p>
            <Link to="/login">
              <Button className="bg-[#2E7D32] hover:bg-[#1B5E20]">
                <Trees className="w-4 h-4 mr-2" />
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
