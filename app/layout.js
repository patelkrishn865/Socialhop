import { Public_Sans } from "next/font/google";
import "./globals.css";
import "@/styles/typography.css";
import StyledComponentsRegistry from "@/lib/AntRegistry";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/lib/QueryProvider";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Socialhop",
  description: "Create beautiful memories",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  minimumScale: 1.0,
  maximumScale: 1.0,
  userScalable: "no",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        signIn: {
          variables: { colorPrimary: "#f9AA11" },
        },
        signUp: {
          variables: { colorPrimary: "#f9AA11" },
        },
      }}
    >
      <html lang="en">
        <body className={publicSans.className}>
          <QueryProvider>
            <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
