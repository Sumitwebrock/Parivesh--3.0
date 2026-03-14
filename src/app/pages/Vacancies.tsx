import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Users,
  GraduationCap,
  DollarSign,
  Search,
  Filter,
  Download,
  ExternalLink,
  FileText,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Building,
  Award,
  TrendingUp,
  Eye,
  Send,
  ArrowRight,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

type JobCategory = "technical" | "administrative" | "scientific" | "support" | "consultancy";
type EmploymentType = "permanent" | "contract" | "temporary" | "consultant";
type ExperienceLevel = "entry" | "mid" | "senior" | "expert";

interface Vacancy {
  id: string;
  title: string;
  department: string;
  category: JobCategory;
  employmentType: EmploymentType;
  location: string;
  positions: number;
  experienceLevel: ExperienceLevel;
  minExperience: number;
  maxExperience?: number;
  qualification: string;
  salary: string;
  applicationDeadline: string;
  postingDate: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  reservationInfo: string;
  isUrgent?: boolean;
  isFeatured?: boolean;
}

export default function Vacancies() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Vacancy | null>(null);

  const stats = [
    {
      label: "Active Openings",
      value: "47",
      icon: Briefcase,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Applications Received",
      value: "8,456",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Positions Filled",
      value: "234",
      icon: CheckCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Departments",
      value: "12",
      icon: Building,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const vacancies: Vacancy[] = [
    {
      id: "VAC-2026-001",
      title: "Senior Environmental Scientist",
      department: "Environmental Clearance Division",
      category: "scientific",
      employmentType: "permanent",
      location: "New Delhi",
      positions: 5,
      experienceLevel: "senior",
      minExperience: 7,
      maxExperience: 12,
      qualification: "PhD in Environmental Science/Engineering or Master's with 10 years experience",
      salary: "₹70,000 - ₹1,20,000 per month (Level 11)",
      applicationDeadline: "2026-04-15",
      postingDate: "2026-03-05",
      description:
        "Senior Environmental Scientists will be responsible for evaluating environmental impact assessments, conducting field inspections, and providing technical guidance for environmental clearance applications.",
      responsibilities: [
        "Review and evaluate Environmental Impact Assessment reports",
        "Conduct site inspections and environmental audits",
        "Provide technical recommendations to Expert Appraisal Committee",
        "Monitor compliance of project proponents with environmental conditions",
        "Prepare technical notes and reports for decision-making",
        "Coordinate with state pollution control boards and other agencies",
      ],
      requirements: [
        "PhD in Environmental Science/Engineering or equivalent",
        "Minimum 7 years of relevant experience in environmental assessment",
        "Strong knowledge of EIA Notification 2006 and environmental laws",
        "Excellent analytical and report writing skills",
        "Proficiency in GIS and environmental modeling software",
        "Experience in conducting environmental audits and inspections",
      ],
      reservationInfo: "Reservation as per Government of India rules (SC-15%, ST-7.5%, OBC-27%)",
      isFeatured: true,
      isUrgent: true,
    },
    {
      id: "VAC-2026-002",
      title: "Forest Conservation Officer",
      department: "Forest Clearance Division",
      category: "technical",
      employmentType: "permanent",
      location: "New Delhi",
      positions: 8,
      experienceLevel: "mid",
      minExperience: 4,
      maxExperience: 8,
      qualification: "Master's degree in Forestry/Environmental Science with B.Sc. Forestry",
      salary: "₹50,000 - ₹90,000 per month (Level 10)",
      applicationDeadline: "2026-04-20",
      postingDate: "2026-03-01",
      description:
        "Forest Conservation Officers will process forest clearance applications, conduct field verifications, and ensure compliance with Forest Conservation Act.",
      responsibilities: [
        "Process applications under Forest Conservation Act, 1980",
        "Conduct field inspections of forest areas proposed for diversion",
        "Verify compensatory afforestation proposals and site suitability",
        "Calculate Net Present Value and prepare technical reports",
        "Coordinate with State Forest Departments for compliance monitoring",
        "Maintain database of forest clearance cases",
      ],
      requirements: [
        "Master's degree in Forestry or Environmental Science",
        "Bachelor's degree in Forestry (B.Sc. Forestry)",
        "Minimum 4 years experience in forest management or conservation",
        "Knowledge of Forest Conservation Act and related rules",
        "Field experience in forest assessment and surveys",
        "Computer proficiency including MS Office and GIS",
      ],
      reservationInfo: "Reservation as per Government of India rules",
      isFeatured: true,
    },
    {
      id: "VAC-2026-003",
      title: "Wildlife Biologist",
      department: "Wildlife Division",
      category: "scientific",
      employmentType: "permanent",
      location: "Multiple Locations",
      positions: 6,
      experienceLevel: "mid",
      minExperience: 5,
      maxExperience: 10,
      qualification: "Master's/PhD in Wildlife Biology, Zoology or related field",
      salary: "₹55,000 - ₹95,000 per month (Level 10)",
      applicationDeadline: "2026-04-18",
      postingDate: "2026-02-28",
      description:
        "Wildlife Biologists will assess impacts on wildlife habitats, evaluate biodiversity studies, and provide technical inputs for wildlife clearances.",
      responsibilities: [
        "Review wildlife impact assessment studies",
        "Conduct biodiversity surveys and assessments",
        "Evaluate projects in eco-sensitive zones and protected areas",
        "Provide recommendations on wildlife conservation measures",
        "Monitor compliance with wildlife protection conditions",
        "Prepare technical reports for Standing Committee",
      ],
      requirements: [
        "Master's degree or PhD in Wildlife Biology/Zoology",
        "Minimum 5 years field experience in wildlife research",
        "Knowledge of Wildlife Protection Act, 1972",
        "Experience in biodiversity assessment methodologies",
        "Strong research and analytical skills",
        "Publications in peer-reviewed journals preferred",
      ],
      reservationInfo: "Reservation as per Government of India norms",
      isUrgent: true,
    },
    {
      id: "VAC-2026-004",
      title: "Coastal Zone Management Specialist",
      department: "CRZ Division",
      category: "technical",
      employmentType: "permanent",
      location: "Chennai",
      positions: 4,
      experienceLevel: "senior",
      minExperience: 6,
      maxExperience: 12,
      qualification: "Master's in Marine Science/Coastal Engineering/Environmental Science",
      salary: "₹60,000 - ₹1,00,000 per month (Level 11)",
      applicationDeadline: "2026-04-25",
      postingDate: "2026-03-08",
      description:
        "CRZ Specialists will evaluate projects in coastal areas, ensure compliance with CRZ Notification, and coordinate with coastal states.",
      responsibilities: [
        "Evaluate CRZ clearance applications and site inspections",
        "Review Coastal Zone Management Plans (CZMP)",
        "Verify HTL/LTL demarcation and CRZ boundary mapping",
        "Coordinate with state coastal authorities",
        "Monitor compliance of coastal projects",
        "Provide technical inputs on coastal conservation",
      ],
      requirements: [
        "Master's degree in Marine Science/Coastal Engineering",
        "Minimum 6 years experience in coastal zone management",
        "In-depth knowledge of CRZ Notification 2019",
        "Experience in coastal surveys and mapping",
        "GIS and remote sensing expertise",
        "Strong coordination and communication skills",
      ],
      reservationInfo: "As per Government rules including EWS reservation",
      isFeatured: true,
    },
    {
      id: "VAC-2026-005",
      title: "IT Systems Analyst",
      department: "IT & Digital Services",
      category: "technical",
      employmentType: "permanent",
      location: "New Delhi",
      positions: 3,
      experienceLevel: "mid",
      minExperience: 4,
      maxExperience: 8,
      qualification: "B.Tech/M.Tech in Computer Science/IT or MCA",
      salary: "₹50,000 - ₹85,000 per month (Level 10)",
      applicationDeadline: "2026-04-10",
      postingDate: "2026-03-02",
      description:
        "IT Systems Analysts will maintain and enhance the PARIVESH portal, develop new modules, and provide technical support.",
      responsibilities: [
        "Maintain and enhance PARIVESH 3.0 portal",
        "Develop new features and modules as per requirements",
        "Ensure system security and data integrity",
        "Provide technical support to users",
        "Database management and optimization",
        "Coordinate with NIC for infrastructure management",
      ],
      requirements: [
        "B.Tech/M.Tech in Computer Science or MCA",
        "4+ years experience in web application development",
        "Strong knowledge of React, Node.js, databases",
        "Experience with government portal development preferred",
        "Understanding of cyber security protocols",
        "Excellent problem-solving skills",
      ],
      reservationInfo: "Reservation as per Govt. of India guidelines",
    },
    {
      id: "VAC-2026-006",
      title: "Legal Advisor (Environment)",
      department: "Legal Cell",
      category: "administrative",
      employmentType: "contract",
      location: "New Delhi",
      positions: 2,
      experienceLevel: "senior",
      minExperience: 8,
      maxExperience: 15,
      qualification: "LLB/LLM with specialization in Environmental Law",
      salary: "₹75,000 - ₹1,25,000 per month (Consolidated)",
      applicationDeadline: "2026-04-12",
      postingDate: "2026-03-04",
      description:
        "Legal Advisors will provide legal opinions on environmental clearances, represent ministry in courts, and draft legal documents.",
      responsibilities: [
        "Provide legal advice on environmental clearance matters",
        "Draft legal opinions, responses to RTI, and court matters",
        "Represent ministry in environmental litigation",
        "Review and vet clearance conditions for legal compliance",
        "Advise on interpretation of environmental laws and regulations",
        "Handle appeals and legal challenges to clearance decisions",
      ],
      requirements: [
        "LLB/LLM degree with environmental law specialization",
        "Minimum 8 years experience in environmental law practice",
        "Strong knowledge of environmental jurisprudence",
        "Experience in appearing before courts and tribunals",
        "Excellent legal drafting and research skills",
        "Bar Council registration mandatory",
      ],
      reservationInfo: "Contract position - no reservation applicable",
    },
    {
      id: "VAC-2026-007",
      title: "Public Relations Officer",
      department: "Communication & Outreach",
      category: "administrative",
      employmentType: "permanent",
      location: "New Delhi",
      positions: 2,
      experienceLevel: "mid",
      minExperience: 5,
      maxExperience: 10,
      qualification: "Master's in Mass Communication/Journalism/PR",
      salary: "₹45,000 - ₹80,000 per month (Level 10)",
      applicationDeadline: "2026-04-22",
      postingDate: "2026-03-06",
      description:
        "PROs will manage media relations, handle public communications, and organize awareness programs on environmental clearances.",
      responsibilities: [
        "Manage media relations and press releases",
        "Organize press conferences and media briefings",
        "Handle social media and digital communications",
        "Coordinate public awareness campaigns",
        "Respond to media queries and manage ministry's public image",
        "Prepare communication materials and annual reports",
      ],
      requirements: [
        "Master's degree in Mass Communication/Journalism",
        "5+ years experience in public relations/media",
        "Excellent written and verbal communication skills",
        "Experience with government communications preferred",
        "Social media management expertise",
        "Ability to handle media in crisis situations",
      ],
      reservationInfo: "Reservation as per Government of India rules",
    },
    {
      id: "VAC-2026-008",
      title: "Data Entry Operator",
      department: "Administrative Services",
      category: "support",
      employmentType: "contract",
      location: "New Delhi",
      positions: 10,
      experienceLevel: "entry",
      minExperience: 1,
      maxExperience: 3,
      qualification: "12th Pass with Diploma in Computer Applications",
      salary: "₹25,000 - ₹35,000 per month (Consolidated)",
      applicationDeadline: "2026-04-30",
      postingDate: "2026-03-10",
      description:
        "Data Entry Operators will maintain databases, digitize records, and provide data entry support for clearance applications.",
      responsibilities: [
        "Enter and update data in PARIVESH portal",
        "Digitize physical documents and maintain records",
        "Verify data accuracy and completeness",
        "Generate reports as required",
        "Maintain confidentiality of data",
        "Assist in record management",
      ],
      requirements: [
        "12th standard pass with minimum 60% marks",
        "Diploma/Certificate in Computer Applications",
        "Typing speed: 40 wpm in English",
        "Proficiency in MS Office applications",
        "1-3 years experience in data entry work",
        "Attention to detail and accuracy",
      ],
      reservationInfo: "Reservation as per Government norms",
    },
    {
      id: "VAC-2026-009",
      title: "Environmental Consultant",
      department: "Expert Appraisal Committee",
      category: "consultancy",
      employmentType: "consultant",
      location: "Remote/New Delhi",
      positions: 15,
      experienceLevel: "expert",
      minExperience: 10,
      qualification: "PhD with 10+ years experience in relevant sector",
      salary: "₹3,000 - ₹5,000 per meeting (Honorarium)",
      applicationDeadline: "2026-04-28",
      postingDate: "2026-03-09",
      description:
        "Environmental Consultants will serve as expert members for EAC/SEAC meetings and provide sector-specific technical expertise.",
      responsibilities: [
        "Attend Expert Appraisal Committee meetings",
        "Review EIA reports and provide expert opinions",
        "Conduct site visits when required",
        "Recommend clearance conditions",
        "Provide sector-specific technical guidance",
        "Prepare meeting minutes and recommendations",
      ],
      requirements: [
        "PhD in relevant environmental/technical field",
        "Minimum 10 years experience in specific sector",
        "Published research in peer-reviewed journals",
        "Expert knowledge in mining/infrastructure/industry",
        "No conflict of interest with project proponents",
        "Available for periodic meetings (2-4 times per month)",
      ],
      reservationInfo: "Consultancy position - selection based on expertise",
      isFeatured: true,
    },
  ];

  const filteredVacancies = vacancies.filter((vacancy) => {
    const categoryMatch = selectedCategory === "all" || vacancy.category === selectedCategory;
    const typeMatch = selectedType === "all" || vacancy.employmentType === selectedType;
    const locationMatch = selectedLocation === "all" || vacancy.location === selectedLocation;
    const searchMatch =
      searchQuery === "" ||
      vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vacancy.department.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && typeMatch && locationMatch && searchMatch;
  });

  const getCategoryBadgeColor = (category: JobCategory) => {
    const colors = {
      technical: "bg-blue-100 text-blue-700",
      administrative: "bg-purple-100 text-purple-700",
      scientific: "bg-green-100 text-green-700",
      support: "bg-gray-100 text-gray-700",
      consultancy: "bg-orange-100 text-orange-700",
    };
    return colors[category];
  };

  const getExperienceLevelLabel = (level: ExperienceLevel) => {
    const labels = {
      entry: "Entry Level",
      mid: "Mid Level",
      senior: "Senior Level",
      expert: "Expert Level",
    };
    return labels[level];
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#003087] to-[#0047AB] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64">
            <Briefcase className="w-full h-full" />
          </div>
          <div className="absolute bottom-10 left-10 w-48 h-48">
            <Users className="w-full h-full" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-12 h-12" />
              <h1 className="text-4xl font-bold">Career Opportunities</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mb-6">
              Join the Ministry of Environment, Forest and Climate Change in shaping
              India's sustainable future through environmental governance
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
        <Tabs defaultValue="current" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="current">Current Openings</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>

          {/* Current Openings Tab */}
          <TabsContent value="current" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search positions..."
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
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="scientific">Scientific</SelectItem>
                      <SelectItem value="administrative">Administrative</SelectItem>
                      <SelectItem value="support">Support Staff</SelectItem>
                      <SelectItem value="consultancy">Consultancy</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Employment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="New Delhi">New Delhi</SelectItem>
                      <SelectItem value="Chennai">Chennai</SelectItem>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Kolkata">Kolkata</SelectItem>
                      <SelectItem value="Multiple Locations">Multiple Locations</SelectItem>
                      <SelectItem value="Remote/New Delhi">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Vacancy Cards */}
            <div className="space-y-4">
              {filteredVacancies.map((vacancy, index) => {
                const daysRemaining = getDaysRemaining(vacancy.applicationDeadline);
                return (
                  <motion.div
                    key={vacancy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`hover:shadow-lg transition-shadow ${
                        vacancy.isFeatured ? "border-2 border-orange-200" : ""
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <Briefcase className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-bold">{vacancy.title}</h3>
                                  {vacancy.isFeatured && (
                                    <Badge className="bg-orange-600">Featured</Badge>
                                  )}
                                  {vacancy.isUrgent && (
                                    <Badge className="bg-red-600">Urgent</Badge>
                                  )}
                                </div>
                                <p className="text-gray-600 mb-3">{vacancy.department}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  <Badge
                                    className={getCategoryBadgeColor(vacancy.category)}
                                    variant="outline"
                                  >
                                    {vacancy.category.charAt(0).toUpperCase() +
                                      vacancy.category.slice(1)}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {vacancy.employmentType}
                                  </Badge>
                                  <Badge variant="outline">
                                    {getExperienceLevelLabel(vacancy.experienceLevel)}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {vacancy.location}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4" />
                                {vacancy.positions} Position{vacancy.positions > 1 ? "s" : ""}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <GraduationCap className="w-4 h-4" />
                                {vacancy.minExperience}
                                {vacancy.maxExperience && `-${vacancy.maxExperience}`} years
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <DollarSign className="w-4 h-4" />
                                {vacancy.salary.split(" ")[0]}
                              </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded text-sm mb-4">
                              <span className="font-semibold">Qualification: </span>
                              {vacancy.qualification}
                            </div>

                            <div className="flex items-center gap-4">
                              <div
                                className={`flex items-center gap-2 text-sm ${
                                  daysRemaining <= 7
                                    ? "text-red-600 font-semibold"
                                    : "text-gray-600"
                                }`}
                              >
                                <Clock className="w-4 h-4" />
                                {daysRemaining > 0
                                  ? `${daysRemaining} days remaining`
                                  : "Deadline passed"}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                Posted:{" "}
                                {new Date(vacancy.postingDate).toLocaleDateString("en-IN")}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedJob(vacancy)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl">
                                    {vacancy.title}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {vacancy.department} • {vacancy.id}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6 mt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-600 mb-1">Location</p>
                                      <p className="font-semibold">{vacancy.location}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600 mb-1">Positions</p>
                                      <p className="font-semibold">{vacancy.positions}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600 mb-1">
                                        Experience Required
                                      </p>
                                      <p className="font-semibold">
                                        {vacancy.minExperience}
                                        {vacancy.maxExperience && `-${vacancy.maxExperience}`}{" "}
                                        years
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600 mb-1">Salary</p>
                                      <p className="font-semibold">{vacancy.salary}</p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">Description</h4>
                                    <p className="text-gray-700">{vacancy.description}</p>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Key Responsibilities
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                      {vacancy.responsibilities.map((item, i) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Eligibility & Requirements
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                      {vacancy.requirements.map((item, i) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                      <AlertCircle className="w-5 h-5 text-blue-600" />
                                      Reservation Policy
                                    </h4>
                                    <p className="text-sm text-gray-700">
                                      {vacancy.reservationInfo}
                                    </p>
                                  </div>

                                  <div className="bg-red-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2 text-red-700">
                                      Application Deadline
                                    </h4>
                                    <p className="text-sm">
                                      {new Date(
                                        vacancy.applicationDeadline
                                      ).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}{" "}
                                      ({daysRemaining} days remaining)
                                    </p>
                                  </div>

                                  <div className="flex gap-3">
                                    <Button className="flex-1 bg-[#1A5C1A] hover:bg-[#145014]">
                                      <Send className="w-4 h-4 mr-2" />
                                      Apply Now
                                    </Button>
                                    <Button variant="outline">
                                      <Download className="w-4 h-4 mr-2" />
                                      Download PDF
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button className="bg-[#1A5C1A] hover:bg-[#145014]" size="sm">
                              <Send className="w-4 h-4 mr-2" />
                              Apply
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {filteredVacancies.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No vacancies found</h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or check back later for new openings
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Upcoming Tab */}
          <TabsContent value="upcoming">
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upcoming Vacancies</h3>
                <p className="text-gray-600 mb-4">
                  New positions will be announced soon. Check this space regularly for
                  updates.
                </p>
                <Button variant="outline">
                  Subscribe to Notifications
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Archive Tab */}
          <TabsContent value="archive">
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Archived Positions</h3>
                <p className="text-gray-600 mb-4">
                  View previously closed job postings and selection lists
                </p>
                <Button variant="outline">
                  View Archive
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
            <CardDescription>Essential resources for applicants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Application Guidelines",
                  icon: BookOpen,
                  description: "Step-by-step guide to apply online",
                },
                {
                  title: "FAQs",
                  icon: AlertCircle,
                  description: "Frequently asked questions",
                },
                {
                  title: "Selection Process",
                  icon: Award,
                  description: "Understand the recruitment procedure",
                },
              ].map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex-col items-start hover:bg-blue-50 hover:border-blue-300"
                >
                  <item.icon className="w-6 h-6 text-[#003087] mb-2" />
                  <div className="text-left">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-12 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Need Assistance?</h3>
                <p className="text-gray-700 mb-4">
                  For any queries related to recruitment, eligibility, or application
                  process, please contact our recruitment cell.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p className="text-gray-600">recruitment.moefcc@nic.in</p>
                  </div>
                  <div>
                    <p className="font-semibold">Helpline:</p>
                    <p className="text-gray-600">1800-11-5678 (Mon-Fri, 9:30 AM - 5:30 PM)</p>
                  </div>
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
