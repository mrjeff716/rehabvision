// =============================================================================
// pages.jsx — Privacy policy, Terms of use, Cookies and storage, Accessibility.
//
// Written from what the code actually does (checked November 2026):
//   - data stored: backend/src/models/User.js and Session.js
//   - browser storage: src/api.js, src/i18n/messages.js, StorageNotice.jsx
//   - camera frames are processed on the device (src/pose/), only numbers are sent
// If the app changes what it collects or who it shares with, update these pages.
//
// DRAFTS: have them reviewed by a lawyer for the country you operate in before
// launch. Business details come from business.js (highlighted until filled in).
// =============================================================================

import { Link } from 'react-router'
import LegalLayout from './LegalLayout'
import Field from './Field'

export const PrivacyPage = () => (
  <LegalLayout title="Privacy policy">
    <p>
      This policy explains what personal data RehabVision collects, why, who can see it, and
      the choices you have. RehabVision is operated by <Field name="legalName" label="company name" />,{' '}
      <Field name="address" label="registered address" /> (&ldquo;we&rdquo;). For any privacy
      question or request, contact <Field name="privacyEmail" label="privacy contact email" />.
    </p>

    <h2>What we collect</h2>
    <ul>
      <li><b>Your account:</b> name, email address, whether you are a patient or a physiotherapist, and your password. We store the password only as a one-way hash, never the password itself.</li>
      <li><b>Physiotherapists:</b> a public ID (like PT-ABC234) that we create so patients can find you.</li>
      <li><b>Patients:</b> which physiotherapist you have linked to, and the exercises they assign you: exercise, side, angles, safe range, number of repetitions, when to stop, and their confirmation that you are cleared for the exercise.</li>
      <li><b>Exercise results:</b> for each session, the exercise and side, the plan at that time, the highest angle reached in each repetition and whether it reached the target, the number of repetitions, an optional pain score, and the date and time.</li>
      <li><b>Technical data:</b> your IP address is held briefly in the server&rsquo;s memory to limit how many requests one connection can make. It is not saved in our database. Our hosting provider (<Field name="hosting" label="hosting provider" />) may keep its own server logs.</li>
    </ul>
    <p>
      Exercise plans and results are <b>health data</b>. We only use them to run the service for
      you and your physiotherapist.
    </p>

    <h2>What we do not collect</h2>
    <ul>
      <li><b>No video or photos.</b> The camera image is analysed on your own device to measure the angle of your joint. It is never uploaded or saved. Only the numbers listed above are sent.</li>
      <li><b>No tracking.</b> RehabVision has no analytics, advertising or social-media trackers, and sets no cookies. See <Link to="/cookies">Cookies and storage</Link>.</li>
      <li>We do not sell your data or use it for advertising.</li>
    </ul>

    <h2>Who can see your data</h2>
    <ul>
      <li><b>Your physiotherapist</b>, once you link to them: your name, email address, assigned exercises, your 50 most recent exercise results (including results from before you linked to them), and a weekly &ldquo;needs attention&rdquo; summary based on them. If you remove your physiotherapist, they can no longer see any of your data in RehabVision, and your assigned exercises are cleared.</li>
      <li><b>Patients</b> who enter a physiotherapist&rsquo;s public ID see that physiotherapist&rsquo;s name and ID.</li>
      <li><b>Service providers</b> that store and run the service for us: <Field name="hosting" label="hosting provider" /> and <Field name="database" label="database provider and country" />. They may only use the data to provide their service to us.</li>
      <li>Authorities, only where the law requires us to share it.</li>
    </ul>

    <h2>Why we use it (legal basis)</h2>
    <ul>
      <li>Account details: to provide the service you signed up for.</li>
      <li>Health data (exercise plans and results): with your explicit consent, which you give when you create a patient account. You can withdraw it at any time by removing your physiotherapist or asking us to delete your account. Withdrawing does not affect use before that.</li>
      <li>IP address for rate limiting: to keep the service secure and available.</li>
    </ul>

    <h2>Spoken feedback</h2>
    <p>
      The exercise coach speaks short phrases (such as &ldquo;Good&rdquo;) using your browser&rsquo;s
      built-in text-to-speech. Some browsers use an online voice service from the browser maker for
      this. The phrases are the same for everyone and contain no personal data.
    </p>

    <h2>How long we keep it</h2>
    <p>
      We keep your account and results while your account is open. After an account is closed:{' '}
      <Field name="retention" label="retention period" />.
    </p>

    <h2>Your rights</h2>
    <p>
      Depending on the law where you live, you can ask to see the data we hold about you, correct it,
      delete it, receive a copy, or object to or restrict its use. To make a request, including
      closing your account, email <Field name="privacyEmail" label="privacy contact email" />. We
      will answer within the time the law requires. You can also complain to your data-protection
      authority.
    </p>

    <h2>Security</h2>
    <p>
      Passwords are stored only as a hash. In the app, you must log in to see any personal data,
      and a patient&rsquo;s data can only be seen by that patient and their linked physiotherapist.
      Our staff and service providers only access data when needed to run or fix the service.
      No system is completely secure; if a breach affects you, we will tell you as the law requires.
    </p>

    <h2>Children</h2>
    <p>
      You must be at least <Field name="minimumAge" label="minimum age" /> to create an account.
      Younger patients need a parent or guardian to create and manage the account for them.
    </p>

    <h2>Changes</h2>
    <p>We will update this page when what we collect changes, and change the date at the top.</p>
  </LegalLayout>
)

