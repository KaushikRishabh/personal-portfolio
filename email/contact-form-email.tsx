"use client";

import { Html } from "@react-email/html";
import { Tailwind } from "@react-email/tailwind";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type ContactFormEmailProps = {
  senderEmail: string;
  title: string;
  message: string;
};

export default function ContactFormEmail({
  senderEmail,
  title,
  message,
}: ContactFormEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New message from your portfolio site</Preview>
      <Tailwind>
        <Body className="bg-gray-100 text-black">
          <Container>
            <Section className="bg-white my-10 rounded-md px-10 py-4">
              <Heading className="leading-tight">
                You received the following message from the contact form
              </Heading>
              <Heading as="h2">Title: {title}</Heading>

              <Text>Detail: {message}</Text>
              <Hr />
              <Text>The sender&apos;s email is: {senderEmail}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
