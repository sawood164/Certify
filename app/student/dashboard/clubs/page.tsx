"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  Calendar,
  ArrowRight,
  Check,
  Clock,
  Sparkles,
  Users2,
  Trophy,
  Star,
  Activity,
  Bell,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Club {
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

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load clubs
    const savedClubs = localStorage.getItem("clubs");
    if (savedClubs) {
      setClubs(JSON.parse(savedClubs));
    }

    // Load current user data
    const currentUserEmail = localStorage.getItem("userEmail");
    const savedUsers = localStorage.getItem("users");
    if (currentUserEmail && savedUsers) {
      const users = JSON.parse(savedUsers);
      const user = users.find((u: any) => u.email === currentUserEmail);
      if (user) {
        setCurrentUser(user);
      }
    }

    // Load pending requests for current user
    const savedRequests = localStorage.getItem("clubRequests") || "[]";
    const allRequests = JSON.parse(savedRequests);
    const userRequests = allRequests.filter(
      (req: any) =>
        req.studentId === localStorage.getItem("userEmail") &&
        req.status === "Pending"
    );
    setPendingRequests(userRequests);
  }, []);

  const isClubMember = (clubId: number) => {
    return profile?.clubs?.some((club: any) => club.clubId === clubId);
  };

  const hasPendingRequest = (clubId: number) => {
    const requests = JSON.parse(localStorage.getItem("clubRequests") || "[]");
    return requests.some(
      (req: any) =>
        req.clubId === clubId &&
        req.studentId === profile?.id &&
        req.status === "Pending"
    );
  };

  const checkClubStatus = (clubId: number) => {
    // Get all club requests
    const savedRequests = localStorage.getItem("clubRequests") || "[]";
    const requests = JSON.parse(savedRequests);

    // Check if user has any request (pending or accepted) for this club
    const existingRequest = requests.find(
      (req: any) =>
        req.studentId === localStorage.getItem("userEmail") &&
        req.clubId === clubId
    );

    if (existingRequest) {
      return existingRequest.status; // Will return "Pending" or "Approved"
    }

    // Check if user is already a member
    const savedMemberships = localStorage.getItem("clubMemberships") || "[]";
    const memberships = JSON.parse(savedMemberships);
    const isMember = memberships.some(
      (membership: any) =>
        membership.userId === profile?.id && membership.clubId === clubId
    );

    if (isMember) {
      return "Member";
    }

    return null; // No existing relationship with club
  };

  const handleJoinRequest = (clubId: number) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User data not found. Please login again.",
        variant: "destructive",
      });
      return;
    }

    const status = checkClubStatus(clubId);

    if (status) {
      let message = "";
      switch (status) {
        case "Approved":
          message = "You are already accepted in this club";
          break;
        case "Pending":
          message = "You already have a pending request for this club";
          break;
        case "Member":
          message = "You are already a member of this club";
          break;
      }

      toast({
        title: "Cannot Join Club",
        description: message,
        variant: "destructive",
      });
      return;
    }

    // Create new request with user data
    const newRequest = {
      id: Date.now(),
      studentId: currentUser.email,
      studentName: currentUser.name,
      registrationNumber: currentUser.regNumber,
      department: currentUser.department,
      clubId: clubId,
      clubName: clubs.find((c) => c.id === clubId)?.clubName,
      timestamp: new Date().toISOString(),
      status: "Pending",
    };

    // Save request
    const savedRequests = localStorage.getItem("clubRequests") || "[]";
    const requests = JSON.parse(savedRequests);
    localStorage.setItem(
      "clubRequests",
      JSON.stringify([...requests, newRequest])
    );

    toast({
      title: "Success",
      description: "Club join request submitted successfully",
    });
  };

  return (
    <div className="space-y-8 p-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg p-8"
      >
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">College Clubs</h1>
            <p className="text-white/60">
              Join and participate in college clubs
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-lg p-6 backdrop-blur-sm hover:bg-white/10 transition-colors"
        >
          <Users2 className="h-8 w-8 text-blue-400 mb-3" />
          <h3 className="text-sm font-medium text-white/60">Total Clubs</h3>
          <p className="text-3xl font-bold text-white mt-1">{clubs.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-lg p-6 backdrop-blur-sm hover:bg-white/10 transition-colors"
        >
          <Activity className="h-8 w-8 text-green-400 mb-3" />
          <h3 className="text-sm font-medium text-white/60">Active Clubs</h3>
          <p className="text-3xl font-bold text-white mt-1">
            {clubs.filter((club) => club.status === "Active").length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-lg p-6 backdrop-blur-sm hover:bg-white/10 transition-colors"
        >
          <Bell className="h-8 w-8 text-yellow-400 mb-3" />
          <h3 className="text-sm font-medium text-white/60">Your Requests</h3>
          <p className="text-3xl font-bold text-white mt-1">
            {pendingRequests.length}
          </p>
        </motion.div>
      </div>

      {/* Clubs Grid with Animation */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club, index) => (
          <motion.div
            key={club.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full transition-all hover:shadow-lg hover:shadow-blue-500/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {club.clubName}
                    {club.status === "Active" && (
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                    )}
                  </CardTitle>
                  <Badge
                    variant={club.status === "Active" ? "success" : "secondary"}
                    className="capitalize"
                  >
                    {club.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">{club.description}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users2 className="h-4 w-4" />
                      <span>{club.members} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Founded {new Date(club.foundedDate).getFullYear()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    {(() => {
                      const status = checkClubStatus(club.id);
                      switch (status) {
                        case "Approved":
                          return (
                            <motion.div whileHover={{ scale: 1.02 }}>
                              <Badge
                                variant="success"
                                className="w-full py-2 flex justify-center items-center gap-2"
                              >
                                <Check className="h-4 w-4" />
                                Accepted
                              </Badge>
                            </motion.div>
                          );
                        case "Pending":
                          return (
                            <motion.div whileHover={{ scale: 1.02 }}>
                              <Badge
                                variant="warning"
                                className="w-full py-2 flex justify-center items-center gap-2"
                              >
                                <Clock className="h-4 w-4" />
                                Request Pending
                              </Badge>
                            </motion.div>
                          );
                        default:
                          return (
                            <motion.div whileHover={{ scale: 1.02 }}>
                              <Button
                                className="w-full"
                                onClick={() => handleJoinRequest(club.id)}
                                disabled={club.status !== "Active"}
                              >
                                Join Club
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </motion.div>
                          );
                      }
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
