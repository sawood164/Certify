"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Award, Medal, CheckCircle2 } from "lucide-react";
import Image from "next/image";

// Function to generate signature SVG from name
const generateSignatureSVG = (name: string) => {
  // Convert name to title case
  const formattedName = name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Create SVG with enhanced styling
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="80">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&amp;display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Mr+De+Haviland&amp;display=swap');
        </style>
        <linearGradient id="signatureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#1a365d;stop-opacity:0.8"/>
          <stop offset="100%" style="stop-color:#1a365d;stop-opacity:1"/>
        </linearGradient>
      </defs>
      <g transform="rotate(-5, 120, 40)">
        <!-- Main Signature -->
        <text 
          x="50%" 
          y="45%" 
          font-family="'Mr De Haviland', cursive" 
          font-size="42" 
          fill="url(#signatureGradient)" 
          text-anchor="middle" 
          dominant-baseline="middle"
          letter-spacing="1px"
        >
          ${formattedName}
        </text>
        
        <!-- Decorative Underline -->
        <path 
          d="M 40,50 C 70,50 90,48 200,48" 
          stroke="#1a365d" 
          stroke-width="1.5"
          fill="none" 
          stroke-linecap="round"
          opacity="0.8"
        />
        
        <!-- Small Decorative Flourish -->
        <path 
          d="M ${
            formattedName.length > 12 ? "180" : "160"
          },52 c 10,-2 20,-2 30,2" 
          stroke="#1a365d" 
          stroke-width="1"
          fill="none" 
          stroke-linecap="round"
          opacity="0.6"
        />
      </g>
    </svg>
  `)}`;
};

export interface CertificateProps {
  studentName: string;
  registrationNumber: string;
  clubName: string;
  eventName: string;
  issueDate: string;
  isAdmin: boolean;
  hideDownloadButton?: boolean;
  coordinatorName?: string;
  coordinatorSignature?: string;
  hodName?: string;
  hodSignature?: string;
  template?: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    fontFamily: string;
    borderStyle: string;
    watermarkOpacity: string;
  };
}

