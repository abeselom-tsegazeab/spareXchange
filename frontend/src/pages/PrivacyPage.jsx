import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Calendar, FileText, ChevronRight } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useEffect, useState } from "react";

const PrivacyPage = () => {
  const { darkMode } = useTheme();
  const [activeSection, setActiveSection] = useState("");

  const sections = [
    { id: "introduction", title: "1. Introduction" },
    { id: "definitions", title: "2. Definitions" },
    { id: "information-we-collect", title: "3. Information We Collect" },
    { id: "how-we-collect", title: "4. How We Collect Information" },
    { id: "purpose-of-collection", title: "5. Purpose of Data Collection" },
    { id: "legal-basis", title: "6. Legal Basis for Processing" },
    { id: "data-sharing", title: "7. Data Sharing and Disclosure" },
    { id: "third-party-services", title: "8. Third-Party Services" },
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
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-emerald-600 text-transparent bg-clip-text">
            Privacy Policy
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" />
              Effective Date: May 25, 2026
            </span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="flex items-center">
              <FileText className="w-4 h-4 mr-1.5" />
              SpareXchange Platform
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
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left text-sm py-2 px-3 rounded-lg flex items-center transition-all duration-200 ${
                        activeSection === section.id
                          ? "bg-primary/20 text-primary font-semibold border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <ChevronRight className={`w-3.5 h-3.5 mr-1.5 transition-transform duration-200 ${activeSection === section.id ? 'rotate-90 text-primary' : 'text-muted-foreground'}`} />
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
              
              {/* Introduction Section */}
              <section id="introduction" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  1. Introduction
                </h2>
                <p className="text-muted-foreground">
                  Welcome to SpareXchange Privacy Policy. This Privacy Policy explains how SpareXchange (“SpareXchange,” “we,” “our,” or “us”) collects, uses, stores, processes, protects, and manages personal information obtained through the use of the SpareXchange platform, including related services, features, and functionalities.
                </p>
                <p className="text-muted-foreground">
                  SpareXchange recognizes the importance of privacy and is committed to ensuring the responsible, transparent, and secure handling of personal data collected from users of the platform. We understand that trust is essential in creating a reliable digital environment for spare part exchange, technician coordination, recycling activities, and community engagement. Accordingly, SpareXchange seeks to implement reasonable technical and organizational measures to protect user information from unauthorized access, misuse, disclosure, alteration, or loss.
                </p>
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <h4 className="font-semibold mb-2 text-primary">The purpose of this Privacy Policy is to:</h4>
                  <ul className="list-disc list-inside space-y-1.5 ml-2 text-muted-foreground">
                    <li>Explain what information SpareXchange collects;</li>
                    <li>Describe how information is collected and processed;</li>
                    <li>Clarify how information is used and protected;</li>
                    <li>Inform users about their rights and responsibilities regarding personal data;</li>
                    <li>Provide transparency regarding information sharing and system operations.</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  This Privacy Policy applies to all individuals and entities accessing or using SpareXchange, including Standard Users, Verified Users, Technicians, Recyclers, and Administrators. By accessing, registering for, or using SpareXchange, users acknowledge that they have read, understood, and accepted the practices described in this Privacy Policy. Users who do not agree with this Policy should discontinue use of the platform.
                </p>
                <p className="text-muted-foreground">
                  SpareXchange may periodically update this Privacy Policy to reflect operational, legal, technical, or security changes. Updated versions may be communicated through the platform or published on official pages.
                </p>
              </section>

              {/* Definitions Section */}
              <section id="definitions" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  2. Definitions
                </h2>
                <p className="text-muted-foreground">For clarity and consistency, the following terms used in this Privacy Policy shall have the meanings assigned below:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { term: "Personal Data", text: "Any information that directly or indirectly identifies an individual user or can reasonably be associated with a specific person. Examples include name, email, phone number, verification documents, and usage records." },
                    { term: "Processing", text: "Any operation performed on user information, whether automated or manual, including collection, recording, storage, retrieval, modification, sharing, and deletion." },
                    { term: "User", text: "Any person who accesses, browses, registers, or interacts with SpareXchange. This includes Standard Users, Verified Users, Technicians, Recyclers, and Administrators." },
                    { term: "Verified User", text: "A registered user whose identity or required supporting documentation has been reviewed and approved by SpareXchange to access additional functionalities like listing parts or redeeming points." },
                    { term: "Technician", text: "An approved user who offers independent technical support, repair, maintenance, or consultation services through the platform. They are not employees of SpareXchange." },
                    { term: "Recycler", text: "An approved individual or organization involved in recycling, refurbishing, responsible disposal, or environmentally sustainable management of spare parts through SpareXchange." },
                    { term: "Administrator", text: "An authorized platform manager responsible for system monitoring, verification review, moderation, dispute handling, security management, and policy enforcement." },
                    { term: "Cookies", text: "Small text files stored on a user's device that help improve platform functionality, maintain user sessions, remember preferences, and support secure authentication processes." },
                    { term: "Authentication", text: "The process of verifying a user's identity to allow secure access, including username/password validation, session tokens, and security checks." },
                    { term: "Third-Party Services", text: "External systems, technologies, or providers integrated to support functionality (e.g., hosting, geolocation, notifications). They maintain independent privacy practices." },
                    { term: "Eco-Points", text: "Non-monetary digital incentive points awarded for participating in approved recycling activities. They have no cash value and are non-transferable." },
                    { term: "Verification Documents", text: "Files, credentials, licenses, or identification materials submitted by users to determine eligibility for restricted platform functionalities." }
                  ].map((d, index) => (
                    <div key={index} className="p-4 rounded-xl border border-border bg-muted/20">
                      <h4 className="font-bold mb-1 text-primary">{d.term}</h4>
                      <p className="text-sm text-muted-foreground">{d.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Information We Collect Section */}
              <section id="information-we-collect" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  3. Information We Collect
                </h2>
                <p className="text-muted-foreground">SpareXchange collects information necessary to provide, maintain, improve, secure, and manage platform functionalities. The type of information collected depends on how users interact with the platform and the services they access.</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">3.1 Personal Information</h3>
                    <p className="mb-2 text-muted-foreground">We collect basic personal information necessary for identification, communication, and account management:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Full name, email address, and phone number;</li>
                      <li>Profile image (if provided) and user role information;</li>
                      <li>Geographic or location-related information where applicable.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">3.2 Account Information</h3>
                    <p className="mb-2 text-muted-foreground">To support secure access and authentication, we collect account-related information:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Username and encrypted or hashed password credentials;</li>
                      <li>Login history, session information, and authentication status;</li>
                      <li>Password reset activity and account preferences.</li>
                    </ul>
                    <p className="text-xs text-destructive mt-1 italic font-medium">For security purposes, SpareXchange does not intentionally store passwords in readable or plain-text format.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">3.3 Verification Information</h3>
                    <p className="mb-2 text-muted-foreground">Users seeking additional privileges, technician access, or recycler participation must submit verification materials:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Identity documents, licenses, or certifications;</li>
                      <li>Supporting documentation and verification photos;</li>
                      <li>Role-specific eligibility materials.</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-1 opacity-70">Verification info is used solely for trust and security. Access is restricted to authorized administrators.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">3.4 Listing and Activity Data</h3>
                    <p className="mb-2 text-muted-foreground">We collect details regarding platform activities and user interactions:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li><strong>Spare Listing Data:</strong> Title, description, category, item condition, uploaded images, and availability status.</li>
                      <li><strong>Technician Activity:</strong> Service requests, availability, and service coordination messages.</li>
                      <li><strong>Recycling Activity:</strong> Submissions, recyclable item details, validation records, and eco-point history.</li>
                      <li><strong>Disputes and Reports:</strong> User complaints, reports, submitted evidence/documents, and moderation records.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">3.5 Device and Usage Information</h3>
                    <p className="mb-2 text-muted-foreground">Limited technical information is collected automatically to improve security, reliability, and performance:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>IP address, browser type, device type, and operating system;</li>
                      <li>Login timestamps, platform interaction logs, and activity/error logs.</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-1 opacity-70">This data supports security monitoring, troubleshooting, fraud prevention, and performance optimization.</p>
                  </div>
                </div>
              </section>

              {/* How We Collect Section */}
              <section id="how-we-collect" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  4. How We Collect Information
                </h2>
                <p className="text-muted-foreground">SpareXchange collects information through various interactions and activities performed on the platform. Information may be collected directly from users, automatically through system usage, or through platform-related processes necessary to support functionality, security, and service delivery.</p>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <h3 className="font-bold text-sm mb-2 text-primary">4.1 Registration & Profile Updates</h3>
                    <p className="text-sm text-muted-foreground">We collect data directly from you when you register an account or voluntarily update your profile (such as changing contact info, uploading images, or editing role details).</p>
                  </div>
                  
                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <h3 className="font-bold text-sm mb-2 text-primary">4.2 Verification & Application Processes</h3>
                    <p className="text-sm text-muted-foreground">When applying for verified status, technician privileges, or recycler participation, we collect identity documents, professional licenses, and credentials to assess eligibility.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <h3 className="font-bold text-sm mb-2 text-primary">4.3 Listings & Functional Requests</h3>
                    <p className="text-sm text-muted-foreground">When posting spare listings, requesting technician support, submitting recycling items, or filing complaints and reports, we collect all associated descriptions, metadata, images, and communications.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <h3 className="font-bold text-sm mb-2 text-primary">4.4 Automatic Collection</h3>
                    <p className="text-sm text-muted-foreground">As you navigate the platform, certain data is gathered automatically by our servers—such as your IP address, device specs, login timestamps, session records, and platform activity logs.</p>
                  </div>
                </div>
              </section>

              {/* Purpose of Collection Section */}
              <section id="purpose-of-collection" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  5. Purpose of Data Collection (Why We Use Data)
                </h2>
                <p className="text-muted-foreground">SpareXchange collects and processes information to provide secure, reliable, and effective platform services. Information is used only for legitimate operational, security, administrative, and functional purposes necessary for platform performance.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold mb-2 text-foreground">Account Management & Auth</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Verifying user identity during login</li>
                      <li>Maintaining secure account access sessions</li>
                      <li>Detecting suspicious login attempts</li>
                      <li>Preventing unauthorized credential access</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2 text-foreground">Platform Operations</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Creating and managing spare listings</li>
                      <li>Facilitating repair request coordination</li>
                      <li>Processing recycling submissions</li>
                      <li>Tracking and managing Eco-Point history</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2 text-foreground">Trust & Fraud Prevention</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Reviewing verification requests</li>
                      <li>Determining feature eligibility</li>
                      <li>Detecting identity misuse and fraud</li>
                      <li>Enforcing platform policies and rules</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2 text-foreground">Security & Moderation</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Monitoring suspicious user behavior</li>
                      <li>Investigating security incidents</li>
                      <li>Preventing harassment and abuse</li>
                      <li>Supporting dispute resolution processes</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="font-bold mb-2 text-foreground">System Improvement</h4>
                  <p className="text-sm text-muted-foreground">We analyze technical logs to diagnose bugs, resolve system malfunctions, improve application responsiveness, and optimize the overall user experience.</p>
                </div>
              </section>

              {/* Legal Basis Section */}
              <section id="legal-basis" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  6. Legal Basis for Processing Information
                </h2>
                <p className="text-muted-foreground">SpareXchange processes user information only for legitimate, necessary, and lawful purposes related to platform functionality, security, operational effectiveness, and compliance obligations. Information may be processed on the following grounds:</p>
                
                <ul className="space-y-3 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">6.1 Platform Functionality:</strong> Processing is necessary to provide the core services, including account access, exchange coordination, listing creation, technician requests, and notifications.
                  </li>
                  <li>
                    <strong className="text-foreground">6.2 User Consent:</strong> Consent is provided when users register, submit profile updates, upload verification documents, or participate in platform workflows. Users can choose not to provide optional data, which may limit functionality.
                  </li>
                  <li>
                    <strong className="text-foreground">6.3 Security & Platform Protection:</strong> We process technical logs to maintain platform integrity, detect and prevent fraud, protect accounts, and investigate security incidents.
                  </li>
                  <li>
                    <strong className="text-foreground">6.4 Legitimate Operational Interests:</strong> To support troubleshooting, system analytics, performance optimization, and administrative review.
                  </li>
                  <li>
                    <strong className="text-foreground">6.5 Legal Obligations:</strong> We may process or disclose information to comply with applicable Ethiopian laws, lawful government requests, regulatory obligations, or authorized investigations.
                  </li>
                </ul>
              </section>

              {/* Data Sharing Section */}
              <section id="data-sharing" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  7. Data Sharing and Disclosure
                </h2>
                <p className="text-muted-foreground">SpareXchange values user privacy and seeks to limit unnecessary disclosure of personal information. <strong className="text-primary">SpareXchange does not sell, rent, or commercially trade users' personal information to third parties.</strong></p>
                <p className="text-muted-foreground">However, limited information sharing may occur under these strictly managed circumstances:</p>
                
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="border-l-4 border-primary pl-4">
                    <strong className="text-foreground">7.1 With Administrators:</strong> Authorized administrators access verification papers, listings, and logs to review applications, moderate content, handle disputes, and prevent fraud.
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <strong className="text-foreground">7.2 With Technicians and Recyclers:</strong> Basic communication and request coordination details are shared between users, technicians, and recyclers to allow offline coordination of repairs and waste handling.
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <strong className="text-foreground">7.3 With Legal Authorities:</strong> Disclosures are limited to what is legally necessary to comply with Ethiopian law, respond to government subpoenas, or investigate illegal conduct.
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <strong className="text-foreground">7.4 With Service Providers:</strong> Trusted third-party infrastructure providers (e.g., hosting, storage, notifications) process limited metadata solely to support system functionality.
                  </div>
                </div>
              </section>

              {/* Third-Party Services Section */}
              <section id="third-party-services" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold pb-2 border-b border-border text-foreground">
                  8. Third-Party Services and Integrations
                </h2>
                <p className="text-muted-foreground">
                  SpareXchange integrates external technologies to support location-based recycling search, secure cloud file storage, transactional notifications, and system hosting.
                </p>
                <p className="text-muted-foreground">
                  Although SpareXchange seeks to work only with reputable providers, these third-party integrations maintain independent privacy practices and policies beyond our direct control. Users are encouraged to review relevant policies where applicable. SpareXchange shall not be responsible for privacy practices or actions conducted independently by third-party service providers.
                </p>
              </section>

            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PrivacyPage;
