import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { blogPosts } from "@/data/blogPosts";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const postIndex = blogPosts.findIndex((p) => p.slug === slug);
  const post = blogPosts[postIndex];

  if (!post) return <Navigate to="/blog" replace />;

  const prevPost = postIndex > 0 ? blogPosts[postIndex - 1] : null;
  const nextPost =
    postIndex < blogPosts.length - 1 ? blogPosts[postIndex + 1] : null;

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
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors mb-8"
            >
              <ArrowLeft size={14} />
              Back to Blog
            </Link>
            <div className="flex items-center gap-3 mb-5">
              <post.icon
                size={24}
                className="text-primary-foreground/60"
                strokeWidth={1.5}
              />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary-foreground/50">
                {post.category}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-primary-foreground/40">
              <span>
                {new Date(post.date).toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="w-1 h-1 bg-primary-foreground/30 rounded-full" />
              <span>{post.readTime}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container">
          <motion.article
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="max-w-3xl mx-auto space-y-6"
          >
            {post.content.map((paragraph, i) => (
              <p
                key={i}
                className="text-foreground/80 leading-relaxed text-base"
              >
                {paragraph}
              </p>
            ))}
          </motion.article>
        </div>
      </section>

      {/* Prev / Next Navigation */}
      <section className="bg-secondary border-t border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {prevPost ? (
              <Link
                to={`/blog/${prevPost.slug}`}
                className="group py-10 px-6 md:pr-12 hover:bg-background transition-colors"
              >
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-3 block">
                  Previous
                </span>
                <span className="font-display text-lg font-semibold text-foreground group-hover:opacity-70 transition-opacity leading-snug block">
                  {prevPost.title}
                </span>
              </Link>
            ) : (
              <div className="py-10 px-6" />
            )}
            {nextPost ? (
              <Link
                to={`/blog/${nextPost.slug}`}
                className="group py-10 px-6 md:pl-12 text-right hover:bg-background transition-colors"
              >
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-3 block">
                  Next
                </span>
                <span className="font-display text-lg font-semibold text-foreground group-hover:opacity-70 transition-opacity leading-snug block">
                  {nextPost.title}
                </span>
              </Link>
            ) : (
              <div className="py-10 px-6" />
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-background">
        <div className="container text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="font-display text-4xl font-bold text-foreground mb-6">
              Need Expert IT Support?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
              Let's discuss how Continuate can help secure and optimise your IT
              infrastructure.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity"
            >
              Contact Us <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default BlogPost;
