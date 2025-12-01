import React, { useState, useRef, useEffect } from "react";
import "./Home.css";

// Material Design Icons - Used icons only
import { 
  MdAnalytics,
  MdPlayCircle,
  MdClose,
} from "react-icons/md";

// Tabler icons
import {
  TbBrain,
  TbLanguage,
  TbEye,
} from "react-icons/tb";

// Remix icons
import {
  RiRobot2Line,
  RiVoiceprintLine,
  RiCustomerService2Line,
  RiShieldCheckLine,
  RiLockLine,
  RiGlobalLine,
  RiSparklingLine,
  RiBrainLine,
  RiTwitterXLine,
  RiLinkedinFill,
  RiGithubFill,
} from "react-icons/ri";

// ============================================================
// HOME PAGE - TEMPLATE-BASED DESIGN WITH VCB + BUA-XI CONTENT
// ============================================================

// --- VIDEO MODAL COMPONENT ---
interface VideoModalProps {
  isOpen: boolean;
  videoSrc: string;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, videoSrc, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-vcb-300 transition-colors"
          aria-label="Close video"
        >
          <MdClose className="w-8 h-8" />
        </button>
        <video
          ref={videoRef}
          className="w-full rounded-xl shadow-2xl"
          controls
          src={videoSrc}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

// --- HERO SECTION ---
const Hero: React.FC = () => {
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; src: string }>({ isOpen: false, src: '' });

  const openVideoModal = (src: string) => {
    setVideoModal({ isOpen: true, src });
  };

  const closeVideoModal = () => {
    setVideoModal({ isOpen: false, src: '' });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 85;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-vcb-900">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-vcb-900 via-vcb-800 to-vcb-700" />
        {/* Animated mesh pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)
          `
        }} />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full min-h-screen flex flex-col justify-center items-center text-center px-6 py-32">
        <div className="animate-fade-in-up w-full max-w-5xl">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-vcb-300 mb-10 px-5 py-2.5 bg-vcb-800/50 border border-vcb-600/50 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            AI-Powered Enterprise Solutions
          </span>
          
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-8 leading-[1.1]">
            Viable Core
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vcb-200 via-vcb-300 to-vcb-200">Business</span>
          </h1>
          
          {/* Tagline */}
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-vcb-200 font-medium leading-relaxed mb-4">
            The First AI That <strong className="text-white">Talks, Hears & Sees</strong>
          </p>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-vcb-400 font-normal leading-relaxed mb-6">
            in All 11 Official South African Languages
          </p>
          
          {/* Description */}
          <p className="max-w-xl mx-auto text-base md:text-lg text-vcb-400 font-light leading-relaxed mb-12">
            Human-first AI agents for revenue & support. Production-ready conversational agents 
            built with enterprise-grade security.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <button 
              onClick={() => openVideoModal('/Dee.mp4')}
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-white text-vcb-900 rounded-full text-sm font-bold uppercase tracking-widest overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
            >
              <MdPlayCircle className="w-5 h-5" />
              <span className="relative z-10">Meet VCB</span>
            </button>
            <button 
              onClick={() => openVideoModal('/vee.mp4')}
              className="group inline-flex items-center gap-3 px-10 py-4 bg-vcb-700 text-white border-2 border-vcb-500 rounded-full text-sm font-bold uppercase tracking-widest hover:border-white hover:bg-vcb-600 transition-all duration-300"
            >
              <MdPlayCircle className="w-5 h-5" />
              Gogga · Coming Soon
            </button>
          </div>

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#products" 
              onClick={(e) => handleNavClick(e, 'products')}
              className="group relative px-10 py-4 bg-vcb-100 text-vcb-900 rounded-full text-sm font-bold uppercase tracking-widest overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
            >
              <span className="relative z-10">Explore Products</span>
            </a>
            <a 
              href="/salesagent" 
              className="group px-10 py-4 bg-vcb-800 text-white border-2 border-vcb-600 rounded-full text-sm font-bold uppercase tracking-widest hover:border-vcb-400 hover:bg-vcb-700 transition-all duration-300"
            >
              Try Sales Agent Demo
            </a>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-vcb-500 text-sm">
            <div className="flex items-center gap-2">
              <RiShieldCheckLine className="w-5 h-5" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <RiLockLine className="w-5 h-5" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <RiGlobalLine className="w-5 h-5" />
              <span>POPIA Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-vcb-500">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-6 h-10 border-2 border-vcb-600 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-vcb-400 rounded-full animate-bounce" />
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal 
        isOpen={videoModal.isOpen} 
        videoSrc={videoModal.src} 
        onClose={closeVideoModal} 
      />
    </section>
  );
};

