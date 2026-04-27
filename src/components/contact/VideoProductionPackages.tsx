"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { 
    Check, 
    Video, 
    Camera, 
    Crown, 
    Calendar, 
    MapPin, 
    Edit3, 
    Sparkles, 
    Plane, 
    ShieldCheck, 
    Download,
    Clock,
    Zap,
    Film,
    BookOpen
} from "lucide-react";

const packages = [
    {
        name: "BRONZE",
        price: "$500",
        color: "from-[#b87333]/20 via-[#b87333]/10 to-transparent",
        borderColor: "border-[#b87333]/50",
        textColor: "text-[#b87333]",
        gradientText: "from-[#e6a87c] to-[#b87333]",
        icon: Video,
        features: [
            { icon: Calendar, text: "1-DAY SHOOT (UP TO 4 HOURS)" },
            { icon: MapPin, text: "UP TO 2 LOCATIONS" },
            { icon: Edit3, text: "1 REVISION" },
            { icon: Sparkles, text: "COLOR GRADING" },
            { icon: ScissorsIcon, text: "BASIC EDITING & SIMPLE EFFECTS" },
        ],
        turnaround: "10 DAYS"
    },
    {
        name: "SILVER",
        price: "$1,000",
        color: "from-zinc-300/20 via-zinc-400/10 to-transparent",
        borderColor: "border-zinc-300/50",
        textColor: "text-zinc-300",
        gradientText: "from-white to-zinc-400",
        icon: Film,
        popular: true,
        features: [
            { icon: Calendar, text: "2-DAY SHOOT (UP TO 10 HOURS TOTAL)" },
            { icon: MapPin, text: "UP TO 4 LOCATIONS (PEERSPACE STUDIO INCLUDED)" },
            { icon: BookOpen, text: "STORYLINE / CONCEPT" },
            { icon: Sparkles, text: "COLOR GRADING" },
            { icon: Zap, text: "SPECIAL EFFECTS & AI ANIMATION" },
            { icon: Video, text: "VIDEO TRAILER" },
            { icon: Camera, text: "DIGITAL + FILM PHOTOS" },
            { icon: Edit3, text: "3 REVISIONS" },
        ],
        turnaround: "7 DAYS"
    },
    {
        name: "GOLD",
        price: "$5,000",
        color: "from-yellow-400/20 via-yellow-500/10 to-transparent",
        borderColor: "border-yellow-400/50",
        textColor: "text-yellow-400",
        gradientText: "from-yellow-200 to-yellow-600",
        icon: Crown,
        features: [
            { icon: Calendar, text: "4-DAY SHOOT (UP TO 20 HOURS TOTAL)" },
            { icon: MapPin, text: "UP TO 5 LOCATIONS (PEERSPACE STUDIO INCLUDED)" },
            { icon: BookOpen, text: "STORYLINE / FULL CREATIVE DIRECTION" },
            { icon: Sparkles, text: "COLOR GRADING" },
            { icon: Zap, text: "SPECIAL EFFECTS & AI ANIMATION" },
            { icon: Plane, text: "DRONE FOOTAGE" },
            { icon: Video, text: "VIDEO TRAILER" },
            { icon: Camera, text: "DIGITAL + FILM PHOTOS" },
            { icon: Camera, text: "BEHIND-THE-SCENES (BTS) FOOTAGE & PHOTOS" },
        ],
        turnaround: "5 DAYS AFTER FINAL SHOOT"
    }
];

function ScissorsIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
    );
}

