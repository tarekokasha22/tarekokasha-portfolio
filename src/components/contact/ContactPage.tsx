"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { siteConfig } from "@/config/site";

type FormState = "idle" | "loading" | "success" | "error";

export function ContactPage() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [error, setError] = useState<string>("");
  const [values, setValues] = useState({ name: "", email: "", message: "" });

  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });
  const formRef = useRef<HTMLDivElement>(null);
  const formInView = useInView(formRef, { once: true, margin: "-80px" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        setFormState("success");
      } else {
        const data = await res.json();
        setError(data.error || "Couldn't send. Try email instead.");
        setFormState("error");
      }
    } catch {
      setError("Couldn't send. Try email instead.");
      setFormState("error");
    }
  };

  const inputStyle = {
    fontFamily: "var(--font-sans)",
    fontSize: "0.9375rem",
    background: "rgba(244,239,230,0.03)",
    border: "1px solid var(--color-rule)",
    color: "var(--color-cream)",
    padding: "12px 16px",
    width: "100%",
    outline: "none",
    transition: "border-color 300ms ease",
  };

  const labelStyle = {
    fontFamily: "var(--font-sans)",
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "var(--color-muted)",
    display: "block",
    marginBottom: "8px",
    fontWeight: 500,
  };

  return (
    <div className="pt-28 md:pt-36 pb-24">
      <div className="container">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Left: headline + info */}
          <div className="md:col-span-5" ref={heroRef}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow mb-6">Get in touch</p>
              <h1
                className="text-cream mb-8"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.5rem, 5vw, 5rem)",
                  fontWeight: 300,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                Tell me
                <br />
                about it.
              </h1>

              <div className="space-y-6">
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9375rem",
                    color: "var(--color-muted)",
                    lineHeight: 1.7,
                  }}
                >
                  The fastest way is to book a 30-min intro call. We'll spend 15 minutes on your problem and 15
                  minutes on whether I'm the right person to solve it. No sales pitch.
                </p>

                <div className="py-6 border-t border-rule space-y-3">
                  <div>
                    <p className="eyebrow mb-1">Email</p>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="text-cream text-sm hover:text-accent transition-colors duration-300 underline-accent"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {siteConfig.email}
                    </a>
                  </div>
                  <div>
                    <p className="eyebrow mb-1">WhatsApp</p>
                    <a
                      href={siteConfig.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cream text-sm hover:text-accent transition-colors duration-300 underline-accent"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {siteConfig.whatsapp}
                    </a>
                  </div>
                  <div>
                    <p className="eyebrow mb-1">LinkedIn</p>
                    <a
                      href={siteConfig.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cream text-sm hover:text-accent transition-colors duration-300 underline-accent"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      Tarek Okasha
                    </a>
                  </div>
                  <div>
                    <p className="eyebrow mb-1">Location</p>
                    <p
                      className="text-sm"
                      style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}
                    >
                      {siteConfig.location}
                    </p>
                  </div>
                </div>

                <div
                  className="px-4 py-3 border border-rule"
                  style={{ background: "rgba(201,169,97,0.04)" }}
                >
                  <p
                    className="text-xs"
                    style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}
                  >
                    <span
                      className="avail-dot inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
                      style={{ background: "#4CAF50" }}
                    />
                    {siteConfig.availability}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: form */}
          <div className="md:col-span-7" ref={formRef}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={formInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              {formState === "success" ? (
                <div
                  className="p-8 border border-rule"
                  style={{ background: "rgba(244,239,230,0.02)" }}
                >
                  <div className="mb-4">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-3"
                      style={{ background: "#4CAF50" }}
                    />
                    <span
                      className="text-xs eyebrow"
                      style={{ color: "#4CAF50" }}
                    >
                      Sent
                    </span>
                  </div>
                  <h2
                    className="text-cream mb-3"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                      fontWeight: 400,
                    }}
                  >
                    I'll respond within 24h on weekdays.
                  </h2>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.9375rem",
                      color: "var(--color-muted)",
                      lineHeight: 1.7,
                    }}
                  >
                    If it's urgent, the fastest path is email:{" "}
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="text-cream underline-accent"
                    >
                      {siteConfig.email}
                    </a>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="name" style={labelStyle}>
                        Your name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Your name"
                        value={values.name}
                        onChange={(e) => setValues({ ...values, name: e.target.value })}
                        style={inputStyle}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "var(--color-accent)")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = "var(--color-rule)")
                        }
                      />
                    </div>

                    <div>
                      <label htmlFor="email" style={labelStyle}>
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={values.email}
                        onChange={(e) => setValues({ ...values, email: e.target.value })}
                        style={inputStyle}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "var(--color-accent)")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = "var(--color-rule)")
                        }
                      />
                    </div>

                    <div>
                      <label htmlFor="message" style={labelStyle}>
                        What are you trying to build?
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        placeholder="We run a wholesale distribution business and our inventory tracking is three spreadsheets and a group chat..."
                        value={values.message}
                        onChange={(e) => setValues({ ...values, message: e.target.value })}
                        style={{ ...inputStyle, resize: "vertical", minHeight: "140px" }}
                        onFocus={(e) =>
                          ((e.target as HTMLTextAreaElement).style.borderColor =
                            "var(--color-accent)")
                        }
                        onBlur={(e) =>
                          ((e.target as HTMLTextAreaElement).style.borderColor =
                            "var(--color-rule)")
                        }
                      />
                    </div>

                    {(formState === "error" || error) && (
                      <p
                        className="text-sm"
                        style={{ fontFamily: "var(--font-sans)", color: "#E74C3C" }}
                      >
                        {error || "Couldn't send. Try email instead:"}{" "}
                        <a
                          href={`mailto:${siteConfig.email}`}
                          className="underline"
                        >
                          {siteConfig.email}
                        </a>
                      </p>
                    )}

                    <div className="flex items-center gap-6 pt-2">
                      <button
                        type="submit"
                        disabled={formState === "loading"}
                        className="btn-glow inline-flex items-center gap-3 px-6 py-3.5 text-sm font-medium tracking-wide transition-all duration-500 disabled:opacity-60 hover:gap-5 group"
                        style={{
                          fontFamily: "var(--font-sans)",
                          background: "var(--color-accent)",
                          color: "var(--color-ink)",
                          cursor: formState === "loading" ? "wait" : "none",
                        }}
                      >
                        {formState === "loading" ? "Sending…" : "Send →"}
                      </button>
                      <p
                        className="text-xs"
                        style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}
                      >
                        I respond within 24h on weekdays.
                      </p>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
