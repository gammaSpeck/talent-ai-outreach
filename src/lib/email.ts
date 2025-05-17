import emailjs from "emailjs-com";

interface Params {
  content: string;
  to_email: string;
  recruiter_mail: string;
}

export async function sendEmailViaEmailJs({
  content,
  recruiter_mail,
  to_email,
}: Params) {
  try {
    const { subject, body } = parseEmailContent(content);

    const result = await emailjs.send(
      import.meta.env.VITE_EMAIL_SERVICE_ID, // e.g., 'gmail'
      import.meta.env.VITE_EMAIL_TEMPLATE_ID, // from EmailJS dashboard
      {
        time: new Date().toString(),
        subject,
        message: body,
        email: to_email,
        recruiter_mail,
      },
      import.meta.env.VITE_EMAIL_SERVICE_PUBLIC_KEY // (a.k.a. user ID or public key)
    );

    console.log("✅ Email sent!", result.text);
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
}

export function parseEmailContent(emailContent: string): {
  subject: string;
  body: string;
} {
  // Match "Subject: " followed by text until a newline
  const subjectMatch = emailContent.match(/^Subject:\s*(.*?)(?:\r?\n|$)/);

  if (!subjectMatch) {
    // If no subject is found, return empty subject and the whole content as body
    return {
      subject: "",
      body: emailContent.trim(),
    };
  }

  const subject = subjectMatch[1].trim();

  // Get the body by removing the subject line
  // Find the index after the first newline
  const subjectEndIndex = subjectMatch[0].length;
  const body = emailContent.substring(subjectEndIndex).trim();

  return {
    subject,
    body,
  };
}
