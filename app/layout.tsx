export const metadata = { title: "GrowKit", description: "Grow your Instagram without risking your account." };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F5F6FA", color: "#101528" }}>{children}</body></html>;
}
