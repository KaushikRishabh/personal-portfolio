const Contact = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h2 className="text-4xl font-bold">Contact Me</h2>
      <form className="w-full max-w-sm">
        <div className="py-2">
          <label htmlFor="name" className="block mb-1 font-bold">
            Name:
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="py-2">
          <label htmlFor="email" className="block mb-1 font-bold">
            Email:
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="py-2">
          <label htmlFor="message" className="block mb-1 font-bold">
            Message:
          </label>
          <textarea
            id="message"
            rows="4"
            className="w-full px-3 py-2 border rounded-md"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full px-3 py-2 font-bold text-white bg-blue-500 rounded-md"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default Contact;
