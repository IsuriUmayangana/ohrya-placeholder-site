import { getAllResponses, getStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const responses = getAllResponses();
  const stats = getStats();

  return (
    <div style={{ fontFamily: "Georgia, serif", padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.6rem", color: "#2d2d2d", marginBottom: "1.5rem" }}>
        OHRYA — Survey Responses
      </h1>

      {/* Stats */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {[
          { label: "Total Responses", value: stats.total },
          { label: "Avg. Score", value: stats.avgScore },
          { label: "Top Campaign", value: Object.entries(stats.campaigns).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—" },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "#f0f8fa", borderRadius: 10, padding: "1rem 1.5rem", minWidth: 140 }}>
            <p style={{ color: "#777", fontSize: "0.82rem", marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: "1.8rem", color: "#5a9aaa", fontWeight: "bold" }}>{value}</p>
          </div>
        ))}
      </div>

      {responses.length === 0 ? (
        <p style={{ color: "#777" }}>No responses yet. Complete the survey to see data here.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: "#5a9aaa", color: "white" }}>
                {["#", "Email", "Campaign", "Give?", "Donation", "Vote?", "Shine?", "Referred By", "Survey Score", "Referral Score", "Total", "Referrals", "Date"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: "normal", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? "#fafafa" : "white", borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "9px 12px", color: "#999" }}>{i + 1}</td>
                  <td style={{ padding: "9px 12px" }}>{r.email}</td>
                  <td style={{ padding: "9px 12px" }}>{r.campaign}</td>
                  <td style={{ padding: "9px 12px" }}>{r.willGive}</td>
                  <td style={{ padding: "9px 12px" }}>{r.donationAmount}</td>
                  <td style={{ padding: "9px 12px" }}>{r.willVote}</td>
                  <td style={{ padding: "9px 12px" }}>{r.willShine}</td>
                  <td style={{ padding: "9px 12px", fontFamily: "monospace", color: "#aaa", fontSize: "0.78rem" }}>{r.referredBy || "—"}</td>
                  <td style={{ padding: "9px 12px", color: "#5a9aaa", fontWeight: "bold" }}>{r.surveyScore}</td>
                  <td style={{ padding: "9px 12px", color: "#c9a84c", fontWeight: "bold" }}>+{r.referralScore}</td>
                  <td style={{ padding: "9px 12px", fontWeight: "bold" }}>{r.surveyScore + r.referralScore}</td>
                  <td style={{ padding: "9px 12px" }}>{r.referralCount}</td>
                  <td style={{ padding: "9px 12px", color: "#aaa", fontSize: "0.78rem" }}>{new Date(r.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
