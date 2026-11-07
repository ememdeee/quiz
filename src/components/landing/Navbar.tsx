"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useQuizUrl } from "@/hooks/useQuizUrl";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const quizUrl = useQuizUrl();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const toggleMenu = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${isOpen ? "duration-0 bg-transparent" : `duration-300 ${isScrolled ? "bg-[#DFF3EC]/90 backdrop-blur-md border-b border-[#0F4D3A]/10 shadow-sm" : "bg-transparent py-4"}`
        } ${isScrolled ? "" : "py-4"}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className={`text-2xl font-black tracking-tighter uppercase flex items-center gap-1 group ${isOpen ? "text-[#DFF3EC]" : "text-[#0F4D3A]"} transition-colors`}>
          <span className={`${isOpen ? "text-white" : "text-[#155F4A]"} group-hover:animate-pulse transition-colors`}>Quiz</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Benefits", "Results", "Methods", "Reviews"].map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item.toLowerCase())}
              className="text-sm font-bold text-[#155F4A] hover:text-[#0F4D3A] transition-colors uppercase tracking-widest relative group cursor-pointer"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0F4D3A] transition-all group-hover:w-full" />
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <Link
            href={quizUrl}
            className="bg-[#0F4D3A] text-white px-6 py-2 rounded-full font-bold text-sm tracking-wide hover:bg-[#155F4A] transition-transform active:scale-95 uppercase shadow-lg shadow-[#0F4D3A]/20"
          >
            Take Quiz
          </Link>
        </div>

        {/* Mobile Menu Toggle (Hamburger/Close) */}
        <button
          className={`md:hidden transition-colors relative z-50 ${isOpen ? "text-[#DFF3EC] hover:text-white" : "text-[#0F4D3A] hover:text-[#155F4A]"}`}
          onClick={toggleMenu}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className={`md:hidden fixed inset-0 z-40 bg-[#0F4D3A] flex flex-col items-center justify-center overscroll-none pt-20 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
          style={{ animationDuration: '0.3s', animationTimingFunction: 'ease-out' }}
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9F84B] rounded-full filter blur-[100px] opacity-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3E8F7A] rounded-full filter blur-[100px] opacity-20 pointer-events-none" />

          <div className="flex flex-col items-center gap-8 relative z-10">
            {["Benefits", "Results", "Methods", "Reviews"].map((item) => (
              <div key={item}>
                <button
                  onClick={() => { handleClose(); setTimeout(() => scrollTo(item.toLowerCase()), 320); }}
                  className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#DFF3EC] hover:to-[#C9F84B] transition-all uppercase tracking-tighter cursor-pointer"
                >
                  {item}
                </button>
              </div>
            ))}

            <div className="mt-8">
              <Link
                href={quizUrl}
                onClick={handleClose}
                className="inline-block bg-[#C9F84B] text-[#0F4D3A] px-12 py-4 rounded-full font-black text-xl tracking-wide hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(201,248,75,0.4)]"
              >
                Start Quiz
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
