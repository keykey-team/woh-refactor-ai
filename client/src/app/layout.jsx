import "./globals.scss";

import {
  manrope,
  sofiaSansCondensed,
  urbanist,
} from "@shared";

export default function RootLayout({ children }) {
  return (
    <html
      lang="uk"
      suppressHydrationWarning
      className={`${sofiaSansCondensed.variable} ${urbanist.variable} ${manrope.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
