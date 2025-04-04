"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Download,
  User,
  Calendar,
  Mail,
  FileCheck,
  LogOut,
  Award,
  Clock,
  ArrowLeft,
  Share2,
  Eye,
  CheckCircle2,
  BadgeCheck,
  GraduationCap,
  BookOpen,
  Linkedin,
  Share,
  Building2,
  Users,
  Activity,
  Bell,
  Trophy,
  Users2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Certificate from "@/components/Certificate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedDate: string;
  regNumber: string;
  password: string;
  lastLogin: string | null;
  hasDownloadedCertificate: boolean;
}

interface Certificate {
  id: string;
  userId: number;
  studentName: string;
  registrationNumber: string;
  clubName: string;
  eventName: string;
  issueDate: string;
  coordinatorName: string;
  coordinatorSignature: string;
  hodName: string;
  hodSignature: string;
  isEnabled: boolean;
}

interface ClubRegistration {
  id: number;
  clubName: string;
  description: string;
  presidentName: string;
  email: string;
  members: number;
  foundedDate: string;
  status: "Active" | "Pending" | "Inactive";
  category: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [totalClubs, setTotalClubs] = useState(0);
  const [activeClubs, setActiveClubs] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is logged in
    const currentStudent = localStorage.getItem("currentStudent");
    const currentUserEmail = localStorage.getItem("userEmail");

    if (!currentUserEmail) {
      router.push("/login");
      return;
    }

    // Load users to get user ID
    const savedUsers = localStorage.getItem("users");
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      const currentUser = users.find((u: any) => u.email === currentUserEmail);

