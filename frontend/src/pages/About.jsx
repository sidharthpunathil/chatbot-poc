const About = () => {
  return (
    <div className="px-15 py-10 max-md:px-5 max-md:py-8 bg-white min-h-screen">
      <h1 className="text-center text-primary text-[2rem] max-md:text-2xl font-bold mb-1.5">
        About Our College Chatbot
      </h1>
      <p className="text-center text-gray-light text-sm mb-8 max-md:mb-5">
        Smart | Secure | Student Friendly
      </p>

      <p className="max-w-[900px] mx-auto text-center max-md:text-left text-gray-text text-[15px] leading-relaxed mb-10 max-md:mb-8 max-md:text-sm">
        Our College Chatbot is a smart digital assistant designed to provide
        instant information to students regarding admissions, courses, fees,
        academic schedules and campus services. It works 24/7 to simplify
        communication between students and the institution.
      </p>

      <div className="grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-5 max-md:gap-4 mb-10">
        {[
          { title: "AI Powered", desc: "Uses intelligent automation to answer student queries instantly and accurately." },
          { title: "Student Friendly", desc: "Simple, clean interface designed for easy interaction and quick responses." },
          { title: "Secure & Reliable", desc: "Protects student information and ensures reliable system performance." },
          { title: "24/7 Availability", desc: "Students can access information anytime without depending on office hours." },
        ].map((card) => (
          <div key={card.title} className="bg-[#f9f4f4] rounded-xl p-5 max-md:p-4.5 text-center max-md:text-left shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
            <h3 className="text-primary text-base max-md:text-[15px] font-semibold mb-2.5">{card.title}</h3>
            <p className="text-sm max-md:text-[13px] text-gray-text leading-normal">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#f6efef] p-6 max-md:p-5 rounded-2xl max-w-[900px] mx-auto">
        <h2 className="text-primary mb-2.5 max-md:text-lg font-semibold">Our Vision</h2>
        <p className="text-gray-text text-sm max-md:text-[13px] leading-relaxed">
          To build a smart and reliable virtual assistant that transforms student
          support by delivering fast, transparent and accurate information
          through digital innovation.
        </p>
      </div>
    </div>
  );
};

export default About;
