export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Isolated layout — no sidebar, no providers wrapping the app shell
  return <div className="h-full">{children}</div>;
}
