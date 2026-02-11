import { motion } from "framer-motion";
import socImage from "@/assets/soc-operations.jpg";
import { fadeUp } from "@/lib/animations";

const values = [
  { title: "Reliability", desc: "99.9% uptime with redundant systems and proactive monitoring around the clock." },
  { title: "Security First", desc: "Every solution is architected with security as the foundation, not an afterthought." },
  { title: "Innovation", desc: "We continuously evolve our stack to stay ahead of emerging threats and technologies." },
  { title: "Partnership", desc: "We're an extension of your team — transparent, accountable, and always available." },
];

const About = () => {
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
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-primary-foreground/50 mb-4">About Us</p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Built by an IT Operator. Trusted by Growing Businesses.
            </h1>
            <p className="text-lg text-primary-foreground/60 leading-relaxed">
              Continuate IT Services is founder-led by Amrish Seunarain, with 20+ years of hands-on IT support experience across environments from TP-Link to Cisco.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story + Image */}
      <section className="section-padding bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Continuate was founded by Amrish Seunarain after two decades in frontline IT support. The goal was clear: give SMEs the same disciplined IT and security standards usually reserved for large enterprises.
                </p>
                <p>
                  We combine practical field experience with managed service structure. From TP-Link rollouts to Cisco-grade network and security operations, we design, implement, and maintain systems that stay stable under real-world pressure.
                </p>
                <p>
                  Today, we support organizations across finance, retail, manufacturing, and professional services, with NOC/SOC operations, networking, CCTV, biometrics, backup, and server room infrastructure.
                </p>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
              <img
                src={socImage}
                alt="Continuate security operations center"
                className="w-full aspect-square object-cover grayscale"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Differentiation + Security */}
      <section className="section-padding bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="p-8 bg-secondary border border-border"
            >
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-muted-foreground mb-3">Why Continuate</p>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">No handoffs. No ticket ping-pong.</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our key differentiator is direct technical ownership. The same team that scopes your environment is accountable for operations, incident response, and long-term improvements.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
              className="p-8 bg-secondary border border-border"
            >
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-muted-foreground mb-3">Security & Compliance</p>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Security controls you can verify</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement POPIA-aligned controls, layered monitoring, and documented operational processes. Where client or regulatory requirements apply, we share current certification and compliance evidence during onboarding.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-secondary">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mb-16">
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground mb-3">Our Principles</p>
            <h2 className="font-display text-4xl font-bold text-foreground">Core Values</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="p-8 bg-background border border-border"
              >
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{v.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
