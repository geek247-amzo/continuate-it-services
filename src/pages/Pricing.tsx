import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ArrowRight,
  Network,
  Camera,
  Lock,
  Server,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fadeUp } from "@/lib/animations";

function calculateEstimate(devices: number, cybersecurity: boolean, backup: boolean) {
  const baseRate = 220;
  const cybersecurityRate = 125;
  const backupRate = 75;

  let base = devices * baseRate;
  if (cybersecurity) base += devices * cybersecurityRate;
  if (backup) base += devices * backupRate;

  // Show a range (±15%) to keep it consultative
  const low = Math.round(base * 0.85 / 100) * 100;
  const high = Math.round(base * 1.15 / 100) * 100;

  return { low, high };
}

function formatZAR(amount: number) {
  return `R${amount.toLocaleString("en-ZA")}`;
}

const includedFeatures = [
  {
    title: "Managed IT Support",
    subtitle: "Included in base",
    features: [
      "24/7 proactive monitoring",
      "Unlimited remote support",
      "Patch management & updates",
      "Asset & lifecycle tracking",
      "Monthly reporting",
      "Vendor liaison",
    ],
  },
  {
    title: "Cybersecurity",
    subtitle: "Optional add-on",
    features: [
      "Advanced threat detection",
      "Firewall management",
      "Endpoint protection (EDR)",
      "Vulnerability assessments",
      "POPIA compliance support",
      "Security awareness training",
    ],
  },
  {
    title: "Backup & DR",
    subtitle: "Optional add-on",
    features: [
      "Automated encrypted backups",
      "Off-site replication",
      "Tested disaster recovery",
      "Ransomware protection",
      "Rapid restore (defined RTOs)",
      "Compliance audit trails",
    ],
  },
];

const projectServices = [
  { icon: Network, name: "Networking", desc: "LAN/WAN design, Wi-Fi, VPN, SD-WAN deployment" },
  { icon: Camera, name: "CCTV & Biometrics", desc: "IP cameras, biometric access, site surveys" },
  { icon: Lock, name: "Server Rooms", desc: "Design, build, cooling, power management" },
  { icon: Server, name: "Hardware Procurement", desc: "Sourcing, racking, lifecycle management" },
];

const faqs = [
  {
    q: "What's included in the base managed IT support?",
    a: "Our base service covers proactive 24/7 monitoring via our NOC, unlimited remote support for all users, automated patch management, asset tracking, vendor liaison, and monthly strategic reviews. It's a comprehensive foundation for your IT operations.",
  },
  {
    q: "How does billing work?",
    a: "We operate on a fixed monthly fee based on the number of devices under management. No hidden costs, no per-incident charges. You'll receive a single, predictable invoice each month — making budgeting straightforward.",
  },
  {
    q: "Can I scale up or down?",
    a: "Absolutely. Our pricing scales with your business. As you add or remove devices, your monthly fee adjusts accordingly. There are no long-term lock-in contracts — we earn your business every month.",
  },
  {
    q: "What about on-site support?",
    a: "On-site support is available as part of our managed service packages. Response times depend on your SLA tier, with priority clients receiving same-day on-site visits for critical issues. Remote support is always available 24/7.",
  },
  {
    q: "How do you handle POPIA compliance?",
    a: "Our cybersecurity add-on includes POPIA compliance consulting, helping you implement the technical and organisational measures required by the Act. This includes data encryption, access controls, breach notification procedures, and regular compliance audits.",
  },
];

