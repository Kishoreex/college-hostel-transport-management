import { useState } from "react";

export default function DeleteAccount() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const studentId = (
      form.elements.namedItem("studentId") as HTMLInputElement
    ).value;

    const email = (
      form.elements.namedItem("email") as HTMLInputElement
    ).value;

    const reason = (
      form.elements.namedItem("reason") as HTMLTextAreaElement
    ).value;

    const subject = encodeURIComponent(
      "Madha Campus - Account Deletion Request"
    );

    const body = encodeURIComponent(
      `Madha Campus Account Deletion Request

Student/User ID: ${studentId}
Email: ${email}

Reason:
${reason}

I request deletion of my Madha Campus account and associated personal data.`
    );

    window.location.href =
      `mailto:it@mdch.in?subject=${subject}&body=${body}`;

    setSubmitted(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f9fc",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              marginBottom: "8px",
              color: "#123b6d",
            }}
          >
            MADHA CAMPUS
          </h1>

          <p style={{ margin: 0, color: "#666" }}>
            Campus Hostel & Transport Management System
          </p>
        </div>

        <hr />

        <h2 style={{ marginTop: "30px" }}>
          Request Account Deletion
        </h2>

        <p style={{ color: "#555", lineHeight: 1.6 }}>
          If you would like to delete your Madha Campus account and
          associated personal data, please submit the request below.
        </p>

        <p style={{ color: "#555", lineHeight: 1.6 }}>
          Your request will be reviewed by the Madha Campus administration
          before the account and associated data are permanently deleted.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              Student / User ID
            </label>

            <input
              name="studentId"
              type="text"
              required
              placeholder="Example: MDC0001"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              Registered Email
            </label>

            <input
              name="email"
              type="email"
              required
              placeholder="Enter your registered email"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              Reason for deletion
            </label>

            <textarea
              name="reason"
              rows={5}
              placeholder="Optional"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "8px",
              background: "#d32f2f",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Request Account Deletion
          </button>
        </form>

        {submitted && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#eef7ee",
              borderRadius: "8px",
              color: "#246b2a",
            }}
          >
            Your email application should now open. Please send the
            deletion request to the Madha Campus administration.
          </div>
        )}

        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#f5f5f5",
            borderRadius: "10px",
          }}
        >
          <h3>What will be deleted?</h3>

          <p style={{ lineHeight: 1.6 }}>
            Upon an approved account deletion request, Madha Campus will
            delete the personal information associated with the account,
            subject to any information that must be retained for legitimate
            legal, security, or administrative requirements.
          </p>

          <h3>Important</h3>

          <p style={{ lineHeight: 1.6 }}>
            Account deactivation, suspension, or a hostel vacating request
            is not the same as account deletion. Account deletion requests
            are handled separately by the Madha Campus administration.
          </p>
        </div>

        <div
          style={{
            marginTop: "30px",
            textAlign: "center",
            color: "#777",
            fontSize: "14px",
          }}
        >
          © Madha Campus
        </div>
      </div>
    </div>
  );
}