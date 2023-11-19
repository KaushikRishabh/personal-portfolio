"use server";

import { getErrorMessage, validateString } from "@/lib/utils";
import { Resend } from "resend";
import ContactFormEmail from "@/email/contact-form-email";
import { createElement } from "react";

// debugger;
// console.log(process.env.RESEND_API_KEY);

// This is a simple example; you'll need to adjust it to fit your actual email content requirements
function renderEmailContent(
  senderEmail: string,
  title: string,
  message: string
) {
  return `
    <html>
      <body>
        <h1>You received the following message from the contact form</h1>
        <h2>Title: ${title}</h2>
        <p>Detail: ${message}</p>
        <p>The sender's email is: ${senderEmail}</p>
      </body>
    </html>
  `;
}
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(formData: FormData) {
  const senderEmail = formData.get("senderEmail");
  const title = formData.get("title");
  const message = formData.get("message");

  if (!validateString(senderEmail, 500)) {
    return {
      error: "Invalid Sender Email",
    };
  }
  if (!validateString(title, 500)) {
    return {
      error: "Invalid title",
    };
  }
  if (!validateString(message, 5000)) {
    return {
      error: "Invalid Message",
    };
  }
  // In your sendEmail function
  const emailHtml = renderEmailContent(
    senderEmail as string,
    title as string,
    message as string
  );

  let data;
  try {
    data = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: "reachmeatrish@gmail.com",
      subject: "Message from Contact Form",
      reply_to: senderEmail as string,
      react: emailHtml,
      // createElement(ContactFormEmail, {
      //   message: message as string,
      //   title: title as string,
      //   senderEmail: senderEmail as string,
      // }),
    });
  } catch (error: unknown) {
    return {
      error: getErrorMessage(error),
    };
  }
  return {
    data,
  };
}
