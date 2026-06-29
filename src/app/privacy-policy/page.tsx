import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";
import {
  generateBreadcrumbSchema,
  generateBreadcrumbsFromPath,
} from "@/lib/seo/structured-data";
import { generateHreflangMetadata } from "@/lib/seo/hreflang-metadata";

export const metadata: Metadata = {
  title: "Privacy Policy - AimTrainerPro",
  description:
    "Privacy Policy of aimtrainerpro.online. Learn what data we collect, why we collect it, and what your rights are in relation to it.",
  alternates: {
    ...generateHreflangMetadata("/privacy-policy"),
  },
};

const OWNER_EMAIL = "kbnoname1.1@gmail.com";

const card = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius, 12px)",
  padding: "24px",
  marginBottom: "20px",
} as const;

const heading = {
  marginTop: 0,
  fontSize: "1.2rem",
  marginBottom: "12px",
} as const;

const subHeading = {
  fontSize: "1.02rem",
  margin: "20px 0 8px",
  color: "var(--text)",
} as const;

const minorHeading = {
  fontSize: "0.95rem",
  fontWeight: 700,
  margin: "16px 0 6px",
  color: "var(--text)",
} as const;

const para = {
  color: "var(--text-muted)",
  lineHeight: 1.7,
  margin: "0 0 12px",
} as const;

const list = {
  color: "var(--text-muted)",
  lineHeight: 1.8,
  paddingLeft: "20px",
  margin: "0 0 12px",
} as const;

