"use client";

import Link from "next/link";
import { Typography } from "@heroui/react";
import { FiArrowUpRight } from "react-icons/fi";

type Props = { title?: string; text?: string; button?: string };

export function CallToAction({
  title = "Organiza la calidad de tu operación agrícola",
  text = "Cuéntanos sobre tu empresa y cómo deseas utilizar AgroCloud. Revisaremos tu solicitud de acceso.",
  button = "Solicitar acceso empresarial",
}: Props) {
  return (
    <section className="site-container py-14 sm:py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#104C37] to-[#0F523C] px-7 py-10 text-white shadow-xl shadow-brand-700/20 sm:px-12 sm:py-14 lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 size-[360px] rounded-full border-[65px] border-white/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-[#B7F5A2]/10 blur-2xl"
        />
        <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <Typography.Paragraph
              className="font-bold uppercase tracking-[0.2em] text-[#A5E9BE]"
              size="xs"
            >
              Comienza con AgroCloud
            </Typography.Paragraph>
            <Typography.Heading className="mt-4 text-3xl text-white sm:text-4xl" level={2}>
              {title}
            </Typography.Heading>
            <Typography.Paragraph className="mt-4 leading-7 text-white/80">
              {text}
            </Typography.Paragraph>
          </div>
          <Link
            className="site-button shrink-0 bg-white text-[#104C37] shadow-lg shadow-black/10 hover:bg-[#E7F9EB]"
            href="/solicitar-acceso"
          >
            {button}
            <FiArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
