export const metadata = {
  title: "Auntie Marlene's Studio",
  description: "Content management for Auntie Marlene's blog",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