export function VideoProductionPackages() {
    return (
        <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-noir-void -z-20" />
            
            {/* Cinematic atmospheric lights */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-cyan/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Unified Image Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="w-full flex justify-center mb-16"
                >
                    <Image
                        src="/NEW HEADER CONTACT.png"
                        alt="Loaf Films Video Production Packages"
                        width={1024}
                        height={352}
                        className="w-full max-w-4xl h-auto object-contain drop-shadow-2xl"
                        priority
                    />
                </motion.div>

                {/* Pricing Cards Grid */}
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 mb-16">
                    {packages.map((pkg, idx) => (
                        <motion.div
                            key={pkg.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            className={`relative rounded-3xl backdrop-blur-xl border-2 ${pkg.borderColor} bg-gradient-to-b ${pkg.color} flex flex-col overflow-hidden transition-transform duration-500 hover:-translate-y-2`}
                        >
                            {/* Inner glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
                            
                            <div className="p-8 flex flex-col h-full relative z-10">
                                <div className="flex justify-center mb-6">
                                    <div className={`w-20 h-20 rounded-full border-2 ${pkg.borderColor} flex items-center justify-center bg-black/40 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
                                        <pkg.icon className={`w-10 h-10 ${pkg.textColor}`} />
                                    </div>
                                </div>
                                
                                <div className="text-center mb-8 pb-8 border-b border-white/10">
                                    <h4 className={`text-3xl font-black uppercase tracking-widest bg-gradient-to-r ${pkg.gradientText} bg-clip-text text-transparent mb-2`}>
                                        {pkg.name}
                                    </h4>
                                    <div className="text-5xl font-black text-white drop-shadow-md">
                                        {pkg.price}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    {pkg.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-start gap-3">
                                            <feature.icon className={`w-5 h-5 ${pkg.textColor} shrink-0 mt-0.5`} />
                                            <span className="text-sm font-medium text-gray-300 leading-snug">
                                                {feature.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className={`mt-auto pt-6 border-t ${pkg.borderColor} flex items-center justify-center gap-3`}>
                                    <Clock className={`w-6 h-6 ${pkg.textColor}`} />
                                    <div className="text-left">
                                        <div className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Turnaround Time</div>
                                        <div className={`font-black text-lg ${pkg.textColor}`}>{pkg.turnaround}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Add-ons & Notes Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <Zap className="w-8 h-8 text-amber-500 shrink-0" />
                            <h4 className="text-2xl font-black text-white tracking-widest">ADD-ONS</h4>
                        </div>
                        
                        {/* Clapperboard Logos Centered Inline */}
                        <div className="flex justify-center items-center gap-1">
                            <Image
                                src="/BLKLOAF.png"
                                alt="Loaf Films"
                                width={80}
                                height={64}
                                className="w-16 md:w-20 drop-shadow-xl object-contain hover:scale-105 transition-transform duration-300"
                            />
                            <Image
                                src="/BLKLOAF.png"
                                alt="Loaf Films"
                                width={80}
                                height={64}
                                className="w-16 md:w-20 drop-shadow-xl object-contain hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <span className="text-sm font-bold text-gray-300 uppercase tracking-widest text-center sm:text-left">Next-Day Edit Turnaround</span>
                            <span className="text-2xl font-black text-amber-500 bg-amber-500/10 px-4 py-1 rounded-lg border border-amber-500/20">+ $100</span>
                        </div>
                    </div>

                    {/* Notes Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 relative">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-4" />
                        <div className="text-center">
                            <div className="text-[10px] font-black tracking-[0.2em] text-amber-500 mb-2">ADDITIONAL NOTES</div>
                        </div>
                        <div className="col-span-2 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col items-center text-center gap-2">
                                <Edit3 className="w-5 h-5 text-gray-400" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">Additional revisions available upon request (fees may apply)</p>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <Plane className="w-5 h-5 text-gray-400" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">Travel outside local area may incur extra charges</p>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-gray-400" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">A deposit is required to secure your booking</p>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <Download className="w-5 h-5 text-gray-400" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">Final deliverables provided in high-res digital format</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer / CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 py-8 border-t border-white/10"
                >
                    <div className="text-center md:text-left flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-4 mb-2">
                            <h4 className="text-xl md:text-2xl text-amber-500 font-serif italic mb-1">Let's Bring</h4>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter flex items-center justify-center md:justify-start gap-3 flex-wrap">
                            YOUR VISION <span className="font-serif italic text-amber-500 font-normal">TO LIFE.</span>
                        </h3>
                    </div>
                    
                    <div className="text-center md:text-right space-y-2">
                        <h5 className="text-sm font-black text-gray-300 tracking-widest uppercase mb-4">Book Your Project Today</h5>
                        <a href="mailto:Loaffilms@gmail.com" className="flex items-center justify-center md:justify-end gap-2 text-sm text-gray-400 hover:text-amber-500 transition-colors">
                            <span className="w-5 h-5 border border-current rounded flex items-center justify-center text-[10px]">✉</span>
                            Loaffilms@gmail.com
                        </a>
                        <a href="https://instagram.com/Loaffilms" target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-end gap-2 text-sm text-gray-400 hover:text-amber-500 transition-colors">
                            <span className="w-5 h-5 border border-current rounded flex items-center justify-center text-[10px]">IG</span>
                            @Loaffilms
                        </a>
                        <div className="flex items-center justify-center md:justify-end gap-2 text-sm text-gray-400">
                            <span className="w-5 h-5 border border-current rounded flex items-center justify-center text-[10px]">☎</span>
                            347 636 3202
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