const Pricing = () => {
  const [devices, setDevices] = useState(25);
  const [cybersecurity, setCybersecurity] = useState(false);
  const [backup, setBackup] = useState(false);

  const estimate = useMemo(
    () => calculateEstimate(devices, cybersecurity, backup),
    [devices, cybersecurity, backup]
  );

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
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-primary-foreground/50 mb-4">Pricing</p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Transparent IT Support Pricing
            </h1>
            <p className="text-lg text-primary-foreground/60 leading-relaxed">
              Fixed-rate, per-device pricing with no hidden costs. Use our estimator to get a sense of cost, then talk to us for a custom quote.
            </p>
          </motion.div>
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
              If we miss your agreed SLA targets, you receive service credits — no excuses, no hidden clauses. We stand
              behind every response time and resolution commitment.
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

      {/* Interactive Cost Estimator */}
      <section className="section-padding bg-background">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground mb-3">Cost Estimator</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Estimate Your Monthly Cost</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="max-w-2xl mx-auto"
          >
            <div className="border border-border p-8 md:p-12">
              {/* Device slider */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                    Number of Devices
                  </label>
                  <span className="font-display text-2xl font-bold text-foreground">{devices}</span>
                </div>
                <Slider
                  value={[devices]}
                  onValueChange={(value) => setDevices(value[0])}
                  min={5}
                  max={200}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>5</span>
                  <span>200</span>
                </div>
              </div>

              {/* Add-on toggles */}
              <div className="space-y-4 mb-10">
                <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-2">Add-Ons</p>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 border-2 flex items-center justify-center transition-colors shrink-0 ${
                      cybersecurity ? "bg-primary border-primary" : "border-border"
                    }`}
                  >
                    {cybersecurity && <Check size={14} className="text-primary-foreground" />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={cybersecurity}
                    onChange={(e) => setCybersecurity(e.target.checked)}
                  />
                  <div>
                    <span className="text-sm font-medium text-foreground group-hover:opacity-80 transition-opacity">
                      Cybersecurity
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Threat detection, EDR, firewall management
                    </span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 border-2 flex items-center justify-center transition-colors shrink-0 ${
                      backup ? "bg-primary border-primary" : "border-border"
                    }`}
                  >
                    {backup && <Check size={14} className="text-primary-foreground" />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={backup}
                    onChange={(e) => setBackup(e.target.checked)}
                  />
                  <div>
                    <span className="text-sm font-medium text-foreground group-hover:opacity-80 transition-opacity">
                      Backup & Disaster Recovery
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Encrypted backups, off-site replication, DR
                    </span>
                  </div>
                </label>
              </div>

              {/* Estimated cost */}
              <div className="border-t border-border pt-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Estimated Monthly Cost</p>
                <p className="font-display text-4xl md:text-5xl font-bold text-foreground mb-1">
                  {formatZAR(estimate.low)} – {formatZAR(estimate.high)}
                </p>
                <p className="text-xs text-muted-foreground mb-8">
                  per month &middot; exact pricing depends on your environment
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity"
                >
                  Get Your Custom Quote <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What's Included */}
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
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground mb-3">What You Get</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">What's Included</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {includedFeatures.map((tier, i) => (
              <motion.div
                key={tier.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="p-8 bg-background border border-border"
              >
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
                  {tier.subtitle}
                </p>
                <h3 className="font-display text-2xl font-bold text-foreground mb-6">{tier.title}</h3>
                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check size={16} className="text-foreground shrink-0 mt-0.5" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project-Based Services */}
      <section className="section-padding bg-background">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-12"
          >
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground mb-3">Project-Based</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Quote-Based Services
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed">
              These services are scoped and priced per project. Contact us for a site survey and detailed proposal.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectServices.map((service, i) => (
              <motion.div
                key={service.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex items-center gap-5 p-6 border border-border hover:bg-secondary transition-colors"
              >
                <service.icon size={28} className="text-foreground shrink-0" strokeWidth={1.5} />
                <div>
                  <h4 className="font-display font-semibold text-foreground">{service.name}</h4>
                  <p className="text-sm text-muted-foreground">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-secondary">
        <div className="container max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-12"
          >
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground mb-3">FAQ</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Common Questions</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                  <AccordionTrigger className="text-left text-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-black">
        <div className="container text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-white/60 max-w-md mx-auto mb-10 leading-relaxed">
              Our team will assess your environment and deliver a tailored proposal — no obligation.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-black px-10 py-4 text-sm font-semibold tracking-wide hover:bg-white/90 transition-colors"
            >
              Talk to Our Team <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Pricing;
