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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash,
  Building2,
  Mail,
  User,
  Calendar,
  Link as LinkIcon,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
  studentId: string;
  studentName: string;
  studentEmail: string;
  message: string;
  status: "Pending" | "Approved" | "Rejected";
  timestamp: string;
}

export default function ClubRegistrationPage() {
  const [clubs, setClubs] = useState<ClubRegistration[]>([]);
  const [requests, setRequests] = useState<ClubRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingClub, setEditingClub] = useState<ClubRegistration | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    clubName: "",
    description: "",
    presidentName: "",
    email: "",
    members: "",
    foundedDate: "",
    status: "Pending",
    category: "",
    website: "",
    linkedin: "",
    instagram: "",
  });

  useEffect(() => {
    // Load clubs from localStorage
    const savedClubs = localStorage.getItem("clubs");
    if (savedClubs) {
      setClubs(JSON.parse(savedClubs));
    }

    // Load requests from localStorage
    const savedRequests = localStorage.getItem("clubRequests");
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    }
  }, []);

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.clubName.trim()) {
      toast({
        title: "Error",
        description: "Club name is required.",
        variant: "destructive",
      });
      return;
    }

    const members = parseInt(formData.members) || 0;

    const newClub: ClubRegistration = {
      id: editingClub?.id || Date.now(),
      clubName: formData.clubName.trim(),
      description: formData.description.trim(),
      presidentName: formData.presidentName.trim(),
      email: formData.email.trim(),
      members: members,
      foundedDate: formData.foundedDate,
      status: formData.status as "Active" | "Pending" | "Inactive",
      category: formData.category,
      socialLinks: {
        website: formData.website.trim(),
        linkedin: formData.linkedin.trim(),
        instagram: formData.instagram.trim(),
      },
    };

    try {
      if (editingClub) {
        // Update existing club
        const updatedClubs = clubs.map((club) =>
          club.id === editingClub.id ? newClub : club
        );
        setClubs(updatedClubs);
        localStorage.setItem("clubs", JSON.stringify(updatedClubs));
        toast({
          title: "Success",
          description: "Club information updated successfully.",
        });
      } else {
        // Add new club
        const updatedClubs = [...clubs, newClub];
        setClubs(updatedClubs);
        localStorage.setItem("clubs", JSON.stringify(updatedClubs));
        toast({
          title: "Success",
          description: "New club registered successfully.",
        });
      }

      setShowAddDialog(false);
      setEditingClub(null);
      resetForm();
    } catch (error) {
      console.error("Error saving club:", error);
      toast({
        title: "Error",
        description: "Failed to save club information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (club: ClubRegistration) => {
    setFormData({
      clubName: club.clubName || "",
      description: club.description || "",
      presidentName: club.presidentName || "",
      email: club.email || "",
      members: club.members?.toString() || "0",
      foundedDate: club.foundedDate || "",
      status: club.status || "Pending",
      category: club.category || "",
      website: club.socialLinks?.website || "",
      linkedin: club.socialLinks?.linkedin || "",
      instagram: club.socialLinks?.instagram || "",
    });
    setEditingClub(club);
    setShowAddDialog(true);
  };

  const handleDelete = (id: number) => {
    const updatedClubs = clubs.filter((club) => club.id !== id);
    setClubs(updatedClubs);
    localStorage.setItem("clubs", JSON.stringify(updatedClubs));
    toast({
      title: "Success",
      description: "Club deleted successfully.",
    });
  };

  const resetForm = () => {
    setFormData({
      clubName: "",
      description: "",
      presidentName: "",
      email: "",
      members: "",
      foundedDate: "",
      status: "Pending",
      category: "",
      website: "",
      linkedin: "",
      instagram: "",
    });
  };

  const handleRequestAction = (
    requestId: number,
    action: "Approved" | "Rejected"
  ) => {
    const updatedRequests = requests.map((request) =>
      request.id === requestId ? { ...request, status: action } : request
    );

    if (action === "Approved") {
      // Update club members count
      const request = requests.find((r) => r.id === requestId);
      if (request) {
        const updatedClubs = clubs.map((club) =>
          club.id === request.clubId
            ? { ...club, members: club.members + 1 }
            : club
        );
        setClubs(updatedClubs);
        localStorage.setItem("clubs", JSON.stringify(updatedClubs));
      }
    }

    setRequests(updatedRequests);
    localStorage.setItem("clubRequests", JSON.stringify(updatedRequests));

    toast({
      title: "Success",
      description: `Request ${action.toLowerCase()} successfully.`,
    });
  };

  const handleDeleteRequest = (requestId: number) => {
    // Get current requests from localStorage
    const savedRequests = localStorage.getItem("clubRequests") || "[]";
    const requests = JSON.parse(savedRequests);

    // Filter out the request to be deleted
    const updatedRequests = requests.filter((req: any) => req.id !== requestId);

    // Update localStorage and state
    localStorage.setItem("clubRequests", JSON.stringify(updatedRequests));
    setRequests(updatedRequests);

    toast({
      title: "Success",
      description: "Join request deleted successfully.",
    });
  };

  const filteredClubs = clubs.filter((club) => {
    if (!club) return false;

    const searchTermLower = searchTerm.toLowerCase();
    const clubName = club.clubName?.toLowerCase() || "";
    const presidentName = club.presidentName?.toLowerCase() || "";
    const category = club.category?.toLowerCase() || "";

    return (
      clubName.includes(searchTermLower) ||
      presidentName.includes(searchTermLower) ||
      category.includes(searchTermLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Club Registration</h1>
          <p className="text-muted-foreground">
            Manage and monitor club registrations
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Register New Club
        </Button>
      </div>

      <Tabs defaultValue="clubs">
        <TabsList>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
          <TabsTrigger value="requests">Join Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="clubs">
          <Card className="p-6">
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

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Club Name</TableHead>
                    <TableHead>President</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Founded Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClubs.map((club) => (
                    <TableRow key={club.id}>
                      <TableCell className="font-medium">
                        {club.clubName}
                      </TableCell>
                      <TableCell>{club.presidentName}</TableCell>
                      <TableCell>{club.category}</TableCell>
                      <TableCell>{club.members}</TableCell>
                      <TableCell>
                        {new Date(club.foundedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            club.status === "Active"
                              ? "bg-green-50 text-green-700"
                              : club.status === "Pending"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {club.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(club)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(club.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card className="p-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Club Name</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Registration No.</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => {
                    const club = clubs.find((c) => c.id === request.clubId);
                    return (
                      <TableRow key={request.id}>
                        <TableCell>{club?.clubName}</TableCell>
                        <TableCell>{request.studentName}</TableCell>
                        <TableCell>{request.studentId}</TableCell>
                        <TableCell>{request.studentEmail}</TableCell>
                        <TableCell>
                          {new Date(request.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              request.status === "Approved"
                                ? "success"
                                : request.status === "Rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {request.status === "Pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleRequestAction(request.id, "Approved")
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleRequestAction(request.id, "Rejected")
                                  }
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-[600px] w-full">
          <DialogHeader>
            <DialogTitle>
              {editingClub ? "Edit Club" : "Register New Club"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Club Name</Label>
              <Input
                value={formData.clubName}
                onChange={(e) =>
                  setFormData({ ...formData, clubName: e.target.value })
                }
                placeholder="Enter club name"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter club description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>President Name</Label>
                <Input
                  value={formData.presidentName}
                  onChange={(e) =>
                    setFormData({ ...formData, presidentName: e.target.value })
                  }
                  placeholder="Enter president name"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label>Number of Members</Label>
                <Input
                  type="number"
                  value={formData.members}
                  onChange={(e) =>
                    setFormData({ ...formData, members: e.target.value })
                  }
                  placeholder="Enter number of members"
                />
              </div>

              <div className="space-y-2">
                <Label>Founded Date</Label>
                <Input
                  type="date"
                  value={formData.foundedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, foundedDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Social Links</Label>
              <div className="space-y-2">
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="Website URL"
                    className="pl-10"
                  />
                </div>
                <Input
                  value={formData.linkedin}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin: e.target.value })
                  }
                  placeholder="LinkedIn URL"
                />
                <Input
                  value={formData.instagram}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram: e.target.value })
                  }
                  placeholder="Instagram URL"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingClub(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingClub ? "Update Club" : "Register Club"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
