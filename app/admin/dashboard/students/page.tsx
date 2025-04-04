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
import { Search, Plus, Check, X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Student {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  department: string;
  joinDate: string;
  accountStatus: "Active" | "Inactive";
  clubs: {
    clubId: number;
    clubName: string;
    joinedDate: string;
    status: "Active" | "Inactive";
  }[];
}

interface Club {
  id: number;
  clubName: string;
  status: "Active" | "Pending" | "Inactive";
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    registrationNumber: "",
    department: "",
    clubId: "",
  });

  useEffect(() => {
    // Load clubs
    const savedClubs = localStorage.getItem("clubs");
    if (savedClubs) {
      setClubs(JSON.parse(savedClubs));
    }

    // Load students
    const savedStudents = localStorage.getItem("students") || "[]";
    setStudents(JSON.parse(savedStudents));

    // Load club requests
    const savedRequests = localStorage.getItem("clubRequests") || "[]";
    const requests = JSON.parse(savedRequests);
    setPendingRequests(requests.filter((req: any) => req.status === "Pending"));
  }, []);

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.registrationNumber ||
      !formData.department
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Create new student with empty clubs array
    const newStudent: Student = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      registrationNumber: formData.registrationNumber,
      department: formData.department,
      joinDate: new Date().toISOString().split("T")[0],
      accountStatus: "Active",
      clubs: [],
    };

    // If a club is selected, add it to the clubs array
    if (formData.clubId) {
      const selectedClub = clubs.find(
        (c) => c.id === parseInt(formData.clubId)
      );
      if (selectedClub) {
        newStudent.clubs.push({
          clubId: selectedClub.id,
          clubName: selectedClub.clubName,
          joinedDate: new Date().toISOString().split("T")[0],
          status: "Active" as const,
        });
      }
    }

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    localStorage.setItem("students", JSON.stringify(updatedStudents));

    // Also save to studentProfile for student portal
    localStorage.setItem("studentProfile", JSON.stringify(newStudent));

    toast({
      title: "Success",
      description: formData.clubId
        ? `Student added successfully and assigned to ${newStudent.clubs[0].clubName}`
        : "Student added successfully.",
    });

    setShowAddDialog(false);
    setFormData({
      name: "",
      email: "",
      registrationNumber: "",
      department: "",
      clubId: "",
    });
  };

  const handleRequestAction = (
    requestId: number,
    action: "Approved" | "Rejected"
  ) => {
    const savedRequests = localStorage.getItem("clubRequests") || "[]";
    const requests = JSON.parse(savedRequests);

    const updatedRequests = requests.map((req: any) =>
      req.id === requestId ? { ...req, status: action } : req
    );

    // Update students if request is approved
    if (action === "Approved") {
      const request = requests.find((req: any) => req.id === requestId);
      const club = clubs.find((c) => c.id === request.clubId);

      const updatedStudents = students.map((student) => {
        if (student.id === request.studentId) {
          return {
            ...student,
            clubs: [
              ...student.clubs,
              {
                clubId: request.clubId,
                clubName: club?.clubName || "",
                joinedDate: new Date().toISOString().split("T")[0],
                status: "Active" as const,
              },
            ],
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      localStorage.setItem("students", JSON.stringify(updatedStudents));

      // Update studentProfile for student portal
      const studentProfile = updatedStudents.find(
        (s) => s.id === request.studentId
      );
      if (studentProfile) {
        localStorage.setItem("studentProfile", JSON.stringify(studentProfile));
      }
    }

    localStorage.setItem("clubRequests", JSON.stringify(updatedRequests));
    setPendingRequests(
      updatedRequests.filter((req: any) => req.status === "Pending")
    );

    toast({
      title: "Success",
      description: `Request ${action.toLowerCase()} successfully.`,
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    // Filter out the student to be deleted
    const updatedStudents = students.filter(
      (student) => student.id !== studentId
    );

    // Update localStorage
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setStudents(updatedStudents);

    // Also remove from studentProfile if it's the same student
    const currentProfile = localStorage.getItem("studentProfile");
    if (currentProfile) {
      const profile = JSON.parse(currentProfile);
      if (profile.id === studentId) {
        localStorage.removeItem("studentProfile");
      }
    }

    // Remove any pending club requests for this student
    const savedRequests = localStorage.getItem("clubRequests") || "[]";
    const requests = JSON.parse(savedRequests);
    const updatedRequests = requests.filter(
      (req: any) => req.studentId !== studentId
    );
    localStorage.setItem("clubRequests", JSON.stringify(updatedRequests));

    toast({
      title: "Success",
      description: "Student deleted successfully.",
    });
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.registrationNumber.toLowerCase().includes(searchLower) ||
      student.department.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">
            Manage students and their club memberships
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Pending Club Requests */}
        {pendingRequests.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Pending Club Requests
            </h2>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Club Name</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => {
                    const student = students.find(
                      (s) => s.id === request.studentId
                    );
                    const club = clubs.find((c) => c.id === request.clubId);
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          {student?.name || request.studentName}
                        </TableCell>
                        <TableCell>{club?.clubName}</TableCell>
                        <TableCell>
                          {new Date(request.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRequestAction(request.id, "Approved")
                              }
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRequestAction(request.id, "Rejected")
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Students List */}
        <Card className="p-6">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Registration Number</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Club Names</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.registrationNumber}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {student.clubs.length > 0 ? (
                          student.clubs.map((club) => (
                            <Badge
                              key={club.clubId}
                              variant={
                                club.status === "Active" ? "success" : "outline"
                              }
                              className={
                                club.status === "Active"
                                  ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                  : ""
                              }
                            >
                              {club.clubName}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">
                            No clubs
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.accountStatus === "Active"
                            ? "success"
                            : "destructive"
                        }
                        className={
                          student.accountStatus === "Active"
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : ""
                        }
                      >
                        {student.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter student name"
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
              <Label>Registration Number</Label>
              <Input
                value={formData.registrationNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationNumber: e.target.value,
                  })
                }
                placeholder="Enter registration number"
              />
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Enter department"
              />
            </div>

            <div className="space-y-2">
              <Label>Club Name</Label>
              <Select
                value={formData.clubId}
                onValueChange={(value) =>
                  setFormData({ ...formData, clubId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a club" />
                </SelectTrigger>
                <SelectContent>
                  {clubs
                    .filter((club) => club.status === "Active")
                    .map((club) => (
                      <SelectItem key={club.id} value={club.id.toString()}>
                        {club.clubName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setFormData({
                    name: "",
                    email: "",
                    registrationNumber: "",
                    department: "",
                    clubId: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add Student</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
