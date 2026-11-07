import type { ReactNode, SVGProps } from "react";

/** Line icons from the design. One place, so every screen draws them the same way. */
type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number; strokeWidth?: number };

function Svg({ size = 20, strokeWidth = 2, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const ArrowRightIcon = (p: IconProps) => (
  <Svg size={18} strokeWidth={2.4} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const ArrowLeftIcon = (p: IconProps) => (
  <Svg size={18} strokeWidth={2.2} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);
export const CheckIcon = (p: IconProps) => (
  <Svg strokeWidth={3} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);
export const ChevronDownIcon = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);
export const ChevronRightIcon = (p: IconProps) => (
  <Svg size={22} strokeWidth={2.2} {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);
export const MenuIcon = (p: IconProps) => (
  <Svg strokeWidth={2.4} {...p}>
    <path d="M4 8h16M4 16h16" />
  </Svg>
);
export const CloseIcon = (p: IconProps) => (
  <Svg strokeWidth={2.4} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const AlertCircleIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h0" />
  </Svg>
);
export const MailIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
);
export const UserIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
  </Svg>
);
export const StarIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.7 6.7 19.6l1.1-6L3.4 9.4l6-.8z" />
  </Svg>
);
export const HelpIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h0" />
  </Svg>
);
export const LogoutIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 8l4 4-4 4M20 12H9" />
  </Svg>
);
export const ShieldCheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

/* Feature icons (home page cards) */
export const SparklesIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    <path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
  </Svg>
);
export const PageIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="M8 9h8M8 13h5" />
  </Svg>
);
export const BranchIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <path d="M6 4v8a4 4 0 0 0 4 4h8M14 12l4 4-4 4" />
    <circle cx="6" cy="4" r="1.5" />
  </Svg>
);
export const PhoneIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <rect x="7" y="3" width="10" height="18" rx="3" />
    <path d="M11 18h2" />
  </Svg>
);
export const BarChartIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Svg>
);
export const DownloadIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </Svg>
);
export const TemplateIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </Svg>
);
export const EyeIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);
export const GlobeIcon = (p: IconProps) => (
  <Svg size={22} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </Svg>
);

/* Big glyphs on the dark side panel of the sign-in screens */
export const LockGlyph = () => (
  <Svg size={64} strokeWidth={1.6} stroke="#FFFFFF">
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15.5" r="1" fill="#FFFFFF" />
  </Svg>
);
export const MailGlyph = () => (
  <Svg size={64} strokeWidth={1.6} stroke="#FFFFFF">
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m3 8 9 6 9-6" />
  </Svg>
);
export const CheckCircleGlyph = () => (
  <Svg size={64} strokeWidth={1.8} stroke="#FFFFFF">
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 3 3 5-6" />
  </Svg>
);
export const ClockGlyph = () => (
  <Svg size={64} strokeWidth={1.6} stroke="#FFFFFF">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);
