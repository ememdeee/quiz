"use client";

import { useActionState, useEffect, useState, type CSSProperties } from "react";
import { TurnstileWidget } from "@/components/auth/turnstile";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { ToggleChip } from "@/components/ui/chip";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ArrowRightIcon } from "@/components/ui/icons";
import { contact, contactTopics } from "@/content/contact";
import { sendContactMessage, type ContactFormState } from "@/server/actions/contact";
import { Container } from "../container";
import { HeroBackdrop } from "../hero-backdrop";
import { ContactAside } from "./contact-aside";
import { ContactSent } from "./contact-sent";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** The contact page: heading, form, side cards. Swaps to the "sent" card when the message is on its way. */
export function ContactView({ initialState }: { initialState: ContactFormState }) {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);
  const [topics, setTopics] = useState<string[]>(
    initialState.status === "error" ? initialState.values.topics : [],
  );

  // The page gets shorter when the form is replaced by the "sent" card: glide back up instead of jumping
  const sent = state.status === "sent";
  useEffect(() => {
    if (sent) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sent]);

  if (sent) return <ContactSent />;

  const errors = state.status === "error" ? state.errors : {};
  const values = state.status === "error" ? state.values : { name: "", email: "", message: "", topics: [] };
  const toggle = (topic: string) => setTopics((now) => (now.includes(topic) ? now.filter((t) => t !== topic) : [...now, topic]));

  return (
    <header className="relative pb-[88px] pt-10 sm:pt-16 max-[700px]:pb-14">
      <HeroBackdrop dotsAt="30% 20%" blobB={{ top: 120 }} />
      <Container className="relative">
        <span className="enter text-sm font-bold uppercase tracking-[0.06em] text-mute" style={delay(40)}>
          {contact.eyebrow}
        </span>
        <h1 className="enter mt-3 text-[clamp(34px,4.6vw,56px)] font-extrabold leading-[1.06] tracking-[-0.035em]" style={delay(120)}>
          {contact.titleLines[0]}
          <br />
          {contact.titleLines[1]}
        </h1>
        <p className="enter mt-4 max-w-[520px] text-[19px] leading-[29px] text-mute max-[700px]:text-[17px] max-[700px]:leading-[27px]" style={delay(220)}>
          {contact.lede}
        </p>

        <div className="enter relative mt-12 flex flex-wrap items-start gap-8" style={delay(320)}>
          <form
            action={formAction}
            noValidate
            className="flex min-w-0 flex-[1.4_1_460px] flex-col gap-5 rounded-3xl border border-line bg-white p-8 shadow-[0_24px_60px_rgba(51,65,85,0.08)] max-[700px]:p-[22px]"
          >
            {state.status === "error" ? <Banner tone="error">{contact.errors.banner}</Banner> : null}

            <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
              <legend className="mb-2 p-0 text-[15px] font-semibold">{contact.form.topicsLabel}</legend>
              <div className="flex flex-wrap gap-2.5">
                {contactTopics.map((topic) => (
                  <ToggleChip key={topic} pressed={topics.includes(topic)} onClick={() => toggle(topic)}>
                    {topic}
                  </ToggleChip>
                ))}
              </div>
              {topics.map((topic) => (
                <input key={topic} type="hidden" name="topic" value={topic} />
              ))}
            </fieldset>

            <Field label={contact.form.name} htmlFor="contact-name">
              <Input id="contact-name" name="name" autoComplete="name" defaultValue={values.name} className="min-h-[54px]" />
            </Field>
            <Field label={contact.form.email} htmlFor="contact-email" error={errors.email}>
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={values.email}
                invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                className="min-h-[54px]"
              />
            </Field>
            <Field label={contact.form.message} htmlFor="contact-message" error={errors.message}>
              <Textarea
                id="contact-message"
                name="message"
                rows={5}
                defaultValue={values.message}
                placeholder={contact.form.messagePlaceholder}
                invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
              />
            </Field>

            <TurnstileWidget />
            <Button type="submit" size="lg" loading={pending} className="self-start">
              {pending ? contact.form.sending : contact.form.send}
              {pending ? null : <ArrowRightIcon />}
            </Button>
          </form>

          <ContactAside />
        </div>
      </Container>
    </header>
  );
}
