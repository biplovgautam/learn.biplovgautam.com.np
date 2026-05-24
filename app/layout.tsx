import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BiLearnHub — Applied AI, ROS 2 & Software Engineering by Biplov Gautam",
    template: "%s | BiLearnHub",
  },
  description:
    "Open courseware on Applied AI (LLMs, RAG, agents), ROS 2 robotics (SLAM, Nav2), and modern software engineering. Structured courses, focused tutorials, and in-depth articles by Biplov Gautam.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://learn.biplovgautam.com.np"
  ),
  keywords: [
    "Applied AI",
    "LLM",
    "RAG",
    "AI agents",
    "ROS 2",
    "Robot Operating System",
    "robotics",
    "SLAM",
    "Nav2",
    "software engineering",
    "Python",
    "TypeScript",
    "Biplov Gautam",
    "BiLearnHub",
    "online courses",
    "robotics tutorials",
    "AI tutorials",
  ],
  authors: [{ name: "Biplov Gautam", url: "https://biplovgautam.com.np" }],
  creator: "Biplov Gautam",
  publisher: "BiLearnHub",
  category: "Education",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BiLearnHub",
    title: "BiLearnHub — Applied AI, ROS 2 & Software Engineering",
    description:
      "Open courseware on Applied AI, ROS 2 robotics, and modern software engineering by Biplov Gautam.",
    images: [
      {
        url: "/footer.png",
        width: 1200,
        height: 630,
        alt: "BiLearnHub — Knowledge that matters",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BiLearnHub — Applied AI, ROS 2 & Software Engineering",
    description:
      "Open courseware on Applied AI, ROS 2 robotics, and modern software engineering.",
    creator: "@BiplovGautam_",
    images: ["/footer.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
