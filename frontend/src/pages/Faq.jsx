const faqs = [
  { q: "What is the College Chatbot?", a: "The College Chatbot is a virtual assistant designed to help students get instant information about admissions, courses, fees, academic schedules, and campus services." },
  { q: "Is the chatbot available 24/7?", a: "Yes, the chatbot is available 24/7 to assist students anytime without depending on office hours." },
  { q: "Can I check admission details through the chatbot?", a: "Yes, you can check admission-related information such as eligibility, important dates, and procedures using the chatbot." },
  { q: "Is my data safe with the chatbot?", a: "Absolutely. The chatbot follows secure practices to protect student data and ensures privacy and reliability." },
  { q: "Can I use the chatbot on mobile?", a: "Yes, the chatbot is fully responsive and can be accessed on mobile, tablet, and desktop devices." },
];

const Faq = () => {
  return (
    <div className="px-15 py-10 max-md:px-5 max-md:py-8 bg-white min-h-screen">
      <h1 className="text-center text-[2rem] max-md:text-2xl font-bold text-primary mb-1.5">
        Frequently Asked Questions
      </h1>
      <p className="text-center text-sm max-md:text-[13px] text-gray-light mb-10 max-md:mb-6">
        Find quick answers to common chatbot questions
      </p>

      <div className="max-w-[900px] mx-auto flex flex-col gap-4">
        {faqs.map((faq) => (
          <details key={faq.q} className="bg-[#f5f5f5] rounded-lg px-4.5 py-3.5 max-md:px-3.5 max-md:py-3 cursor-pointer">
            <summary className="text-[15px] max-md:text-sm font-medium text-primary flex justify-between items-center">
              {faq.q}
            </summary>
            <p className="mt-3 text-sm max-md:text-[13px] text-gray-text leading-relaxed">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
};

export default Faq;
