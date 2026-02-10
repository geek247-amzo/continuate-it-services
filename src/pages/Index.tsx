import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Server, Camera, Network, HardDrive, Lock } from "lucide-react";
import heroImage from "@/assets/hero-server-room.jpg";
import { fadeUp } from "@/lib/animations";

const services = [
  { icon: Server, title: "NOC / SOC", desc: "24/7 network and security operations monitoring for uninterrupted service." },
  { icon: Shield, title: "Cybersecurity", desc: "Advanced threat detection, firewall management, and incident response." },
  { icon: HardDrive, title: "Backups & DR", desc: "Automated backup solutions and disaster recovery planning." },
  { icon: Network, title: "Networking", desc: "Enterprise-grade network design, deployment, and management." },
  { icon: Camera, title: "CCTV & Biometrics", desc: "Surveillance systems and biometric access control installations." },
  { icon: Lock, title: "Hardware & Server Rooms", desc: "Server room builds, hardware procurement, and installations." },
];

const stats = [
  { value: "10+", label: "Years in Business" },
  { value: "1000+", label: "Devices Managed" },
  { value: "99.9%", label: "Uptime Guaranteed" },
  { value: "24/7", label: "Support Available" },
];

const Index = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Secure server room infrastructure" className="w-full h-full object-cover grayscale" />
          <div className="absolute inset-0 hero-gradient" />
        </div>
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-primary-foreground/60 mb-4">
              Managed Security Service Provider
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground leading-[1.05] mb-6">
              Secure IT Continuity Since 2015
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-lg mb-10 leading-relaxed">
              Enterprise-grade IT security, networking, and infrastructure solutions for Johannesburg's SMEs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/services"
                className="bg-primary-foreground text-primary px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-primary-foreground/90 transition-colors"
              >
                Our Services
              </Link>
              <Link
                to="/contact"
                className="border border-primary-foreground/40 text-primary-foreground px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-primary-foreground/10 transition-colors"
              >
                Get a Quote
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary">
        <div className="container py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-primary-foreground/50 tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
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
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground mb-3">What We Do</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Our Services</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link
                  to="/services"
                  className="block group p-8 border border-border hover:bg-secondary transition-colors"
                >
                  <service.icon size={32} className="text-foreground mb-5" strokeWidth={1.5} />
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
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
              Ready to Secure Your Business?
            </h2>
            <p className="text-white/60 max-w-lg mx-auto mb-10 leading-relaxed">
              Get in touch with our team for a free consultation and customised IT security proposal.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-black px-10 py-4 text-sm font-semibold tracking-wide hover:bg-white/90 transition-colors"
            >
              Contact Us Today
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Index;
