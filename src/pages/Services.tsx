import { motion } from "framer-motion";
import {
  Shield,
  Server,
  Camera,
  Network,
  HardDrive,
  Lock,
  Monitor,
  ChevronRight,
  MessageSquare,
  ClipboardCheck,
  Rocket,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import cctvImage from "@/assets/cctv-security.jpg";
import { fadeUp } from "@/lib/animations";

const services = [
  {
    icon: Monitor,
    title: "Managed IT Support",
    desc: "Our foundational managed service provides proactive monitoring, remote support, and automation-driven maintenance across your entire IT environment. Every device, every user — covered under a single predictable monthly fee.",
    features: [
      "Proactive 24/7 monitoring via our NOC",
      "Unlimited remote support for all users",
      "Automated patch management & updates",
      "Asset tracking & lifecycle management",
      "Vendor liaison & procurement support",
      "Monthly reporting & strategic reviews",
    ],
  },
  {
    icon: Server,
    title: "NOC / SOC Operations",
    desc: "Our Network and Security Operations Centres provide round-the-clock monitoring, alerting, and incident response. We use industry-leading tools to detect anomalies before they become threats — backed by strict SLAs and dedicated analysts.",
    features: [
      "24/7 real-time network monitoring",
      "Automated alert escalation & triage",
      "Security incident detection & response",
      "SLA-backed response times",
      "Monthly performance & threat reports",
      "Dedicated analyst oversight",
    ],
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    desc: "Comprehensive, multi-layered security services that protect your business from evolving threats. From perimeter defence to endpoint protection — we cover every attack surface and keep you compliant with POPIA and industry standards.",
    price: "R125 per device",
    features: [
      "Advanced threat detection & response",
      "Firewall management & configuration",
      "Endpoint detection & response (EDR)",
      "Vulnerability assessments & pen testing",
      "POPIA compliance consulting",
      "Security awareness training for staff",
    ],
  },
  {
    icon: HardDrive,
    title: "Backups & Disaster Recovery",
    desc: "Automated, encrypted backups with tested disaster recovery plans ensure your data is always recoverable — whether from hardware failure, ransomware, or natural disaster. We don't just back up; we verify and test recovery regularly.",
    price: "R75 per device",
    features: [
      "Automated daily encrypted backups",
      "Off-site & cloud replication",
      "Regularly tested DR plans",
      "Ransomware protection & isolation",
      "Rapid restore with defined RTOs",
      "Compliance-ready audit trails",
    ],
  },
  {
    icon: Network,
    title: "Networking",
    desc: "Enterprise-grade network infrastructure — from initial design through deployment and ongoing optimisation. We handle everything from structured cabling to SD-WAN, ensuring your connectivity is fast, reliable, and secure.",
    features: [
      "LAN/WAN design & deployment",
      "Wi-Fi site surveys & installation",
      "VPN & remote access solutions",
      "SD-WAN deployment & management",
      "Network performance optimisation",
      "Structured cabling & audits",
    ],
  },
  {
    icon: Camera,
    title: "CCTV & Biometrics",
    desc: "Professional surveillance and access control systems tailored to your facility. From site survey through installation to remote monitoring, we deliver end-to-end physical security that integrates with your IT environment.",
    features: [
      "IP camera system design & install",
      "Biometric access control systems",
      "Site surveys & risk assessments",
      "Remote monitoring & alerts",
      "Integration with IT infrastructure",
      "Maintenance & support contracts",
    ],
  },
  {
    icon: Lock,
    title: "Server Rooms & Hardware",
    desc: "Purpose-built server room installations with proper cooling, power management, and cable infrastructure. We also handle hardware procurement, racking, and full lifecycle management — from spec to decommission.",
    features: [
      "Server room design & construction",
      "Cooling & power management systems",
      "Hardware procurement & racking",
      "Structured cabling & labelling",
      "Lifecycle management & refresh cycles",
      "Environmental monitoring & alerts",
    ],
  },
];

const process = [
  {
    icon: MessageSquare,
    step: "01",
    title: "Consult",
    desc: "We start with a discovery call to understand your business, existing infrastructure, pain points, and goals.",
  },
  {
    icon: ClipboardCheck,
    step: "02",
    title: "Assess",
    desc: "Our engineers perform a thorough audit of your IT environment — identifying risks, gaps, and opportunities.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Deploy",
    desc: "We implement solutions with minimal disruption — rolling out monitoring, security, and infrastructure upgrades.",
  },
  {
    icon: Activity,
    step: "04",
    title: "Monitor",
    desc: "Ongoing 24/7 monitoring, proactive maintenance, and regular strategic reviews keep your systems optimised.",
  },
];

const msspDeliverables = [
  "24/7 security monitoring (SOC) with real-time alerting",
  "Managed EDR/XDR with threat containment",
  "Firewall and network security management",
  "SIEM monitoring and log analysis",
  "Incident response coordination",
  "Vulnerability scanning and remediation guidance",
  "Patch management oversight",
  "Monthly security reporting and reviews",
];

const msspKpis = [
  "Detection & response SLAs aligned to severity and impact",
  "Mean time to acknowledge (MTTA)",
  "Mean time to resolve (MTTR)",
  "Patch compliance rate",
  "Endpoint protection coverage",
  "Backup and recovery success rate",
  "Security incident trend reporting",
];

const msspSlaHighlights = [
  "Critical: < 1 hour response, 4–8 hours resolution target",
  "High: < 4 hours response, 24 hours resolution target",
  "Medium: < 8 hours response, 2–3 business days resolution target",
  "Low: 1 business day response, scheduled resolution",
  "All devices covered where remote connectivity is possible",
  "Pricing is exclusive of VAT; changes require written approval",
];

const Services = () => {
  return (
    <>
      {/* Hero */}
      <section className="section-padding bg-primary">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-primary-foreground/50 mb-4">Services</p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              End-to-End IT Security & Infrastructure
            </h1>
            <p className="text-lg text-primary-foreground/60 leading-relaxed">
              From monitoring to hardware — we cover every layer of your IT stack with managed services built for reliability, security, and scale.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MSSP Detail */}
      <section className="section-padding bg-background border-t border-border">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="max-w-3xl mb-12"
          >
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Managed Security Services (MSSP)
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Know Exactly What You’re Getting
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our MSSP offering is built for full transparency. You get round‑the‑clock protection, clear KPIs,
              and SLA-backed response times. We cover every device we can reach and document what’s included,
              what’s optional, and how escalation works.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
              className="bg-secondary p-8 border border-border"
            >
              <h3 className="font-display text-xl font-bold text-foreground mb-4">Key Deliverables</h3>
              <ul className="space-y-3">
                {msspDeliverables.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-foreground">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-2 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={2}
              className="bg-secondary p-8 border border-border"
            >
              <h3 className="font-display text-xl font-bold text-foreground mb-4">KPIs You Can Hold Us To</h3>
              <ul className="space-y-3">
                {msspKpis.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-foreground">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-2 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={3}
              className="bg-secondary p-8 border border-border"
            >
              <h3 className="font-display text-xl font-bold text-foreground mb-4">SLA Highlights</h3>
              <ul className="space-y-3">
                {msspSlaHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-foreground">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-2 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link
                  to="/contact"
                  className="inline-flex items-center text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
                >
                  Request the full SLA pack <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Money-Back SLA */}
      <section className="section-padding bg-primary border-t border-primary-foreground/10">
        <div className="container text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-primary-foreground/50 mb-3">
              SLA Confidence
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Money-Back SLA Service Guarantee
            </h2>
            <p className="text-primary-foreground/60 max-w-lg mx-auto mb-8 leading-relaxed">
              If we miss your agreed SLA targets, you receive service credits. Our response times and resolution
              commitments are backed by a written SLA — no fine print.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-black px-10 py-4 text-sm font-semibold tracking-wide hover:bg-white/90 transition-colors"
            >
              View SLA Guarantee <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="section-padding bg-background">
        <div className="container space-y-24">
          {services.map((service) => (
            <motion.div
              key={service.title}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
            >
              <div>
                <service.icon size={36} className="text-foreground mb-5" strokeWidth={1.5} />
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">{service.title}</h2>
                {service.price && (
                  <p className="text-sm font-semibold text-foreground mb-3">{service.price}</p>
                )}
                <p className="text-muted-foreground leading-relaxed mb-6">{service.desc}</p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
                  >
                    Request a quote <ChevronRight size={16} className="ml-1" />
                  </Link>
                  {service.title === "Networking" && (
                    <Link
                      to="/networking"
                      className="inline-flex items-center text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
                    >
                      View networking pricing <ChevronRight size={16} className="ml-1" />
                    </Link>
                  )}
                </div>
              </div>
              <div className="bg-secondary p-8">
                <h4 className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4">Key Features</h4>
                <ul className="space-y-3">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-foreground">
                      <div className="w-1.5 h-1.5 bg-foreground rounded-full shrink-0" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How We Work */}
      <section className="section-padding bg-secondary">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground mb-3">Our Process</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">How We Work</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative p-8 bg-background border border-border"
              >
                <span className="font-display text-5xl font-bold text-muted-foreground/20 absolute top-4 right-6">
                  {step.step}
                </span>
                <step.icon size={28} className="text-foreground mb-4" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image break */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img src={cctvImage} alt="CCTV surveillance systems" className="w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 hero-gradient flex items-center justify-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Physical + Digital</h2>
            <p className="text-primary-foreground/60 max-w-md mx-auto">Complete coverage — from your server room to your front door.</p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-background">
        <div className="container text-center">
          <h2 className="font-display text-4xl font-bold text-foreground mb-6">Need a Custom Solution?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
            Every business is different. Let us design an IT security package tailored to your operations and budget.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-primary text-primary-foreground px-10 py-4 text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
};

export default Services;