export const TermsPage = () => (
  <LegalLayout title="Terms of use">
    <p>
      These terms apply when you use RehabVision, operated by <Field name="legalName" label="company name" />,{' '}
      <Field name="address" label="registered address" />, registration no.{' '}
      <Field name="registrationNo" label="registration number" />. By creating an account you agree
      to them and to the <Link to="/privacy">Privacy policy</Link>.
    </p>

    <h2>What RehabVision is</h2>
    <p>
      A tool that lets a physiotherapist assign home exercises and lets the patient do them in
      front of a camera, with on-screen and spoken feedback on the joint angle and repetitions.
    </p>

    <h2>Not medical advice, not for emergencies</h2>
    <ul>
      <li>RehabVision does not diagnose or treat any condition and does not replace your physiotherapist or doctor.</li>
      <li>Angles measured by the camera are estimates. They can be wrong because of lighting, camera position, clothing or how much of your body is visible.</li>
      <li>Follow your physiotherapist&rsquo;s instructions. Stop and seek advice if you feel pain or new symptoms, or if anything on your plan says to stop.</li>
      <li>In an emergency, contact your local emergency number.</li>
    </ul>

    <h2>Your account</h2>
    <ul>
      <li>Give accurate details and keep your password private. An account is for one person.</li>
      <li>You must be at least <Field name="minimumAge" label="minimum age" />, or have a parent or guardian manage the account.</li>
    </ul>

    <h2>Physiotherapists</h2>
    <ul>
      <li>You must be qualified and allowed to practise where you treat patients.</li>
      <li>You are responsible for the exercises, angles, safe ranges and stop criteria you assign, and for confirming each patient is clinically cleared for them.</li>
      <li>Use patients&rsquo; data only to treat them, and follow the health-data and professional rules that apply to you.</li>
    </ul>

    <h2>Acceptable use</h2>
    <p>
      Do not misuse the service: no access to other people&rsquo;s accounts or data, no attempts to
      break or overload it, and nothing unlawful.
    </p>

    <h2>Payments</h2>
    <p>
      RehabVision does not take payments in the app, so there is nothing to refund through it. Any
      payment for treatment, and any refund of it, is a matter between you and your physiotherapist.
    </p>

    <h2>Availability and changes</h2>
    <p>
      We work to keep RehabVision running, but cannot promise it will always be available or free
      of errors. We may change or stop features, and will update these terms when we do.
    </p>

    <h2>Liability</h2>
    <p>
      We are not responsible for losses caused by using exercises or measurements against your
      physiotherapist&rsquo;s advice, or by events outside our control. Nothing in these terms limits
      liability that cannot be limited by law, or your rights as a consumer.
    </p>

    <h2>Ending your use</h2>
    <p>
      You can stop using RehabVision at any time and ask us to delete your account
      (<Field name="privacyEmail" label="privacy contact email" />). We may suspend an account that
      breaks these terms.
    </p>

    <h2>Law and contact</h2>
    <p>
      These terms are governed by the law of <Field name="country" label="country" />. Questions:{' '}
      <Field name="email" label="contact email" />.
    </p>
  </LegalLayout>
)

export const CookiesPage = () => (
  <LegalLayout title="Cookies and storage">
    <p>
      RehabVision sets <b>no cookies</b> and uses no analytics, advertising or third-party trackers.
      It saves a few items in your browser&rsquo;s local storage, only so the features you use work:
    </p>
    <table className="data-table">
      <thead>
        <tr><th>Item</th><th>What it is for</th><th>When it is removed</th></tr>
      </thead>
      <tbody>
        <tr><td><code>authToken</code></td><td>Keeps you logged in</td><td>When you log out, or when the login expires</td></tr>
        <tr><td><code>pendingSessions</code></td><td>Exercise results saved while you were offline, so they can be sent later</td><td>As soon as they are sent</td></tr>
        <tr><td><code>coachLanguage</code></td><td>The coach language you chose</td><td>When you clear your browser data</td></tr>
        <tr><td><code>storageNoticeSeen</code></td><td>Remembers that you closed the storage notice</td><td>When you clear your browser data</td></tr>
      </tbody>
    </table>
    <p>
      These items are strictly necessary for the service you asked for, so we do not ask for
      consent to use them. If we ever add optional cookies or analytics, we will ask for your
      consent first and you will be able to refuse.
    </p>
    <p>
      You can delete these items at any time in your browser settings (for this site: clear site
      data). You will then be logged out, and any results not yet sent will be lost.
    </p>
  </LegalLayout>
)

export const AccessibilityPage = () => (
  <LegalLayout title="Accessibility">
    <p>
      We want everyone, including people in pain, older people and people with disabilities, to be
      able to use RehabVision. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at
      level AA.
    </p>

    <h2>What we have done</h2>
    <ul>
      <li>Large default text (18px), high-contrast colours, and buttons at least 44 pixels tall.</li>
      <li>Everything can be used with a keyboard, with a clearly visible focus outline.</li>
      <li>Form fields have visible labels, and errors are explained in words, not only in colour.</li>
      <li>The exercise coach speaks its feedback, so you don&rsquo;t need to look at the screen.</li>
      <li>Animations are reduced if your device is set to reduce motion.</li>
      <li>The coach works in several languages, including right-to-left Arabic.</li>
    </ul>

    <h2>Known limitations</h2>
    <ul>
      <li>The exercise coach needs a camera and enough of your body in view to measure angles.</li>
      <li>These policy pages are in English only.</li>
      <li>The site has not yet been audited by an independent accessibility expert.</li>
    </ul>

    <h2>Tell us about a problem</h2>
    <p>
      If something is hard to use, email <Field name="email" label="contact email" /> and say which
      page and what happened. We will reply and work on a fix.
    </p>
  </LegalLayout>
)
