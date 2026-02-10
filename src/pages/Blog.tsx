import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
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
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-primary-foreground/50 mb-4">
              Blog
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Insights & Resources
            </h1>
            <p className="text-lg text-primary-foreground/60 leading-relaxed">
              Practical advice on IT security, infrastructure, and managed
              services — written for South African businesses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="section-padding bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <motion.div
                key={post.slug}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block h-full border border-border hover:bg-secondary transition-colors"
                >
                  <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-5">
                      <post.icon
                        size={24}
                        className="text-foreground"
                        strokeWidth={1.5}
                      />
                      <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                        {post.category}
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground mb-3 leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {new Date(post.date).toLocaleDateString("en-ZA", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
                        <span>{post.readTime}</span>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary">
        <div className="container text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Have a Question?
            </h2>
            <p className="text-primary-foreground/60 max-w-lg mx-auto mb-10 leading-relaxed">
              Our team is ready to help you navigate IT security, compliance,
              and infrastructure challenges.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-black px-10 py-4 text-sm font-semibold tracking-wide hover:bg-white/90 transition-colors"
            >
              Get in Touch
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Blog;
