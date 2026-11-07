import { Instrument_Serif } from "next/font/google";

// Italic serif used for single accent words in headings ("Sound familiar?").
// Only this page imports it, so other routes don't download the font.
export const accentSerif = Instrument_Serif({
    weight: "400",
    style: "italic",
    subsets: ["latin"],
    display: "swap",
    variable: "--font-hn-serif",
});
