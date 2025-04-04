"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  Mail,
  Hash,
  Building2,
  GraduationCap,
  CheckCircle2,
  Clock,
  User,
  Award,
  BookOpen,
  Shield,
  Pencil,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import Certificate from "@/components/Certificate";
import ReactDOM from "react-dom/client";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface ClubMembership {
  clubId: number;
  clubName: string;
  joinedDate: string;
  status: "Active" | "Inactive";
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  department: string;
  joinDate: string;
  accountStatus: "Active" | "Inactive";
  clubs: ClubMembership[];
  certificates: any[];
  profileImage?: string;
}

interface Club {
  id: number;
  clubName: string;
  status: "Active" | "Pending" | "Inactive";
}

interface Certificate {
  id: string;
  eventName: string;
  issueDate: string;
  isEnabled: boolean;
  coordinatorSignature?: string;
  coordinatorName?: string;
  hodSignature?: string;
  hodName?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [userClubs, setUserClubs] = useState<ClubMembership[]>([]);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedClub, setSelectedClub] = useState("");
  const [acceptedRequests, setAcceptedRequests] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [joinedClubs, setJoinedClubs] = useState<any[]>([]);
  const [approvedClubs, setApprovedClubs] = useState<any[]>([]);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const currentUserEmail = localStorage.getItem("userEmail");
    if (!currentUserEmail) return;

    // Try to load saved profile first
    const savedProfile = localStorage.getItem(`profile_${currentUserEmail}`);
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      // Set profile image from saved profile
      setProfileImage(parsedProfile.profileImage);
    } else {
      // Fallback to users data
      const savedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const currentUser = savedUsers.find(
        (u: any) => u.email === currentUserEmail
      );
      if (currentUser) {
        // Create fresh profile for current user
        const freshProfile: StudentProfile = {
          id: currentUser.id.toString(),
          name: currentUser.name,
          email: currentUser.email,
          registrationNumber: currentUser.regNumber,
          department: currentUser.department,
          joinDate: currentUser.joinedDate,
          accountStatus: currentUser.status,
          clubs: [],
          certificates: [],
        };

        // Load certificates for this user
        const savedCertificates = localStorage.getItem("certificates") || "[]";
        const allCertificates = JSON.parse(savedCertificates);

        // Filter certificates for this user
        const userCertificates = allCertificates.filter(
          (cert: any) =>
            cert.userId === currentUser.id && cert.isEnabled === true
        );

        freshProfile.certificates = userCertificates;
        setProfile(freshProfile);
        setProfileImage(currentUser.profileImage);
      }
    }

    // Load all data from localStorage
    const savedClubs = JSON.parse(localStorage.getItem("clubs") || "[]");
    const savedRequests = JSON.parse(
      localStorage.getItem("clubRequests") || "[]"
    );
    const savedMemberships = JSON.parse(
      localStorage.getItem("clubMemberships") || "[]"
    );
    const savedCertificates = JSON.parse(
      localStorage.getItem("certificates") || "[]"
    );

    // Set clubs state
    setClubs(savedClubs);

    // Handle club memberships and requests
    const userMemberships = savedMemberships.filter(
      (membership: any) => membership.studentId === currentUserEmail
    );

    // Get approved requests
    const approvedRequests = savedRequests.filter(
      (req: any) =>
        req.studentId === currentUserEmail && req.status === "Approved"
    );
    setAcceptedRequests(approvedRequests);

    // Map club details for memberships
    const userClubDetails = userMemberships
      .map((membership: any) => {
        const club = savedClubs.find((c: any) => c.id === membership.clubId);
        return club
          ? {
              ...club,
              joinedDate: membership.joinedDate,
              status: membership.status,
            }
          : null;
      })
      .filter(Boolean);
    setUserClubs(userClubDetails);

    // Filter only approved requests
    const approvedClubDetails = approvedRequests
      .map((request) => {
        const club = savedClubs.find((c: any) => c.id === request.clubId);
        return club
          ? {
              ...club,
              joinedDate: request.timestamp,
              status: club.status || "Inactive",
            }
          : null;
      })
      .filter(Boolean);
    setApprovedClubs(approvedClubDetails);

    // If we already have a profile, also make sure to load latest certificates
    if (profile) {
      // Find the user in users data to get the ID
      const savedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const currentUser = savedUsers.find(
        (u: any) => u.email === currentUserEmail
      );

      if (currentUser) {
        // Get certificates for this user
        const userCertificates = savedCertificates.filter(
          (cert: any) =>
            cert.userId === currentUser.id && cert.isEnabled === true
        );

        // Update the profile with the latest certificates
        setProfile((prev) =>
          prev ? { ...prev, certificates: userCertificates } : null
        );
      }
    }
  }, []);

  // Add a storage event listener specifically for certificates
  useEffect(() => {
    const handleCertificateChange = () => {
      const currentUserEmail = localStorage.getItem("userEmail");
      if (!currentUserEmail || !profile) return;

      // Find the user in users data to get the ID
      const savedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const currentUser = savedUsers.find(
        (u: any) => u.email === currentUserEmail
      );

      if (currentUser) {
        // Get certificates for this user
        const savedCertificates = localStorage.getItem("certificates") || "[]";
        const allCertificates = JSON.parse(savedCertificates);
        const userCertificates = allCertificates.filter(
          (cert: any) =>
            cert.userId === currentUser.id && cert.isEnabled === true
        );

        // Update the profile with the latest certificates
        setProfile((prev) =>
          prev ? { ...prev, certificates: userCertificates } : null
        );
      }
    };

    // Initial load
    handleCertificateChange();

    // Listen for changes
    window.addEventListener("storage", handleCertificateChange);
    return () => window.removeEventListener("storage", handleCertificateChange);
  }, [profile?.id]);

  // Listen for club-related storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "clubRequests") {
        const currentUserEmail = localStorage.getItem("userEmail");
        if (!currentUserEmail) return;

        const requests = JSON.parse(e.newValue || "[]");
        const accepted = requests.filter(
          (req: any) =>
            req.studentId === currentUserEmail && req.status === "Approved"
        );
        setAcceptedRequests(accepted);

        // Update approved clubs
        const savedClubs = JSON.parse(localStorage.getItem("clubs") || "[]");
        const approvedClubDetails = accepted
          .map((request) => {
            const club = savedClubs.find((c: any) => c.id === request.clubId);
            return club
              ? {
                  ...club,
                  joinedDate: request.timestamp,
                  status: club.status || "Inactive",
                }
              : null;
          })
          .filter(Boolean);
        setApprovedClubs(approvedClubDetails);
      } else if (e.key === "clubMemberships") {
        const currentUserEmail = localStorage.getItem("userEmail");
        if (!currentUserEmail) return;

        const savedMemberships = e.newValue || "[]";
        const allMemberships = JSON.parse(savedMemberships);
        const userMemberships = allMemberships.filter(
          (membership: any) => membership.studentId === currentUserEmail
        );

        const savedClubs = JSON.parse(localStorage.getItem("clubs") || "[]");
        const userClubDetails = userMemberships
          .map((membership: any) => {
            const club = savedClubs.find(
              (c: any) => c.id === membership.clubId
            );
            return club
              ? {
                  ...club,
                  joinedDate: membership.joinedDate,
                  status: membership.status,
                }
              : null;
          })
          .filter(Boolean);

        setUserClubs(userClubDetails);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const availableClubs = clubs.filter(
    (club) =>
      club.status === "Active" &&
      !profile.clubs.some((userClub) => userClub.clubId === club.id) &&
      !acceptedRequests.some((req) => req.clubId === club.id)
  );

  const handleJoinClub = () => {
    if (!selectedClub) {
      toast({
        title: "Error",
        description: "Please select a club to join.",
        variant: "destructive",
      });
      return;
    }

    const selectedClubData = clubs.find(
      (club) => club.id === parseInt(selectedClub)
    );
    if (!selectedClubData || selectedClubData.status !== "Active") {
      toast({
        title: "Error",
        description: "This club is not currently accepting new members.",
        variant: "destructive",
      });
      return;
    }

    const clubRequests = JSON.parse(
      localStorage.getItem("clubRequests") || "[]"
    );

    const existingRequest = clubRequests.find(
      (req: any) =>
        req.studentId === profile?.id &&
        req.clubId === parseInt(selectedClub) &&
        req.status === "Pending"
    );

    if (existingRequest) {
      toast({
        title: "Error",
        description: "You already have a pending request for this club.",
        variant: "destructive",
      });
      return;
    }

    const newRequest = {
      id: Date.now(),
      studentId: profile?.id,
      studentName: profile?.name,
      clubId: parseInt(selectedClub),
      timestamp: new Date().toISOString(),
      status: "Pending",
    };

    localStorage.setItem(
      "clubRequests",
      JSON.stringify([...clubRequests, newRequest])
    );

    toast({
      title: "Success",
      description: "Club join request submitted successfully.",
    });

    setShowJoinDialog(false);
    setSelectedClub("");
  };

  const handlePreview = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setShowPreview(true);
  };

  const handleUpdateProfile = () => {
    const savedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = savedUsers.map((user: any) => {
      if (user.email === profile?.email) {
        return {
          ...user,
          department: editedProfile.department,
          profileImage: profileImage,
        };
      }
      return user;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    // Update profile in localStorage for persistence
    const currentUserEmail = localStorage.getItem("userEmail");
    const userProfile = {
      ...profile,
      department: editedProfile.department,
      profileImage: profileImage,
    };
    localStorage.setItem(
      `profile_${currentUserEmail}`,
      JSON.stringify(userProfile)
    );

    setProfile(userProfile);
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8 p-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg p-8"
      >
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-white" />
              )}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{profile?.name}</h1>
          </div>
        </div>
      </motion.div>

      {/* Personal Information Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Personal Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                setEditedProfile(profile);
                setIsEditing(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Registration Number
                  </p>
                  <p className="font-medium">{profile?.registrationNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{profile?.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Joined Date</p>
                  <p className="font-medium">
                    {new Date(profile?.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Account Status
                  </p>
                  <Badge
                    variant={
                      profile?.accountStatus === "Active"
                        ? "success"
                        : "secondary"
                    }
                    className={
                      profile?.accountStatus === "Active"
                        ? "bg-green-500/10 text-green-500"
                        : ""
                    }
                  >
                    {profile?.accountStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Profile Dialog */}
      <AlertDialog open={isEditing} onOpenChange={setIsEditing}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Update your profile photo and department information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="mx-auto">
              <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden group">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-muted-foreground" />
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="h-6 w-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <p className="text-sm text-center mt-2 text-muted-foreground">
                Click to upload photo
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={editedProfile?.department || ""}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    department: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={handleUpdateProfile}>Save Changes</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Joined Clubs Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-500" />
              Joined Clubs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvedClubs.length > 0 ? (
              <div className="space-y-4">
                {approvedClubs.map((club: any) => (
                  <div
                    key={club.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{club.clubName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Joined:{" "}
                          {new Date(club.joinedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          club.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {club.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>You haven't joined any clubs yet</p>
                <p className="text-sm mt-1">Join a club to see it here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Certificates Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.certificates?.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {profile.certificates.map((cert: any) => (
                  <motion.div
                    key={cert.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{cert.eventName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cert.clubName}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => handlePreview(cert)}
                    >
                      Preview Certificate
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No certificates earned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Certificate Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[1200px] w-[95%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          {selectedCertificate && (
            <div className="p-4">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <Certificate
                  studentName={profile.name}
                  registrationNumber={profile.registrationNumber}
                  clubName={selectedCertificate.clubName || ""}
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
