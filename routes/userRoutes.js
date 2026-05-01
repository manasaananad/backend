router.post("/register", async (req, res) => {
  try {
    console.log("🔥 API HIT");   // <-- ADD THIS

    const user = new User(req.body);
    await user.save();

    console.log("✅ User saved"); // <-- ADD THIS

    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🚀 New User Registered",
      text: `
Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone}
Interest: ${user.interest}
`
    })
    .then(() => console.log("📧 Email sent"))
    .catch(err => console.log("❌ Email error:", err));

    res.json({ message: "User saved successfully ✅" });

  } catch (err) {
    console.error("🔥 ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});