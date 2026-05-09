import React, { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { Trash2, Plus, Download, LayoutTemplate, Briefcase, GraduationCap, Code, FileText, User } from "lucide-react";

export default function ResumeBuilder() {
  const componentRef = useRef();
  const containerRef = useRef(null);
  
  // -- STATE --
  const [scale, setScale] = useState(1);
  const [template, setTemplate] = useState(1);
  const [personalInfo, setPersonalInfo] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 8900",
    linkedin: "linkedin.com/in/johndoe",
    portfolio: "johndoe.com",
    summary: "Dedicated and detail-oriented professional with 5+ years of experience in developing scalable web applications. Strong team player with a passion for continuous learning."
  });
  
  const [experience, setExperience] = useState([
    { id: 1, title: "Senior Software Engineer", company: "Tech Solutions Inc.", start: "Jan 2021", end: "Present", description: "Led the development of a microservices architecture. Mentored junior developers and improved system performance by 30%." }
  ]);
  
  const [education, setEducation] = useState([
    { id: 1, degree: "B.S. in Computer Science", school: "University of Technology", start: "2015", end: "2019" }
  ]);

  const [projects, setProjects] = useState([
    { id: 1, name: "E-Commerce Platform", technologies: "React, Node.js, MongoDB", description: "Built a full-stack e-commerce platform with Stripe integration handling over 10k monthly active users." }
  ]);
  
  const [skills, setSkills] = useState("JavaScript, React, Node.js, Python, SQL, Git");

  // -- HANDLERS --
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Calculate available width minus padding (e.g. 40px)
        const availableWidth = containerRef.current.offsetWidth - 40;
        const requiredWidth = 816; // 8.5 inches in pixels
        if (availableWidth < requiredWidth) {
          setScale(availableWidth / requiredWidth);
        } else {
          setScale(1);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDownloadPdf = () => {
    const element = componentRef.current;
    const opt = {
      margin:       0,
      filename:     `${personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const handleInfoChange = (e) => setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });

  const addExperience = () => setExperience([...experience, { id: Date.now(), title: "", company: "", start: "", end: "", description: "" }]);
  const updateExperience = (id, field, value) => setExperience(experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  const removeExperience = (id) => setExperience(experience.filter(exp => exp.id !== id));

  const addEducation = () => setEducation([...education, { id: Date.now(), degree: "", school: "", start: "", end: "" }]);
  const updateEducation = (id, field, value) => setEducation(education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  const removeEducation = (id) => setEducation(education.filter(edu => edu.id !== id));

  const addProject = () => setProjects([...projects, { id: Date.now(), name: "", technologies: "", description: "" }]);
  const updateProject = (id, field, value) => setProjects(projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj));
  const removeProject = (id) => setProjects(projects.filter(proj => proj.id !== id));

  // -- TEMPLATES --
  
  // Template 1: Jake's Resume (Standard Software Engineering Template)
  const TemplateOne = () => (
    <div className="px-10 py-10 font-serif text-black bg-white min-h-[1056px] text-[13px] leading-snug" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      <header className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-1">{personalInfo.name}</h1>
        <div className="flex flex-wrap justify-center items-center gap-1.5 text-sm">
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.email && <span>|</span>}
          {personalInfo.email && <span className="underline">{personalInfo.email}</span>}
          {personalInfo.linkedin && <span>|</span>}
          {personalInfo.linkedin && <span className="underline">{personalInfo.linkedin}</span>}
          {personalInfo.portfolio && <span>|</span>}
          {personalInfo.portfolio && <span className="underline">{personalInfo.portfolio}</span>}
        </div>
      </header>

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[14px] font-bold uppercase border-b border-black mb-1.5">Education</h2>
          {education.map(edu => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline font-bold">
                <span>{edu.school}</span>
                <span className="font-normal">{edu.start} – {edu.end}</span>
              </div>
              <div className="flex justify-between items-baseline italic">
                <span>{edu.degree}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[14px] font-bold uppercase border-b border-black mb-1.5">Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-baseline font-bold">
                <span>{exp.title}</span>
                <span className="font-normal">{exp.start} – {exp.end}</span>
              </div>
              <div className="italic mb-1">{exp.company}</div>
              <ul className="list-disc list-outside ml-4 space-y-0.5">
                {exp.description.split(/(?:\r?\n|\.\s+)/).filter(point => point.trim().length > 0).map((point, i) => (
                  <li key={i}>{point.trim()}{point.trim().endsWith('.') ? '' : '.'}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[14px] font-bold uppercase border-b border-black mb-1.5">Projects</h2>
          {projects.map(proj => (
            <div key={proj.id} className="mb-3">
              <div className="flex justify-between items-baseline font-bold">
                <span>{proj.name} <span className="font-normal italic">| {proj.technologies}</span></span>
              </div>
              <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5">
                {proj.description.split(/(?:\r?\n|\.\s+)/).filter(point => point.trim().length > 0).map((point, i) => (
                  <li key={i}>{point.trim()}{point.trim().endsWith('.') ? '' : '.'}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills && (
        <section className="mb-4">
          <h2 className="text-[14px] font-bold uppercase border-b border-black mb-1.5">Technical Skills</h2>
          <p><strong>Languages & Technologies:</strong> {skills}</p>
        </section>
      )}
    </div>
  );

  // Template 2: Professional Classic
  const TemplateTwo = () => (
    <div className="p-0 font-sans text-gray-800 bg-white min-h-[1056px] flex">
      {/* Left Column */}
      <div className="w-[35%] bg-[#2C3E50] text-white p-8 space-y-8 flex flex-col">
        <div>
          <h1 className="text-3xl font-bold tracking-wide leading-tight">{personalInfo.name}</h1>
        </div>
        
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-500 pb-1 mb-3">Contact</h2>
          <div className="space-y-3 text-sm text-gray-300">
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.linkedin && <div>{personalInfo.linkedin}</div>}
            {personalInfo.portfolio && <div>{personalInfo.portfolio}</div>}
          </div>
        </div>

        {education.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-500 pb-1 mb-3">Education</h2>
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id}>
                  <div className="font-bold text-sm text-white">{edu.degree}</div>
                  <div className="text-xs text-gray-300 mt-1">{edu.school}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{edu.start} - {edu.end}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {skills && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-500 pb-1 mb-3">Skills</h2>
            <p className="text-sm text-gray-300 leading-relaxed">{skills}</p>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="w-[65%] p-8 bg-white flex flex-col gap-6">
        {personalInfo.summary && (
          <section>
            <h2 className="text-lg font-bold uppercase text-[#2C3E50] mb-2 tracking-wide">Professional Summary</h2>
            <p className="text-[13px] leading-relaxed text-gray-700">{personalInfo.summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase text-[#2C3E50] mb-3 tracking-wide border-b-2 border-gray-100 pb-1">Experience</h2>
            <div className="space-y-5">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-end mb-0.5">
                    <span className="font-bold text-[15px] text-[#2C3E50]">{exp.title}</span>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{exp.start} - {exp.end}</span>
                  </div>
                  <div className="text-[13px] font-semibold text-gray-500 mb-1.5">{exp.company}</div>
                  <ul className="list-disc list-outside ml-4 text-[13px] text-gray-700 space-y-1">
                    {exp.description.split(/(?:\r?\n|\.\s+)/).filter(point => point.trim().length > 0).map((point, i) => (
                      <li key={i}>{point.trim()}{point.trim().endsWith('.') ? '' : '.'}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase text-[#2C3E50] mb-3 tracking-wide border-b-2 border-gray-100 pb-1">Projects</h2>
            <div className="space-y-4">
              {projects.map(proj => (
                <div key={proj.id}>
                  <div className="font-bold text-[14px] text-[#2C3E50]">{proj.name}</div>
                  <div className="text-[12px] font-semibold text-gray-500 mb-1">{proj.technologies}</div>
                  <p className="text-[13px] text-gray-700 leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  // Template 3: Creative Accent
  const TemplateThree = () => (
    <div className="px-12 py-10 font-sans text-gray-800 bg-white min-h-[1056px]">
      <header className="flex items-center gap-6 mb-8 pb-6 border-b-2 border-gray-100">
        <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shrink-0 shadow-lg shadow-pink-500/30">
          {personalInfo.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{personalInfo.name}</h1>
          <div className="flex flex-wrap gap-3 mt-3 text-[13px] text-pink-600 font-semibold tracking-wide uppercase">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
          </div>
        </div>
      </header>

      {personalInfo.summary && (
        <section className="mb-8 relative">
          <div className="absolute left-0 top-0 w-1 h-full bg-pink-500 rounded-full"></div>
          <p className="pl-5 text-[14px] leading-relaxed text-gray-600 font-medium">{personalInfo.summary}</p>
        </section>
      )}

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          {experience.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                <span className="w-6 h-1 bg-pink-500 rounded-full"></span> Experience
              </h2>
              <div className="space-y-6">
                {experience.map(exp => (
                  <div key={exp.id} className="relative pl-5 border-l-2 border-gray-100">
                    <div className="absolute w-3 h-3 bg-pink-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    <div className="font-bold text-lg text-gray-900">{exp.title}</div>
                    <div className="text-[13px] text-pink-600 font-semibold mb-2">{exp.company} <span className="text-gray-400 font-normal ml-1">• {exp.start} - {exp.end}</span></div>
                    <ul className="list-disc list-outside ml-4 text-[13px] text-gray-600 space-y-1">
                      {exp.description.split(/(?:\r?\n|\.\s+)/).filter(point => point.trim().length > 0).map((point, i) => (
                        <li key={i}>{point.trim()}{point.trim().endsWith('.') ? '' : '.'}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                <span className="w-6 h-1 bg-pink-500 rounded-full"></span> Projects
              </h2>
              <div className="space-y-6">
                {projects.map(proj => (
                  <div key={proj.id} className="relative pl-5 border-l-2 border-gray-100">
                    <div className="absolute w-3 h-3 bg-pink-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    <div className="font-bold text-md text-gray-900">{proj.name}</div>
                    <div className="text-[12px] text-pink-500 font-semibold mb-1">{proj.technologies}</div>
                    <p className="text-[13px] text-gray-600 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          {education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-4 h-1 bg-pink-500 rounded-full"></span> Education
              </h2>
              <div className="space-y-4">
                {education.map(edu => (
                  <div key={edu.id}>
                    <div className="font-bold text-[14px] text-gray-900">{edu.degree}</div>
                    <div className="text-[13px] text-gray-500 mt-0.5">{edu.school}</div>
                    <div className="text-[12px] text-pink-500 font-semibold mt-0.5">{edu.start} - {edu.end}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-4 h-1 bg-pink-500 rounded-full"></span> Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.split(',').map((skill, i) => (
                  <span key={i} className="bg-pink-50 text-pink-700 text-[12px] px-3 py-1.5 rounded-full border border-pink-200 font-semibold">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#071026] text-white pt-24 px-4 sm:px-8 pb-10">
      <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-8 h-[85vh]">
        
        {/* LEFT COL: FORM */}
        <div className="w-full xl:w-1/2 bg-[#0F172A] border border-gray-700 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-gray-700 bg-gray-900/50">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400 flex items-center gap-2">
              <FileText className="w-6 h-6 text-pink-400" /> Resume Builder
            </h2>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
            {/* Personal Info */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                <User className="w-5 h-5 text-indigo-400" /> Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="name" value={personalInfo.name} onChange={handleInfoChange} placeholder="Full Name" className="w-full p-2.5 rounded-lg bg-gray-800/80 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" />
                <input name="email" value={personalInfo.email} onChange={handleInfoChange} placeholder="Email" className="w-full p-2.5 rounded-lg bg-gray-800/80 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" />
                <input name="phone" value={personalInfo.phone} onChange={handleInfoChange} placeholder="Phone" className="w-full p-2.5 rounded-lg bg-gray-800/80 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" />
                <input name="linkedin" value={personalInfo.linkedin} onChange={handleInfoChange} placeholder="LinkedIn URL" className="w-full p-2.5 rounded-lg bg-gray-800/80 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" />
                <input name="portfolio" value={personalInfo.portfolio} onChange={handleInfoChange} placeholder="Portfolio URL" className="w-full sm:col-span-2 p-2.5 rounded-lg bg-gray-800/80 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" />
                <textarea name="summary" value={personalInfo.summary} onChange={handleInfoChange} placeholder="Professional Summary" rows="3" className="w-full sm:col-span-2 p-2.5 rounded-lg bg-gray-800/80 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition resize-none" />
              </div>
            </section>

            {/* Experience */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                <Briefcase className="w-5 h-5 text-pink-400" /> Experience
              </h3>
              {experience.map((exp, idx) => (
                <div key={exp.id} className="mb-4 p-5 bg-gray-800/40 rounded-xl border border-gray-700 relative group">
                  <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)} placeholder="Job Title" className="w-full p-2 rounded-md bg-gray-900/50 text-sm text-white border border-gray-600 focus:border-pink-500 outline-none" />
                    <input value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company" className="w-full p-2 rounded-md bg-gray-900/50 text-sm text-white border border-gray-600 focus:border-pink-500 outline-none" />
                    <input value={exp.start} onChange={e => updateExperience(exp.id, 'start', e.target.value)} placeholder="Start Date (e.g. Jan 2021)" className="w-full p-2 rounded-md bg-gray-900/50 text-sm text-white border border-gray-600 focus:border-pink-500 outline-none" />
                    <input value={exp.end} onChange={e => updateExperience(exp.id, 'end', e.target.value)} placeholder="End Date (e.g. Present)" className="w-full p-2 rounded-md bg-gray-900/50 text-sm text-white border border-gray-600 focus:border-pink-500 outline-none" />
                  </div>
                  <textarea value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} placeholder="Responsibilities & Achievements (Periods or Newlines will create bullets)" rows="3" className="w-full p-2 rounded-md bg-gray-900/50 text-sm text-white border border-gray-600 focus:border-pink-500 outline-none resize-none" />
                </div>
              ))}
              <button onClick={addExperience} className="flex items-center gap-1.5 text-sm font-semibold text-pink-400 hover:text-pink-300 transition bg-pink-500/10 hover:bg-pink-500/20 px-4 py-2 rounded-lg mt-2"><Plus className="w-4 h-4"/> Add Experience</button>
            </section>

            {/* Projects */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                <Code className="w-5 h-5 text-cyan-400" /> Projects
              </h3>
              {projects.map((proj) => (
                <div key={proj.id} className="mb-4 p-5 bg-gray-800/40 rounded-xl border border-gray-700 relative group">
                  <button onClick={() => removeProject(proj.id)} className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                  <div className="grid grid-cols-1 gap-3 mb-3">
                    <input value={proj.name} onChange={e => updateProject(proj.id, 'name', e.target.value)} placeholder="Project Name" className="w-full p-2 rounded-md bg-gray-900/50 text-sm text-white border border-gray-600 focus:border-cyan-500 outline-none" />
                    <input value={proj.technologies} onChange={e => updateProject(proj.id, 'technologies', e.target.value)} placeholder="Technologies (e.g. React, Node.js)" className="w-full p-2 rounded-md bg-gray-900/50 text-sm text-white border border-gray-600 focus:border-cyan-500 outline-none" />
                  </div>
                  <textarea value={proj.description} onChange={e => updateProject(proj.id, 'description', e.target.value)} placeholder="Project Description" rows="2" className="w-full p-2 rounded-md bg-gray-900/50 text-sm text-white border border-gray-600 focus:border-cyan-500 outline-none resize-none" />
                </div>
              ))}
              <button onClick={addProject} className="flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-2 rounded-lg mt-2"><Plus className="w-4 h-4"/> Add Project</button>
            </section>

            {/* Education */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                <GraduationCap className="w-5 h-5 text-emerald-400" /> Education
              </h3>
              {education.map((edu, idx) => (
                <div key={edu.id} className="mb-4 p-5 bg-gray-800/40 rounded-xl border border-gray-700 relative group">
                  <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Degree" className="w-full p-2 rounded-md bg-gray-900/50 text-sm text-white border border-gray-600 focus:border-emerald-500 outline-none" />
                    <input value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} placeholder="Institution" className="w-full p-2 rounded-md bg-gray-900/50 text-sm text-white border border-gray-600 focus:border-emerald-500 outline-none" />
                    <input value={edu.start} onChange={e => updateEducation(edu.id, 'start', e.target.value)} placeholder="Start Year" className="w-full p-2 rounded-md bg-gray-900/50 text-sm text-white border border-gray-600 focus:border-emerald-500 outline-none" />
                    <input value={edu.end} onChange={e => updateEducation(edu.id, 'end', e.target.value)} placeholder="End Year" className="w-full p-2 rounded-md bg-gray-900/50 text-sm text-white border border-gray-600 focus:border-emerald-500 outline-none" />
                  </div>
                </div>
              ))}
              <button onClick={addEducation} className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-lg mt-2"><Plus className="w-4 h-4"/> Add Education</button>
            </section>

            {/* Skills */}
            <section className="pb-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                <LayoutTemplate className="w-5 h-5 text-purple-400" /> Skills
              </h3>
              <textarea value={skills} onChange={e => setSkills(e.target.value)} placeholder="Comma separated skills..." rows="2" className="w-full p-3 rounded-lg bg-gray-800/80 text-white border border-gray-600 focus:border-purple-500 outline-none resize-none" />
            </section>
          </div>
        </div>

        {/* RIGHT COL: PREVIEW & EXPORT */}
        <div className="w-full xl:w-1/2 flex flex-col h-full gap-4">
          <div className="flex flex-wrap items-center justify-between bg-[#0F172A] border border-gray-700 rounded-2xl p-4 shadow-xl shrink-0">
            <div className="flex items-center gap-3">
              <LayoutTemplate className="w-5 h-5 text-indigo-400" />
              <select 
                value={template} 
                onChange={e => setTemplate(Number(e.target.value))}
                className="bg-gray-800 text-white border border-gray-600 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value={1}>Jake's Resume (Standard)</option>
                <option value={2}>Professional Classic</option>
                <option value={3}>Creative Accent</option>
              </select>
            </div>
            
            <button 
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-lg font-bold transition shadow-lg shadow-indigo-500/30 active:scale-95"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>

          {/* PDF VIEWER CANVAS */}
          <div ref={containerRef} className="bg-[#1E293B] rounded-2xl overflow-x-hidden overflow-y-auto flex-1 border border-gray-700 shadow-inner relative custom-scrollbar">
            <div className="w-full flex justify-center py-8 pb-20">
               <div 
                 className="origin-top" 
                 style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
               >
                 <div 
                   ref={componentRef} 
                   className="w-[816px] min-h-[1056px] bg-white shadow-2xl mx-auto"
                   style={{ boxSizing: 'border-box' }}
                 >
                    {template === 1 && <TemplateOne />}
                    {template === 2 && <TemplateTwo />}
                    {template === 3 && <TemplateThree />}
                 </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
