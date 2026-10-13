import Link from "next/link";

// TODO: put your real contact email here before going live
const CONTACT = "your-email@example.com";

export const metadata = { title: "Privacy policy | GrowKit" };

export default function Privacy() {
  return (
    <div className="prose">
      <Link href="/" className="logo"><i /> GrowKit</Link>
      <h1>Privacy policy</h1>
      <p className="meta">How GrowKit handles your Instagram account and data.</p>

      <h2>What we connect to</h2>
      <p>
        GrowKit connects to your Instagram professional account with your permission. We never
        store your Instagram password.
      </p>

      <h2>What we store</h2>
      <p>
        We store your username, an encrypted access token, and the automations you create.
      </p>

      <h2>How we use comments</h2>
      <p>
        We use comment text only to match your keywords and send the DM you wrote.
      </p>

      <h2>Delete your data</h2>
      <p>
        You can disconnect and delete all your data at any time from the dashboard.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about your data: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
      </p>
    </div>
  );
}
