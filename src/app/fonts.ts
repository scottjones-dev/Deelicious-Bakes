import localFont from "next/font/local";

export const brittanySignature = localFont({
  src: [
    {
      path: "../../public/fonts/BrittanySignature.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-brittany-signature",
  display: "swap",
});
