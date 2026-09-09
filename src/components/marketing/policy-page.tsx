import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { NexMeetLogo } from "@/components/brand/nexmeet-logo";
import styles from "./policy-page.module.css";

export type PolicySection = {
  title: string;
  content: ReactNode;
};

export function PolicyPage({ eyebrow = "NexMeet policy information", title, introduction, sections }: { eyebrow?: string; title: string; introduction: string; sections: PolicySection[] }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="NexMeet home"><NexMeetLogo size={45} /></Link>
        <nav aria-label="Policy navigation"><Link href="/security">Security</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/login" className={styles.headerCta}>Sign in<ArrowRight /></Link></nav>
      </header>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroInner}>
            <Link href="/" className={styles.back}><ArrowLeft />Back to NexMeet</Link>
            <p>{eyebrow}</p>
            <h1>{title}</h1>
            <span>{introduction}</span>
          </div>
        </section>
        <div className={styles.contentLayout}>
          <aside><strong>On this page</strong>{sections.map((section, index) => <a href={`#section-${index + 1}`} key={section.title}>{section.title}</a>)}</aside>
          <article className={styles.content}>
            <div className={styles.notice}><ShieldCheck /><p><strong>Plain-language product information</strong><span>This page describes the current NexMeet product in general terms. It may be updated as the service develops.</span></p></div>
            {sections.map((section, index) => <section id={`section-${index + 1}`} key={section.title}><span>0{index + 1}</span><div><h2>{section.title}</h2>{section.content}</div></section>)}
          </article>
        </div>
      </main>
      <footer><div><NexMeetLogo size={42} /><p>Simple, browser-based video conversations.</p></div><nav><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link><Link href="/acceptable-use">Acceptable Use</Link><Link href="/security">Security</Link></nav><span>© {new Date().getUTCFullYear()} NexMeet</span></footer>
    </div>
  );
}
