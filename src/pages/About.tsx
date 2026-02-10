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
              Defending Johannesburg's Businesses Since 2015
            </h1>
            <p className="text-lg text-primary-foreground/60 leading-relaxed">
              Continuate IT Services is a Managed Security Service Provider (MSSP) delivering enterprise-grade IT solutions to SMEs across Gauteng.
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
                  Founded in 2015 in Johannesburg, Continuate IT Services began with a simple mission: make enterprise-level cybersecurity accessible to small and medium businesses.
                </p>
                <p>
                  Over the past decade, we've grown into a full-service MSSP, offering NOC/SOC operations, networking, CCTV, biometrics, server room installations, and comprehensive backup solutions. Our team of certified technicians operates 24/7, ensuring our clients' infrastructure is always protected.
                </p>
                <p>
                  Today, we manage over 1,000 devices across finance, retail, manufacturing, and professional services sectors — all from our headquarters in Johannesburg.
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
