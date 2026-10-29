import { Suspense } from "react";

import { videosList } from "@/lib/api";

/**
 * Moderation console shell. The review queue (in_review videos, open reports, takedowns,
 * audit log) needs the moderation module and moderator auth, which arrive in phase 5.
 * Until then this lists the latest published videos from the public API.
 */
export default function Home() {
  return (
    <main>
      <p className="eyebrow">Touchline admin</p>
      <h1>Moderation</h1>
      <section>
        <h2>Review queue</h2>
        <p className="muted">Arrives with the moderation module (phase 5): flagged and minors&apos; uploads, reports, takedowns.</p>
      </section>
      <section>
        <h2>Recently published</h2>
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <RecentVideos />
        </Suspense>
      </section>
    </main>
  );
}

async function RecentVideos() {
  const data = await videosList({ limit: 20 }).then(
    (response) => response.data,
    () => null,
  );
  if (!data) {
    return (
      <p className="muted">
        Could not reach the API. Start it with <code>pnpm --filter @touchline/backend dev</code>.
      </p>
    );
  }
  if (data.items.length === 0) return <p className="muted">No published videos yet.</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Athlete</th>
          <th>Season</th>
          <th>Skill</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((video) => (
          <tr key={video.id}>
            <td>{video.title}</td>
            <td>{video.athleteName}</td>
            <td>{video.season}</td>
            <td>{video.skill}</td>
            <td>{video.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
