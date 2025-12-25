import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Check,
    ChevronRight,
    Rocket,
    ShieldCheck,
    BarChart3,
    Clock,
    Smartphone,
    Zap,
    Globe,
    Database
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const versions = [
        {
            id: 'v1',
            title: 'V1: Minimalist Blue',
            subtitle: 'The Beginning of S-Delivery',
            description: 'Essential delivery features focused on speed and simplicity. The foundation of our ecosystem.',
            color: '#3b82f6',
            badge: 'Starter',
            features: [
                'Real-time order tracking',
                'Basic Store setup',
                'Customer PWA',
                'Firestore integration'
            ],
            icon: <Rocket className="w-8 h-8 text-blue-500" />
        },
        {
            id: 'v2',
            title: 'V2: Energetic Orange',
            subtitle: 'Operational Excellence',
            description: 'Advanced tools for high-volume stores. Full integration with major 3rd party delivery services.',
            color: '#f97316',
            badge: 'Professional',
            features: [
                'Delivery partner API (Barogo, etc.)',
                'Sound & Push notifications',
                'Mobile-first admin panel',
                'Enhanced order workflow'
            ],
            icon: <Zap className="w-8 h-8 text-orange-500" />
        },
        {
            id: 'v3',
            title: 'V3: Enterprise Dark/Purple',
            subtitle: 'Data-Driven Future',
            description: 'Enterprise-grade stability with KST stats, scheduler, and advanced security fallback.',
            color: '#6366f1',
            badge: 'Enterprise',
            features: [
                'KST Daily Stats Scheduler',
                'Master Admin Security Fallback',
                'Complex Query Optimization',
                'Enterprise analytics dashboard'
            ],
            icon: <BarChart3 className="w-8 h-8 text-indigo-500" />
        }
    ];

    const comparisonData = [
        { feature: 'Real-time Tracking', v1: true, v2: true, v3: true },
        { feature: 'Store Management', v1: true, v2: true, v3: true },
        { feature: 'Delivery Partner API', v1: false, v2: true, v3: true },
        { feature: 'Custom Status Audio', v1: false, v2: true, v3: true },
        { feature: 'KST Daily Reports', v1: false, v2: false, v3: true },
        { feature: 'Admin Fallback Security', v1: false, v2: false, v3: true },
        { feature: 'Enterprise Analytics', v1: false, v2: false, v3: true },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-500/20 to-transparent blur-3xl -z-10" />
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6 animate-fade-in">
                        <Globe className="w-4 h-4" />
                        S-Delivery Series Evolution
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
                        The Future of <br />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Logistics Software
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-10">
                        S-Delivery는 프로토타입에서 엔터프라이즈 솔루션으로 진화했습니다.
                        각 단계별 혁신을 지금 바로 경험해 보세요.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button size="lg" onClick={() => navigate('/login')}>
                            Get Started Now
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                        <Button variant="outline" size="lg" className="border-gray-700 hover:bg-gray-800">
                            View Case Study
                        </Button>
                    </div>
                </div>
            </section>

            {/* Version Cards Section */}
            <section className="py-20 bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {versions.map((v) => (
                            <Card key={v.id} className="bg-gray-800/40 border-gray-700 hover:border-indigo-500/50 transition-all duration-300 group">
                                <div className="p-2 mb-6 inline-block rounded-xl bg-gray-900/50">
                                    {v.icon}
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-bold">{v.title}</h3>
                                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-indigo-500/20 text-indigo-400">
                                        {v.badge}
                                    </span>
                                </div>
                                <p className="text-indigo-400 font-medium mb-3">{v.subtitle}</p>
                                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                    {v.description}
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {v.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                            <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-green-500" />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <div className="pt-6 border-t border-gray-700/50">
                                    <button className="flex items-center gap-2 text-sm font-semibold group-hover:text-indigo-400 transition-colors">
                                        Explore more
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Table Section */}
            <section className="py-32">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Feature Matrix Comparison</h2>
                        <p className="text-gray-400">각 버전이 제공하는 가치를 비교표를 통해 한눈에 확인하세요.</p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800/20 backdrop-blur-md">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-800/50 border-b border-gray-700">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase">Feature</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-400 uppercase">V1</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-orange-400 uppercase">V2</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-400 uppercase">V3</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonData.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-300">{row.feature}</td>
                                        <td className="px-6 py-4 text-center">
                                            {row.v1 ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <div className="w-5 h-5 mx-auto bg-gray-800 rounded-full" />}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {row.v2 ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <div className="w-5 h-5 mx-auto bg-gray-800 rounded-full" />}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {row.v3 ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <div className="w-5 h-5 mx-auto bg-gray-800 rounded-full" />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="text-4xl font-bold mb-2">99.9%</div>
                        <div className="text-gray-500 text-sm uppercase tracking-wider">Uptime Reliability</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold mb-2">2.5s</div>
                        <div className="text-gray-500 text-sm uppercase tracking-wider">Average Dispatch</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold mb-2">500+</div>
                        <div className="text-gray-500 text-sm uppercase tracking-wider">Global Stores</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold mb-2">1M+</div>
                        <div className="text-gray-500 text-sm uppercase tracking-wider">Monthly Orders</div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-800 bg-black">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    <div className="flex justify-center gap-6 mb-8 text-gray-400">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Service</a>
                        <a href="#" className="hover:text-white">Contact Us</a>
                    </div>
                    <p>© 2025 S-Delivery Series. Designed for Global Logistics.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
