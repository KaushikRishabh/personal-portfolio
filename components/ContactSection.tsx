import SectionTitle from "./SectionTitle";
import ContactForm from "./ContactForm";

const ContactSection = () => {
  return (
    <section
      id="contact"
      className="flex flex-col py-20 gap-4 w-full justify-center"
    >
      <SectionTitle title="Contact Me" />
      <p className="mb-4 text-center text-sm md:text-lg">
        <a href="mailto:reachmeatrish@gmail.com" className="underline">
          Email me
        </a>{" "}
        Or contact me directly or using the form below.
      </p>
      <ContactForm />
    </section>
  );
};

export default ContactSection;
