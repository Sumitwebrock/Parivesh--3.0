import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Building,
  Globe,
  Headphones,
  FileText,
  Users,
  HelpCircle,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Navigation as NavigationIcon,
  PhoneCall,
  MessageSquare,
  Calendar,
  Printer,
  User,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";

interface RegionalOffice {
  id: string;
  region: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string[];
  fax?: string;
  email: string;
  jurisdiction: string[];
  timings: string;
}

interface Department {
  id: string;
  name: string;
  icon: any;
  description: string;
  phone: string;
  email: string;
  head: string;
  designation: string;
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
    organizationType: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const stats = [
    {
      label: "Regional Offices",
      value: "13",
      icon: Building,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Departments",
      value: "8",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Helpline Calls/Month",
      value: "15K+",
      icon: Phone,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Avg Response Time",
      value: "24 hrs",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const regionalOffices: RegionalOffice[] = [
    {
      id: "ro-north",
      region: "Northern Regional Office",
      address: "Vayu Wing, 1st Floor, Indira Paryavaran Bhawan, Jor Bagh Road",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110003",
      phone: ["011-2061-1768", "011-2061-3394"],
      fax: "011-2061-2394",
      email: "ro-north@parivesh.nic.in",
      jurisdiction: [
        "Delhi",
        "Haryana",
        "Himachal Pradesh",
        "Jammu & Kashmir",
        "Ladakh",
        "Punjab",
        "Rajasthan",
        "Uttar Pradesh",
        "Uttarakhand",
      ],
      timings: "9:30 AM - 5:30 PM (Mon-Fri)",
    },
    {
      id: "ro-east",
      region: "Eastern Regional Office",
      address: "2nd Floor, Paryavaran Bhawan, CGO Complex, Sector-1, Lodhi Road",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700020",
      phone: ["033-2242-5146", "033-2242-5147"],
      fax: "033-2242-5148",
      email: "ro-east@parivesh.nic.in",
      jurisdiction: [
        "West Bengal",
        "Bihar",
        "Jharkhand",
        "Odisha",
        "Sikkim",
        "Andaman & Nicobar Islands",
      ],
      timings: "9:30 AM - 5:30 PM (Mon-Fri)",
    },
    {
      id: "ro-west",
      region: "Western Regional Office",
      address: "Kendriya Sadan, 2nd Floor, Koramangala, Sarjapur Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400051",
      phone: ["022-2659-6229", "022-2659-6230"],
      fax: "022-2659-6231",
      email: "ro-west@parivesh.nic.in",
      jurisdiction: [
        "Maharashtra",
        "Gujarat",
        "Goa",
        "Madhya Pradesh",
        "Chhattisgarh",
        "Daman & Diu",
        "Dadra & Nagar Haveli",
      ],
      timings: "9:30 AM - 5:30 PM (Mon-Fri)",
    },
    {
      id: "ro-south",
      region: "Southern Regional Office",
      address: "No. 25, 1st Main Road, Gandhi Nagar, Adyar",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600020",
      phone: ["044-2441-1461", "044-2441-1462"],
      fax: "044-2441-1463",
      email: "ro-south@parivesh.nic.in",
      jurisdiction: [
        "Tamil Nadu",
        "Karnataka",
        "Kerala",
        "Andhra Pradesh",
        "Telangana",
        "Puducherry",
        "Lakshadweep",
      ],
      timings: "9:30 AM - 5:30 PM (Mon-Fri)",
    },
    {
      id: "ro-northeast",
      region: "North-Eastern Regional Office",
      address: "Housefed Complex, Last Gate, Basistha Road",
      city: "Guwahati",
      state: "Assam",
      pincode: "781029",
      phone: ["0361-2227-140", "0361-2227-141"],
      email: "ro-northeast@parivesh.nic.in",
      jurisdiction: [
        "Assam",
        "Arunachal Pradesh",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Tripura",
      ],
      timings: "9:30 AM - 5:30 PM (Mon-Fri)",
    },
  ];

  const departments: Department[] = [
    {
      id: "dept-env",
      name: "Environmental Clearance Division",
      icon: Globe,
      description:
        "Handles environmental clearance applications under EIA Notification 2006",
      phone: "011-2436-1669",
      email: "ec.moefcc@nic.in",
      head: "Dr. Rajesh Kumar",
      designation: "Director, EC Division",
    },
    {
      id: "dept-forest",
      name: "Forest Clearance Division",
      icon: Building,
      description:
        "Processes forest clearance applications under Forest Conservation Act 1980",
      phone: "011-2436-0721",
      email: "fc.moefcc@nic.in",
      head: "Sh. Anil Sharma",
      designation: "Director, FC Division",
    },
    {
      id: "dept-wildlife",
      name: "Wildlife Division",
      icon: Users,
      description:
        "Manages wildlife clearances and protected area related matters",
      phone: "011-2436-1298",
      email: "wildlife.moefcc@nic.in",
      head: "Dr. Priya Singh",
      designation: "Inspector General of Forests (Wildlife)",
    },
    {
      id: "dept-crz",
      name: "Coastal Regulation Zone Division",
      icon: Globe,
      description: "Handles CRZ clearances and coastal zone management",
      phone: "011-2436-1721",
      email: "crz.moefcc@nic.in",
      head: "Sh. Vikram Malhotra",
      designation: "Director, CRZ Division",
    },
    {
      id: "dept-it",
      name: "IT & Digital Services",
      icon: Headphones,
      description: "Technical support for PARIVESH portal and digital services",
      phone: "1800-11-5678",
      email: "support.parivesh@nic.in",
      head: "Sh. Amit Patel",
      designation: "Technical Director",
    },
    {
      id: "dept-admin",
      name: "Administration & Grievances",
      icon: FileText,
      description: "Handles administrative matters and public grievances",
      phone: "011-2436-0357",
      email: "admin.moefcc@nic.in",
      head: "Sh. Suresh Rao",
      designation: "Under Secretary (Admin)",
    },
  ];

  const contactMethods = [
    {
      title: "Phone Support",
      icon: Phone,
      color: "blue",
      details: [
        {
          label: "Toll-Free Helpline",
          value: "1800-11-5678",
          available: "24x7",
        },
        {
          label: "Main Office",
          value: "+91-11-2436-0357",
          available: "Mon-Fri, 9:30 AM - 5:30 PM",
        },
        {
          label: "Technical Support",
          value: "+91-11-2436-1768",
          available: "Mon-Fri, 9:30 AM - 5:30 PM",
        },
      ],
    },
    {
      title: "Email Support",
      icon: Mail,
      color: "green",
      details: [
        {
          label: "General Inquiries",
          value: "info@parivesh.nic.in",
          available: "Response within 24 hours",
        },
        {
          label: "Technical Support",
          value: "support.parivesh@nic.in",
          available: "Response within 12 hours",
        },
        {
          label: "Application Queries",
          value: "application.support@nic.in",
          available: "Response within 24 hours",
        },
      ],
    },
    {
      title: "In-Person Visit",
      icon: MapPin,
      color: "purple",
      details: [
        {
          label: "Head Office",
          value: "Indira Paryavaran Bhawan, Jor Bagh Road, New Delhi - 110003",
          available: "Mon-Fri, 9:30 AM - 5:30 PM",
        },
      ],
    },
    {
      title: "Live Chat",
      icon: MessageCircle,
      color: "orange",
      details: [
        {
          label: "Chat with Support Agent",
          value: "Available for instant assistance",
          available: "Mon-Fri, 9:30 AM - 5:30 PM",
        },
      ],
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Handle form submission logic here
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: "",
        organizationType: "",
      });
    }, 3000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#003087] to-[#0047AB] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64">
            <Phone className="w-full h-full" />
          </div>
          <div className="absolute bottom-10 left-10 w-48 h-48">
            <MessageCircle className="w-full h-full" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Headphones className="w-12 h-12" />
              <h1 className="text-4xl font-bold">Contact Us</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mb-6">
              Get in touch with us for assistance, inquiries, or feedback. Our team
              is here to help you navigate the PARIVESH portal and environmental
              clearance processes.
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
        <Tabs defaultValue="quick-contact" className="space-y-8">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="quick-contact">
              <MessageSquare className="w-4 h-4 mr-2" />
              Quick Contact
            </TabsTrigger>
            <TabsTrigger value="offices">
              <Building className="w-4 h-4 mr-2" />
              Offices
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Users className="w-4 h-4 mr-2" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="inquiry">
              <Send className="w-4 h-4 mr-2" />
              Send Inquiry
            </TabsTrigger>
          </TabsList>

          {/* Quick Contact Tab */}
          <TabsContent value="quick-contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div
                          className={`bg-${method.color}-50 p-3 rounded-lg`}
                        >
                          <method.icon
                            className={`w-6 h-6 text-${method.color}-600`}
                          />
                        </div>
                        <CardTitle>{method.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {method.details.map((detail, idx) => (
                        <div key={idx} className="space-y-1">
                          <p className="text-sm font-semibold text-gray-700">
                            {detail.label}
                          </p>
                          <p className="text-sm text-gray-900">{detail.value}</p>
                          <p className="text-xs text-gray-500">{detail.available}</p>
                        </div>
                      ))}
                      {method.title === "Live Chat" && (
                        <Button className="w-full bg-[#1A5C1A] hover:bg-[#145014]">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Start Chat
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Emergency Contact */}
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">
                      Emergency Environmental Concerns
                    </h3>
                    <p className="text-gray-700 mb-4">
                      For urgent environmental violations or emergencies requiring
                      immediate attention, please contact our emergency helpline.
                    </p>
                    <div className="flex gap-3">
                      <Button className="bg-red-600 hover:bg-red-700">
                        <PhoneCall className="w-4 h-4 mr-2" />
                        Emergency: 1800-11-9999
                      </Button>
                      <Button variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        emergency@moefcc.gov.in
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>Connect on Social Media</CardTitle>
                <CardDescription>
                  Follow us for updates, announcements, and news
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { icon: Facebook, label: "Facebook", color: "blue" },
                    { icon: Twitter, label: "Twitter", color: "sky" },
                    { icon: Linkedin, label: "LinkedIn", color: "blue" },
                    { icon: Youtube, label: "YouTube", color: "red" },
                    { icon: Instagram, label: "Instagram", color: "pink" },
                  ].map((social, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto flex-col py-4 hover:bg-gray-50"
                    >
                      <social.icon className={`w-8 h-8 text-${social.color}-600 mb-2`} />
                      <span className="text-sm">{social.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offices Tab */}
          <TabsContent value="offices" className="space-y-6">
            {/* Head Office */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-6 h-6 text-green-600" />
                  Head Office - Ministry of Environment, Forest and Climate Change
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">Address</p>
                        <p className="text-sm text-gray-700">
                          Indira Paryavaran Bhawan
                          <br />
                          Jor Bagh Road, Aliganj
                          <br />
                          New Delhi - 110003, India
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">Phone</p>
                        <p className="text-sm text-gray-700">
                          +91-11-2436-0357, 2436-1669
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Printer className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">Fax</p>
                        <p className="text-sm text-gray-700">+91-11-2436-2746</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">Email</p>
                        <p className="text-sm text-gray-700">
                          moefcc@nic.in
                          <br />
                          parivesh@nic.in
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">Office Hours</p>
                        <p className="text-sm text-gray-700">
                          Monday - Friday
                          <br />
                          9:30 AM - 5:30 PM (IST)
                        </p>
                      </div>
                    </div>
                    <Button className="bg-[#1A5C1A] hover:bg-[#145014]">
                      <NavigationIcon className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional Offices */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Regional Offices</h2>
              <div className="grid grid-cols-1 gap-6">
                {regionalOffices.map((office, index) => (
                  <motion.div
                    key={office.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{office.region}</CardTitle>
                            <CardDescription>
                              {office.city}, {office.state}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{office.state}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                              <div>
                                <p className="text-sm text-gray-700">
                                  {office.address}
                                  <br />
                                  {office.city}, {office.state} - {office.pincode}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-blue-600 mt-1" />
                              <div>
                                <p className="text-sm text-gray-700">
                                  {office.phone.join(", ")}
                                </p>
                              </div>
                            </div>
                            {office.fax && (
                              <div className="flex items-start gap-2">
                                <Printer className="w-4 h-4 text-blue-600 mt-1" />
                                <div>
                                  <p className="text-sm text-gray-700">
                                    {office.fax}
                                  </p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-start gap-2">
                              <Mail className="w-4 h-4 text-blue-600 mt-1" />
                              <div>
                                <p className="text-sm text-gray-700">
                                  {office.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-blue-600 mt-1" />
                              <div>
                                <p className="text-sm text-gray-700">
                                  {office.timings}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold mb-2 text-sm">
                              Jurisdiction - States/UTs:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {office.jurisdiction.map((state, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {state}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Contact Information</CardTitle>
                <CardDescription>
                  Reach out to specific departments for specialized assistance
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {departments.map((dept, index) => (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <dept.icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{dept.name}</CardTitle>
                          <CardDescription>{dept.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-sm font-semibold">{dept.head}</p>
                            <p className="text-xs text-gray-500">
                              {dept.designation}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-600" />
                          <p className="text-sm">{dept.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <p className="text-sm">{dept.email}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Send Inquiry Tab */}
          <TabsContent value="inquiry" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Inquiry Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Send Us Your Inquiry</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you within 24
                      hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submitted ? (
                      <div className="py-12 text-center">
                        <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                          Message Sent Successfully!
                        </h3>
                        <p className="text-gray-600">
                          We've received your inquiry and will respond within 24
                          hours.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              name="name"
                              placeholder="Enter your name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="your.email@example.com"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              name="phone"
                              placeholder="+91 9876543210"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="organizationType">
                              Organization Type
                            </Label>
                            <Select
                              value={formData.organizationType}
                              onValueChange={(value) =>
                                setFormData({ ...formData, organizationType: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="proponent">
                                  Project Proponent
                                </SelectItem>
                                <SelectItem value="consultant">Consultant</SelectItem>
                                <SelectItem value="government">
                                  Government Agency
                                </SelectItem>
                                <SelectItem value="ngo">NGO</SelectItem>
                                <SelectItem value="individual">Individual</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Inquiry Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) =>
                              setFormData({ ...formData, category: value })
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">
                                Technical Support
                              </SelectItem>
                              <SelectItem value="application">
                                Application Status
                              </SelectItem>
                              <SelectItem value="clearance">
                                Clearance Procedures
                              </SelectItem>
                              <SelectItem value="documents">
                                Document Requirements
                              </SelectItem>
                              <SelectItem value="payment">Payment Issues</SelectItem>
                              <SelectItem value="grievance">Grievance</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            name="subject"
                            placeholder="Brief subject of your inquiry"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message *</Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Describe your inquiry in detail..."
                            className="min-h-32"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Note:</strong> For urgent matters, please call our
                            helpline at <strong>1800-11-5678</strong>. For technical
                            issues, use the live chat feature for immediate assistance.
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-[#1A5C1A] hover:bg-[#145014]"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Inquiry
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Side Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Response Times</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm font-semibold">Email Inquiries</p>
                        <p className="text-xs text-gray-600">Within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm font-semibold">Phone Support</p>
                        <p className="text-xs text-gray-600">Immediate</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm font-semibold">Live Chat</p>
                        <p className="text-xs text-gray-600">
                          During business hours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm font-semibold">Technical Issues</p>
                        <p className="text-xs text-gray-600">Within 12 hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-bold mb-2">Need Immediate Help?</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Start a live chat with our support team
                      </p>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Start Live Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Office Hours</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monday - Friday</span>
                      <span className="font-semibold">9:30 AM - 5:30 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saturday</span>
                      <span className="font-semibold">Closed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunday</span>
                      <span className="font-semibold">Closed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Public Holidays</span>
                      <span className="font-semibold">Closed</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        *Helpline available 24x7 for emergencies
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}