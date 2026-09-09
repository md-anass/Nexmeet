import { PolicyPage } from "@/components/marketing/policy-page";

export const metadata = { title: "Terms | NexMeet", description: "General terms for using NexMeet." };

export default function TermsPage() {
  return <PolicyPage title="Terms of Service" introduction="General terms for accessing and using the current NexMeet product." sections={[
    { title: "Using NexMeet", content: <p>You may use NexMeet only if you can lawfully agree to these terms. You are responsible for following applicable rules and for using the service in a way that does not harm other people or the platform.</p> },
    { title: "Accounts", content: <p>Keep account access information secure and provide accurate details. You are responsible for activity performed through your account and for signing out from shared devices.</p> },
    { title: "Meeting content and conduct", content: <p>Meeting organizers and participants are responsible for the content they share and their conduct. Do not use NexMeet for unlawful, abusive, deceptive or disruptive activity. The <a href="/acceptable-use">Acceptable Use Policy</a> provides more detail.</p> },
    { title: "Service availability", content: <p>NexMeet may evolve, experience interruptions or change as the product develops. Features can depend on compatible browsers, devices, networks and third-party infrastructure.</p> },
    { title: "Intellectual property", content: <p>NexMeet and its original product materials remain protected by applicable intellectual property rights. You keep responsibility for content you bring into a meeting and must have the rights needed to share it.</p> },
    { title: "Suspension and termination", content: <p>Access may be restricted or ended when necessary to protect the service, respond to misuse or comply with applicable requirements. You may stop using the service at any time.</p> },
    { title: "Changes and general disclaimers", content: <p>The service and these terms may change as NexMeet develops. NexMeet is provided on a developing-product basis, subject to the limits allowed by applicable law and without promises that every feature will always be uninterrupted or error-free.</p> },
  ]} />;
}
