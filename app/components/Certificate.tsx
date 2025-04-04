"use client";

import React from "react";

interface CertificateProps {
  studentName: string;
  registrationNumber: string;
  clubName: string;
  eventName: string;
  issueDate: string;
  coordinatorName: string;
  coordinatorSignature: string;
  hodName: string;
  hodSignature: string;
  isAdmin?: boolean;
}

const Certificate: React.FC<CertificateProps> = ({
  studentName,
  registrationNumber,
  clubName,
  eventName,
  issueDate,
  coordinatorName,
  coordinatorSignature,
  hodName,
  hodSignature,
  isAdmin = false,
}) => {
  return (
    <div
      id="certificate"
      className="relative w-full aspect-[1.414/1] bg-white p-8 border-8 border-blue-100 rounded-lg"
      style={{
        backgroundImage: "url('/certificate-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* College Logo and Name */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
        <img
          src="/college-logo.png"
          alt="College Logo"
          className="w-24 h-24 mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-blue-900">
          GOVERNMENT ENGINEERING COLLEGE
        </h1>
        <p className="text-lg text-blue-700 mt-1">BILASPUR, CHHATTISGARH</p>
      </div>

      {/* Certificate Title */}
      <div className="absolute top-52 left-1/2 -translate-x-1/2 text-center">
        <h2 className="text-4xl font-bold text-blue-900 border-b-4 border-blue-900 pb-2">
          CERTIFICATE OF PARTICIPATION
        </h2>
      </div>

      {/* Certificate Content */}
      <div className="absolute top-80 left-1/2 -translate-x-1/2 w-4/5 text-center">
        <p className="text-xl leading-relaxed">
          This is to certify that{" "}
          <span className="font-bold text-blue-900">{studentName}</span> (
          {registrationNumber}) has successfully participated in{" "}
          <span className="font-bold text-blue-900">{eventName}</span> organized
          by <span className="font-bold text-blue-900">{clubName}</span> at
          Government Engineering College, Bilaspur on{" "}
          {new Date(issueDate).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          .
        </p>
      </div>

      {/* Signatures */}
      <div className="absolute bottom-20 w-full px-20 flex justify-between items-end">
        <div className="text-center">
          {coordinatorSignature && (
            <img
              src={coordinatorSignature}
              alt="Coordinator Signature"
              className="h-16 mx-auto mb-2"
            />
          )}
          <div className="w-48 border-t border-gray-400" />
          <p className="font-medium text-blue-900">{coordinatorName}</p>
          <p className="text-sm text-gray-600">Club Coordinator</p>
        </div>

        <div className="text-center">
          {hodSignature && (
            <img
              src={hodSignature}
              alt="HOD Signature"
              className="h-16 mx-auto mb-2"
            />
          )}
          <div className="w-48 border-t border-gray-400" />
          <p className="font-medium text-blue-900">{hodName}</p>
          <p className="text-sm text-gray-600">Head of Department</p>
        </div>
      </div>

      {/* Certificate ID */}
      <div className="absolute bottom-4 left-8 text-sm text-gray-500">
        Certificate ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
      </div>

      {/* Issue Date */}
      <div className="absolute bottom-4 right-8 text-sm text-gray-500">
        Issue Date:{" "}
        {new Date(issueDate).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </div>
    </div>
  );
};

export default Certificate;
