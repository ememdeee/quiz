import { Card, StepNumber } from "@/components/ui/card";
import { pricing } from "@/content/pricing";
import { Container } from "../container";
import { SectionHeading } from "../section-heading";

export function CustomSteps() {
  const { steps } = pricing;
  return (
    <section className="pb-20 max-[700px]:pb-14">
      <Container>
        <SectionHeading eyebrow={steps.eyebrow} title={steps.title} align="center" />
        <div className="mt-11 flex flex-wrap gap-6">
          {steps.items.map((step, i) => (
            <Card key={step.title} className="scroll-rise min-w-0 flex-[1_1_280px]">
              <StepNumber>{i + 1}</StepNumber>
              <h3 className="mb-1.5 mt-[18px] text-[21px] font-bold">{step.title}</h3>
              <p className="m-0 text-base leading-[25px] text-mute">{step.text}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
