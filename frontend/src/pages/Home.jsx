import { Link } from "react-router-dom";
import {
  MessageCircle,
  Clock,
  Zap,
  Users,
  Shield,
  Eye,
  Send,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI Powered",
    desc: "Uses intelligent automation to answer student queries instantly and accurately.",
  },
  {
    icon: Users,
    title: "Student Friendly",
    desc: "Simple, clean interface designed for easy interaction and quick responses.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "Protects student information and ensures reliable system performance.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    desc: "Students can access information anytime without depending on office hours.",
  },
];

const faqs = [
  {
    q: "What is the College Chatbot?",
    a: "The College Chatbot is a virtual assistant designed to help students get instant information about admissions, courses, fees, academic schedules, and campus services.",
  },
  {
    q: "Is the chatbot available 24/7?",
    a: "Yes, the chatbot is available 24/7 to assist students anytime without depending on office hours.",
  },
  {
    q: "Can I check admission details through the chatbot?",
    a: "Yes, you can check admission-related information such as eligibility, important dates, and procedures using the chatbot.",
  },
  {
    q: "Is my data safe with the chatbot?",
    a: "Absolutely. The chatbot follows secure practices to protect student data and ensures privacy and reliability.",
  },
  {
    q: "Can I use the chatbot on mobile?",
    a: "Yes, the chatbot is fully responsive and can be accessed on mobile, tablet, and desktop devices.",
  },
];

const Home = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-violet-50 min-h-[85vh] flex items-center">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-violet-100/50 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl w-full px-6 flex flex-col lg:flex-row items-center gap-12 py-20">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block mb-4 px-4 py-1.5 text-sm font-semibold text-violet-700 bg-violet-100 rounded-full">
              Smart &middot; Secure &middot; Student Friendly
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
              Smart Virtual
              <span className="block text-violet-600">Assistance</span>
              for Your College
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
              Our College Chatbot is a smart digital assistant designed to
              provide instant information to students regarding admissions,
              courses, fees, academic schedules and campus services. It works
              24/7 to simplify communication between students and the
              institution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/chat"
                className="inline-flex items-center justify-center gap-2 bg-violet-600 text-white px-8 py-3.5 rounded-xl no-underline font-semibold text-base shadow-lg shadow-violet-300/40 hover:bg-violet-700 hover:shadow-violet-400/50 hover:scale-[1.02] transition-all duration-200"
              >
                <MessageCircle size={18} />
                Start Chat
              </Link>
              <a
                href="#about"
                className="inline-flex items-center justify-center gap-2 border-2 border-violet-200 text-violet-700 px-8 py-3.5 rounded-xl no-underline font-semibold text-base hover:bg-violet-50 transition-colors duration-200"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Chat mockup */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-violet-200/30 border border-violet-100 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                  <MessageCircle size={14} className="text-white" />
                </div>
                <div className="bg-violet-50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700">
                  Hi! I'm your college assistant. How can I help you today?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-violet-600 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white max-w-[75%]">
                  What are the admission requirements?
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                  <MessageCircle size={14} className="text-white" />
                </div>
                <div className="bg-violet-50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700">
                  For undergraduate admissions you'll need your 12th-grade
                  marksheet, entrance exam scores, and...
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                  <MessageCircle size={14} className="text-white" />
                </div>
                <div className="bg-violet-50 rounded-2xl rounded-tl-sm px-4 py-2.5 flex gap-1 items-center">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            About Our College Chatbot
          </h2>
          <p className="text-center text-violet-600 font-medium mb-4">
            Smart &middot; Secure &middot; Student Friendly
          </p>
          <p className="text-center text-gray-500 mb-14 max-w-2xl mx-auto">
            Our College Chatbot is a smart digital assistant designed to provide
            instant information to students regarding admissions, courses, fees,
            academic schedules and campus services. It works 24/7 to simplify
            communication between students and the institution.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/40 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-200">
                  <f.icon size={22} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-violet-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Find quick answers to common chatbot questions
          </p>

          <div className="flex flex-col gap-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="bg-white rounded-xl px-5 py-4 cursor-pointer shadow-sm border border-violet-100/50"
              >
                <summary className="text-[15px] font-medium text-gray-800 flex justify-between items-center">
                  {faq.q}
                </summary>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Vision + CTA */}
      <section className="py-20 px-6 bg-violet-600">
        <div className="max-w-2xl mx-auto text-center text-white">
          <Eye size={32} className="mx-auto mb-4 text-violet-200" />
          <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
          <p className="text-violet-100 mb-8 text-lg leading-relaxed">
            To build a smart and reliable virtual assistant that transforms
            student support by delivering fast, transparent and accurate
            information through digital innovation.
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 bg-white text-violet-700 px-8 py-3.5 rounded-xl no-underline font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <MessageCircle size={18} />
            Start Chatting Now
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;