export default function PrivacyPolicyPage() {
  const breadcrumbs = generateBreadcrumbsFromPath("/privacy-policy", "Privacy Policy");
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <StructuredData blocks={[breadcrumbSchema]} />
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "56px 24px 72px" }}>
        <header style={{ textAlign: "center", marginBottom: "40px" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "0.72rem",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "var(--accent)",
              background: "rgba(34, 211, 238, 0.08)",
              border: "1px solid rgba(34, 211, 238, 0.25)",
              padding: "6px 14px",
              borderRadius: "999px",
              marginBottom: "18px",
            }}
          >
            Legal
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", letterSpacing: "-0.5px", margin: "0 0 8px", textTransform: "none" }}>
            Privacy Policy of <span className="brand-accent">aimtrainerpro.online</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: "0 auto 8px", maxWidth: "60ch", lineHeight: 1.6 }}>
            Welcome to the privacy policy of aimtrainerpro.online. This policy will help you understand what data we
            collect, why we collect it, and what your rights are in relation to it.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Latest update: June 29, 2026
          </p>
        </header>

        {/* Table of contents */}
        <div style={card}>
          <h2 style={heading}>Table of contents</h2>
          <ul style={{ ...list, margin: 0 }}>
            <li><a href="#summary" style={{ color: "var(--primary)" }}>Summary</a></li>
            <li><a href="#owner" style={{ color: "var(--primary)" }}>Owner and Data Controller</a></li>
            <li><a href="#types-of-data" style={{ color: "var(--primary)" }}>Types of Data collected</a></li>
            <li><a href="#mode-place" style={{ color: "var(--primary)" }}>Mode and place of processing the Data</a></li>
            <li><a href="#purposes" style={{ color: "var(--primary)" }}>The purposes of processing</a></li>
            <li><a href="#detailed" style={{ color: "var(--primary)" }}>Detailed information on the processing of Personal Data</a></li>
            <li><a href="#opt-out" style={{ color: "var(--primary)" }}>Information on opting out of interest-based advertising</a></li>
            <li><a href="#cookie-policy" style={{ color: "var(--primary)" }}>Cookie Policy</a></li>
            <li><a href="#eu-users" style={{ color: "var(--primary)" }}>Further Information for Users in the European Union</a></li>
            <li><a href="#additional" style={{ color: "var(--primary)" }}>Additional information about Data collection and processing</a></li>
            <li><a href="#definitions" style={{ color: "var(--primary)" }}>Definitions and legal references</a></li>
          </ul>
        </div>

        {/* Summary */}
        <div style={card} id="summary">
          <h2 style={heading}>Summary</h2>
          <h3 style={subHeading}>Data we collect automatically</h3>
          <p style={para}>
            We automatically collect data from you for example when you visit aimtrainerpro.online.
          </p>
          <ul style={list}>
            <li>Trackers</li>
            <li>Usage Data</li>
            <li>number of Users</li>
            <li>session statistics</li>
          </ul>
          <h3 style={subHeading}>Trusted third parties help us to process it</h3>
          <p style={{ ...para, marginBottom: "6px" }}>How we use them</p>
          <ul style={{ ...list, marginBottom: 0 }}>
            <li>Remarketing and behavioral targeting</li>
            <li>Advertising</li>
            <li>Analytics</li>
          </ul>
        </div>

        {/* Owner and Data Controller */}
        <div style={card} id="owner">
          <h2 style={heading}>Owner and Data Controller</h2>
          <p style={{ ...para, marginBottom: 0 }}>
            AimTrainerPro -<br />
            Owner contact email:{" "}
            <a href={`mailto:${OWNER_EMAIL}`} style={{ color: "var(--primary)" }}>{OWNER_EMAIL}</a>
          </p>
        </div>

        {/* Types of Data collected */}
        <div style={card} id="types-of-data">
          <h2 style={heading}>Type of Data we collect</h2>
          <p style={para}>
            Among the types of Personal Data that this Application collects, by itself or through third parties, there are:
          </p>
          <ul style={list}>
            <li>Trackers</li>
            <li>Usage Data</li>
            <li>number of Users</li>
            <li>session statistics</li>
          </ul>
          <p style={para}>
            Complete details on each type of Personal Data collected are provided in the dedicated sections of this
            privacy policy or by specific explanation texts displayed prior to the Data collection. Personal Data may be
            freely provided by the User, or, in case of Usage Data, collected automatically when using this Application.
            Unless specified otherwise, all Data requested by this Application is mandatory and failure to provide this
            Data may make it impossible for this Application to provide its services. In cases where this Application
            specifically states that some Data is not mandatory, Users are free not to communicate this Data without
            consequences to the availability or the functioning of the Service. Users who are uncertain about which
            Personal Data is mandatory are welcome to contact the Owner. Any use of Cookies &ndash; or of other tracking
            tools &mdash; by this Application or by the owners of third-party services used by this Application serves the
            purpose of providing the Service required by the User, in addition to any other purposes described in the
            present document and in the Cookie Policy.
          </p>
          <p style={{ ...para, marginBottom: 0 }}>
            Users are responsible for any third-party Personal Data obtained, published or shared through this Application.
          </p>
        </div>

        {/* Mode and place of processing */}
        <div style={card} id="mode-place">
          <h2 style={heading}>Mode and place of processing the Data</h2>

          <h3 style={subHeading}>Methods of processing</h3>
          <p style={para}>
            The Owner takes appropriate security measures to prevent unauthorized access, disclosure, modification, or
            unauthorized destruction of the Data. The Data processing is carried out using computers and/or IT enabled
            tools, following organizational procedures and modes strictly related to the purposes indicated. In addition
            to the Owner, in some cases, the Data may be accessible to certain types of persons in charge, involved with
            the operation of this Application (administration, sales, marketing, legal, system administration) or external
            parties (such as third-party technical service providers, mail carriers, hosting providers, IT companies,
            communications agencies) appointed, if necessary, as Data Processors by the Owner. The updated list of these
            parties may be requested from the Owner at any time.
          </p>

          <h3 style={subHeading}>Place</h3>
          <p style={para}>
            The Data is processed at the Owner&rsquo;s operating offices and in any other places where the parties
            involved in the processing are located. Depending on the User&rsquo;s location, data transfers may involve
            transferring the User&rsquo;s Data to a country other than their own. To find out more about the place of
            processing of such transferred Data, Users can check the section containing details about the processing of
            Personal Data.
          </p>

          <h3 style={subHeading}>Retention time</h3>
          <p style={{ ...para, marginBottom: 0 }}>
            Unless specified otherwise in this document, Personal Data shall be processed and stored for as long as
            required by the purpose they have been collected for and may be retained for longer due to applicable legal
            obligation or based on the Users&rsquo; consent.
          </p>
        </div>

        {/* Purposes of processing */}
        <div style={card} id="purposes">
          <h2 style={heading}>The purposes of processing</h2>
          <p style={para}>
            The Data concerning the User is collected to allow the Owner to provide its Service, comply with its legal
            obligations, respond to enforcement requests, protect its rights and interests (or those of its Users or third
            parties), detect any malicious or fraudulent activity, as well as the following:
          </p>
          <ul style={{ ...list, marginBottom: 0 }}>
            <li>Remarketing and behavioral targeting</li>
            <li>Advertising</li>
            <li>Analytics</li>
          </ul>
        </div>

        {/* Detailed information */}
        <div style={card} id="detailed">
          <h2 style={heading}>Detailed information on the processing of Personal Data</h2>

          <h3 style={subHeading}>Advertising</h3>
          <p style={para}>
            This type of service allows User Data to be utilized for advertising communication purposes. These
            communications are displayed in the form of banners and other advertisements on this Application, possibly
            based on User interests. This does not mean that all Personal Data are used for this purpose. Information and
            conditions of use are shown below. Some of the services listed below may use Trackers to identify Users or they
            may use the behavioral retargeting technique, i.e. displaying ads tailored to the User&rsquo;s interests and
            behavior, including those detected outside this Application. For more information, please check the privacy
            policies of the relevant services. Services of this kind usually allow Users to opt out of such tracking. Users
            may learn how to opt out of interest-based advertising more generally by visiting the relevant opt-out section
            in this document.
          </p>

          <h4 style={minorHeading}>Google Ads conversion tracking</h4>
          <p style={para}>
            Google Ads conversion tracking is an analytics service provided by Google LLC or by Google Ireland Limited,
            depending on how the Owner manages the Data processing, that connects data from the Google Ads advertising
            network with actions performed on this Application. In order to understand Google&rsquo;s use of Data, consult
            their partner policy and their Business Data page.
          </p>
          <p style={para}>Personal Data processed: Trackers; Usage Data.</p>
          <p style={para}>
            Place of processing: United States &ndash;{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Privacy Policy</a>;
            Ireland &ndash;{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Privacy Policy</a>.
          </p>

          <h3 style={subHeading}>Analytics</h3>
          <p style={para}>
            The services contained in this section enable the Owner to monitor and analyze web traffic and can be used to
            keep track of User behavior.
          </p>

          <h4 style={minorHeading}>Google Analytics 4</h4>
          <p style={para}>
            Google Analytics 4 is a web analysis service provided by Google LLC or by Google Ireland Limited, depending on
            how the Owner manages the Data processing, (&ldquo;Google&rdquo;). Google utilizes the Data collected to track
            and examine the use of this Application, to prepare reports on its activities and share them with other Google
            services. Google may use the Data collected to contextualize and personalize the ads of its own advertising
            network. In Google Analytics 4, IP addresses are used at collection time and then discarded before Data is
            logged in any data center or server. Users can learn more by consulting Google&rsquo;s official documentation.
            In order to understand Google&rsquo;s use of Data, consult their partner policy and their Business Data page.
          </p>
          <p style={para}>Personal Data processed: number of Users; session statistics; Trackers; Usage Data.</p>
          <p style={para}>
            Place of processing: United States &ndash;{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Privacy Policy</a> &ndash;{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Opt out</a>;
            Ireland &ndash;{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Privacy Policy</a> &ndash;{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Opt out</a>.
          </p>

          <h3 style={subHeading}>Remarketing and behavioral targeting</h3>
          <p style={para}>
            This type of service allows this Application and its partners to inform, optimize and serve advertising based on
            past use of this Application by the User. This activity is facilitated by tracking Usage Data and by using
            Trackers to collect information which is then transferred to the partners that manage the remarketing and
            behavioral targeting activity. Some services offer a remarketing option based on email address lists. Services
            of this kind usually allow Users to opt out of such tracking. Users may learn how to opt out of interest-based
            advertising more generally by visiting the relevant opt-out section in this document.
          </p>

          <h4 style={minorHeading}>Google Ads Remarketing</h4>
          <p style={para}>
            Google Ads Remarketing is a remarketing and behavioral targeting service provided by Google LLC or by Google
            Ireland Limited, depending on how the Owner manages the Data processing, that connects the activity of this
            Application with the Google Ads advertising network and the DoubleClick Cookie. In order to understand
            Google&rsquo;s use of Data, consult Google&rsquo;s partner policy. Users can opt out of Google&rsquo;s use of
            Trackers for ads personalization by visiting Google&rsquo;s Ads Settings.
          </p>
          <p style={para}>Personal Data processed: Trackers; Usage Data.</p>
          <p style={{ ...para, marginBottom: 0 }}>
            Place of processing: United States &ndash;{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Privacy Policy</a> &ndash;{" "}
            <a href="https://adssettings.google.com/authenticated" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Opt out</a>;
            Ireland &ndash;{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Privacy Policy</a> &ndash;{" "}
            <a href="https://adssettings.google.com/authenticated" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Opt out</a>.
          </p>
        </div>

        {/* Opting out */}
        <div style={card} id="opt-out">
          <h2 style={heading}>Information on opting out of interest-based advertising</h2>
          <p style={{ ...para, marginBottom: 0 }}>
            In addition to any opt-out feature provided by any of the services listed in this document, Users may learn
            more on how to generally opt out of interest-based advertising within the dedicated section of the Cookie
            Policy.
          </p>
        </div>

        {/* Cookie Policy */}
        <div style={card} id="cookie-policy">
          <h2 style={heading}>Cookie Policy</h2>
          <p style={{ ...para, marginBottom: 0 }}>
            This Application uses Trackers. To learn more, Users may consult the Cookie Policy.
          </p>
        </div>

        {/* EU Users */}
        <div style={card} id="eu-users">
          <h2 style={heading}>Further Information for Users in the European Union</h2>
          <p style={para}>
            This section applies to all Users in the European Union, according to the General Data Protection Regulation
            (the &ldquo;GDPR&rdquo;), and, for such Users, supersedes any other possibly divergent or conflicting
            information contained in the privacy policy. Further details regarding the categories of Data processed, the
            purposes of processing, the categories of recipients of the Personal Data, if any, and further information
            about Personal Data can be found in the section titled &ldquo;Detailed information on the processing of
            Personal Data&rdquo; within this document.
          </p>

          <h3 style={subHeading}>Legal basis of processing</h3>
          <p style={para}>
            The Owner may process Personal Data relating to Users if one of the following applies:
          </p>
          <ul style={list}>
            <li>Users have given their consent for one or more specific purposes.</li>
            <li>
              provision of Data is necessary for the performance of an agreement with the User and/or for any
              pre-contractual obligations thereof;
            </li>
            <li>processing is necessary for compliance with a legal obligation to which the Owner is subject;</li>
            <li>
              processing is related to a task that is carried out in the public interest or in the exercise of official
              authority vested in the Owner;
            </li>
            <li>
              processing is necessary for the purposes of the legitimate interests pursued by the Owner or by a third
              party.
            </li>
          </ul>
          <p style={para}>
            In any case, the Owner will gladly help to clarify the specific legal basis that applies to the processing, and
            in particular whether the provision of Personal Data is a statutory or contractual requirement, or a
            requirement necessary to enter into a contract.
          </p>

          <h3 style={subHeading}>Further information about retention time</h3>
          <p style={para}>
            Unless specified otherwise in this document, Personal Data shall be processed and stored for as long as
            required by the purpose they have been collected for and may be retained for longer due to applicable legal
            obligation or based on the Users&rsquo; consent.
          </p>
          <p style={para}>Therefore:</p>
          <ul style={list}>
            <li>
              Personal Data collected for purposes related to the performance of a contract between the Owner and the User
              shall be retained until such contract has been fully performed.
            </li>
            <li>
              Personal Data collected for the purposes of the Owner&rsquo;s legitimate interests shall be retained as long
              as needed to fulfill such purposes. Users may find specific information regarding the legitimate interests
              pursued by the Owner within the relevant sections of this document or by contacting the Owner.
            </li>
          </ul>
          <p style={para}>
            The Owner may be allowed to retain Personal Data for a longer period whenever the User has given consent to
            such processing, as long as such consent is not withdrawn. Furthermore, the Owner may be obliged to retain
            Personal Data for a longer period whenever required to fulfil a legal obligation or upon order of an authority.
            Once the retention period expires, Personal Data shall be deleted. Therefore, the right of access, the right to
            erasure, the right to rectification and the right to data portability cannot be enforced after expiration of
            the retention period.
          </p>

          <h3 style={subHeading}>The rights of Users based on the General Data Protection Regulation (GDPR)</h3>
          <p style={para}>
            Users may exercise certain rights regarding their Data processed by the Owner. In particular, Users have the
            right to do the following, to the extent permitted by law:
          </p>
          <ul style={list}>
            <li>
              <strong>Withdraw their consent at any time.</strong> Users have the right to withdraw consent where they have
              previously given their consent to the processing of their Personal Data.
            </li>
            <li>
              <strong>Object to processing of their Data.</strong> Users have the right to object to the processing of
              their Data if the processing is carried out on a legal basis other than consent.
            </li>
            <li>
              <strong>Access their Data.</strong> Users have the right to learn if Data is being processed by the Owner,
              obtain disclosure regarding certain aspects of the processing and obtain a copy of the Data undergoing
              processing.
            </li>
            <li>
              <strong>Verify and seek rectification.</strong> Users have the right to verify the accuracy of their Data and
              ask for it to be updated or corrected.
            </li>
            <li>
              <strong>Restrict the processing of their Data.</strong> Users have the right to restrict the processing of
              their Data. In this case, the Owner will not process their Data for any purpose other than storing it.
            </li>
            <li>
              <strong>Have their Personal Data deleted or otherwise removed.</strong> Users have the right to obtain the
              erasure of their Data from the Owner.
            </li>
            <li>
              <strong>Receive their Data and have it transferred to another controller.</strong> Users have the right to
              receive their Data in a structured, commonly used and machine readable format and, if technically feasible,
              to have it transmitted to another controller without any hindrance.
            </li>
            <li>
              <strong>Lodge a complaint.</strong> Users have the right to bring a claim before their competent data
              protection authority.
            </li>
          </ul>
          <p style={para}>
            Users are also entitled to learn about the legal basis for Data transfers abroad including to any international
            organization governed by public international law or set up by two or more countries, such as the UN, and about
            the security measures taken by the Owner to safeguard their Data.
          </p>

          <h3 style={subHeading}>Details about the right to object to processing</h3>
          <p style={para}>
            Where Personal Data is processed for a public interest, in the exercise of an official authority vested in the
            Owner or for the purposes of the legitimate interests pursued by the Owner, Users may object to such processing
            by providing a ground related to their particular situation to justify the objection.
          </p>
          <p style={para}>
            Users must know that, however, should their Personal Data be processed for direct marketing purposes, they can
            object to that processing at any time, free of charge and without providing any justification. Where the User
            objects to processing for direct marketing purposes, the Personal Data will no longer be processed for such
            purposes. To learn whether the Owner is processing Personal Data for direct marketing purposes, Users may refer
            to the relevant sections of this document.
          </p>

          <h3 style={subHeading}>How to exercise these rights</h3>
          <p style={{ ...para, marginBottom: 0 }}>
            Any requests to exercise User rights can be directed to the Owner through the contact details provided in this
            document. Such requests are free of charge and will be answered by the Owner as early as possible and always
            within one month, providing Users with the information required by law. Any rectification or erasure of
            Personal Data or restriction of processing will be communicated by the Owner to each recipient, if any, to whom
            the Personal Data has been disclosed unless this proves impossible or involves disproportionate effort. At the
            Users&rsquo; request, the Owner will inform them about those recipients.
          </p>
        </div>

        {/* Additional information */}
        <div style={card} id="additional">
          <h2 style={heading}>Additional information about Data collection and processing</h2>

          <h3 style={subHeading}>Legal action</h3>
          <p style={para}>
            The User&rsquo;s Personal Data may be used for legal purposes by the Owner in Court or in the stages leading to
            possible legal action arising from improper use of this Application or the related Services. The User declares
            to be aware that the Owner may be required to reveal personal data upon request of public authorities.
          </p>

          <h3 style={subHeading}>Additional information about User&rsquo;s Personal Data</h3>
          <p style={para}>
            In addition to the information contained in this privacy policy, this Application may provide the User with
            additional and contextual information concerning particular Services or the collection and processing of
            Personal Data upon request.
          </p>

          <h3 style={subHeading}>System logs and maintenance</h3>
          <p style={para}>
            For operation and maintenance purposes, this Application and any third-party services may collect files that
            record interaction with this Application (System logs) or use other Personal Data (such as the IP Address) for
            this purpose.
          </p>

          <h3 style={subHeading}>Information not contained in this policy</h3>
          <p style={para}>
            More details concerning the collection or processing of Personal Data may be requested from the Owner at any
            time. Please see the contact information at the beginning of this document.
          </p>

          <h3 style={subHeading}>Changes to this privacy policy</h3>
          <p style={{ ...para, marginBottom: 0 }}>
            The Owner reserves the right to make changes to this privacy policy at any time by notifying its Users on this
            page and possibly within this Application and/or - as far as technically and legally feasible - sending a
            notice to Users via any contact information available to the Owner. It is strongly recommended to check this
            page often, referring to the date of the last modification listed at the bottom. Should the changes affect
            processing activities performed on the basis of the User&rsquo;s consent, the Owner shall collect new consent
            from the User, where required.
          </p>
        </div>

        {/* Definitions */}
        <div style={card} id="definitions">
          <h2 style={heading}>Definitions and legal references</h2>

          <h3 style={subHeading}>Personal Data (or Data)</h3>
          <p style={para}>
            Any information that directly, indirectly, or in connection with other information &mdash; including a personal
            identification number &mdash; allows for the identification or identifiability of a natural person.
          </p>

          <h3 style={subHeading}>Usage Data</h3>
          <p style={para}>
            Information collected automatically through this Application (or third-party services employed in this
            Application), which can include: the IP addresses or domain names of the computers utilized by the Users who
            use this Application, the URI addresses (Uniform Resource Identifier), the time of the request, the method
            utilized to submit the request to the server, the size of the file received in response, the numerical code
            indicating the status of the server&rsquo;s answer (successful outcome, error, etc.), the country of origin,
            the features of the browser and the operating system utilized by the User, the various time details per visit
            (e.g., the time spent on each page within the Application) and the details about the path followed within the
            Application with special reference to the sequence of pages visited, and other parameters about the device
            operating system and/or the User&rsquo;s IT environment.
          </p>

          <h3 style={subHeading}>User</h3>
          <p style={para}>
            The individual using this Application who, unless otherwise specified, coincides with the Data Subject.
          </p>

          <h3 style={subHeading}>Data Subject</h3>
          <p style={para}>The natural person to whom the Personal Data refers.</p>

          <h3 style={subHeading}>Data Processor (or Processor)</h3>
          <p style={para}>
            The natural or legal person, public authority, agency or other body which processes Personal Data on behalf of
            the Controller, as described in this privacy policy.
          </p>

          <h3 style={subHeading}>Data Controller (or Owner)</h3>
          <p style={para}>
            The natural or legal person, public authority, agency or other body which, alone or jointly with others,
            determines the purposes and means of the processing of Personal Data, including the security measures
            concerning the operation and use of this Application. The Data Controller, unless otherwise specified, is the
            Owner of this Application.
          </p>

          <h3 style={subHeading}>This Application</h3>
          <p style={para}>The means by which the Personal Data of the User is collected and processed.</p>

          <h3 style={subHeading}>Service</h3>
          <p style={para}>
            The service provided by this Application as described in the relative terms (if available) and on this
            site/application.
          </p>

          <h3 style={subHeading}>European Union (or EU)</h3>
          <p style={para}>
            Unless otherwise specified, all references made within this document to the European Union include all current
            member states to the European Union and the European Economic Area.
          </p>

          <h3 style={subHeading}>Cookie</h3>
          <p style={para}>Cookies are Trackers consisting of small sets of data stored in the User&rsquo;s browser.</p>

          <h3 style={subHeading}>Tracker</h3>
          <p style={para}>
            Tracker indicates any technology - e.g Cookies, unique identifiers, web beacons, embedded scripts, e-tags and
            fingerprinting - that enables the tracking of Users, for example by accessing or storing information on the
            User&rsquo;s device.
          </p>

          <h3 style={subHeading}>Legal information</h3>
          <p style={{ ...para, marginBottom: 0 }}>
            This policy relates solely to this Application, if not stated otherwise within this document.
          </p>
        </div>

        {/* How can we help */}
        <div style={card}>
          <h2 style={heading}>How can we help?</h2>

          <h3 style={subHeading}>What you can do — Your data</h3>
          <ul style={list}>
            <li>Ask us to know and access the information we hold on you</li>
            <li>Ask us to correct information we hold on you</li>
            <li>Ask us to be forgotten (delete the information we hold on you)</li>
            <li>Ask to port your data to another service</li>
          </ul>

          <h3 style={subHeading}>In case of issues</h3>
          <p style={{ ...para, marginBottom: 0 }}>
            While we strive to create a positive user experience, we understand that issues may occasionally arise between
            us and our users. If this is the case, please feel free to{" "}
            <Link href="/contact" style={{ color: "var(--primary)" }}>contact us</Link>.
          </p>
        </div>

        {/* Footer / Owner info */}
        <div style={{ ...card, marginBottom: 0 }}>
          <h2 style={heading}>aimtrainerpro.online</h2>
          <p style={{ ...para, marginBottom: 0 }}>
            AimTrainerPro -<br />
            Owner contact email:{" "}
            <a href={`mailto:${OWNER_EMAIL}`} style={{ color: "var(--primary)" }}>{OWNER_EMAIL}</a>
          </p>
        </div>
      </div>
    </>
  );
}
