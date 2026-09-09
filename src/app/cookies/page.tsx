import { PolicyPage } from "@/components/marketing/policy-page";

export const metadata = { title: "Cookies | NexMeet", description: "Information about cookies and browser storage used by NexMeet." };

export default function CookiesPage() {
  return <PolicyPage title="Cookie Policy" introduction="How NexMeet currently uses necessary cookies and limited browser storage to keep accounts and meeting sessions working." sections={[
    { title: "Necessary cookies", content: <p>NexMeet uses cookies required to operate core features. These include authentication cookies for signed-in accounts and secure, meeting-specific participant credentials used during joining and reconnection.</p> },
    { title: "Meeting session routing", content: <p>Limited selector information can help a browser tab resolve the participant session it is using. Sensitive participant credentials are kept in secure, HTTP-only cookies and are not available to ordinary page scripts.</p> },
    { title: "Preference storage", content: <p>Session storage may remember camera and microphone preferences for a particular meeting so a refresh can preserve the preparation choices made in that browser tab.</p> },
    { title: "Analytics and advertising", content: <p>The current application code does not add advertising cookies or a separate analytics-cookie system. This policy should be updated before introducing any such technology.</p> },
    { title: "Your browser controls", content: <p>You can remove or block storage through your browser settings. Blocking necessary cookies may prevent sign-in, guest joining, reconnection or other meeting features from working correctly.</p> },
    { title: "Policy updates", content: <p>This information may change when NexMeet adds or changes browser storage. The published policy should describe material changes.</p> },
  ]} />;
}
