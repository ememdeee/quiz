import type { ComponentType } from "react";
import { Card, IconBadge } from "@/components/ui/card";
import {
  BarChartIcon,
  BranchIcon,
  DownloadIcon,
  EyeIcon,
  GlobeIcon,
  PageIcon,
  PhoneIcon,
  SparklesIcon,
  TemplateIcon,
} from "@/components/ui/icons";
import { home, type FeatureIcon } from "@/content/home";
import { Container } from "../container";
import { SectionHeading } from "../section-heading";

const icons: Record<FeatureIcon, ComponentType> = {
  sparkles: SparklesIcon,
  page: PageIcon,
  branch: BranchIcon,
  phone: PhoneIcon,
  chart: BarChartIcon,
  download: DownloadIcon,
  template: TemplateIcon,
  eye: EyeIcon,
  globe: GlobeIcon,
};

export function Features() {
  const { features } = home;
  return (
    <section id="features" className="scroll-mt-24 pb-24 max-nav:pb-16">
      <Container size="wide">
        <SectionHeading eyebrow={features.eyebrow} title={features.title} />
        <div className="mt-12 grid gap-5 nav:grid-cols-3">
          {features.items.map((item) => {
            const Icon = icons[item.icon];
            return (
              <Card key={item.title} className="scroll-rise">
                <IconBadge>
                  <Icon />
                </IconBadge>
                <h3 className="mb-1.5 mt-[18px] text-[21px] font-bold tracking-[-0.01em]">{item.title}</h3>
                <p className="m-0 text-base leading-[25px] text-mute">{item.text}</p>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
