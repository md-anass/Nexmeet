import { PolicyPage } from "@/components/marketing/policy-page";

export const metadata = { title: "Security | NexMeet", description: "A public overview of NexMeet meeting access and security controls." };

export default function SecurityPage() {
  return <PolicyPage eyebrow="NexMeet trust information" title="Security" introduction="A high-level view of the product controls available for creating and managing NexMeet conversations." sections={[
    { title: "Private meeting links", content: <p>Every meeting uses its own invitation link. Organizers decide who receives it and can combine the link with additional access controls.</p> },
    { title: "Optional meeting passwords", content: <p>A meeting can require a password before a guest progresses into the waiting or joining flow. Password checks remain tied to the participant’s meeting session.</p> },
    { title: "Waiting-room approval", content: <p>Approval-required meetings hold guest requests outside the live room until the current host admits or rejects them.</p> },
    { title: "Host moderation", content: <p>Current-host authority follows the active meeting session. Host controls include handling waiting-room requests and ending the meeting for everyone.</p> },
    { title: "Controlled meeting access", content: <p>Meeting state and participant authorization are checked before live-room access is issued. Ended, cancelled and not-yet-started scheduled meetings remain outside the ordinary joining flow.</p> },
    { title: "Browser communication", content: <p>NexMeet uses modern browser and service-provider security features for account and real-time communication. Users should keep browsers updated and protect account and meeting credentials.</p> },
    { title: "Responsible disclosure", content: <p>NexMeet does not currently publish a dedicated security contact in this repository. A formal reporting channel should be added here when an official address or process is established.</p> },
  ]} />;
}
