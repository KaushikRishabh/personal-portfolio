import SectionTitle from "./SectionTitle";

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
        </a> to get in touch.
      </p>
      <p className="text-center text-sm">reachmeatrish@gmail.com</p>
    </section>
  );
};

export default ContactSection;
