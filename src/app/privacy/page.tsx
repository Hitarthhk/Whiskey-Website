import { PolicyPage } from "@/components/PolicyPage";
export const metadata = { title: "Privacy — Gamber Valley" };
export default function Privacy() {
  return <PolicyPage title="Privacy in this preview">
    <section><h2>Age confirmation on your device</h2><p>The age gate stores the value “1” under the key “gv-age-verified” in your browser’s session storage. If you select “Remember me”, it uses local storage instead, which remains until you clear it. It does not collect your date of birth or location.</p></section>
    <section><h2>Enquiry form</h2><p>The Contact page shows an enquiry form. In this preview it is not connected to any submission service: what you type is not sent anywhere or stored, and the form says so when you submit it. If a submission service is connected before launch, this notice must be updated to describe it.</p></section>
    <section><h2>Current application features</h2><p>The prototype contains no account registration, checkout or application analytics integration. Browser storage can be removed through your browser’s site-data settings; the age gate will then ask again.</p></section>
    <section><h2>Hosting and final policy</h2><p>Hosting providers may process request information. The final operator must document its hosting arrangements, data practices, retention periods and privacy contact before launch. Those details have not been supplied for this preview.</p></section>
  </PolicyPage>;
}