      if (currentUser) {
        setUser(currentUser);

        // Get certificates for this user
        const savedCertificates = localStorage.getItem("certificates");
        if (savedCertificates) {
          const allCertificates = JSON.parse(savedCertificates);
          const userCertificates = allCertificates.filter(
            (cert: Certificate) =>
              cert.userId === currentUser.id && cert.isEnabled
          );
          setCertificates(userCertificates);
        }
      }
    }

    setLoading(false);

    // Load clubs from localStorage
    const savedClubs = localStorage.getItem("clubs");
    if (savedClubs) {
      const clubs: ClubRegistration[] = JSON.parse(savedClubs);
      setTotalClubs(clubs.length);
      setActiveClubs(clubs.filter((club) => club.status === "Active").length);
    }

    // Load profile data
    if (!currentUserEmail) return;

    // Load profile from localStorage
    const savedProfile = localStorage.getItem(`profile_${currentUserEmail}`);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      // Fallback to users data if no saved profile
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const currentUser = users.find(
          (u: any) => u.email === currentUserEmail
        );
        if (currentUser) {
          setProfile(currentUser);
        }
      }
    }

    // Load pending requests for current user
    const savedRequests = localStorage.getItem("clubRequests") || "[]";
    const allRequests = JSON.parse(savedRequests);
    const userRequests = allRequests.filter(
      (req: any) =>
        req.studentId === currentUserEmail && req.status === "Pending"
    );
    setPendingRequests(userRequests);
  }, []);

  // Add listener for certificate changes
  useEffect(() => {
    const handleCertificateChange = () => {
      const currentUserEmail = localStorage.getItem("userEmail");
      if (!currentUserEmail || !user) return;

      // Get certificates for this user
      const savedCertificates = localStorage.getItem("certificates");
      if (savedCertificates) {
        const allCertificates = JSON.parse(savedCertificates);
        const userCertificates = allCertificates.filter(
          (cert: Certificate) => cert.userId === user.id && cert.isEnabled
        );
        setCertificates(userCertificates);
      }
    };

    // Listen for changes
    window.addEventListener("storage", handleCertificateChange);
    return () => window.removeEventListener("storage", handleCertificateChange);
  }, [user?.id]);

  // Add listener for pending requests changes
  useEffect(() => {
    const handleRequestsChange = () => {
      const currentUserEmail = localStorage.getItem("userEmail");
      if (!currentUserEmail) return;

      const savedRequests = localStorage.getItem("clubRequests") || "[]";
      const allRequests = JSON.parse(savedRequests);
      const userRequests = allRequests.filter(
        (req: any) =>
          req.studentId === currentUserEmail && req.status === "Pending"
      );
      setPendingRequests(userRequests);
    };

    // Listen for changes
    window.addEventListener("storage", handleRequestsChange);
    return () => window.removeEventListener("storage", handleRequestsChange);
  }, []);

  const handleLogout = () => {
    try {
      // First remove all user-specific data
      localStorage.removeItem("userEmail");
      localStorage.removeItem("currentStudent");

      // Get the userEmail before clearing it (might already be null if removed above)
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        localStorage.removeItem(`profile_${userEmail}`);
      }

      // Trigger storage event to notify other components
      window.dispatchEvent(new Event("storage"));

      // Show success message
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });

      // Use direct window location for more reliable navigation
      // Small timeout to allow toast to be seen
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
      // If there's an error, force redirect to home page
      window.location.href = "/";
    }
  };

  const handleDownloadCertificate = async () => {
    if (!selectedCertificate) {
      toast({
        title: "Error",
        description: "Certificate not found. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    const certificateElement = document.getElementById("certificate");
    if (!certificateElement) {
      toast({
        title: "Error",
        description:
          "Certificate element not found. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDownloading(true);

      const canvas = await html2canvas(certificateElement, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;

      pdf.addImage(
        imgData,
        "JPEG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      const filename = `${selectedCertificate.studentName.replace(
        /\s+/g,
        "_"
      )}_${selectedCertificate.clubName.replace(/\s+/g, "_")}_certificate.pdf`;
      pdf.save(filename);

      // Update user's download status
      if (user) {
        const updatedUser = { ...user, hasDownloadedCertificate: true };
        setUser(updatedUser);

        // Update in localStorage
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const updatedUsers = users.map((u: User) =>
          u.id === user.id ? { ...u, hasDownloadedCertificate: true } : u
        );
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        localStorage.setItem("currentStudent", JSON.stringify(updatedUser));
      }

      toast({
        title: "Success!",
        description: "Your certificate has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast({
        title: "Download Failed",
        description:
          "There was an error downloading your certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async (platform: "whatsapp" | "linkedin") => {
    if (!selectedCertificate) return;

    const certificateUrl =
      window.location.origin + `/certificates/${selectedCertificate.id}`;
    const text = `Check out my Professional Web Development Certificate from our program! 🎓`;

    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(
          text + "\n" + certificateUrl
        )}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          certificateUrl
        )}&title=${encodeURIComponent(text)}`;
        break;
    }

    // Open share URL in a new window
    window.open(shareUrl, "_blank");

    toast({
      title: "Share Link Generated",
      description: `Certificate sharing link for ${platform} has been opened.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0118]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0118]">
        <p className="text-gray-400">Please log in to access your dashboard.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0118]">
      {/* Header */}
      <div className="bg-[#110C1D]/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-gray-400 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to home
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                <div
                  className={`h-2 w-2 rounded-full ${
                    user.status === "Active" ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-sm text-gray-300">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-red-500/10 hover:text-red-400 text-gray-400 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg p-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {profile?.name}!
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <motion.div
            variants={item}
            className="bg-white/5 rounded-lg p-6 backdrop-blur-sm hover:bg-white/10 transition-colors"
          >
            <Users2 className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="text-sm font-medium text-white/60">
              Club Memberships
            </h3>
            <p className="text-3xl font-bold text-white mt-1">{totalClubs}</p>
          </motion.div>

          <motion.div
            variants={item}
            className="bg-white/5 rounded-lg p-6 backdrop-blur-sm hover:bg-white/10 transition-colors"
          >
            <Award className="h-8 w-8 text-purple-400 mb-3" />
            <h3 className="text-sm font-medium text-white/60">Certificates</h3>
            <p className="text-3xl font-bold text-white mt-1">
              {certificates.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 rounded-lg p-6 backdrop-blur-sm hover:bg-white/10 transition-colors"
          >
            <Bell className="h-8 w-8 text-yellow-400 mb-3" />
            <h3 className="text-sm font-medium text-white/60">
              Pending Requests
            </h3>
            <p className="text-3xl font-bold text-white mt-1">
              {pendingRequests.length}
            </p>
          </motion.div>

          <motion.div
            variants={item}
            className="bg-white/5 rounded-lg p-6 backdrop-blur-sm hover:bg-white/10 transition-colors"
          >
            <Activity className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="text-sm font-medium text-white/60">Active Clubs</h3>
            <p className="text-3xl font-bold text-white mt-1">{activeClubs}</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <Card className="bg-[#110C1D] border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Link href="/student/dashboard/clubs">
                  <div className="group p-4 rounded-lg border border-white/10 hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Browse Clubs</h3>
                        <p className="text-sm text-white/60">
                          Discover and join college clubs
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/student/dashboard/profile">
                  <div className="group p-4 rounded-lg border border-white/10 hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">My Profile</h3>
                        <p className="text-sm text-white/60">
                          View and update your profile
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div variants={item}>
          <Card className="bg-[#110C1D] border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates.slice(0, 3).map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-white">
                          {cert.eventName}
                        </p>
                        <p className="text-sm text-white/60">{cert.clubName}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}

                {certificates.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60">No recent activities</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Certificate Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[1200px] w-[95%] bg-[#110C1D] border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-[#110C1D] z-10 py-4 border-b border-white/10">
            <DialogTitle className="text-white">Your Certificate</DialogTitle>
          </DialogHeader>
          {selectedCertificate && (
            <div className="p-4">
              <div
                className="relative bg-white rounded-lg shadow-lg p-8"
                id="certificate"
              >
                <Certificate
                  studentName={selectedCertificate.studentName}
                  registrationNumber={selectedCertificate.registrationNumber}
                  clubName={selectedCertificate.clubName}
                  eventName={selectedCertificate.eventName}
                  issueDate={selectedCertificate.issueDate}
                  coordinatorName={selectedCertificate.coordinatorName}
                  coordinatorSignature={
                    selectedCertificate.coordinatorSignature
                  }
                  hodName={selectedCertificate.hodName}
                  hodSignature={selectedCertificate.hodSignature}
                  isAdmin={false}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  onClick={handleDownloadCertificate}
                  className="bg-primary hover:bg-primary/90"
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
