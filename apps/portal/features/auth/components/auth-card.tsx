"use client";

import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { Card, Typography } from "@heroui/react";

import { LoginLayout } from "./login-layout";
import { ThemeSwitch } from "@/components/theme-switch";

export function AuthCard({
  title,
  description,
  children,
  footer,
  variant = "card",
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "card" | "split";
}) {
  if (variant === "split")
    return (
      <LoginLayout title={title} description={description} footer={footer}>
        {children}
      </LoginLayout>
    );

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(69,201,135,.12),transparent_52%)]"
      />
      <div className="absolute right-5 top-5">
        <ThemeSwitch />
      </div>
      <div className="relative w-full max-w-[450px] space-y-7">
        <Link
          aria-label="AgroCloud - inicio de sesión"
          className="mx-auto flex w-fit items-center gap-3"
          href="/login"
        >
          <Image alt="" height={44} src="/agrocloud/logo-mark.svg" width={44} />
          <span className="text-xl font-semibold tracking-tight">
            AgroCloud <span className="text-accent">AI</span>
          </span>
        </Link>
        <Card className="overflow-hidden rounded-[1.7rem] border border-border bg-surface shadow-xl shadow-black/5">
          <Card.Content className="p-6 sm:p-9">
            <Typography.Heading
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
              level={1}
            >
              {title}
            </Typography.Heading>
            <Typography.Paragraph className="mt-3 text-sm leading-7 text-muted">
              {description}
            </Typography.Paragraph>
            <div className="mt-7">{children}</div>
            {footer && (
              <div className="mt-7 border-t border-border pt-5 text-center text-sm text-muted">
                {footer}
              </div>
            )}
          </Card.Content>
        </Card>
        <p className="text-center text-xs text-muted">
          Acceso exclusivo para cuentas autorizadas. Protegemos los datos de cada empresa.
        </p>
      </div>
    </div>
  );
}
