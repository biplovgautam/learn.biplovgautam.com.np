import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { FooterAccountLinks } from "./footer-account-links";

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.79.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .78 0 1.73v20.55c0 .95.79 1.72 1.77 1.72h20.45c.98 0 1.78-.77 1.78-1.72V1.73C24 .78 23.2 0 22.22 0z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-background">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand + tagline */}
          <div className="md:col-span-5">
            <Image
              src="/footer.png"
              alt="BiLearnHub — Knowledge that matters"
              width={300}
              height={120}
              className="h-auto w-auto max-w-[280px] mb-5"
            />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Open courseware on Applied AI, ROS 2 robotics, and modern
              software engineering by Biplov Gautam.
            </p>

            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              <SocialIcon
                href="https://github.com/biplovgautam"
                label="GitHub"
              >
                <GithubIcon />
              </SocialIcon>
              <SocialIcon
                href="https://linkedin.com/in/biplovgautam"
                label="LinkedIn"
              >
                <LinkedinIcon />
              </SocialIcon>
              <SocialIcon
                href="https://x.com/BiplovGautam_"
                label="X (Twitter)"
              >
                <TwitterIcon />
              </SocialIcon>
              <SocialIcon
                href="mailto:madhavbiplov@gmail.com"
                label="Email"
              >
                <Mail size={16} strokeWidth={1.8} />
              </SocialIcon>
            </div>
          </div>

          {/* Learn */}
          <div className="md:col-span-2">
            <p className="label-mono mb-4">Learn</p>
            <ul className="space-y-3 text-sm">
              <li>
                <FooterLink href="/courses">Courses</FooterLink>
              </li>
              <li>
                <FooterLink href="/tutorials">Tutorials</FooterLink>
              </li>
              <li>
                <FooterLink href="/blog">Blog</FooterLink>
              </li>
            </ul>
          </div>

          {/* Account — dynamic */}
          <div className="md:col-span-2">
            <p className="label-mono mb-4">Account</p>
            <FooterAccountLinks />
          </div>

          {/* Resources */}
          <div className="md:col-span-3">
            <p className="label-mono mb-4">Resources</p>
            <ul className="space-y-3 text-sm">
              <li>
                <FooterLink href="https://biplovgautam.com.np">
                  Author portfolio &#8599;
                </FooterLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-14 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            &copy; 2025 BiLearnHub by Biplov Gautam. All rights reserved.
          </p>
          <p className="font-mono">
            &lt;Knowledge that matters/&gt;
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </Link>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
    >
      {children}
    </a>
  );
}
