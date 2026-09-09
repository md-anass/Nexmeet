import { PolicyPage } from "@/components/marketing/policy-page";

export const metadata = { title: "Privacy | NexMeet", description: "General information about privacy in the NexMeet product." };

export default function PrivacyPage() {
  return <PolicyPage title="Privacy" introduction="How information may be handled when you create an account, organize a meeting or join a NexMeet conversation." sections={[
    { title: "Information you provide", content: <><p>This can include account details such as your name and email address, meeting titles and schedules, and the display name you use when joining a room.</p><p>People in a meeting are responsible for the content they choose to share through video, audio, chat, screen sharing and reactions.</p></> },
    { title: "Meeting and technical information", content: <p>NexMeet uses meeting and participant metadata needed to run the service, such as meeting status, join state, access settings and timestamps. Technical information may include browser, device and connection details supplied during ordinary web requests.</p> },
    { title: "Cookies and local storage", content: <p>Necessary cookies support authentication and secure participant sessions. Browser storage may remember limited preferences such as camera and microphone choices for a meeting. See the <a href="/cookies">Cookie Policy</a> for more detail.</p> },
    { title: "Service providers", content: <p>NexMeet relies on infrastructure and communication providers to operate account, data and real-time meeting features. They process information as needed to provide those services.</p> },
    { title: "Security", content: <p>NexMeet uses product controls intended to limit meeting access, including private links, optional passwords, waiting-room approval and host moderation. No online service can eliminate every risk.</p> },
    { title: "Retention and choices", content: <p>Information may be kept for as long as reasonably needed to operate, secure and improve the service or meet applicable obligations. Users can make choices through available account, meeting and browser controls.</p> },
    { title: "Changes to this information", content: <p>This page may change as NexMeet develops. Material updates should be reflected in the published policy information.</p> },
  ]} />;
}
