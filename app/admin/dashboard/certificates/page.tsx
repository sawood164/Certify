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
  Award,
  Download,
  Edit,
  Eye,
  FileUp,
  Palette,
  Plus,
  Search,
  Settings,
  Trash,
} from "lucide-react";
import { useState, useEffect } from "react";
import Certificate from "@/components/Certificate";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  name: string;
  regNumber: string;
  email: string;
  role: string;
  status: string;
  joinedDate: string;
  hasDownloadedCertificate: boolean;
}

interface CertificateTemplate {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  fontFamily: string;
  borderStyle: string;
  watermarkOpacity: string;
  logoPosition: string;
}

interface Certificate {
  id: number;
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

export default function CertificatesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load users and their certificates
    const savedUsers = localStorage.getItem("users");
    const savedClubs = localStorage.getItem("clubs");
    if (savedUsers && savedClubs) {
      const users = JSON.parse(savedUsers);
      const clubs = JSON.parse(savedClubs);
      setUsers(users);

      // Load or initialize certificates
      const savedCertificates = localStorage.getItem("certificates");
      let existingCertificates: Certificate[] = savedCertificates
        ? JSON.parse(savedCertificates)
        : [];

      // Create certificates for users who don't have one
      const newCertificates = users
        .filter(
          (user: User) =>
            !existingCertificates.some((cert) => cert.userId === user.id)
        )
        .map((user: User) => ({
          id: Math.floor(Math.random() * 1000000),
          userId: user.id,
          studentName: user.name,
          registrationNumber: user.regNumber,
          clubName: "",
          eventName: "",
          issueDate: new Date().toISOString(),
          coordinatorName: "Club Coordinator",
          coordinatorSignature: "",
          hodName: "Head of Department",
          hodSignature: "",
          isEnabled: false,
        }));

      if (newCertificates.length > 0) {
        existingCertificates = [...existingCertificates, ...newCertificates];
        localStorage.setItem(
          "certificates",
          JSON.stringify(existingCertificates)
        );
      }

      setCertificates(existingCertificates);
    }
  }, []);

  const handleUpdateCertificate = (certificate: Certificate) => {
    const updatedCertificates = certificates.map((cert) =>
      cert.id === certificate.id ? certificate : cert
    );
    setCertificates(updatedCertificates);
    localStorage.setItem("certificates", JSON.stringify(updatedCertificates));

    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event("storage"));

    toast({
      title: "Certificate Updated",
      description: "Certificate has been updated successfully.",
    });
  };

  const handleToggleCertificate = (certificateId: number) => {
    const updatedCertificates = certificates.map((cert) =>
      cert.id === certificateId ? { ...cert, isEnabled: !cert.isEnabled } : cert
    );
    setCertificates(updatedCertificates);
    localStorage.setItem("certificates", JSON.stringify(updatedCertificates));

    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event("storage"));

    toast({
      title: "Certificate Status Updated",
      description: `Certificate has been ${
        updatedCertificates.find((cert) => cert.id === certificateId)?.isEnabled
          ? "enabled"
          : "disabled"
      }.`,
    });
  };

  const handlePreview = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowPreview(true);
  };

  const filteredCertificates = certificates.filter((certificate) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      certificate.studentName.toLowerCase().includes(searchLower) ||
      certificate.registrationNumber.toLowerCase().includes(searchLower) ||
      certificate.clubName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Certificates</h1>
        <div className="w-64">
          <Input
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Registration Number</TableHead>
              <TableHead>Club Name</TableHead>
              <TableHead>Event Name</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCertificates.map((certificate) => (
              <TableRow key={certificate.id}>
                <TableCell>{certificate.studentName}</TableCell>
                <TableCell>{certificate.registrationNumber}</TableCell>
                <TableCell>{certificate.clubName}</TableCell>
                <TableCell>{certificate.eventName}</TableCell>
                <TableCell>
                  {new Date(certificate.issueDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={certificate.isEnabled ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleToggleCertificate(certificate.id)}
                  >
                    {certificate.isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(certificate)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCertificate(certificate);
                        setShowTemplateEditor(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Certificate Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[1200px] w-full">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          {selectedCertificate && (
            <Certificate
              studentName={selectedCertificate.studentName}
              registrationNumber={selectedCertificate.registrationNumber}
              clubName={selectedCertificate.clubName}
              eventName={selectedCertificate.eventName}
              issueDate={selectedCertificate.issueDate}
              isAdmin={true}
              coordinatorName={selectedCertificate.coordinatorName}
              coordinatorSignature={selectedCertificate.coordinatorSignature}
              hodName={selectedCertificate.hodName}
              hodSignature={selectedCertificate.hodSignature}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Certificate Editor Dialog */}
      <Dialog open={showTemplateEditor} onOpenChange={setShowTemplateEditor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Certificate</DialogTitle>
          </DialogHeader>
          {selectedCertificate && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateCertificate(selectedCertificate);
                setShowTemplateEditor(false);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Club Name</Label>
                <Input
                  value={selectedCertificate.clubName}
                  onChange={(e) =>
                    setSelectedCertificate({
                      ...selectedCertificate,
                      clubName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Event Name</Label>
                <Input
                  value={selectedCertificate.eventName}
                  onChange={(e) =>
                    setSelectedCertificate({
                      ...selectedCertificate,
                      eventName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Coordinator Name</Label>
                <Input
                  value={selectedCertificate.coordinatorName}
                  onChange={(e) =>
                    setSelectedCertificate({
                      ...selectedCertificate,
                      coordinatorName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>HOD Name</Label>
                <Input
                  value={selectedCertificate.hodName}
                  onChange={(e) =>
                    setSelectedCertificate({
                      ...selectedCertificate,
                      hodName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTemplateEditor(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
