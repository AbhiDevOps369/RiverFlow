import HeroSection from "@/app/components/HeroSection";
import LatestQuestions from "@/app/components/LatestQuestions";
import TopContributers from "@/app/components/TopContributers";

export default function Home() {
    return (
        <main>
            <HeroSection />
            <div className="container mx-auto px-4 pb-20 pt-10">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <h2 className="mb-6 text-2xl font-bold">Latest Questions</h2>
                        <LatestQuestions />
                    </div>
                    <div className="lg:col-span-1">
                        <h2 className="mb-6 text-2xl font-bold">Top Contributors</h2>
                        <TopContributers />
                    </div>
                </div>
            </div>
        </main>
    );
}