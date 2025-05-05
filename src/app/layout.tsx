import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WalletContextProvider from "../context/WalletContextProvider";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DarkNode - Privacy for Crypto Transactions",
  description: "DarkNode routes your transactions through our native RPC, protecting your privacy and preventing data logging.",
  metadataBase: new URL('https://darknode.pro'),
  openGraph: {
    title: "DarkNode - The VPN for RPC Services",
    description: "DarkNode routes your transactions through our secure infrastructure, protecting your privacy and preventing data logging.",
    url: "https://darknode.pro",
    siteName: "DarkNode",
    images: [
      {
        url: "https://raw.githubusercontent.com/DarkNodeRPC/darknode/master/public/preview.png",
        width: 1200,
        height: 630,
        alt: "DarkNode - Privacy for Crypto Transactions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DarkNode - The VPN for RPC Services",
    description: "DarkNode routes your transactions through our secure infrastructure, protecting your privacy and preventing data logging.",
    images: ["https://raw.githubusercontent.com/DarkNodeRPC/darknode/master/public/preview.png"],
    creator: "@darknoderpc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white min-h-screen flex flex-col`}
      >
        <WalletContextProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </WalletContextProvider>
      </body>
    </html>
  );
}
