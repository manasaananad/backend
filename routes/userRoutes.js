const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  try {
    // 1. Save to MongoDB
    const user = new User(req.body);
    await user.save();
    console.log("✅ User saved to MongoDB:", user.email);

    // 2. Send email via Resend (works on Render free tier — uses HTTPS not SMTP)
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "GlobalPhDHub <onboarding@resend.dev>",
        to: [process.env.EMAIL_USER],
        subject: "🚀 New Lead - GlobalPhDHub",
        html: `
          <div style="font-family:sans-serif;padding:24px;background:#f9f9f9;border-radius:8px;max-width:500px;">
            <h2 style="color:#f5a623;margin-top:0;">New Student Registration 🎓</h2>
            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr style="background:#fff;">
                <td style="padding:10px;font-weight:bold;width:100px;">Name</td>
                <td style="padding:10px;">${user.name}</td>
              </tr>
              <tr>
                <td style="padding:10px;font-weight:bold;">Email</td>
                <td style="padding:10px;">${user.email}</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:10px;font-weight:bold;">Phone</td>
                <td style="padding:10px;">${user.phone}</td>
              </tr>
              <tr>
                <td style="padding:10px;font-weight:bold;">Interest</td>
                <td style="padding:10px;">${user.interest}</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:10px;font-weight:bold;">Time (IST)</td>
                <td style="padding:10px;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
              </tr>
            </table>
          </div>
        `
      })
    });

    const emailData = await emailRes.json();

    if (!emailRes.ok) {
      console.error("❌ Resend error:", JSON.stringify(emailData));
      return res.status(500).json({ error: "User saved but email failed", detail: emailData });
    }

    console.log("✅ Email sent via Resend, id:", emailData.id);
    res.json({ message: "User saved + Email sent ✅" });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;