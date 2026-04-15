// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Features from "../components/Features";
import CTA from "../components/Cta";
import TrustedBadge from "../components/TrustBadge.jsx";
import Testimonials from "../components/Testimonials.jsx";
import PerfectForEveryone from "../components/PerfectForEveryone.jsx";
import CareerCTA from "../components/CareerCta.jsx";
import Stats from "../components/Stats.jsx";

const Home = () => {
  return (
    <> 
    <Hero/>
    <Features/>
    <Stats/>
    <CTA/>
    <TrustedBadge/>
    <Testimonials/>
    <PerfectForEveryone/>
    <CareerCTA/>
    
    </>
 
  );
};

export default Home;
