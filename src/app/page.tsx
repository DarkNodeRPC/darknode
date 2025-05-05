import Hero from "../components/Hero";
import Features from "../components/Features";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";

export const metadata = {
  openGraph: {
    title: "DarkNode - The VPN for RPC Services",
    description: "DarkNode routes your transactions through our secure infrastructure, protecting your privacy and preventing data logging.",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "DarkNode - Privacy for Crypto Transactions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DarkNode - The VPN for RPC Services",
    description: "DarkNode routes your transactions through our secure infrastructure, protecting your privacy and preventing data logging.",
    images: ["/preview.png"],
    creator: "@darknoderpc",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  );
}
