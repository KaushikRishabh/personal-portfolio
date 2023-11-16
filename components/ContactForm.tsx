"use client";

import { Input, Textarea } from "@nextui-org/react";
import { sendEmail } from "@/app/actions";
import SubmitButton from "./SubmitButton";
import toast from "react-hot-toast";

const ContactForm = () => {
  return (
    <form
      className="flex flex-col w-full mx-auto md:max-w-3xl gap-2"
      action={async (formData) => {
        const { data, error } = await sendEmail(formData);

        if (error) {
          toast.error(error);
          return;
        }
        toast.success("Your email has been sent successfully!");
      }}
    >
      <Input
        isRequired
        name="senderEmail"
        type="email"
        label="Email"
        labelPlacement="outside"
        variant="bordered"
        maxLength={200}
        placeholder="Please enter your email address."
      />
      <Input
        isRequired
        name="title"
        type="text"
        label="Title"
        labelPlacement="outside"
        variant="bordered"
        maxLength={200}
        placeholder="Please enter a title."
      />

      <Textarea
        name="message"
        placeholder="Please enter your details."
        isRequired
        label="Details"
        variant="bordered"
        labelPlacement="outside"
        minRows={5}
        maxLength={5000}
        className="mt-2"
      />
      <SubmitButton />
    </form>
  );
};

export default ContactForm;
