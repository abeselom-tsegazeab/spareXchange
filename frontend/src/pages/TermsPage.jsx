import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Scale, ArrowLeft, Calendar, FileText, ChevronRight } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useEffect, useState } from "react";

const TermsPage = () => {
  const { darkMode } = useTheme();
  const [activeSection, setActiveSection] = useState("");

  const sections = [
    { id: "definitions", title: "1. Definitions" },
    { id: "eligibility", title: "2. Eligibility" },
    { id: "registration", title: "3. Account Registration & Verification" },
    { id: "responsibilities", title: "4. User Responsibilities" },
    { id: "listings", title: "5. Spare Listings & Exchanges" },
    { id: "technicians", title: "6. Technician Services" },
    { id: "recycling", title: "7. Recycling Services" },
    { id: "disputes", title: "8. Disputes" },
    { id: "conduct", title: "9. Prohibited Conduct" },
    { id: "liability", title: "10. Liability & Disclaimer" },
    { id: "governing-law", title: "11. Governing Law & Jurisdiction" },
    { id: "termination", title: "12. Suspension & Termination" },
    { id: "contact", title: "13. Contact Information" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-primary/5 text-foreground dark:bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 transition-colors duration-300 relative overflow-hidden">
      
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-primary rounded-full opacity-5 blur-3xl -top-12 -left-12" />
        <div className="absolute w-96 h-96 bg-emerald-500 rounded-full opacity-5 blur-3xl bottom-12 right-12" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Breadcrumbs / Back button */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-semibold transition-all duration-200 group text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Home
          </Link>
        </div>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex p-3 bg-primary/10 rounded-full text-primary mb-4">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-emerald-600 text-transparent bg-clip-text">
            Terms & Conditions
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" />
              Effective Date: May 25, 2026
            </span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="flex items-center">
              <FileText className="w-4 h-4 mr-1.5" />
              SpareXchange Agreement
            </span>
          </div>
        </motion.div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-6 rounded-2xl border border-border bg-card shadow-xl transition-all duration-300">
              <h3 className="text-lg font-bold mb-4 pb-2 border-b border-border text-foreground">
                On this page
              </h3>
              <ul className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left text-xs py-2 px-3 rounded-lg flex items-center transition-all duration-200 ${
                        activeSection === section.id
                          ? "bg-primary/20 text-primary font-semibold border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <ChevronRight className={`w-3 h-3 mr-1 transition-transform duration-200 ${activeSection === section.id ? 'rotate-90 text-primary' : 'text-muted-foreground'}`} />
                      {section.title.split(". ")[1]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Policy Document Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 sm:p-10 rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 space-y-12 leading-relaxed text-foreground"
            >
              
              {/* Introduction */}
              <div className="space-y-4">
                <p className="text-lg font-medium text-foreground">
                  Welcome to SpareXchange. These Terms and Conditions (“Terms”) govern access to and use of the SpareXchange platform, including its website, services, features, and functionalities related to spare part exchange, technician services, recycling coordination, dispute resolution, and user interaction.
                </p>
                <p className="text-muted-foreground">
                  By registering, accessing, or using SpareXchange, users acknowledge that they have read, understood, and agreed to comply with these Terms and Conditions. Users who do not agree with these Terms should discontinue use of the platform.
                </p>
                <p className="border-l-4 border-primary pl-4 py-1 font-semibold italic text-sm text-foreground">
                  SpareXchange operates as an intermediary digital platform that facilitates communication and interaction among users, technicians, recyclers, and administrators. SpareXchange does not directly own, manufacture, inspect, sell, purchase, repair, or physically deliver spare parts unless otherwise explicitly stated.
                </p>
              </div>

              {/* Definitions Section */}
              <section id="definitions" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  1. Definitions
                </h2>
                <p className="text-muted-foreground">For the purpose of clarity, consistency, and interpretation, the following terms shall have the meanings assigned below:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {[
                    { term: "SpareXchange / We", text: "The digital system and related services that facilitate spare part exchange, technician coordination, recycling, dispute resolution, and user interaction." },
                    { term: "User", text: "Any registered individual who accesses the platform to browse, trade, request assistance, or recycle. This includes Standard Users, Verified Users, Technicians, Recyclers, and Admins." },
                    { term: "Verified User", text: "A user approved through our verification process to access advanced features: listing parts, participating in verified exchanges, and redeeming eco-points." },
                    { term: "Technician", text: "An independent registered service provider who offers technical repair, maintenance, installation, or consultation. They are not agents or employees of SpareXchange." },
                    { term: "Recycler", text: "A verified actor participating in environment-friendly waste handling, recycling, or disposal. Requires document validation or license review." },
                    { term: "Administrator", text: "Authorized platform manager in charge of verification, moderation, dispute handling, policy enforcement, and user/content suspension." },
                    { term: "Spare Listing", text: "Any item description, image, condition report, availability status, category details, or other information posted by a user for transfer, trade, sale discussion, or donation." },
                    { term: "Exchange", text: "Any arrangement, agreement, transfer, sale discussion, or trade transaction between users involving spares or related services. We are not a direct party to exchanges." },
                    { term: "Recycling Activity", text: "The collection, submission, validation, disposal, or refurbishing of recyclable parts through approved recyclers." },
                    { term: "Eco-Points", text: "Non-monetary digital incentive credits awarded for recycling. They have no cash value, are non-transferable, and cannot be converted to physical currency." },
                    { term: "Verification", text: "The review of documents and identity to determine eligibility for restricted features. It is not a legal guarantee of reliability or quality." },
                    { term: "Dispute", text: "Any disagreement, complaint, or conflict between users regarding listings, repairs, recycler validations, representation, or behavior." },
                    { term: "Prohibited Items", text: "Goods, products, or materials that are unlawful, stolen, counterfeit, hazardous, unsafe, or restricted by Ethiopian law and platform policy." },
                    { term: "Intermediary Platform", text: "A digital system facilitating communication and visibility among users without acting as seller, buyer, transporter, or guarantor." }
                  ].map((d, index) => (
                    <div key={index} className="p-4 rounded-xl border border-border bg-muted/20">
                      <h4 className="font-bold mb-1 text-primary">{d.term}</h4>
                      <p className="text-muted-foreground">{d.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Eligibility Section */}
              <section id="eligibility" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  2. Eligibility
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">2.1 Minimum Requirements:</strong> To use SpareXchange, you must be legally capable of entering digital contracts under applicable laws, provide complete and truthful registration info, and use the platform in full compliance with Ethiopian laws and regulations.
                  </li>
                  <li>
                    <strong className="text-foreground">2.2 Account Responsibility:</strong> Users are solely responsible for activities performed under their account. You must maintain the confidentiality of login details and notify us immediately of unauthorized access.
                  </li>
                  <li>
                    <strong className="text-foreground">2.3 Verification Eligibility:</strong> Access to features like listing parts, technician requests, and eco-point redemption may require completing identity or professional verification.
                  </li>
                  <li>
                    <strong className="text-foreground">2.4 Restricted Access:</strong> We reserve the right to suspend or block access if false documents are submitted, fraud is suspected, platform rules are breached, or security concerns arise.
                  </li>
                  <li>
                    <strong className="text-foreground">2.5 Geographic Scope:</strong> SpareXchange is designed for use within Ethiopia. Services and availability vary depending on regional infrastructure and operational feasibility.
                  </li>
                </ul>
              </section>

              {/* Registration and Verification Section */}
              <section id="registration" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  3. Account Registration & Verification
                </h2>
                
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">3.1 Registration & Credentials</h3>
                    <p>Users must submit accurate details (name, email, phone, location) and maintain account security on their devices. SpareXchange is not liable for unauthorized access resulting from user negligence.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">3.2 Account Categories</h3>
                    <ul className="list-disc list-inside space-y-1.5 text-sm ml-2">
                      <li><strong className="text-foreground">Standard User:</strong> Can search listings, browse spares, request technicians, recycle items, and submit disputes.</li>
                      <li><strong className="text-foreground">Verified User:</strong> Can additionally list parts for exchange and earn/redeem Eco-Points.</li>
                      <li><strong className="text-foreground">Technician:</strong> Can accept repair requests, manage availability, and offer technical assistance.</li>
                      <li><strong className="text-foreground">Recycler:</strong> Can validate submissions, manage eco-point workflows, and handle scrap.</li>
                      <li><strong className="text-foreground">Administrator:</strong> Possesses elevated system rights for moderation, validation, security, and dispute resolution.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">3.3 Verification Process & Review</h3>
                    <p>
                      Administrators review verification documents to verify eligibility. We reserve the right to approve, reject, or revoke verified status at our discretion. Verification does not constitute a legal endorsement or professional accreditation, and users must independently evaluate who they trade with.
                    </p>
                  </div>
                </div>
              </section>

              {/* User Responsibilities Section */}
              <section id="responsibilities" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  4. User Responsibilities
                </h2>
                <p className="text-muted-foreground">Users agree to act in good faith, legally, and respectfully:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Provide only accurate and truthful information across the platform.</li>
                  <li>Comply with all applicable Ethiopian laws and avoid trade in illegal items.</li>
                  <li>Conduct negotiations honestly without abusive language, harassment, or discrimination.</li>
                  <li>Assume full responsibility for inspecting parts, verifying item authenticity, checking technician qualifications, and managing offline exchanges.</li>
                  <li>Report any policy violations, fraud, or counterfeit items to administrators.</li>
                </ul>
              </section>

              {/* Spare Listings Section */}
              <section id="listings" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  5. Spare Listings & Exchanges
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Listing privileges are restricted to verified users and technicians. Users must legally own and accurately describe listed items (condition, title, pictures).
                  </p>
                  <p>
                    <strong>Permitted Items:</strong> Auto spare parts, electronic components, accessories, and refurbished materials in compliance with laws.
                  </p>
                  <p className="text-destructive font-semibold">
                    Prohibited Items: Stolen goods, counterfeit products, hazardous waste, weapons, or items banned by Ethiopian environmental or trade regulations.
                  </p>
                  <p>
                    SpareXchange is not responsible for failed transactions, product defects, non-delivery, payment disputes, or offline issues. Users must inspect items physically prior to finalizing an exchange.
                  </p>
                </div>
              </section>

              {/* Technician Services Section */}
              <section id="technicians" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  6. Technician Services
                </h2>
                <p className="text-muted-foreground">
                  SpareXchange operates as a matching platform allowing users to find independent technicians for diagnostic and repair services.
                </p>
                <p className="text-muted-foreground">
                  Technicians must verify their identity, qualifications, and certification. They are independent contractors and not employees of SpareXchange. We do not guarantee technician skill, availability, or service quality.
                </p>
                <p className="italic text-muted-foreground">
                  Users and technicians independently negotiate scopes, pricing, and timelines. SpareXchange is not liable for property damage, faulty repairs, bodily injury, or financial loss arising from technical assistance.
                </p>
              </section>

              {/* Recycling Services Section */}
              <section id="recycling" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  7. Recycling Services
                </h2>
                <p className="text-muted-foreground">
                  To support circular economy initiatives, users can submit damaged or end-of-life spare parts to verified recyclers. Recyclers must review and validate submissions honestly.
                </p>
                <p className="text-muted-foreground">
                  <strong>Eco-Points:</strong> Validated recycling activities award Eco-Points. Eco-Points represent platform-only incentive tokens; they have no cash value, are non-transferable, and cannot be converted to physical currency. We reserve the right to alter or cancel the Eco-Points program at any time.
                </p>
                <p className="text-muted-foreground">
                  Hazardous or toxic waste requiring special government licenses is prohibited from submission. We do not guarantee environmental compliance of offline recyclers.
                </p>
              </section>

              {/* Disputes Section */}
              <section id="disputes" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  8. Disputes
                </h2>
                <p className="text-muted-foreground">
                  If conflicts arise concerning item conditions, failed transactions, repair quality, or recycler validations, users can file a dispute through platform systems.
                </p>
                <p className="text-muted-foreground">
                  Disputes must include a clear explanation, details of interaction, and evidence (screenshots). Administrators investigate and can issue warnings, remove listings, or block users.
                </p>
                <p className="text-muted-foreground">
                  SpareXchange is not a legal arbitrator and does not guarantee financial compensation. Serious issues or criminal acts must be referred to competent courts or Ethiopian law enforcement.
                </p>
              </section>

              {/* Prohibited Conduct Section */}
              <section id="conduct" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  9. Prohibited Conduct
                </h2>
                <p className="text-muted-foreground">Users must not engage in harmful behavior:</p>
                <ul className="list-disc list-inside space-y-1.5 text-sm ml-2 text-muted-foreground">
                  <li><strong className="text-foreground">Fraud:</strong> Creating fake accounts, forging papers, lying about listings, or falsifying skill credentials.</li>
                  <li><strong className="text-foreground">Abuse:</strong> Harassment, threats, hate speech, bullying, or discrimination.</li>
                  <li><strong className="text-foreground">Technical Malice:</strong> Introducing malware, attempting unauthorized system access, scraping data, or reverse engineering the software.</li>
                  <li><strong className="text-foreground">System Abuse:</strong> Submitting fake disputes, fabricating evidence, or cheating the Eco-Points system.</li>
                  <li><strong className="text-foreground">Intellectual Property:</strong> Posting images or data violating third-party copyrights or licenses.</li>
                </ul>
              </section>

              {/* Liability Section */}
              <section id="liability" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  10. Liability & Disclaimer
                </h2>
                <p className="font-semibold text-destructive">
                  Disclaimer: SpareXchange operates "as is" and "as available". We provide no warranties regarding service continuity, listing accuracy, part quality, recycler compliance, or user honesty.
                </p>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by Ethiopian law, SpareXchange, its directors, and affiliates shall not be liable for financial loss, property damage, bodily injury, online/offline scams, defective parts, or server downtime. Users indemnify and hold SpareXchange harmless from claims arising from policy violations, platform misuse, or transactions.
                </p>
              </section>

              {/* Governing Law Section */}
              <section id="governing-law" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  11. Governing Law & Jurisdiction
                </h2>
                <p className="text-muted-foreground">
                  These Terms are governed and interpreted in accordance with the laws of the Federal Democratic Republic of Ethiopia. Electronic actions (registration, policy agreements, messaging) constitute legally binding electronic transactions. Any legal claims must be submitted to the exclusive jurisdiction of competent courts in Ethiopia.
                </p>
              </section>

              {/* Termination Section */}
              <section id="termination" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  12. Suspension & Termination
                </h2>
                <p className="text-muted-foreground">
                  We reserve the right to temporarily suspend or permanently terminate user accounts if they violate policies, submit fake credentials, commit fraud, compromise software safety, or exploit other users.
                </p>
                <p className="text-muted-foreground">
                  If terminated, users must cease platform use immediately. Users can voluntarily delete accounts, but we may retain essential data to satisfy tax, dispute resolution, or fraud prevention records in accordance with our Privacy Policy.
                </p>
              </section>

              {/* Contact Section */}
              <section id="contact" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  13. Contact Information
                </h2>
                <p className="text-muted-foreground">For support, appeals, or questions regarding platform rules, please contact us through official channels:</p>
                <div className="p-6 rounded-xl border border-border bg-muted/20 space-y-2">
                  <p className="text-foreground"><strong>Email Support:</strong> support@sparexchange.com</p>
                  <p className="text-foreground"><strong>Official Website:</strong> www.sparexchange.com</p>
                  <p className="text-foreground"><strong>Corporate Address:</strong> Addis Ababa, Ethiopia</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2 opacity-70">
                  Always verify official email addresses and links before sharing personal data to prevent scams.
                </p>
              </section>

            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TermsPage;