// --- FEATURES SECTION (BUA-XI Multilingual AI) ---
const Features: React.FC = () => {
  const features = [
    {
      icon: <RiVoiceprintLine className="w-8 h-8 text-white" />,
      title: "Voice Intelligence",
      description: "Natural speech recognition and synthesis across all 11 official South African languages with human-like intonation.",
    },
    {
      icon: <TbEye className="w-8 h-8 text-white" />,
      title: "Vision AI",
      description: "Advanced visual understanding that sees, interprets and responds to images and documents in real-time.",
    },
    {
      icon: <TbLanguage className="w-8 h-8 text-white" />,
      title: "11 Languages",
      description: "Complete multilingual support: Zulu, Xhosa, Afrikaans, English, Sotho, Tswana, Venda, Tsonga, Swati, Ndebele, Pedi.",
    },
    {
      icon: <RiCustomerService2Line className="w-8 h-8 text-white" />,
      title: "Call Center Ready",
      description: "Enterprise-grade deployment for high-volume call centers with 24/7 availability and real-time analytics.",
    },
  ];

  return (
    <section id="products" className="bg-vcb-800 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-vcb-400 mb-4 block">
            Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            AI That Understands Africa
          </h2>
          <p className="max-w-2xl mx-auto text-vcb-300 text-lg font-light">
            Multimodal AI agents engineered for the unique linguistic and cultural landscape of Southern Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-vcb-700 hover:bg-vcb-600 rounded-2xl p-8 transition-all duration-300 border border-vcb-600 hover:border-vcb-500"
            >
              <div className="w-14 h-14 bg-vcb-900 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-vcb-300 font-light leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- ABOUT SECTION ---
const About: React.FC = () => {
  return (
    <section id="about" className="bg-vcb-100">
      {/* Introduction */}
      <div className="py-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-16 md:gap-24">
        <div className="md:w-1/3">
          <h2 className="text-4xl md:text-5xl font-bold text-vcb-900 leading-tight">
            Human-first AI <br /> for African enterprise.
          </h2>
        </div>
        <div className="md:w-2/3 max-w-2xl">
          <p className="text-lg md:text-xl text-vcb-500 font-normal leading-relaxed mb-8">
            Viable Core Business was founded on a simple but radical premise: AI should speak your language—literally. 
            We build production-ready conversational agents that understand the nuances of African languages and cultures.
          </p>
          <p className="text-lg md:text-xl text-vcb-500 font-normal leading-relaxed">
            Our AI-first venture builder focuses on making artificial intelligence useful, secure, and compliant—not just shiny. 
            By pioneering multi-skill fine-tuning on premier foundation models, VCB creates uniquely powerful tools for enterprise.
          </p>
        </div>
      </div>

      {/* Philosophy Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="order-2 lg:order-1 relative h-[500px] lg:h-auto overflow-hidden group bg-vcb-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-12">
              <TbBrain className="w-24 h-24 mx-auto text-vcb-400 mb-6" />
              <p className="text-vcb-500 text-lg font-medium">Intelligent Design</p>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2 flex flex-col justify-center p-12 lg:p-24 bg-vcb-150">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-vcb-500 mb-6">Security First</span>
          <h3 className="text-3xl md:text-4xl font-bold mb-8 text-vcb-900 leading-tight">
            Enterprise-grade <br /> by design.
          </h3>
          <p className="text-lg text-vcb-500 font-normal leading-relaxed max-w-md">
            End-to-end encryption, zero-trust architecture, and comprehensive audit trails. 
            Our AI solutions are built for industries where compliance isn't optional—it's essential.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center p-12 lg:p-24 bg-vcb-900 text-white">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-vcb-400 mb-6">The Platform</span>
          <h3 className="text-3xl md:text-4xl font-bold mb-8 text-white leading-tight">
            From prototype <br /> to production.
          </h3>
          <p className="text-lg text-vcb-300 font-normal leading-relaxed max-w-md">
            Our orchestration platform takes AI agents from concept to enterprise deployment. 
            Real-time monitoring, A/B testing, and seamless scaling—all in one unified dashboard.
          </p>
        </div>
        <div className="relative h-[500px] lg:h-auto overflow-hidden group bg-vcb-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-12">
              <MdAnalytics className="w-24 h-24 mx-auto text-vcb-400 mb-6" />
              <p className="text-vcb-300 text-lg font-medium">Analytics Dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- PRODUCTS/TRACKS SECTION ---
const Tracks: React.FC = () => {
  const tracks = [
    {
      title: "Sales Agent Demo",
      description: "Experience our AI-powered sales automation with real-time multilingual conversations.",
      href: "/salesagent",
      icon: <RiRobot2Line className="w-10 h-10 text-white" />,
    },
    {
      title: "Agentic AI Platform",
      description: "Build, deploy and orchestrate autonomous AI agents for complex enterprise workflows.",
      href: "/agenticai",
      icon: <RiSparklingLine className="w-10 h-10 text-white" />,
    },
    {
      title: "LLM Enterprise",
      description: "Fine-tuned large language models for legal, finance, and regulated industries.",
      href: "/LLM-Ent",
      icon: <RiBrainLine className="w-10 h-10 text-white" />,
    },
  ];

  return (
    <section className="bg-vcb-700 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-vcb-400 mb-4 block">
            Our Products
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Enterprise AI Tracks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tracks.map((track, index) => (
            <a
              key={index}
              href={track.href}
              className="group bg-vcb-100 hover:bg-white rounded-2xl p-10 transition-all duration-300 border border-transparent hover:border-vcb-200 hover:shadow-2xl"
            >
              <div className="w-16 h-16 bg-vcb-900 rounded-xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform duration-300">
                {track.icon}
              </div>
              <h3 className="text-2xl font-bold text-vcb-900 mb-4">{track.title}</h3>
              <p className="text-vcb-500 font-normal leading-relaxed mb-6">{track.description}</p>
              <span className="text-sm font-bold uppercase tracking-widest text-vcb-900 group-hover:underline">
                Learn More →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- STATISTICS SECTION ---
const Statistics: React.FC = () => {
  const stats = [
    { value: "11", label: "Official Languages", suffix: "" },
    { value: "99.7", label: "Uptime SLA", suffix: "%" },
    { value: "50", label: "Response Time", suffix: "ms" },
    { value: "24/7", label: "Support Available", suffix: "" },
  ];

  return (
    <section className="bg-vcb-900 py-20 px-6 border-y border-vcb-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                {stat.value}<span className="text-vcb-400">{stat.suffix}</span>
              </div>
              <p className="text-vcb-400 text-sm md:text-base uppercase tracking-wider font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- PARTNERS/TRUST SECTION ---
const Partners: React.FC = () => {
  return (
    <section className="bg-vcb-100 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-vcb-400 text-sm uppercase tracking-[0.2em] mb-12 font-medium">
          Trusted by Enterprise Leaders
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-60">
          {/* Placeholder logos - replace with actual partner SVGs */}
          {['Enterprise', 'FinTech', 'LegalTech', 'TeleCom', 'Banking'].map((name, i) => (
            <div key={i} className="text-vcb-500 font-bold text-xl tracking-wider">
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- CTA SECTION ---
const CallToAction: React.FC = () => {
  return (
    <section className="bg-vcb-800 py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to transform your customer experience?
        </h2>
        <p className="text-vcb-300 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto">
          Join the enterprises already using VCB's multilingual AI to connect with customers in their native language.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="/contact" 
            className="px-10 py-4 bg-white text-vcb-900 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-vcb-100 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Schedule a Demo
          </a>
          <a 
            href="/salesagent" 
            className="px-10 py-4 bg-vcb-700 text-white border-2 border-vcb-500 rounded-full text-sm font-bold uppercase tracking-widest hover:border-vcb-300 hover:bg-vcb-600 transition-all duration-300"
          >
            Try It Free
          </a>
        </div>
      </div>
    </section>
  );
};

// --- FOOTER ---
const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubscribe = () => {
    if (!email) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1500);
  };

  return (
    <footer className="bg-vcb-900 pt-24 pb-12 px-6 text-vcb-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        
        <div className="md:col-span-4">
          <h4 className="text-2xl font-bold text-white mb-6">Viable Core Business</h4>
          <p className="max-w-xs font-normal leading-relaxed mb-6">
            Human-first AI agents for enterprise. Production-ready solutions built with security, compliance, and African languages at their core.
          </p>
          {/* Social Links */}
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-vcb-800 flex items-center justify-center text-vcb-400 hover:bg-vcb-700 hover:text-white transition-all">
              <RiTwitterXLine className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-vcb-800 flex items-center justify-center text-vcb-400 hover:bg-vcb-700 hover:text-white transition-all">
              <RiLinkedinFill className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-vcb-800 flex items-center justify-center text-vcb-400 hover:bg-vcb-700 hover:text-white transition-all">
              <RiGithubFill className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-white mb-6 tracking-wide text-sm uppercase">Products</h4>
          <ul className="space-y-4 font-normal">
            <li><a href="/salesagent" className="hover:text-white transition-colors">Sales Agent Demo</a></li>
            <li><a href="/agenticai" className="hover:text-white transition-colors">Agentic AI</a></li>
            <li><a href="/LLM-Ent" className="hover:text-white transition-colors">LLM Enterprise</a></li>
            <li><a href="/salesagent" className="hover:text-white transition-colors">Sales Agent</a></li>
          </ul>
        </div>
        
        <div className="md:col-span-2">
          <h4 className="font-bold text-white mb-6 tracking-wide text-sm uppercase">Company</h4>
          <ul className="space-y-4 font-normal">
            <li><a href="/aboutus" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="/Partners" className="hover:text-white transition-colors">Partners</a></li>
            <li><a href="/Compliance" className="hover:text-white transition-colors">Compliance</a></li>
            <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="font-bold text-white mb-6 tracking-wide text-sm uppercase">Stay Updated</h4>
          <p className="text-vcb-400 mb-4 text-sm">Get the latest on African AI innovation.</p>
          <div className="flex flex-col gap-3">
            <input 
              type="email" 
              placeholder="your@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status !== 'idle'}
              className="bg-vcb-800 border border-vcb-700 rounded-lg py-3 px-4 text-white placeholder-vcb-500 outline-none focus:border-vcb-500 transition-colors disabled:opacity-50" 
            />
            <button 
              onClick={handleSubscribe}
              disabled={status !== 'idle' || !email}
              className="w-full px-6 py-3 bg-white text-vcb-900 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-vcb-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'idle' && 'Subscribe'}
              {status === 'loading' && 'Subscribing...'}
              {status === 'success' && '✓ Subscribed'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-vcb-800 flex flex-col md:flex-row justify-between items-center text-xs uppercase tracking-widest">
        <p>© {new Date().getFullYear()} Viable Core Business. All rights reserved.</p>
        <p className="mt-4 md:mt-0">Built in South Africa 🇿🇦</p>
      </div>
    </footer>
  );
};

// ============================================================
// MAIN HOME COMPONENT
// ============================================================
const Home: React.FC = () => {
  return (
    <div className="home-root">
      <Hero />
      <Features />
      <Statistics />
      <Tracks />
      <About />
      <Partners />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Home;
