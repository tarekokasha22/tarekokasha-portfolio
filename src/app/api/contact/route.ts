import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "That email looks off — typo, maybe?" }, { status: 400 });
    }

    // Option 1 — Formspree (easiest setup: sign up at formspree.io, create a form,
    //   add FORMSPREE_ENDPOINT=https://formspree.io/f/YOUR_ID to env vars)
    if (process.env.FORMSPREE_ENDPOINT) {
      const res = await fetch(process.env.FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email: email, message, _replyto: email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Formspree error");
      }
    }
    // Option 2 — Resend (set RESEND_API_KEY + verify domain at resend.com)
    else if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "Portfolio Contact <contact@tarekokasha.com>",
        to: "tarekokasha53@gmail.com",
        replyTo: email,
        subject: `New project inquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="margin-bottom: 16px;">New project inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `,
      });
    } else {
      // No email service configured — log submission locally
      console.log("📬 Contact form submission (configure FORMSPREE_ENDPOINT or RESEND_API_KEY):", { name, email, message });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Couldn't send. Try email instead." }, { status: 500 });
  }
}
