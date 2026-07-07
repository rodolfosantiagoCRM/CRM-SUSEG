'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SusegLogo from '@/components/public/suseg-logo';
import LeadForm from '@/components/public/lead-form';
import WhatsAppButton from '@/components/public/whatsapp-button';
import CasanLogo from '@/components/public/casan-logo';
import { getPublicWhatsappNumber } from '@/app/actions/whatsapp';

interface Installation {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
}

export default function LandingPage() {
  const [selectedService, setSelectedService] = useState('');
  const [activeImage, setActiveImage] = useState<Installation | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('5541999999999');
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);

  React.useEffect(() => {
    async function loadWhatsapp() {
      try {
        const num = await getPublicWhatsappNumber();
        setWhatsappNumber(num);
      } catch (e) {
        console.warn('Erro ao carregar whatsApp público:', e);
      }
    }
    loadWhatsapp();
  }, []);

  // Lista de Parceiros e Clientes
  const partners = [
    {
      id: 'casan',
      name: 'CASAN',
      tag: 'Parceiro há anos',
      logo: <CasanLogo className="h-10 w-auto text-[#007A3E] shrink-0" />,
      title: 'CASAN - Parceria de longos anos',
    },
    {
      id: 'construtora-sul',
      name: 'CONSTRUTORA SUL',
      tag: 'Cliente Atendido',
      logo: (
        <div className="w-10 h-10 bg-suseg-green-light text-suseg-green rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-suseg-green group-hover:text-white shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      ),
      title: 'Construtora Sul - Cliente Atendido',
    },
    {
      id: 'shopping-centro',
      name: 'SHOPPING CENTRO',
      tag: 'Cliente Atendido',
      logo: (
        <div className="w-10 h-10 bg-suseg-green-light text-suseg-green rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-suseg-green group-hover:text-white shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      ),
      title: 'Shopping Centro - Cliente Atendido',
    },
    {
      id: 'jardim-botanico',
      name: 'JARDIM BOTÂNICO',
      tag: 'Condomínio Residencial',
      logo: (
        <div className="w-10 h-10 bg-suseg-green-light text-suseg-green rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-suseg-green group-hover:text-white shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
      ),
      title: 'Jardim Botânico Condomínio - Cliente Atendido',
    },
  ];

  // Lista de Serviços
  const services = [
    {
      title: 'Carregadores Veiculares',
      description: 'Instalação profissional de carregadores veiculares (Wallbox) em residências, empresas e condomínios. Vistoria técnica prévia, ART/TRT, Load Management e conformidade com as normas NBR 17019 e NBR 5410.',
      icon: (
        <svg className="w-8 h-8 text-suseg-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      tag: 'Carregamento Veicular',
      link: '/carregamento-veicular',
    },
    {
      title: 'Segurança & Automação',
      description: 'Sistemas inteligentes de segurança eletrônica (CFTV IP, alarmes monitorados, biometria facial) e automação de iluminação, persianas e climatização de alto padrão.',
      icon: (
        <svg className="w-8 h-8 text-suseg-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      tag: 'Segurança e Automação',
      link: '/seguranca-automacao',
    },
    {
      title: 'Projetos Elétricos & Padrão CELESC',
      description: 'Desenvolvimento de projetos elétricos residenciais/comerciais completos, dimensionamento técnico e instalação homologada do padrão de entrada de energia seguindo as normas da CELESC.',
      icon: (
        <svg className="w-8 h-8 text-suseg-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      tag: 'Projetos Elétricos',
    },
  ];

  // Instalações na Galeria (Fotos reais de alta autoridade)
  const installations: Installation[] = [
    {
      id: 1,
      title: 'Sistema de Monitoramento CFTV IP',
      category: 'Segurança Eletrônica',
      description: 'Instalação de câmeras dome infravermelho de alta resolução com cabeamento estruturado e central organizadora organizada.',
      image: '/gallery/cctv.png',
    },
    {
      id: 2,
      title: 'Carregador Wallbox Residencial',
      category: 'Carregamento Veicular',
      description: 'Estação de recarga inteligente 22kW montada em garagem residencial, com proteção elétrica completa (DR e disjuntor exclusivo).',
      image: '/gallery/charger.png',
    },
    {
      id: 3,
      title: 'Central Touch de Automação',
      category: 'Automação Residencial',
      description: 'Painel inteligente embutido para controle integrado de persianas, iluminação programada e ar condicionado.',
      image: '/gallery/smart-home.png',
    },
    {
      id: 4,
      title: 'Leitor Facial e Biométrico',
      category: 'Segurança Eletrônica',
      description: 'Controle de acesso facial ultrarrápido instalado no portão de pedestres de condomínio de alto padrão.',
      image: '/gallery/facial.png',
    },
  ];

  // Reviews/Testemunhos
  const testimonials = [
    {
      name: 'Mariana P. Silva',
      role: 'Síndica do Condomínio Plaza',
      comment: 'Instalamos a infraestrutura para carregadores veiculares com a SUSEG. O atendimento técnico foi exemplar, do dimensionamento inicial à entrega final.',
      stars: 5,
      avatarBg: 'bg-emerald-100 text-emerald-800',
    },
    {
      name: 'Roberto K. Almeida',
      role: 'Proprietário Residencial',
      comment: 'A automação de iluminação e ar condicionado integrada à segurança me trouxe muita tranquilidade. Consigo monitorar tudo de forma simples no celular.',
      stars: 5,
      avatarBg: 'bg-suseg-green-light text-suseg-green',
    },
    {
      name: 'Carlos E. Ramos',
      role: 'Gerente Comercial',
      comment: 'A SUSEG instalou o controle de acesso biométrico e as câmeras na nossa distribuidora. Sistema robusto, sem falhas e com suporte técnico imediato.',
      stars: 5,
      avatarBg: 'bg-slate-100 text-slate-800',
    },
  ];

  const handleServiceSelect = (serviceTag: string, link?: string) => {
    if (link) {
      window.location.href = link;
      return;
    }
    setSelectedService(serviceTag);
    const formElement = document.getElementById('orcamento');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-chombo font-sans selection:bg-suseg-green selection:text-white overflow-x-hidden">
      
      {/* Header / Nav */}
      <header className="fixed top-0 left-0 w-full z-45 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <SusegLogo />
          
          <nav className="hidden md:flex space-x-8 text-sm font-bold text-slate-500">
            <Link href="/" className="hover:text-suseg-green transition-colors">Página Inicial</Link>
            <Link href="/carregamento-veicular" className="hover:text-suseg-green transition-colors">Carregamento Veicular</Link>
            <Link href="/seguranca-automacao" className="hover:text-suseg-green transition-colors">Segurança & Automação</Link>
          </nav>
          
          <a
            href="#orcamento"
            onClick={() => handleServiceSelect('')}
            className="px-5 py-2.5 bg-suseg-green hover:bg-suseg-green-dark text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-suseg-green/10 cursor-pointer"
          >
            Falar com Especialista
          </a>
        </div>
      </header>

      {/* Hero Section (Atenção) */}
      <section className="relative pt-24 pb-20 md:pt-40 md:pb-28 px-6 bg-gradient-to-b from-suseg-green-light/30 via-white to-white overflow-hidden">
        {/* Glowing visual effect in background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,122,62,0.03)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Coluna da Esquerda: Textos e CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-suseg-green/20 bg-suseg-green-light text-suseg-green text-[10px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-suseg-green animate-pulse" />
              Engenharia Elétrica & Eletromobilidade
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-chombo-dark">
              Infraestrutura Elétrica e Recarga de{' '}
              <span className="text-suseg-green block sm:inline">
                Alta Performance.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
              Projetos elétricos completos, instalação homologada de carregadores veiculares (NBR 17019) e adequação de padrão de entrada CELESC com total segurança e conformidade técnica.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <a
                href="#orcamento"
                onClick={() => handleServiceSelect('')}
                className="w-full sm:w-auto px-8 py-4 bg-suseg-green hover:bg-suseg-green-dark text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-suseg-green/20 text-center cursor-pointer active:scale-[0.98]"
              >
                Solicitar Orçamento Gratuito
              </a>
              <Link
                href="/carregamento-veicular#simulador"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-650 border border-slate-200 font-bold text-sm rounded-xl transition-all shadow-sm text-center cursor-pointer active:scale-[0.98]"
              >
                Simular Economia EV
              </Link>
            </div>
          </div>

          {/* Coluna da Direita: Imagem de Destaque (Colagem) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100/50 bg-white p-2">
              <img 
                src="/hero-collage.png" 
                alt="Soluções SUSEG" 
                className="w-full h-auto rounded-2xl object-cover hover:scale-[1.01] transition-transform duration-500" 
              />
              
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 bg-chombo-dark/90 backdrop-blur-md border border-slate-700/50 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-suseg-green animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Projetos 100% Homologados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Clientes e Parceiros */}
      <section className="bg-white py-16 border-b border-slate-100/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 mb-10">
            Empresas parceiras e clientes atendidos pela SUSEG
          </p>
          <div className="relative w-full overflow-hidden mask-gradient-marquee">
            <div
              className="flex w-max animate-marquee"
              style={{ animationPlayState: isMarqueePaused ? 'paused' : 'running' }}
              onMouseEnter={() => setIsMarqueePaused(true)}
              onMouseLeave={() => setIsMarqueePaused(false)}
            >
              {/* Repetir 3 vezes para garantir efeito contínuo em telas grandes */}
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="flex gap-12 pr-12 shrink-0">
                  {partners.map((partner) => (
                    <div
                      key={`${idx}-${partner.id}`}
                      className="flex items-center gap-3 border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-suseg-green/30 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 shadow-sm select-none cursor-pointer group shrink-0"
                      title={partner.title}
                    >
                      {partner.logo}
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-slate-700 leading-none group-hover:text-chombo-dark transition-colors">
                          {partner.name}
                        </span>
                        <span className="text-[8px] font-bold text-suseg-green tracking-wider uppercase mt-1">
                          {partner.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Serviços (Interesse) */}
      <section id="servicos" className="py-20 md:py-28 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">O Que Fazemos</span>
            <h2 className="text-3xl md:text-4xl font-black text-chombo-dark">Soluções Integradas sob Medida</h2>
            <p className="text-slate-500 font-medium">Tecnologia de ponta implementada com rigor técnico para maximizar proteção e eficiência.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((svc) => (
              <div
                key={svc.title}
                className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-suseg-green/30 hover:shadow-xl transition-all duration-350 flex flex-col justify-between group"
              >
                <div className="space-y-5">
                  <div className="w-14 h-14 bg-suseg-green-light rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105">
                    {svc.icon}
                  </div>
                  <h3 className="text-xl font-extrabold text-chombo-dark leading-snug">{svc.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{svc.description}</p>
                </div>
                
                <div className="pt-8">
                  <button
                    onClick={() => handleServiceSelect(svc.tag, svc.link)}
                    className="w-full py-3 bg-slate-50 group-hover:bg-suseg-green group-hover:text-white text-slate-600 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{svc.link ? 'Ver Página Dedicada' : 'Saber Mais & Orçar'}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Seção Prova Social e Galeria (Confiança) */}
      <section id="galeria" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Galeria de Instalações */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">Nosso Portfólio</span>
            <h2 className="text-3xl md:text-4xl font-black text-chombo-dark">Instalações Recentes</h2>
            <p className="text-slate-500 font-medium">Equipamentos instalados com alto padrão de acabamento e segurança.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            {installations.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveImage(item)}
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-100 cursor-pointer transition-all duration-300 bg-white"
              >
                {/* Imagem realística da instalação */}
                <div className="aspect-square relative overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 text-[9px] font-extrabold uppercase tracking-widest text-suseg-green bg-suseg-green-light px-2.5 py-0.5 rounded-full z-10 shadow-sm border border-suseg-green/10">
                    {item.category}
                  </span>
                  
                  {/* Hover overlay with zoom icon */}
                  <div className="absolute inset-0 bg-chombo-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 flex-col z-20">
                    <svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Ampliar Detalhes</span>
                  </div>
                </div>
                <div className="p-4 bg-white border-t border-slate-100">
                  <h4 className="text-xs font-black text-chombo-dark truncate">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.category}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Depoimentos (Reviews) */}
          <div className="border-t border-slate-150 pt-20">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">Depoimentos</span>
              <h2 className="text-3xl font-black text-chombo-dark">O Que Dizem Nossos Clientes</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex gap-1 text-amber-500">
                      {[...Array(t.stars)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed italic font-medium">
                      {`"${t.comment}"`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-200/50">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm uppercase ${t.avatarBg}`}>
                      {t.name.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-chombo-dark">{t.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Formulário de Captura / CRM (Ação) */}
      <section id="orcamento" className="py-20 md:py-28 bg-slate-50 relative border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Informações da Esquerda (Geração de Confiança) */}
          <div className="md:col-span-6 space-y-8">
            <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">Solicitar Contato</span>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-chombo-dark leading-tight">
                Conte-nos seu projeto
              </h2>
              <p className="text-slate-500 leading-relaxed font-semibold">
                Seja para instalação de carregadores veiculares, projetos elétricos comerciais/residenciais ou adequação de padrão de entrada CELESC, nossa engenharia entrega a solução ideal para o seu imóvel.
              </p>
              <p className="text-sm text-suseg-green font-extrabold tracking-wide uppercase">
                Preencha o formulário e receba seu orçamento gratuito.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                'Atendimento especializado',
                'Projetos personalizados',
                'Equipamentos de alta qualidade',
                'Instalação profissional',
                'Garantia dos serviços',
                'Suporte técnico',
                'Atendimento para residências, empresas e condomínios',
              ].map((item, idx) => (
                <div key={idx} className={`flex items-start gap-2.5 ${idx === 6 ? 'sm:col-span-2' : ''}`}>
                  <div className="flex-shrink-0 w-5 h-5 bg-suseg-green-light rounded-full flex items-center justify-center text-suseg-green mt-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-650 leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formulário à Direita */}
          <div className="md:col-span-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-suseg-green" />
              
              <h3 className="text-lg font-black text-chombo-dark mb-6">Fale com um Especialista</h3>

              <LeadForm defaultService={selectedService} />
            </div>
          </div>
        </div>
      </section>

      {/* Chamada para WhatsApp */}
      <section className="bg-emerald-50/40 py-16 border-t border-b border-emerald-100/30">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-chombo-dark">
              Prefere falar diretamente com um especialista?
            </h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Clique abaixo e tire suas dúvidas pelo WhatsApp.
            </p>
          </div>
          <div className="pt-2">
            <a
              href={`https://wa.me/${whatsappNumber}?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento%20para%20soluções%20da%20SUSEG.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer hover:scale-103 active:scale-97"
            >
              Falar no WhatsApp
            </a>
          </div>
          <p className="text-[10px] text-slate-450 font-bold uppercase tracking-widest">
            Atendimento rápido e sem compromisso.
          </p>
        </div>
      </section>

      {/* Chamada Final no Final da Página (Opção 1) */}
      <section className="py-20 bg-chombo text-white relative overflow-hidden">
        {/* Decorative Shield Watermark */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Vamos conversar?
          </h2>
          <p className="text-base sm:text-lg text-slate-350 max-w-xl mx-auto font-medium leading-relaxed">
            Solicite agora seu orçamento gratuito e descubra a solução ideal para o seu projeto.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-suseg-green-light">✔</span> Sem compromisso
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-suseg-green-light">✔</span> Atendimento especializado
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-suseg-green-light">✔</span> Resposta rápida
            </div>
          </div>

          <div className="pt-4">
            <a
              href="#orcamento"
              className="inline-block px-10 py-4 bg-suseg-green hover:bg-suseg-green-dark text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-suseg-green/20 cursor-pointer active:scale-[0.98]"
            >
              Solicitar Orçamento
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-16 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="flex justify-center">
            <SusegLogo className="h-16" />
          </div>
          <div className="flex justify-center flex-wrap gap-y-2 gap-x-6 text-slate-400 font-bold">
            <Link href="/" className="hover:text-suseg-green">Página Inicial</Link>
            <span>•</span>
            <Link href="/carregamento-veicular" className="hover:text-suseg-green">Carregamento Veicular</Link>
            <span>•</span>
            <Link href="/seguranca-automacao" className="hover:text-suseg-green">Segurança & Automação</Link>
            <span>•</span>
            <a href="#servicos" className="hover:text-suseg-green">Projetos & Padrões</a>
            <span>•</span>
            <Link href="/carregamento-veicular#simulador" className="hover:text-suseg-green">Simulador EV</Link>
            <span>•</span>
            <Link href="/login" className="hover:text-suseg-green">Acessar CRM</Link>
          </div>
          <p className="max-w-md mx-auto text-slate-400 font-medium">
            SUSEG Engenharia & Automação © 2026. Todos os direitos reservados. Soluções premium de segurança residencial e condomínio.
          </p>
        </div>
      </footer>

      {/* Lightbox Modal (Galeria de Instalações) */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-chombo-dark/95 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl relative animate-scaleIn border border-slate-100"
          >
            {/* Visual element in lightbox */}
            <div className="w-full aspect-video relative overflow-hidden bg-slate-100">
              <img
                src={activeImage.image}
                alt={activeImage.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 cursor-pointer transition-colors z-10"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-suseg-green bg-suseg-green-light px-2.5 py-0.5 rounded-full inline-block">
                {activeImage.category}
              </span>
              <h3 className="text-xl font-black text-chombo-dark">{activeImage.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {activeImage.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante do WhatsApp */}
      <WhatsAppButton whatsappNumber={whatsappNumber} />
    </div>
  );
}
