import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

const COLORS = {
  primary: "#2563EB",
  secondary: "#1E40AF",
  accent: "#10B981",
  bg: "#F9FAFB",
  card: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  error: "#EF4444",
  border: "#E5E7EB",
};

const statusColors = {
  open: "#10B981",
  closed: "#6B7280",
};

const RecruiterDashboard = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isPending = user?.status === "pending";

  useEffect(() => {
    if (isPending) {
      setLoading(false);
      return;
    }

    const fetchMyJobs = async () => {
      try {
        setLoading(true);
        const res = await api.get("/jobs/my-jobs");
        setJobs(res.data.jobs || res.data.data || res.data || []);
      } catch (err) {
        console.error("fetchMyJobs error:", err);
        setError(
          err.response?.data?.message || "Failed to load your job posts"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, [isPending]);

  if (loading) return <Spinner />;

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: COLORS.bg,
        minHeight: "100vh",
        padding: "32px 48px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <div>
          <h1
            style={{
              color: COLORS.textPrimary,
              fontSize: "28px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Recruiter Dashboard
          </h1>
          <p style={{ color: COLORS.textSecondary, marginTop: "4px" }}>
            Manage your job postings and review applicants
          </p>
        </div>

        {!isPending && (
          <Link to="/recruiter/jobs/create" style={{ textDecoration: "none" }}>
            <button
              style={{
                background: COLORS.primary,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              + Create Job
            </button>
          </Link>
        )}
      </div>

      {isPending && (
        <div
          style={{
            background: "#FEF3C7",
            border: "1px solid #FDE68A",
            color: "#92400E",
            padding: "16px 20px",
            borderRadius: "10px",
            margin: "20px 0",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          Your account is pending admin approval. You cannot post jobs yet.
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#FEE2E2",
            border: `1px solid ${COLORS.error}`,
            color: COLORS.error,
            padding: "14px 18px",
            borderRadius: "10px",
            margin: "20px 0",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {!isPending && !error && jobs.length === 0 && (
        <div
          style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "12px",
            padding: "48px",
            textAlign: "center",
            color: COLORS.textSecondary,
            marginTop: "24px",
          }}
        >
          You haven't posted any jobs yet.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
          marginTop: "24px",
        }}
      >
        {jobs.map((job) => (
          <div
            key={job._id}
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "12px",
              padding: "20px",
              transition: "box-shadow 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "12px",
              }}
            >
              <h3
                style={{
                  color: COLORS.textPrimary,
                  fontSize: "17px",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {job.title}
              </h3>
              <span
                style={{
                  background: statusColors[job.status] || COLORS.textSecondary,
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "999px",
                  textTransform: "capitalize",
                }}
              >
                {job.status}
              </span>
            </div>

            <p
              style={{
                color: COLORS.textSecondary,
                fontSize: "13px",
                margin: "4px 0",
                textTransform: "capitalize",
              }}
            >
              {job.type}
            </p>

            <div
              style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: `1px solid ${COLORS.border}`,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  color: COLORS.primary,
                  fontSize: "22px",
                  fontWeight: 700,
                }}
              >
                {job.applicantCount ?? job.totalApplicants ?? 0}
              </span>
              <span
                style={{ color: COLORS.textSecondary, fontSize: "13px" }}
              >
                applicant
                {(job.applicantCount ?? job.totalApplicants ?? 0) === 1
                  ? ""
                  : "s"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <Link
                to={`/recruiter/applicants/${job._id}`}
                style={{ textDecoration: "none", flex: 1 }}
              >
                <button
                  style={{
                    width: "100%",
                    background: COLORS.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Applicants
                </button>
              </Link>
              <Link
                to={`/recruiter/jobs/${job._id}/edit`}
                style={{ textDecoration: "none", flex: 1 }}
              >
                <button
                  style={{
                    width: "100%",
                    background: COLORS.secondary,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Edit
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterDashboard;