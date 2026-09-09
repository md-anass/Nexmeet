import { PolicyPage } from "@/components/marketing/policy-page";

export const metadata = { title: "Acceptable Use | NexMeet", description: "Acceptable use expectations for NexMeet." };

export default function AcceptableUsePage() {
  return <PolicyPage title="Acceptable Use" introduction="Straightforward expectations that help keep NexMeet useful and respectful for everyone." sections={[
    { title: "Use the service lawfully", content: <p>Do not use NexMeet to create, share or coordinate unlawful content or activity. You are responsible for understanding the rules that apply to you and your meeting.</p> },
    { title: "Respect other people", content: <p>Do not harass, threaten, exploit, impersonate or deliberately expose another person’s private information. Obtain appropriate permission before sharing content involving others.</p> },
    { title: "Protect access", content: <p>Do not seek unauthorized access to accounts, meetings, participant sessions, systems or data. Do not distribute meeting credentials for abusive purposes.</p> },
    { title: "No spam or disruption", content: <p>Do not flood meetings, automate unwanted joins, create excessive sessions, interfere with calls or use the platform to distribute spam, malware or deceptive content.</p> },
    { title: "Do not misuse product controls", content: <p>Do not circumvent passwords, waiting rooms, host decisions, quotas or other measures intended to protect users and the service.</p> },
    { title: "Response to misuse", content: <p>NexMeet may restrict access or take other reasonable steps when misuse threatens people, meetings or the service.</p> },
  ]} />;
}
