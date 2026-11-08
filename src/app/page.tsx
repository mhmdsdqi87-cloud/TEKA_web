"use client";

import { Providers } from "@/components/teka/providers";
import { TekaNavigation } from "@/components/teka/navigation";
import { TekaFooter } from "@/components/teka/footer";
import { PageShell } from "@/components/teka/page-shell";
import { Preloader } from "@/components/teka/preloader";
import { useRouter, useHashSync } from "@/lib/teka/router";
import { HomeView } from "@/components/teka/views/home-view";
import { AboutView } from "@/components/teka/views/about-view";
import { EcosystemView } from "@/components/teka/views/ecosystem-view";
import { TechnologyView } from "@/components/teka/views/technology-view";
import { TokenView } from "@/components/teka/views/token-view";
import { CommandView } from "@/components/teka/views/command-view";
import { ExploreView } from "@/components/teka/views/explore-view";
import { ContactView } from "@/components/teka/views/contact-view";
import { PerformanceView, SecurityView, PremiumView, GlobalVisionView } from "@/components/teka/views/deep-dives";

function TekaApp() {
  useHashSync();
  const route = useRouter((s) => s.route);

  const view = (() => {
    switch (route) {
      case "about":
        return <AboutView />;
      case "ecosystem":
        return <EcosystemView />;
      case "technology":
        return <TechnologyView />;
      case "token":
        return <TokenView />;
      case "command":
        return <CommandView />;
      case "explore":
        return <ExploreView />;
      case "contact":
        return <ContactView />;
      case "performance":
        return <PerformanceView />;
      case "security":
        return <SecurityView />;
      case "premium":
        return <PremiumView />;
      case "global-vision":
        return <GlobalVisionView />;
      default:
        return <HomeView />;
    }
  })();

  return (
    <div className="flex min-h-screen flex-col">
      <Preloader />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to content
      </a>
      <TekaNavigation />
      <div id="main-content">
        <PageShell>{view}</PageShell>
      </div>
      <TekaFooter />
    </div>
  );
}

export default function Page() {
  return (
    <Providers>
      <TekaApp />
    </Providers>
  );
}
