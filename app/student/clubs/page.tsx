"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ClubRegistration {
  id: number;
  clubName: string;
  description: string;
  presidentName: string;
  email: string;
  members: number;
  foundedDate: string;
  status: "Active" | "Pending" | "Inactive";
  socialLinks: {
    website?: string;
    linkedin?: string;
    instagram?: string;
  };
  category: string;
}

interface ClubRequest {
  id: number;
  clubId: number;
  studentId: string; // This would come from the logged-in student's info
  studentName: string;
  studentEmail: string;
  message: string;
  status: "Pending" | "Approved" | "Rejected";
  timestamp: string;
}

export default function StudentClubsPage() {
  const [clubs, setClubs] = useState<ClubRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedClub, setSelectedClub] = useState<ClubRegistration | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [requestForm, setRequestForm] = useState({
    message: "",
    studentName: "",
    studentEmail: "",
  });

  useEffect(() => {
    try {
      // Load clubs from localStorage
      const savedClubs = localStorage.getItem("clubs");
      console.log("Saved clubs from localStorage:", savedClubs); // Debug log

      if (savedClubs) {
        const parsedClubs = JSON.parse(savedClubs);
        console.log("Parsed clubs:", parsedClubs); // Debug log
        setClubs(parsedClubs);
      }
    } catch (error) {
      console.error("Error loading clubs:", error);
      toast({
        title: "Error",
        description: "Failed to load clubs. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleJoinRequest = () => {
    if (!selectedClub) return;

    // Validate form
    if (!requestForm.studentName.trim() || !requestForm.studentEmail.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Create new request
    const newRequest: ClubRequest = {
      id: Date.now(),
      clubId: selectedClub.id,
      studentId: "student123", // This would come from actual student session
      studentName: requestForm.studentName,
      studentEmail: requestForm.studentEmail,
      message: requestForm.message,
      status: "Pending",
      timestamp: new Date().toISOString(),
    };

    // Save request to localStorage
    const savedRequests = localStorage.getItem("clubRequests") || "[]";
    const requests = JSON.parse(savedRequests);
    requests.push(newRequest);
    localStorage.setItem("clubRequests", JSON.stringify(requests));

    toast({
      title: "Success",
      description: "Your request to join the club has been sent successfully.",
    });

    setShowJoinDialog(false);
    setSelectedClub(null);
    setRequestForm({ message: "", studentName: "", studentEmail: "" });
  };

  const filteredClubs = clubs.filter((club) => {
    if (!club || club.status !== "Active") return false;

    const searchTermLower = searchTerm.toLowerCase();
    const clubName = club.clubName?.toLowerCase() || "";
    const category = club.category?.toLowerCase() || "";

    return (
      clubName.includes(searchTermLower) || category.includes(searchTermLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">College Clubs</h1>
        <p className="text-muted-foreground">
          Discover and join clubs that interest you
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading clubs...</p>
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No clubs found matching your search."
              : "No active clubs available at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <Card key={club.id} className="p-6">
              <h3 className="text-xl font-semibold mb-2">{club.clubName}</h3>
              <p className="text-muted-foreground mb-4">{club.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Category:</span>
                  <span className="text-sm">{club.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Members:</span>
                  <span className="text-sm">{club.members}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">President:</span>
                  <span className="text-sm">{club.presidentName}</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedClub(club);
                  setShowJoinDialog(true);
                }}
              >
                Request to Join
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Join {selectedClub?.clubName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input
                value={requestForm.studentName}
                onChange={(e) =>
                  setRequestForm({
                    ...requestForm,
                    studentName: e.target.value,
                  })
                }
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label>Your Email</Label>
              <Input
                type="email"
                value={requestForm.studentEmail}
                onChange={(e) =>
                  setRequestForm({
                    ...requestForm,
                    studentEmail: e.target.value,
                  })
                }
                placeholder="Enter your email address"
              />
            </div>

            <div className="space-y-2">
              <Label>Message (Optional)</Label>
              <Textarea
                value={requestForm.message}
                onChange={(e) =>
                  setRequestForm({ ...requestForm, message: e.target.value })
                }
                placeholder="Why do you want to join this club?"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowJoinDialog(false);
                  setSelectedClub(null);
                  setRequestForm({
                    message: "",
                    studentName: "",
                    studentEmail: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleJoinRequest}>Send Request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
