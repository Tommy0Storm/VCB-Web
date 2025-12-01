import React from "react";
import { RiLinkedinFill } from "react-icons/ri";
import { MdPerson, MdGavel, MdCode } from "react-icons/md";

// ============================================================
// ABOUT PAGE - VCB LEADERSHIP AND COMPANY INFO
// ============================================================

const About: React.FC = () => {
  const leadership = [
    {
      name: "Dawn Beech",
      role: "CEO · Co-founder",
      icon: <MdPerson className="w-8 h-8" />,
      description: `A seasoned technology professional with extensive experience delivering solutions across industries in South Africa, Dawn is driving the creation of an AI-native business designed to operate across multiple sectors of the economy. The venture is built on three focus areas: Advisory Services, Project Delivery Services, and Product Development.`,
      vision: `The five-year vision is bold: to establish one of Africa's leading AI services and product development companies, with capabilities spanning the full AI value chain—from strategy to execution.`,
      philosophy: `At its core is the conviction that AI can serve as a national enabler—streamlining government services, reducing inefficiencies, empowering businesses, and strengthening communities.`,
      linkedIn: "https://za.linkedin.com/in/dawnbeech",
    },
    {
      name: "Advocate Nandi Basson",
      role: "Chief Legal Officer · Co-founder",
      icon: <MdGavel className="w-8 h-8" />,
      description: `My journey as an advocate has been dedicated to one core principle: navigating complexity to find just outcomes for people. From the intricacies of labour disputes and complex civil claims to corporate litigation and foundational constitutional challenges, my work has always been at the intersection of systems and the human beings they are meant to serve.`,
      vision: `I see the coming wave of artificial intelligence not as a technological challenge, but as a profoundly human one. My vision is to ensure that our innovations are built with empathy and foresight.`,
      philosophy: `I am a builder of bridges—connecting the vast potential of AI with the practical, ethical, and legal realities of the world. This means embedding compliance into our products from the outset, upholding crucial legislation such as POPIA, and ensuring our legacy is one of responsible innovation.`,
      linkedIn: "https://za.linkedin.com/in/nandi-basson",
    },
    {
      name: "Tommy Ferreira",
      role: "CTO · Co-founder",
      icon: <MdCode className="w-8 h-8" />,
      description: `I am a builder of systems and a strategist of transformation. For three decades I have worked at the frontlines of technology, from the early days of mainframes and networks to the current wave of artificial intelligence. My journey has never been about chasing trends, but about recognising when an innovation is ready to shift from theory into impact.`,
      vision: `I am a connector. I bring together advisory insight, delivery execution, and product innovation into a single continuum—ensuring that ideas do not die in strategy decks, but become measurable outcomes in the real world.`,
      philosophy: `Most of all, I am committed to a bigger vision: that artificial intelligence can be more than a tool of efficiency. It can be a national enabler—a force that streamlines systems, empowers businesses, and uplifts communities.`,
      linkedIn: "https://za.linkedin.com/in/tommy-ferreira-cissp",
    },
  ];

  return (
    <div className="bg-vcb-100 min-h-screen">
      {/* Hero Section */}
      <section className="bg-vcb-900 py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About VCB
          </h1>
          <p className="text-xl md:text-2xl text-vcb-300 font-medium mb-4">
            Vision becomes Viable.
          </p>
          <p className="max-w-3xl mx-auto text-lg text-vcb-400 font-light leading-relaxed">
            We are builders at the intersection of strategy, delivery, and product. 
            VCB aligns vision with disciplined execution to turn AI-native ideas 
            into measurable outcomes for South Africa and the continent.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-vcb-900 mb-8">Who We Are</h2>
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-vcb-200">
            <p className="text-lg text-vcb-600 leading-relaxed mb-6">
              <strong className="text-vcb-900">VCB</strong> is a South African AI-native venture designed to operate across multiple sectors with one clear promise: align vision with execution. We help organisations adopt and integrate AI responsibly, deliver end-to-end projects with measurable impact, and develop products that solve real problems while unlocking new market opportunities.
            </p>
            <p className="text-lg text-vcb-600 leading-relaxed mb-6">
              Our five-year ambition is bold—become one of Africa's leading AI services and product companies, spanning the full AI value chain from strategy to delivery. To accelerate capability and scale, we are open to strategic partnerships, including equity participation or structured debt.
            </p>
            <p className="text-lg text-vcb-600 leading-relaxed">
              At our core lies a conviction that AI should be a national enabler—streamlining public services, reducing inefficiency, empowering businesses, and strengthening communities. With strong operational leadership and the right partners, VCB will drive responsible, large-scale transformation.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="bg-vcb-800 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-vcb-700 rounded-2xl p-8 border border-vcb-600">
              <h3 className="text-xl font-bold text-white mb-4">Advisory Services</h3>
              <p className="text-vcb-300 mb-4">Strategy, governance, and adoption roadmaps to integrate AI responsibly and effectively.</p>
              <ul className="space-y-2 text-vcb-400">
                <li>• AI strategy & operating model</li>
                <li>• Risk, POPIA & Responsible AI governance</li>
                <li>• Data readiness & value mapping</li>
              </ul>
            </div>
            <div className="bg-vcb-700 rounded-2xl p-8 border border-vcb-600">
              <h3 className="text-xl font-bold text-white mb-4">Project Delivery</h3>
              <p className="text-vcb-300 mb-4">End-to-end delivery with measurable outcomes and enterprise-grade controls.</p>
              <ul className="space-y-2 text-vcb-400">
                <li>• Solution architecture & implementation</li>
                <li>• MLOps, observability & support</li>
                <li>• Change enablement & value realisation</li>
              </ul>
            </div>
            <div className="bg-vcb-700 rounded-2xl p-8 border border-vcb-600">
              <h3 className="text-xl font-bold text-white mb-4">Product Development</h3>
              <p className="text-vcb-300 mb-4">Applications that solve business problems and open new markets.</p>
              <ul className="space-y-2 text-vcb-400">
                <li>• AI-native product design & build</li>
                <li>• Compliance-by-design (POPIA, security)</li>
                <li>• Commercialisation & go-to-market</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-vcb-900 mb-12">Leadership</h2>
          <div className="space-y-8">
            {leadership.map((leader, index) => (
              <article key={index} className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-vcb-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-vcb-900 rounded-xl flex items-center justify-center text-white">
                    {leader.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-vcb-900">{leader.name}</h3>
                    <p className="text-vcb-500 font-medium">{leader.role}</p>
                  </div>
                </div>
                <p className="text-vcb-600 leading-relaxed mb-4">{leader.description}</p>
                <p className="text-vcb-600 leading-relaxed mb-4">{leader.vision}</p>
                <p className="text-vcb-600 leading-relaxed mb-6">{leader.philosophy}</p>
                <a
                  href={leader.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A66C2] text-white rounded-lg font-semibold text-sm hover:bg-[#004182] transition-colors"
                >
                  <RiLinkedinFill className="w-5 h-5" />
                  View on LinkedIn
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-vcb-900 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Contact</h2>
          <p className="text-vcb-300 text-lg mb-6">
            Start a conversation with the team. We'll respond with next steps and a meeting slot.
          </p>
          <p className="text-white">
            <strong>Email:</strong>{" "}
            <a href="mailto:info@vcb-ai.online" className="text-vcb-300 hover:text-white transition-colors underline">
              info@vcb-ai.online
            </a>
            {" "}•{" "}
            <strong>Location:</strong> South Africa
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
