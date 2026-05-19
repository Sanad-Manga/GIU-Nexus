import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import ApplicationStatusBadge from "../components/ApplicationStatusBadge";
import SkillChip from "../components/SkillChip";
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

const STATUS_OPTIONS = ["pending", "shortlisted", "rejected"];

const ApplicantsPage = () => {
  const { jobId } = useParams();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/jobs/${jobId}/applicants`);
        setApplicants(res.data.applications || res.data.applicants || res.data.data || []);
      } catch (err) {
        console.error("fetchApplicants error:", err);
        if (err.response?.status === 403) {
          setError("You are not authorised to view applicants for this job.");
        } else if (err.response?.status === 404) {
          setError("Job not found.");
        } else {
          setError(
            err.response?.data?.message || "Failed to load applicants"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      const res = await api.patch(`/applications/${applicationId}/status`, {
        status: newStatus,
      });
      const updated = res.data.application || res.data.data;
      setApplicants((prev) =>
        prev.map((a) =>
          a._id === applicationId ? { ...a, status: updated.status } : a
        )
      );
    } catch (err) {
      console.error("handleStatusChange error:", err);
      alert(
        err.response?.data?.message || "Failed to update application status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Spinner />;

  if (error)
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
            background: "#FEE2E2",
            border: `1px solid ${COLORS.error}`,
            color: COLORS.error,
            padding: "16px 20px",
            borderRadius: "10px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      </div>
    );

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
          alignItems: "flex-start",
          gap: "16px",
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
            Applicants
          </h1>
          <p style={{ color: COLORS.textSecondary, marginTop: "4px" }}>
            Review and update the status of each applicant
          </p>
        </div>
      </div>

      {applicants.length === 0 ? (
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
          No applicants for this job yet.
        </div>
      ) : (
        <div
          style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "12px",
            overflow: "hidden",
            marginTop: "24px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ background: COLORS.bg }}>
                {["Name", "Email", "Skills", "Status", "Action"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      color: COLORS.textSecondary,
                      fontWeight: 600,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: `1px solid ${COLORS.border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applicants.map((app) => (
                <tr
                  key={app._id}
                  style={{ borderBottom: `1px solid ${COLORS.border}` }}
                >
                  <td
                    style={{
                      padding: "14px 16px",
                      color: COLORS.textPrimary,
                      fontWeight: 500,
                    }}
                  >
                    {app.user?.name}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      color: COLORS.textSecondary,
                    }}
                  >
                    {app.user?.email}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {app.user?.skills?.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {app.user.skills.map((skill, i) => (
                          <SkillChip key={i} skill={skill} />
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: COLORS.textSecondary }}>
                        No skills
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <ApplicationStatusBadge status={app.status} />
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <select
                      value={app.status}
                      disabled={updatingId === app._id}
                      onChange={(e) =>
                        handleStatusChange(app._id, e.target.value)
                      }
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: `1px solid ${COLORS.border}`,
                        background: "#fff",
                        color: COLORS.textPrimary,
                        fontSize: "13px",
                        fontFamily: "'Inter', sans-serif",
                        cursor:
                          updatingId === app._id ? "not-allowed" : "pointer",
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicantsPage;