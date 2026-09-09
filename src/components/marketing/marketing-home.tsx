"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, CalendarClock, Check, ChevronDown, CircleUserRound, Clock3, Copy,
  Globe2, Hand, KeyRound, Laptop, Link2, LockKeyhole,
  Menu, MessageCircle, Mic, MicOff, MonitorUp, MoreHorizontal, Play, Radio, Send,
  ShieldCheck, Sparkles, UserCheck, UsersRound, Video, X,
} from "lucide-react";
import { AnimatedNexMeetLogo, NexMeetLogo } from "@/components/brand/nexmeet-logo";
import styles from "./marketing-home.module.css";

type MarketingHomeProps = { authenticated: boolean };

const participants = [
  { name: "Maya", role: "Product design", src: "/marketing/participants/hero-maya.jpg", muted: false },
  { name: "Arman", role: "Engineering", src: "/marketing/participants/hero-arman.jpg", muted: false },
  { name: "Noor", role: "Research", src: "/marketing/participants/hero-noor.jpg", muted: true },
  { name: "Jordan", role: "Strategy", src: "/marketing/participants/hero-jordan.jpg", muted: false },
];

const navigation = [["Experience", "#product"], ["Features", "#features"], ["How it works", "#how-it-works"], ["Security", "#security"], ["Support", "#support"], ["FAQ", "#faq"]];

const values = [
  [Globe2, "Browser based", "Open a link and meet"],
  [Laptop, "No downloads", "Nothing new to install"],
  [ShieldCheck, "Private access", "Flexible entry controls"],
  [CalendarClock, "Scheduled meetings", "Plan conversations ahead"],
  [MonitorUp, "Works across devices", "Designed to stay responsive"],
] as const;

const faqs = [
  ["What is NexMeet?", "NexMeet is a browser-based video meeting platform for starting instant rooms, scheduling conversations and bringing guests together through one meeting link."],
  ["Do I need to install an app to join a meeting?", "No. NexMeet works in a supported modern browser, so you can open the invitation and continue without installing a separate desktop application."],
  ["Can guests join without creating an account?", "Yes. Guests can enter a display name and follow the access steps chosen for that meeting."],
  ["Can I protect a meeting with a password?", "Yes. Meeting creators can require an optional password before a guest continues to the room or waiting area."],
  ["Can I approve participants before they enter?", "Yes. Approval-required meetings place guests in a waiting room where the current host can admit or reject each request."],
  ["Can I schedule a meeting for later?", "Yes. Signed-in users can create a scheduled meeting for a future date and time, then share its invitation."],
  ["Can I share my screen during a meeting?", "Yes. The in-meeting controls include screen sharing in supported browsers."],
  ["Does NexMeet support chat and reactions?", "Yes. Participants can use meeting chat, reactions and raise hand alongside video and audio."],
  ["What controls does the meeting host have?", "The current host can manage waiting-room requests, leave while passing host responsibility to another participant, or end the meeting for everyone."],
  ["What happens if I refresh or temporarily lose connection?", "NexMeet can resume the same participant session during a refresh or reconnection. A temporary connection loss is treated differently from choosing Leave meeting."],
];

function IconOrb({ icon: Icon, tone = "blue" }: { icon: ElementType; tone?: "blue" | "cyan" | "violet" | "navy" }) {
  return <span className={`${styles.iconOrb} ${styles[`orb${tone[0].toUpperCase()}${tone.slice(1)}`]}`}><Icon /></span>;
}

function Reveal({ children, className = "", delay = 0, variant = "up" }: { children: ReactNode; className?: string; delay?: number; variant?: "up" | "left" | "right" | "clip" | "scale" }) {
  return <div className={className} data-reveal={variant} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}

function MeetingWindow({ cinematic = false }: { cinematic?: boolean }) {
  return (
    <div className={`${styles.meetingScene} ${cinematic ? styles.meetingSceneCinematic : ""}`}>
      <span className={styles.sceneGlow} aria-hidden="true" />
      <div className={styles.meetingWindow} aria-label="NexMeet product preview showing four people in a video meeting">
        <div className={styles.windowTopbar}>
          <span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span>
          <span className={styles.windowTitle}><NexMeetLogo markOnly size={19} /><strong>Weekly design review</strong><small>nexmeet.app</small></span>
          <span className={styles.livePill}><i />Live <em>12:48</em></span>
        </div>
        <div className={styles.meetingBody}>
          <div className={styles.videoArea}>
            <div className={styles.photoGrid}>
              {participants.map((person, index) => (
                <figure className={`${styles.photoTile} ${index === 0 ? styles.photoTileActive : ""}`} key={person.name}>
                  <Image src={person.src} alt={`${person.name} in a NexMeet video conversation`} fill sizes={cinematic ? "(max-width: 720px) 50vw, 360px" : "(max-width: 720px) 46vw, 260px"} priority={!cinematic} />
                  <span className={styles.photoShade} />
                  {index === 0 && <span className={styles.speaking}><Radio />Speaking</span>}
                  {index === 2 && <span className={styles.handRaised}><Hand />Raised hand</span>}
                  <figcaption><span><strong>{person.name}</strong><small>{person.role}</small></span>{person.muted ? <MicOff /> : <Mic />}</figcaption>
                </figure>
              ))}
            </div>
            <div className={styles.toolbar}>
              <button tabIndex={-1} type="button"><Mic /></button><button tabIndex={-1} type="button"><Video /></button><button tabIndex={-1} type="button"><MonitorUp /></button><button tabIndex={-1} type="button" className={styles.toolbarActive}><Hand /></button><button tabIndex={-1} type="button"><MoreHorizontal /></button><button tabIndex={-1} type="button" className={styles.endCall}>End</button>
            </div>
          </div>
          <aside className={styles.peoplePanel}>
            <div className={styles.panelTabs}><strong>People</strong><span>Chat</span></div><p>In this meeting <strong>4</strong></p>
            {participants.slice(0, 3).map((person, index) => <div className={styles.person} key={person.name}><span className={styles.personPhoto}><Image src={person.src} alt="" fill sizes="42px" /></span><span><strong>{person.name}</strong><small>{index === 0 ? "Speaking" : "In meeting"}</small></span>{person.muted ? <MicOff /> : <Mic />}</div>)}
            <div className={styles.panelMessage}><span className={styles.personPhoto}><Image src="/marketing/participants/hero-noor.jpg" alt="" fill sizes="34px" /></span><span><strong>Noor</strong><small>Ready for the next idea 👋</small></span></div>
          </aside>
        </div>
      </div>
      {!cinematic && <><div className={`${styles.floatCard} ${styles.floatSecurity}`}><ShieldCheck /><span><strong>Private room</strong><small>Access controls on</small></span><Check /></div><div className={`${styles.floatCard} ${styles.floatReaction}`}><span>👏</span><div><strong>Great point</strong><small>Reaction from Maya</small></div></div></>}
    </div>
  );
}

function SecurityMeetingVisual() {
  const accessCards = [
    { icon: Link2, title: "Private meeting link", copy: "Share access with the people you choose", state: "Ready", className: styles.securityCardLink },
    { icon: KeyRound, title: "Optional password", copy: "Add a password before guests continue", state: "Protected", className: styles.securityCardPassword },
    { icon: UserCheck, title: "Waiting-room approval", copy: "Review each request before admission", state: "2 waiting", className: styles.securityCardWaiting },
    { icon: CircleUserRound, title: "Host moderation", copy: "Keep entry and end controls close", state: "Host", className: styles.securityCardHost },
    { icon: ShieldCheck, title: "Controlled guest access", copy: "Joining follows the room's access rules", state: "On", className: styles.securityCardGuest },
  ];

  return (
    <div className={styles.securityStage} aria-label="NexMeet meeting protected by password, waiting-room and host access controls">
      <span className={styles.securityStageGlow} aria-hidden="true" />
      <svg className={styles.securityConnections} viewBox="0 0 760 680" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="security-connection-gradient" x1="0" x2="1"><stop stopColor="#22d3ee" /><stop offset=".52" stopColor="#3b82f6" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient></defs>
        <path className={styles.securityLineBase} d="M92 190 C145 190 128 118 210 118 H566 C632 118 621 78 690 78 M128 520 C196 520 170 570 245 570 H548 C626 570 620 608 698 608 M610 320 H728" />
        <path className={styles.securityLinePulse} d="M92 190 C145 190 128 118 210 118 H566 C632 118 621 78 690 78 M128 520 C196 520 170 570 245 570 H548 C626 570 620 608 698 608 M610 320 H728" />
      </svg>

      <div className={styles.securityMeetingFrame}>
        <div className={styles.securityMeetingTopbar}>
          <span><NexMeetLogo markOnly size={22} /><strong>Team planning room</strong><small>Private meeting</small></span>
          <em><ShieldCheck />Protected</em>
        </div>
        <div className={styles.securityMeetingGrid}>
          {participants.map((person, index) => (
            <figure className={index === 0 ? styles.securitySpeaker : ""} key={person.name}>
              <Image src={person.src} alt={`${person.name} in a protected NexMeet meeting`} fill sizes="(max-width: 760px) 46vw, 240px" />
              <span />
              {index === 0 && <em><Radio />Speaking</em>}
              <figcaption><strong>{person.name}</strong>{person.muted ? <MicOff /> : <Mic />}</figcaption>
            </figure>
          ))}
        </div>
        <div className={styles.securityMeetingControls} aria-hidden="true">
          <button type="button" tabIndex={-1}><Mic /></button>
          <button type="button" tabIndex={-1}><Video /></button>
          <button type="button" tabIndex={-1}><MonitorUp /></button>
          <button type="button" tabIndex={-1}><UsersRound /></button>
          <button type="button" tabIndex={-1} className={styles.securityEndControl}>End</button>
        </div>
        <div className={styles.securityStateRail}>
          <span><UserCheck /><strong>Waiting room enabled</strong></span>
          <span><KeyRound /><strong>Password protected</strong></span>
          <span><ShieldCheck /><strong>Host approval required</strong></span>
        </div>
      </div>

      <div className={styles.securityCardLayer}>
        {accessCards.map(({ icon: Icon, title, copy, state, className }, index) => (
          <article className={`${styles.securityFloatCard} ${className}`} style={{ "--security-delay": `${380 + index * 90}ms` } as CSSProperties} key={title}>
            <span className={styles.securityCardIcon}><Icon /></span>
            <span><strong>{title}</strong><small>{copy}</small></span>
            <em><i />{state}</em>
          </article>
        ))}
      </div>
    </div>
  );
}

function MiniInvite() { return <div className={styles.miniInvite} aria-hidden="true"><span><Link2 />nexmeet.app/m/nx8...<Copy /></span><button tabIndex={-1}>Start room<ArrowRight /></button><small><i /><i /><i /> Invitation ready</small></div>; }
function MiniAccess() { return <div className={styles.miniAccess} aria-hidden="true"><div><LockKeyhole /><span><strong>Meeting password</strong><small>Required before entry</small></span><Check /></div><div><UserCheck /><span><strong>Host approval</strong><small>Waiting room enabled</small></span><Check /></div></div>; }
function MiniCalendar() { return <div className={styles.miniCalendar} aria-hidden="true"><span><small>SEP</small><strong>18</strong></span><div><strong>Design sync</strong><small><Clock3 />10:30 AM</small><em>Scheduled</em></div></div>; }
function MiniWaiting() { return <div className={styles.miniWaiting} aria-hidden="true"><span className={styles.waitingAvatar}><Image src="/marketing/participants/hero-arman.jpg" alt="" fill sizes="52px" /></span><span><strong>Arman is waiting</strong><small>Ready to join</small></span><button tabIndex={-1}>Admit</button></div>; }
function MiniChat() { return <div className={styles.miniChat} aria-hidden="true"><span className={styles.chatBubble}>The latest version looks great <em>✨</em></span><span className={styles.chatBubble}>I&apos;ll share the next screen.</span><div><span>Message everyone</span><Send /></div></div>; }
function MiniModeration() { return <div className={styles.miniModeration} aria-hidden="true"><div><span className={styles.waitingAvatar}><Image src="/marketing/participants/hero-noor.jpg" alt="" fill sizes="50px" /></span><span><strong>Noor</strong><small>In meeting</small></span><MicOff /><MoreHorizontal /></div><p><ShieldCheck />Host controls are active</p></div>; }

export function MarketingHome({ authenticated }: MarketingHomeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const startHref = authenticated ? "/dashboard" : "/signup";
  const accountHref = authenticated ? "/dashboard" : "/login";
  const accountLabel = authenticated ? "Dashboard" : "Sign in";

  useEffect(() => {
    const root = rootRef.current;
    const onScroll = () => { setScrolled(window.scrollY > 28); if (root) root.style.setProperty("--page-scroll", `${Math.min(window.scrollY, 1400)}px`); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    const items = root ? [...root.querySelectorAll<HTMLElement>("[data-reveal]")] : [];
    root?.classList.add(styles.motionReady);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let observer: IntersectionObserver | null = null;
    if (reduce || !("IntersectionObserver" in window)) items.forEach((item) => item.classList.add(styles.visible));
    else { observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (!entry.isIntersecting) return; (entry.target as HTMLElement).classList.add(styles.visible); observer?.unobserve(entry.target); }), { threshold: 0.12, rootMargin: "0px 0px -8%" }); items.forEach((item) => observer?.observe(item)); }
    return () => { window.removeEventListener("scroll", onScroll); observer?.disconnect(); };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close);
  }, [mobileOpen]);

  return (
    <div className={styles.page} ref={rootRef}>
      <header className={`${styles.navShell} ${scrolled ? styles.navScrolled : ""}`}>
        <div className={styles.navbar}>
          <Link className={styles.brand} href="/" aria-label="NexMeet home"><AnimatedNexMeetLogo size={46} /></Link>
          <nav className={styles.desktopNav} aria-label="Homepage navigation">{navigation.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
          <div className={styles.navActions}><Link href={accountHref} className={styles.signIn}>{accountLabel}</Link><Link href={startHref} className={styles.navCta}>Get started<ArrowRight /></Link><button className={styles.menuButton} type="button" aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"} aria-controls="mobile-navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}>{mobileOpen ? <X /> : <Menu />}</button></div>
          <div id="mobile-navigation" className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ""}`} aria-hidden={!mobileOpen}>{navigation.map(([label, href]) => <a key={href} href={href} onClick={() => setMobileOpen(false)}>{label}<ArrowRight /></a>)}<div><Link href={accountHref}>{accountLabel}</Link><Link href={startHref}>Get started<ArrowRight /></Link></div></div>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroGrid} aria-hidden="true" /><div className={styles.aurora} aria-hidden="true"><i /><i /><i /></div>
          <div className={styles.container}><div className={styles.heroLayout}>
            <div className={styles.heroCopy}><p className={`${styles.eyebrow} ${styles.heroEnterOne}`}><Sparkles />A faster way to be together</p><h1 className={styles.heroHeadline}><span className={styles.heroEnterTwo}>One link.</span><span className={`${styles.gradientText} ${styles.heroEnterThree}`}>Everyone in.</span></h1><p className={`${styles.heroLead} ${styles.heroEnterFour}`}>NexMeet turns a browser tab into a focused meeting room—instant to start, effortless to join and designed to keep the conversation in control.</p><div className={`${styles.heroActions} ${styles.heroEnterFive}`}><Link href={startHref} className={styles.primaryCta}><Video />Create your room<ArrowRight /></Link><a href="#product" className={styles.secondaryCta}><Play />Explore NexMeet</a></div><ul className={`${styles.trustList} ${styles.heroEnterSix}`}><li><Check />No app required</li><li><Check />Guest-friendly links</li><li><Check />Host access controls</li></ul><div className={styles.heroLightline} aria-hidden="true"><i /></div></div>
            <div className={`${styles.heroVisual} ${styles.heroVisualEnter}`}><MeetingWindow /></div>
          </div></div><div className={styles.heroBottomFade} aria-hidden="true" />
        </section>

        <section className={styles.valueBar} aria-label="NexMeet product qualities"><div className={`${styles.container} ${styles.valueGrid}`}><span className={styles.valueTrail} aria-hidden="true"><i /></span>{values.map(([Icon, title, copy]) => <div className={styles.valueItem} key={title}><Icon /><span><strong>{title}</strong><small>{copy}</small></span></div>)}</div></section>

        <section id="features" className={`${styles.section} ${styles.features}`}><div className={styles.container}>
          <Reveal className={styles.sectionHeading} variant="left"><p className={styles.kicker}>A complete meeting flow</p><h2>From “shall we meet?”<br /><span>to everyone connected.</span></h2><p>Every step is designed to feel obvious: create the room, control access, invite people and stay focused once the conversation begins.</p></Reveal>
          <div className={styles.bento}>
            <Reveal className={`${styles.featureCard} ${styles.featureInstant}`} variant="clip"><div className={styles.featureCopy}><IconOrb icon={Video} tone="cyan" /><p>Instant video meetings</p><h3>Bring everyone together in a few steps.</h3><span>Create a room, copy the link and make space for the conversation.</span></div><div className={styles.featurePhoto}><Image src="/marketing/participants/video-call-laptop.jpg" alt="A participant joining a video conversation on a laptop" fill sizes="(max-width: 720px) 100vw, 580px" /><span /></div><MiniInvite /></Reveal>
            <Reveal className={`${styles.featureCard} ${styles.featureSecure}`} delay={80} variant="right"><div className={styles.featureCopy}><IconOrb icon={ShieldCheck} tone="violet" /><p>Secure access</p><h3>The right people. Your rules.</h3><span>Use optional passwords and host approval where the conversation needs them.</span></div><div className={styles.featurePhoto}><Image src="/marketing/participants/team-collaboration.jpg" alt="Colleagues collaborating in a private meeting" fill sizes="(max-width: 720px) 100vw, 580px" /><span /></div><MiniAccess /></Reveal>
            <Reveal className={`${styles.featureCard} ${styles.featureSchedule}`} variant="left"><div className={styles.featureCopy}><IconOrb icon={CalendarClock} tone="violet" /><p>Scheduled meetings</p><h3>Make time for what matters.</h3><span>Plan a future room and share the invitation ahead of time.</span></div><MiniCalendar /></Reveal>
            <Reveal className={`${styles.featureCard} ${styles.featureWaiting}`} delay={70}><div className={styles.featureCopy}><IconOrb icon={UserCheck} tone="blue" /><p>Waiting room</p><h3>Welcome each guest with clarity.</h3><span>Review requests before someone enters an approval-required room.</span></div><MiniWaiting /></Reveal>
            <Reveal className={`${styles.featureCard} ${styles.featureChat}`} delay={140} variant="clip"><div className={styles.featurePhoto}><Image src="/marketing/participants/hero-maya.jpg" alt="A participant engaged in an online conversation" fill sizes="(max-width: 720px) 100vw, 430px" /><span /></div><div className={styles.featureCopy}><IconOrb icon={MessageCircle} tone="violet" /><p>Chat, reactions & raise hand</p><h3>Stay part of the moment.</h3></div><MiniChat /></Reveal>
            <Reveal className={`${styles.featureCard} ${styles.featureHost}`} delay={210} variant="right"><div className={styles.featurePhoto}><Image src="/marketing/participants/community-collaboration.jpg" alt="People working together during a shared conversation" fill sizes="(max-width: 720px) 100vw, 430px" /><span /></div><div className={styles.featureCopy}><IconOrb icon={CircleUserRound} tone="navy" /><p>Host controls</p><h3>Lead the room with confidence.</h3></div><MiniModeration /></Reveal>
          </div>
        </div></section>

        <section id="about" className={`${styles.section} ${styles.about}`}><div className={`${styles.container} ${styles.aboutLayout}`}><Reveal className={styles.aboutMedia} variant="clip"><Image src="/marketing/participants/about-nexmeet.jpg" alt="People collaborating together around a table" fill sizes="(max-width: 860px) 100vw, 590px" /><div className={styles.aboutOverlay}><AnimatedNexMeetLogo markOnly size={56} /><span><strong>Built around the conversation</strong><small>Less interface between people</small></span></div></Reveal><Reveal className={styles.aboutCopy} variant="right"><p className={styles.kicker}>Why NexMeet exists</p><h2>Meeting software should disappear when people start talking.</h2><p>We designed NexMeet around the moments that usually create friction: getting everyone into the room, knowing who is waiting, finding the controls you need and keeping the meeting private when it matters.</p><div className={styles.capabilityGrid}><span><Video /><strong>Start in moments</strong><small>Instant rooms without setup overload</small></span><span><Globe2 /><strong>Invite with one link</strong><small>A clear path for every guest</small></span><span><ShieldCheck /><strong>Decide who enters</strong><small>Password and waiting-room options</small></span><span><MessageCircle /><strong>Keep people involved</strong><small>Chat, reactions and raised hands</small></span></div></Reveal></div></section>

        <section className={`${styles.section} ${styles.why}`}><div className={styles.container}><Reveal className={`${styles.sectionHeading} ${styles.centerHeading}`}><p className={styles.kicker}>Why NexMeet?</p><h2>Less friction.<br /><span>More human connection.</span></h2></Reveal><div className={styles.whyGrid}>{[
          [Video, "Simple to start", "Move from an idea to a live meeting without a complicated setup.", "/marketing/participants/video-call-woman.jpg"],
          [Link2, "Easy for guests", "Share one meeting link and guide guests through a focused joining flow.", "/marketing/participants/students-learning.jpg"],
          [ShieldCheck, "Built around control", "Choose open access, a password or waiting-room approval for each room.", "/marketing/participants/team-collaboration.jpg"],
          [UsersRound, "Designed for conversation", "Keep faces, voices and participation at the center of the experience.", "/marketing/participants/community-collaboration.jpg"],
        ].map(([Icon, title, copy, src], index) => <Reveal key={String(title)} className={styles.whyCard} delay={index * 70} variant={index % 2 ? "right" : "left"}><div><Image src={String(src)} alt="" fill sizes="(max-width: 720px) 100vw, 320px" /><span /></div><IconOrb icon={Icon as ElementType} tone={index === 2 ? "violet" : "blue"} /><h3>{String(title)}</h3><p>{String(copy)}</p></Reveal>)}</div></div></section>

        <section id="product" className={`${styles.section} ${styles.product}`}><div className={styles.productAurora} aria-hidden="true" /><div className={styles.container}><Reveal className={styles.productHeading} variant="left"><p className={styles.kicker}>A calmer place to collaborate</p><h2>A meeting space<br /><span>that stays out of the way.</span></h2><p>Video stays central. The controls you need remain close. Everything else gives the conversation room to breathe.</p></Reveal><Reveal className={styles.productStage} variant="scale"><MeetingWindow cinematic /><span className={`${styles.productChip} ${styles.chipMic}`}><Mic />Clear controls</span><span className={`${styles.productChip} ${styles.chipChat}`}><MessageCircle />Chat in context</span><span className={`${styles.productChip} ${styles.chipHand}`}><Hand />Raise hand</span></Reveal></div></section>

        <section id="how-it-works" className={`${styles.section} ${styles.journey}`}><div className={styles.container}><Reveal className={styles.sectionHeading} variant="left"><p className={styles.kicker}>From a link to live</p><h2>Three clear steps.<br /><span>One real conversation.</span></h2></Reveal><div className={styles.journeyTrack}><span className={styles.journeyLine} aria-hidden="true"><i /></span>{[
          ["01", Video, "Create", "Start an instant room or schedule a time that works.", "/marketing/participants/video-call-laptop.jpg", "Room ready"],
          ["02", Link2, "Share", "Send the private meeting link to the people you want there.", "/marketing/participants/support-specialist.jpg", "Invite copied"],
          ["03", UsersRound, "Meet", "Prepare your camera and microphone, then join the room.", "/marketing/participants/team-collaboration.jpg", "Everyone is ready"],
        ].map(([number, Icon, title, copy, src, label], index) => <Reveal className={styles.journeyStep} key={String(number)} delay={index * 100}><span className={styles.stepNo}>{String(number)}</span><div className={styles.stepVisual}><Image src={String(src)} alt="" fill sizes="(max-width: 720px) 100vw, 380px" /><span className={styles.stepUi}><Icon /><strong>{String(label)}</strong><Check /></span></div><h3>{String(title)}</h3><p>{String(copy)}</p></Reveal>)}</div></div></section>

        <section id="security" className={`${styles.section} ${styles.security}`}>
          <span className={styles.securityGrid} aria-hidden="true" />
          <span className={styles.securityAura} aria-hidden="true"><i /><i /></span>
          <div className={`${styles.container} ${styles.securityPanel}`}>
            <Reveal className={styles.securityCopy} variant="left">
              <p className={styles.kicker}>Control that stays with you</p>
              <h2>Your meeting.<br /><span>Your control.</span></h2>
              <p>Choose how people enter, decide who joins, and keep control of your meeting from start to finish.</p>
              <ul className={styles.securityProofs}>
                <li><KeyRound /><span><strong>Password protection</strong><small>Add an optional step before entry.</small></span></li>
                <li><UserCheck /><span><strong>Waiting-room approval</strong><small>Review guests before they join.</small></span></li>
                <li><ShieldCheck /><span><strong>Host moderation</strong><small>Keep important room decisions close.</small></span></li>
              </ul>
            </Reveal>
            <Reveal className={styles.securityVisualReveal} delay={150} variant="scale"><SecurityMeetingVisual /></Reveal>
          </div>
        </section>

        <section className={`${styles.section} ${styles.useCases}`}><div className={styles.container}><Reveal className={styles.useHeading} variant="left"><p className={styles.kicker}>Made for people, not personas</p><h2>For the conversations<br /><span>that move things forward.</span></h2><p>From a quick check-in to a focused learning session, NexMeet keeps the experience centered on who is there.</p></Reveal><div className={styles.useGrid}>{[["Teams", "Share decisions and move work forward.", "/marketing/participants/team-collaboration.jpg"], ["Students & educators", "Create room for learning and discussion.", "/marketing/participants/students-learning.jpg"], ["Friends & communities", "Stay close through conversations that feel natural.", "/marketing/participants/community-collaboration.jpg"], ["Remote collaboration", "Bring ideas and people into one focused space.", "/marketing/participants/video-call-laptop.jpg"]].map(([title, copy, src], index) => <Reveal key={title} className={styles.useCard} delay={index * 70} variant="clip"><Image src={src} alt={`${title} using online communication`} fill sizes="(max-width: 720px) 100vw, 400px" /><span /><div><small>0{index + 1}</small><h3>{title}</h3><p>{copy}</p></div></Reveal>)}</div></div></section>


        <section id="support" className={`${styles.section} ${styles.support}`}><div className={styles.container}><Reveal className={styles.supportPanel} variant="clip"><div className={styles.supportPhoto}><Image src="/marketing/participants/support-specialist.jpg" alt="A person ready to help with an online meeting" fill sizes="(max-width: 760px) 100vw, 520px" /><span className={styles.supportPhotoShade} /><div className={styles.supportBadge}><span><MessageCircle /></span><div><small>NexMeet support</small><strong>Help when the meeting matters.</strong></div></div></div><div className={styles.supportCopy}><p className={styles.kicker}>Support without the runaround</p><h2>Need help getting everyone connected?</h2><p>Start with quick answers for joining, access controls, audio, video and meeting links. NexMeet keeps support close to the same simple experience as the product.</p><div className={styles.supportActions}><a href="#faq" className={styles.supportPrimary}>Browse common questions<ArrowRight /></a><Link href="/security" className={styles.supportSecondary}><ShieldCheck />Read about security</Link></div><div className={styles.supportStats}><span><strong>Browser first</strong><small>No desktop setup to troubleshoot</small></span><span><strong>Clear controls</strong><small>Easy-to-find meeting actions</small></span></div></div></Reveal></div></section>

        <section id="faq" className={`${styles.section} ${styles.faq}`}><div className={`${styles.container} ${styles.faqLayout}`}><Reveal className={styles.faqIntro} variant="left"><p className={styles.kicker}>Useful answers, up front</p><h2>Questions?<br /><span>Answered.</span></h2><p>What to expect before you create, share or join a NexMeet room.</p></Reveal><Reveal className={styles.faqList} variant="right">{faqs.map(([question, answer], index) => { const open = openFaq === index; return <article className={`${styles.faqItem} ${open ? styles.faqOpen : ""}`} key={question}><h3><button type="button" aria-expanded={open} aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaq(open ? null : index)}><span><em>{String(index + 1).padStart(2, "0")}</em>{question}</span><ChevronDown /></button></h3><div className={styles.faqAnswer} id={`faq-answer-${index}`}><div><p>{answer}</p></div></div></article>; })}</Reveal></div></section>

        <section className={styles.finalCta}><Reveal className={`${styles.container} ${styles.finalPanel}`} variant="scale"><Image src="/marketing/participants/hero-maya.jpg" alt="A person smiling during an online meeting" fill sizes="1280px" /><span className={styles.finalShade} /><span className={styles.finalBeam} aria-hidden="true" /><div className={styles.finalCopy}><AnimatedNexMeetLogo markOnly size={68} /><p className={styles.kicker}>The room is yours</p><h2>Start with a link.<br /><span>End with progress.</span></h2><p>Create a NexMeet room, invite your people and get straight to the conversation.</p><div><Link href={startHref} className={styles.primaryCta}>Get started<ArrowRight /></Link><Link href={accountHref} className={styles.finalSecondary}>{accountLabel}</Link></div></div></Reveal></section>
      </main>

      <footer className={styles.footer}><div className={styles.footerLine} aria-hidden="true"><i /></div><div className={`${styles.container} ${styles.footerGrid}`}><div className={styles.footerBrand}><NexMeetLogo size={53} /><p>Browser-based video meetings designed around simple joining, clear controls and real conversation.</p></div><div><strong>Product</strong><a href="#features">Features</a><a href="#how-it-works">How it works</a><Link href="/security">Security</Link><a href="#faq">FAQ</a></div><div><strong>Company</strong><a href="#about">About</a><a href="#support">Support</a></div><div><strong>Legal</strong><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link><Link href="/acceptable-use">Acceptable Use</Link></div><div><strong>Account</strong><Link href={accountHref}>{accountLabel}</Link><Link href={startHref}>Get started</Link></div></div><div className={`${styles.container} ${styles.footerBottom}`}><span>© {new Date().getUTCFullYear()} NexMeet</span><span><ShieldCheck />Thoughtful access controls for every conversation.</span></div></footer>
    </div>
  );
}
