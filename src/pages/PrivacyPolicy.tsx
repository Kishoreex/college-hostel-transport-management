import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 20px",
        color: "#1e293b",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ color: "#123b6d", marginBottom: "10px" }}>
          Madha Campus – Privacy Policy
        </h1>

        <p style={{ color: "#64748b" }}>
          Last Updated: August 21, 2026
        </p>

        <hr />

        <h2>1. Introduction</h2>
        <p>
          Madha Campus is a Campus Hostel & Transport Management System
          developed for authorized students, parents, staff, wardens,
          security personnel, and administrators of the institution.
        </p>

        <h2>2. Information We Collect</h2>
        <p>
          Depending on the features used, Madha Campus may collect and process
          the following information:
        </p>

        <ul>
          <li>Student name and register number</li>
          <li>Email address and phone number</li>
          <li>Parent or guardian information</li>
          <li>Hostel information</li>
          <li>Transport information</li>
          <li>Profile photograph</li>
          <li>Outpass and leave information</li>
          <li>Device information required for account security</li>
          <li>Location information when required for hostel verification</li>
        </ul>

        <h2>3. How We Use Information</h2>
        <p>Information may be used for:</p>

        <ul>
          <li>Student authentication and account management</li>
          <li>Hostel management</li>
          <li>Transport management</li>
          <li>Outpass and leave management</li>
          <li>Hostel exit and return verification</li>
          <li>Campus security</li>
          <li>Communication regarding campus services</li>
        </ul>

        <h2>4. Location Information</h2>
        <p>
          Madha Campus may request access to the device's location when a
          feature requires location-based verification, such as verifying
          whether a student has exited or returned to the hostel premises.
        </p>

        <p>
          Location information is used for campus management, security, and
          outpass verification purposes.
        </p>

        <h2>5. Profile Photos</h2>
        <p>
          Students may upload a profile photograph. The photograph may be
          displayed within the Madha Campus application for identification
          and campus-management purposes.
        </p>

        <h2>6. Data Security</h2>
        <p>
          We take reasonable technical and organizational measures to protect
          personal information against unauthorized access, alteration,
          disclosure, or destruction.
        </p>

        <h2>7. Data Sharing</h2>
        <p>
          Personal information is used for legitimate campus administration,
          hostel, transport, security, and related institutional purposes.
          We do not sell personal information to third parties.
        </p>

        <h2>8. Data Retention</h2>
        <p>
          Information may be retained for as long as necessary for campus
          administration, security, record keeping, and applicable legal or
          institutional requirements.
        </p>

        <h2>9. Account and Data Requests</h2>
        <p>
          Users may contact the institution regarding appropriate requests
          concerning their personal information, including correction or
          deletion where applicable.
        </p>

        <h2>10. Children's Privacy</h2>
        <p>
          Madha Campus is an institutional application intended for authorized
          users of the campus. It is not designed as a service directed
          specifically toward children.
        </p>

        <h2>11. Changes to This Privacy Policy</h2>
        <p>
          This Privacy Policy may be updated from time to time to reflect
          changes to the application, services, or applicable requirements.
          Any updated version will be published on this page.
        </p>

        <h2>12. Contact Us</h2>

        <p>
          For questions regarding this Privacy Policy, please contact:
        </p>

        <p>
          <strong>Madha Campus</strong>
          <br />
          Madha Dental College & Hospital
          <br />
          Email:{" "}
          <a href="mailto:it@mdch.in">
            it@mdch.in
          </a>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;