"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Award, Plus, Upload } from "lucide-react";
import Certificate from "@/components/Certificate";

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

interface User {
  id: number;
  name: string;
  regNumber: string;
  email: string;
}

interface CertificateTemplate {
  id: number;
  clubId: number;
  eventName: string;
  coordinatorName: string;
  coordinatorSignature: string;
  hodName: string;
  hodSignature: string;
  issueDate: string;
}

export default function CertificateGenerationPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [eventName, setEventName] = useState("");
  const [coordinatorName, setCoordinatorName] = useState("");
  const [hodName, setHodName] = useState("");
  const [coordinatorSignature, setCoordinatorSignature] = useState("");
  const [hodSignature, setHodSignature] = useState("");
  const [previewUser, setPreviewUser] = useState<User | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load clubs from localStorage
    const savedClubs = localStorage.getItem("clubs");
    if (savedClubs) {
      const activeClubs = JSON.parse(savedClubs).filter(
        (club: Club) => club.status === "Active"
      );
      setClubs(activeClubs);
    }

    // Load users from localStorage
    const savedUsers = localStorage.getItem("users");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  useEffect(() => {
    // Filter users based on search query
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.regNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchQuery]);

  const handleGenerateCertificates = () => {
    if (!selectedClub || !eventName || !coordinatorName || !hodName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description:
          "Please select at least one user to generate certificates.",
        variant: "destructive",
      });
      return;
    }

    // Generate certificates for selected users
    const savedCertificates = localStorage.getItem("certificates") || "[]";
    const existingCertificates = JSON.parse(savedCertificates);

    const newCertificates = selectedUsers.map((user) => ({
      id: Math.floor(Math.random() * 1000000),
      userId: user.id,
      studentName: user.name,
      registrationNumber: user.regNumber,
      clubName: selectedClub.clubName,
      eventName: eventName,
      issueDate: new Date().toISOString(),
      coordinatorName: coordinatorName,
      coordinatorSignature: coordinatorSignature || "",
      hodName: hodName,
      hodSignature: hodSignature || "",
      isEnabled: true,
    }));

    const updatedCertificates = [...existingCertificates, ...newCertificates];
    localStorage.setItem("certificates", JSON.stringify(updatedCertificates));

    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event("storage"));

    toast({
      title: "Success",
      description: `Generated ${selectedUsers.length} certificates successfully.`,
    });

    // Reset form
    setSelectedUsers([]);
    setEventName("");
  };

  const handleFileUpload = async (
    type: "coordinator" | "hod",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === "coordinator") {
        setCoordinatorSignature(base64String);
      } else {
        setHodSignature(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      // If all filtered users are selected, deselect all
      setSelectedUsers([]);
    } else {
      // Select all filtered users
      setSelectedUsers(filteredUsers);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Generate Club Certificates</h1>
          <p className="text-muted-foreground">
            Create and manage certificates for club events
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
            <CardDescription>
              Enter the details for the certificates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Club</Label>
              <Select
                value={selectedClub?.id.toString()}
                onValueChange={(value) => {
                  const club = clubs.find((c) => c.id === parseInt(value));
                  setSelectedClub(club || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a club" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id.toString()}>
                      {club.clubName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter event name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coordinatorName">Coordinator Name</Label>
              <Input
                id="coordinatorName"
                value={coordinatorName}
                onChange={(e) => setCoordinatorName(e.target.value)}
                placeholder="Enter coordinator name"
              />
              <p className="text-sm text-muted-foreground">
                A signature will be automatically generated if no image is
                uploaded
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coordinatorSignature">
                Coordinator Signature (Optional)
              </Label>
              <Input
                id="coordinatorSignature"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload("coordinator", e)}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hodName">HOD Name</Label>
              <Input
                id="hodName"
                value={hodName}
                onChange={(e) => setHodName(e.target.value)}
                placeholder="Enter HOD name"
              />
              <p className="text-sm text-muted-foreground">
                A signature will be automatically generated if no image is
                uploaded
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hodSignature">HOD Signature (Optional)</Label>
              <Input
                id="hodSignature"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload("hod", e)}
                className="cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Students</CardTitle>
            <CardDescription>
              Choose students to generate certificates for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or registration number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleSelectAll}
                className="whitespace-nowrap"
              >
                {selectedUsers.length === filteredUsers.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.regNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPreviewUser(user);
                        setShowPreview(true);
                      }}
                    >
                      Preview
                    </Button>
                    <Button
                      variant={
                        selectedUsers.some((u) => u.id === user.id)
                          ? "destructive"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        if (selectedUsers.some((u) => u.id === user.id)) {
                          setSelectedUsers(
                            selectedUsers.filter((u) => u.id !== user.id)
                          );
                        } else {
                          setSelectedUsers([...selectedUsers, user]);
                        }
                      }}
                    >
                      {selectedUsers.some((u) => u.id === user.id)
                        ? "Remove"
                        : "Select"}
                    </Button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  No students found matching your search.
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-muted-foreground">
                Selected: {selectedUsers.length} students
                {searchQuery && ` (Filtered: ${filteredUsers.length})`}
              </p>
              <Button
                onClick={handleGenerateCertificates}
                disabled={
                  !selectedClub ||
                  !eventName ||
                  !coordinatorName ||
                  !hodName ||
                  selectedUsers.length === 0
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Certificates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[1200px] w-[95%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          {previewUser && selectedClub && (
            <div className="p-4">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <Certificate
                  studentName={previewUser.name}
                  registrationNumber={previewUser.regNumber}
                  clubName={selectedClub.clubName}
                  eventName={eventName}
                  issueDate={new Date().toISOString()}
                  coordinatorName={coordinatorName}
                  coordinatorSignature={coordinatorSignature}
                  hodName={hodName}
                  hodSignature={hodSignature}
                  isAdmin={true}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
