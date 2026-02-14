import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPageBySlug } from '@/lib/wordpress';
import { getCanonicalUrl } from '@/lib/site-config';
import { Download } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
    const page = await getPageBySlug('resume');
    if (!page) return { title: 'Resume', alternates: { canonical: getCanonicalUrl('/resume') } };
    return {
        title: page.title.rendered.replace(/<[^>]*>/g, '').trim() || 'Resume',
        description: 'Resume / Lebenslauf — Professional experience, education, and skills. Download or view online.',
        alternates: { canonical: getCanonicalUrl('/resume') },
    };
}

// Section heading component
function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-white mb-4 pb-2 border-b border-zinc-300 dark:border-zinc-700">
            {children}
        </h2>
    );
}

// Work experience entry component
function WorkEntry({
    dateRange,
    title,
    company,
    responsibilities,
}: {
    dateRange: string;
    title: string;
    company: string;
    responsibilities: string[];
}) {
    return (
        <div className="mb-8">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{dateRange}</p>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{company}</p>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-0.5">
                {responsibilities.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

// Education entry component
function EducationEntry({
    dateRange,
    degree,
    institution,
}: {
    dateRange: string;
    degree: string;
    institution: string;
}) {
    return (
        <div className="mb-6">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{dateRange}</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-white uppercase">{degree}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{institution}</p>
        </div>
    );
}

export default async function ResumePage() {
    const page = await getPageBySlug('resume');

    if (!page) {
        notFound();
    }

    // Static resume data - can be replaced with ACF/Meta Box fields if available
    const resumeData = {
        aboutMe: `As a designer I have specialized in the conception of interactive systems, illustrations and animations. Thereby I was able to gain valuable experience in design processes, as well as in the areas of UI and UX design aswell as web app and plugin development up to the realization of full stack websites.`,
        education: [
            { dateRange: '2016 – 2021', degree: 'Communication Design', institution: 'HS Düsseldorf' },
            { dateRange: '2006 – 2007', degree: 'Int. Studies Web Design & Development', institution: 'SAE Berlin' },
            { dateRange: '2001 – 2002', degree: 'Fachabitur Design', institution: 'Richard-Riemerschmidt-Berufskolleg Cologne' },
        ],
        workExperience: [
            {
                dateRange: '10/2022 – 05/2026',
                title: 'Art Director Digital / AI Specialist',
                company: 'TAKTZEIT Marketing GmbH, Düsseldorf',
                responsibilities: ['UX/UI Design / Illustration / Animation for marketing automotive campaigns'],
            },
            {
                dateRange: '12/2019 – 08/2020',
                title: 'Student Assistant Marketing',
                company: 'SuperCode GmbH, Düsseldorf',
                responsibilities: [
                    'Social Media Management / Conzept/ Design / Animation',
                    'UX/UI Design of the cooperate website',
                    'Content Management',
                ],
            },
            {
                dateRange: '08/2018 – 11/2019',
                title: 'Marketing / Creation',
                company: 'ARAG SE, Düsseldorf',
                responsibilities: [
                    'Social Media Design / Animation',
                    'UX/UI Design / Illustration / Animation',
                    'Video Production / Animation',
                ],
            },
            {
                dateRange: '12/2012 – 11/2013',
                title: 'Motion- & UI Designer / Illustrator',
                company: 'Elements of Art GmbH, Mönchengladbach',
                responsibilities: ['Game + UX / UI Design / Animation / Illustration of child-friendly content for web & apps'],
            },
            {
                dateRange: '02/2011 – 10/2012',
                title: 'Motion & UI Designer',
                company: 'Web Guerilla GmbH, Berlin',
                responsibilities: [
                    'Social Media Design / Animation',
                    'UX/UI App Design / Illustration / Conzept',
                    'Video Production / Motion Design',
                ],
            },
        ],
        freelance: {
            dateRange: '2008 – Today',
            label: 'Freelance Clients:',
            clients: 'V4 Media, Mindnapped Productions',
        },
        languageSkills: [
            { language: 'German', level: 'fluent' },
            { language: 'English', level: 'Fluent in negotiations' },
        ],
        socialMedia: ['linkedin.com/in/felix-seeger-128374b2/'],
        interests: ['Photography', 'Climbing', 'Running'],
        personal: {
            name: 'Felix Seeger',
            birthdate: '30.05.1982',
            email: 'mail@felixseeger.de',
            addressLine1: 'Schanzenstr. 26',
            addressLine2: '40549 Düsseldorf',
        },
    };

    return (
        <div className="min-h-screen bg-white dark:bg-background py-24 px-6 lg:px-10" suppressHydrationWarning>
            <article className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="mb-12">
                    <h1
                        className="text-4xl md:text-5xl font-unbounded font-black text-zinc-900 dark:text-white mb-6 pb-4 border-b-2 border-zinc-900 dark:border-white"
                        dangerouslySetInnerHTML={{ __html: page.title.rendered }}
                    />
                    <Link
                        href="/resume.pdf"
                        target="_blank"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-900 dark:border-white text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 font-medium text-sm rounded transition-colors"
                    >
                        <Download size={16} />
                        PRINT DOWNLOAD
                    </Link>
                </header>

                {/* Three Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Left Column - About Me & Education */}
                    <div className="space-y-10">
                        {/* About Me */}
                        <section>
                            <SectionHeading>ABOUT ME</SectionHeading>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {resumeData.aboutMe}
                            </p>
                        </section>

                        {/* Education */}
                        <section>
                            <SectionHeading>EDUCATION</SectionHeading>
                            {resumeData.education.map((edu, index) => (
                                <EducationEntry
                                    key={index}
                                    dateRange={edu.dateRange}
                                    degree={edu.degree}
                                    institution={edu.institution}
                                />
                            ))}
                        </section>
                    </div>

                    {/* Middle Column - Work Experience */}
                    <div>
                        <section>
                            <SectionHeading>WORK EXPERIENCE</SectionHeading>
                            {resumeData.workExperience.map((work, index) => (
                                <WorkEntry
                                    key={index}
                                    dateRange={work.dateRange}
                                    title={work.title}
                                    company={work.company}
                                    responsibilities={work.responsibilities}
                                />
                            ))}
                        </section>
                    </div>

                    {/* Right Column - Freelance, Skills, Personal */}
                    <div className="space-y-10">
                        {/* Freelance */}
                        <section>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{resumeData.freelance.dateRange}</p>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{resumeData.freelance.label}</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{resumeData.freelance.clients}</p>
                        </section>

                        {/* Language Skills */}
                        <section>
                            <SectionHeading>LANGUAGE SKILLS</SectionHeading>
                            <div className="space-y-1">
                                {resumeData.languageSkills.map((skill, index) => (
                                    <p key={index} className="text-sm text-zinc-600 dark:text-zinc-400">
                                        {skill.language}: {skill.level}
                                    </p>
                                ))}
                            </div>
                        </section>

                        {/* Social Media */}
                        <section>
                            <SectionHeading>SOCIAL MEDIA</SectionHeading>
                            <div className="space-y-1">
                                {resumeData.socialMedia.map((link, index) => (
                                    <a
                                        key={index}
                                        href={`https://${link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                    >
                                        {link}
                                    </a>
                                ))}
                            </div>
                        </section>

                        {/* Interests */}
                        <section>
                            <SectionHeading>INTERESTS</SectionHeading>
                            <ul className="text-sm text-zinc-600 dark:text-zinc-400 list-disc list-inside space-y-1">
                                {resumeData.interests.map((interest, index) => (
                                    <li key={index}>{interest}</li>
                                ))}
                            </ul>
                        </section>

                        {/* Personal */}
                        <section>
                            <SectionHeading>PERSONAL</SectionHeading>
                            <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                                <p className="font-medium text-zinc-900 dark:text-white">{resumeData.personal.name}</p>
                                {resumeData.personal.birthdate && <p>{resumeData.personal.birthdate}</p>}
                                <p>E: {resumeData.personal.email}</p>
                                {resumeData.personal.addressLine1 && <p>A: {resumeData.personal.addressLine1}</p>}
                                {resumeData.personal.addressLine2 && <p>{resumeData.personal.addressLine2}</p>}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Optional: Render WordPress content below if it contains additional info */}
                {page.content.rendered && page.content.rendered.trim() !== '' && (
                    <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                        <div
                            className="prose prose-zinc lg:prose-lg dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
                        />
                    </div>
                )}
            </article>
        </div>
    );
}