export default function Certificate({
  studentName,
  registrationNumber,
  clubName,
  eventName,
  issueDate,
  isAdmin,
  hideDownloadButton = false,
  coordinatorName = "Club Coordinator",
  coordinatorSignature = "",
  hodName = "Head of Department",
  hodSignature = "",
  template = {
    backgroundColor: "#ffffff",
    borderColor: "#1a365d",
    textColor: "#1a365d",
    fontFamily: "serif",
    borderStyle: "double",
    watermarkOpacity: "0.1",
  },
}: CertificateProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [autoCoordinatorSignature, setAutoCoordinatorSignature] = useState("");
  const [autoHodSignature, setAutoHodSignature] = useState("");

  // Generate automatic signatures when names change
  useEffect(() => {
    if (coordinatorName && coordinatorName !== "Club Coordinator") {
      setAutoCoordinatorSignature(generateSignatureSVG(coordinatorName));
    }
    if (hodName && hodName !== "Head of Department") {
      setAutoHodSignature(generateSignatureSVG(hodName));
    }
  }, [coordinatorName, hodName]);

  const downloadAsPDF = async () => {
    const certificate = document.getElementById("certificate");
    if (!certificate) {
      console.error("Certificate element not found");
      return;
    }

    try {
      setIsDownloading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(certificate, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true,
        onclone: (clonedDoc) => {
          const clonedCertificate = clonedDoc.getElementById("certificate");
          if (clonedCertificate) {
            clonedCertificate.style.transform = "none";
            clonedCertificate.style.visibility = "visible";
          }
        },
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
      pdf.save(
        `${studentName.replace(/\s+/g, "_")}_${clubName.replace(
          /\s+/g,
          "_"
        )}_certificate.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative min-h-screen" id="certificate-container">
      <div
        id="certificate"
        className="relative p-16 rounded-lg shadow-2xl overflow-hidden"
        style={{
          backgroundColor: template.backgroundColor,
          border: `4px ${template.borderStyle} ${template.borderColor}`,
          fontFamily: template.fontFamily,
          color: template.textColor,
          minHeight: "600px",
          width: "100%",
          boxShadow:
            "0 0 0 8px #f8fafc, 0 0 0 10px #1a365d, 0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Enhanced Background Design */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Main Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f0f7ff] via-white to-[#f0f7ff]" />

          {/* Decorative Corner Patterns */}
          <div className="absolute top-0 left-0 w-72 h-72 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,#234681_0%,transparent_70%)]" />
          </div>
          <div className="absolute top-0 right-0 w-72 h-72 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,#234681_0%,transparent_70%)]" />
          </div>
          <div className="absolute bottom-0 left-0 w-72 h-72 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,#234681_0%,transparent_70%)]" />
          </div>
          <div className="absolute bottom-0 right-0 w-72 h-72 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,#234681_0%,transparent_70%)]" />
          </div>

          {/* Decorative Border Frame */}
          <div className="absolute inset-6 border-[3px] border-[#1a365d]/10 rounded-lg" />
          <div className="absolute inset-8 border-[1px] border-[#1a365d]/5 rounded-lg" />

          {/* Enhanced Accent Lines */}
          <div className="absolute inset-x-12 top-20 h-[2px] bg-gradient-to-r from-[#1a365d]/0 via-[#1a365d]/10 to-[#1a365d]/0" />
          <div className="absolute inset-x-12 bottom-20 h-[2px] bg-gradient-to-r from-[#1a365d]/0 via-[#1a365d]/10 to-[#1a365d]/0" />

          {/* Diagonal Lines Pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #234681 1px, transparent 1px),
                linear-gradient(-45deg, #234681 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />

          {/* VIT BHOPAL Text Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 15 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="whitespace-nowrap text-[#1a365d] transform -rotate-[15deg]"
                style={{
                  position: "absolute",
                  top: `${rowIndex * 8}%`,
                  left: "-5%",
                  right: "-5%",
                  fontSize: "28px",
                  fontWeight: "bold",
                  letterSpacing: "4px",
                  opacity: "0.03",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {Array.from({ length: 6 }).map((_, colIndex) => (
                  <span key={colIndex} style={{ marginRight: "80px" }}>
                    VIT BHOPAL
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Subtle Dot Grid */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(#234681 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Lion Watermark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[600px] h-[600px] opacity-[0.06]">
              <Image
                src="/lion.jpg"
                alt="Lion Watermark"
                fill
                className="object-contain"
                sizes="600px"
                priority
              />
            </div>
          </div>

          {/* Center VIT Logo Watermark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 opacity-[0.025] rotate-[30deg]">
              <Image
                src="/vitlogo.png"
                alt="VIT Logo Watermark"
                fill
                className="object-contain"
                sizes="384px"
              />
            </div>
          </div>

          {/* Enhanced Decorative Corners */}
          <div className="absolute top-8 left-8 w-24 h-24">
            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-l-4 border-[#1a365d]/20 rounded-tl-xl" />
            <div className="absolute top-2 left-2 w-full h-full border-t-2 border-l-2 border-[#1a365d]/10 rounded-tl-xl" />
          </div>
          <div className="absolute top-8 right-8 w-24 h-24">
            <div className="absolute top-0 right-0 w-full h-full border-t-4 border-r-4 border-[#1a365d]/20 rounded-tr-xl" />
            <div className="absolute top-2 right-2 w-full h-full border-t-2 border-r-2 border-[#1a365d]/10 rounded-tr-xl" />
          </div>
          <div className="absolute bottom-8 left-8 w-24 h-24">
            <div className="absolute bottom-0 left-0 w-full h-full border-b-4 border-l-4 border-[#1a365d]/20 rounded-bl-xl" />
            <div className="absolute bottom-2 left-2 w-full h-full border-b-2 border-l-2 border-[#1a365d]/10 rounded-bl-xl" />
          </div>
          <div className="absolute bottom-8 right-8 w-24 h-24">
            <div className="absolute bottom-0 right-0 w-full h-full border-b-4 border-r-4 border-[#1a365d]/20 rounded-br-xl" />
            <div className="absolute bottom-2 right-2 w-full h-full border-b-2 border-r-2 border-[#1a365d]/10 rounded-br-xl" />
          </div>

          {/* Decorative Flourishes */}
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-32 h-1">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1a365d]/10 to-transparent" />
          </div>
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-32 h-1">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1a365d]/10 to-transparent" />
          </div>
        </div>

        {/* VIT Bhopal Logo with Enhanced Container */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="relative w-[220px] h-[90px] p-2 rounded-lg bg-white/50 backdrop-blur-sm">
            <Image
              src="/vitlogo.png"
              alt="VIT Bhopal Logo"
              fill
              priority
              className="object-contain"
              sizes="220px"
            />
          </div>
        </div>

        {/* Certificate Content with Enhanced Container */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 mt-24">
          <div className="relative">
            <h1 className="text-5xl font-bold mb-8 text-[#1a365d] tracking-wide">
              Certificate of Achievement
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1a365d]/20 to-transparent" />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xl text-[#1a365d]/90">This is to certify that</p>
            <h2 className="text-4xl font-bold text-[#1a365d]">{studentName}</h2>
            <p className="text-lg text-[#1a365d]/80">
              Registration Number: {registrationNumber}
            </p>
          </div>

          <div className="space-y-4 max-w-2xl mt-6">
            <p className="text-xl text-[#1a365d]/90">
              has successfully participated in
            </p>
            <h3 className="text-3xl font-bold text-[#1a365d]">{eventName}</h3>
            <p className="text-xl text-[#1a365d]/90">organized by</p>
            <h3 className="text-2xl font-bold text-[#1a365d]">{clubName}</h3>
          </div>

          <div className="mt-12 w-full">
            <p className="text-lg mb-8 text-[#1a365d]/80">
              Issued on:{" "}
              {new Date(issueDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {/* Enhanced Signatures Section */}
            <div className="flex justify-between items-end gap-12 px-12">
              <div className="text-center flex-1">
                <div className="mt-4">
                  {(coordinatorSignature ||
                    (coordinatorName &&
                      coordinatorName !== "Club Coordinator" &&
                      autoCoordinatorSignature)) && (
                    <div className="mb-3">
                      <img
                        src={coordinatorSignature || autoCoordinatorSignature}
                        alt="Coordinator Signature"
                        className="h-20 mx-auto"
                        style={{
                          filter: "contrast(1.1) brightness(0.95)",
                        }}
                      />
                    </div>
                  )}
                  <div className="border-t-2 pt-2 border-[#1a365d]/20">
                    <p className="font-semibold text-lg text-[#1a365d]">
                      {coordinatorName}
                    </p>
                    <p className="text-sm text-[#1a365d]/70">
                      Club Coordinator
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center flex-1">
                <div className="mt-4">
                  {(hodSignature ||
                    (hodName &&
                      hodName !== "Head of Department" &&
                      autoHodSignature)) && (
                    <div className="mb-3">
                      <img
                        src={hodSignature || autoHodSignature}
                        alt="HOD Signature"
                        className="h-20 mx-auto"
                        style={{
                          filter: "contrast(1.1) brightness(0.95)",
                        }}
                      />
                    </div>
                  )}
                  <div className="border-t-2 pt-2 border-[#1a365d]/20">
                    <p className="font-semibold text-lg text-[#1a365d]">
                      {hodName}
                    </p>
                    <p className="text-sm text-[#1a365d]/70">
                      Head of Department
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Download Button */}
      {!isAdmin && !hideDownloadButton && (
        <motion.button
          onClick={downloadAsPDF}
          disabled={isDownloading}
          className={`mt-6 px-8 py-4 bg-[#1a365d] text-white rounded-lg shadow-lg 
            hover:bg-[#234681] transition-all flex items-center gap-3 mx-auto 
            text-lg font-semibold ${
              isDownloading ? "opacity-75 cursor-wait" : "hover:shadow-xl"
            }`}
          whileHover={{ scale: isDownloading ? 1 : 1.05 }}
          whileTap={{ scale: isDownloading ? 1 : 0.95 }}
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Generating PDF...
            </>
          ) : (
            <>
              <Award className="w-6 h-6" />
              Download Certificate
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}
