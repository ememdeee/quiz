import { getQuizUrl } from "@/lib/projectSettings";
import { accentSerif } from "@/components/home/fonts";
import SiteNavbar from "@/components/home/SiteNavbar";
import Hero from "@/components/home/Hero";
import MarqueeBands from "@/components/home/MarqueeBands";
import PainPicker from "@/components/home/PainPicker";
import HowItWorks from "@/components/home/HowItWorks";
import Benefits from "@/components/home/Benefits";
import StatsBand from "@/components/home/StatsBand";
import Reviews from "@/components/home/Reviews";
import Faq from "@/components/home/Faq";
import FinalCta from "@/components/home/FinalCta";
import SiteFooter from "@/components/home/SiteFooter";
import MotionDirector from "@/components/home/MotionDirector";
import "@/components/home/home.css";

// Rendered per request so the quiz link always follows the Home Page Quiz
// chosen in /dashboard/settings. Metadata (incl. noindex) comes from the root layout.
export const dynamic = "force-dynamic";

export default async function Home() {
    const quizUrl = await getQuizUrl();

    return (
        <div id="top" className={`hn-root min-h-screen font-sans ${accentSerif.variable}`}>
            <SiteNavbar quizUrl={quizUrl} />
            <main>
                <Hero quizUrl={quizUrl} />
                <MarqueeBands />
                <PainPicker quizUrl={quizUrl} />
                <HowItWorks />
                <Benefits />
                <StatsBand />
                <Reviews />
                <Faq quizUrl={quizUrl} />
                <FinalCta quizUrl={quizUrl} />
            </main>
            <SiteFooter quizUrl={quizUrl} />
            <MotionDirector />
            {/* Without JS nothing would ever get `data-in` — show everything */}
            <noscript>
                <style>{`.hn-root [data-reveal]{opacity:1!important;transform:none!important}.hn-line>span{transform:none!important}`}</style>
            </noscript>
        </div>
    );
}
