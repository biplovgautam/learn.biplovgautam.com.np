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
    default: "BiLearnHub — ROS 2, Robotics & Intelligent Systems by Biplov Gautam",
    template: "%s | BiLearnHub",
  },
  description:
    "Open courseware on ROS 2, robotics, and intelligent systems — nodes, topics, SLAM, Nav2, MoveIt, perception, planning, and control. Structured courses, focused tutorials, and in-depth articles by Biplov Gautam.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://learn.biplovgautam.com.np"
  ),
  keywords: [
    "ROS 2",
    "ROS2",
    "Robot Operating System",
    "robotics",
    "intelligent systems",
    "autonomous robots",
    "SLAM",
    "Nav2",
    "MoveIt",
    "robot perception",
    "motion planning",
    "robot control",
    "micro-ROS",
    "Gazebo",
    "Python robotics",
    "Biplov Gautam",
    "BiLearnHub",
    "robotics courses",
    "ROS 2 tutorials",
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
    title: "BiLearnHub — ROS 2, Robotics & Intelligent Systems",
    description:
      "Open courseware on ROS 2, robotics, and intelligent systems by Biplov Gautam.",
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
    title: "BiLearnHub — ROS 2, Robotics & Intelligent Systems",
    description:
      "Open courseware on ROS 2, robotics, and intelligent systems.",
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
