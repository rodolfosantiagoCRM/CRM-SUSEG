'use client';

import React, { useState } from 'react';
import SusegLogo from '@/components/public/suseg-logo';
import LeadForm from '@/components/public/lead-form';
import EvCalculator from '@/components/public/ev-calculator';
import WhatsAppButton from '@/components/public/whatsapp-button';
import CasanLogo from '@/components/public/casan-logo';

interface Installation {
  id: number;
  title: string;
  category: string;
  description: string;
  gradient: string;
  icon: React.ReactNode;
}

export default function LandingPage() {
  const [selectedService, setSelectedService] = useState('');
  const [activeImage, setActiveImage] = useState<Installation | null>(null);

  // Lista de Serviços
  const services = [
    {
      title: 'Carregamento Veicular',
      description: 'Infraestrutura de recarga inteligente e segura (Wallbox) para residências, comércios e condomínios de qualquer porte.',
      icon: (
        <svg className="w-8 h-8 text-suseg-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      tag: 'Carregamento Veicular',
    },
    {
      title: 'Automação Residencial e Predial',
      description: 'Gestão integrada de iluminação, climatização, áudio e vídeo. Conforto térmico e eficiência na palma da sua mão.',
      icon: (
        <svg className="w-8 h-8 text-suseg-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
      ),
      tag: 'Automação Residencial e Predial',
    },
    {
      title: 'Segurança Eletrônica',
      description: 'Monitoramento 24h por alarmes, câmeras CFTV IP de alta definição, sensores de barreira e controle de acesso facial.',
      icon: (
        <svg className="w-8 h-8 text-suseg-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      tag: 'Segurança Eletrônica',
    },
  ];

  // Instalações na Galeria (Mock com representação visual via gradientes e ícones)
  const installations: Installation[] = [
    {
      id: 1,
      title: 'Sistema de Monitoramento CFTV IP',
      category: 'Segurança Eletrônica',
      description: 'Instalação de câmeras dome infravermelho de alta resolução com cabeamento estruturado e central organizadora organizada.',
      gradient: 'from-emerald-950 via-slate-900 to-slate-950',
      icon: (
        <svg className="w-16 h-16 text-suseg-green/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Carregador Wallbox Residencial',
      category: 'Carregamento Veicular',
      description: 'Estação de recarga inteligente 22kW montada em garagem residencial, com proteção elétrica completa (DR e disjuntor exclusivo).',
      gradient: 'from-suseg-green-dark via-slate-900 to-slate-950',
      icon: (
        <svg className="w-16 h-16 text-suseg-green/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: 'Central Touch de Automação',
      category: 'Automação Residencial',
      description: 'Painel inteligente embutido para controle integrado de persianas, iluminação programada e ar condicionado.',
      gradient: 'from-cyan-950 via-slate-900 to-slate-950',
      icon: (
        <svg className="w-16 h-16 text-suseg-green/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 4,
      title: 'Leitor Facial e Biométrico',
      category: 'Segurança Eletrônica',
      description: 'Controle de acesso facial ultrarrápido instalado no portão de pedestres de condomínio de alto padrão.',
      gradient: 'from-blue-950 via-slate-900 to-slate-950',
      icon: (
        <svg className="w-16 h-16 text-suseg-green/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
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

  const handleServiceSelect = (serviceTag: string) => {
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
            <a href="#servicos" className="hover:text-suseg-green transition-colors">Serviços</a>
            <a href="#calculadora" className="hover:text-suseg-green transition-colors">Simulador EV</a>
            <a href="#galeria" className="hover:text-suseg-green transition-colors">Portfólio</a>
            <a href="/login" className="text-suseg-green hover:text-suseg-green-dark transition-colors font-extrabold flex items-center gap-1">
              Acessar CRM
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
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
              Engenharia e Integração Tecnológica
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-chombo-dark">
              Segurança, Conforto e Economia para sua{' '}
              <span className="text-suseg-green block sm:inline">
                Casa ou Condomínio.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
              Projetos especializados em segurança eletrônica avançada, automação inteligente e infraestrutura homologada para carregamento de veículos elétricos (EV).
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <a
                href="#orcamento"
                onClick={() => handleServiceSelect('')}
                className="w-full sm:w-auto px-8 py-4 bg-suseg-green hover:bg-suseg-green-dark text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-suseg-green/20 text-center cursor-pointer active:scale-[0.98]"
              >
                Solicitar Orçamento Gratuito
              </a>
              <a
                href="#calculadora"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-650 border border-slate-200 font-bold text-sm rounded-xl transition-all shadow-sm text-center cursor-pointer active:scale-[0.98]"
              >
                Simular Economia EV
              </a>
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
      <section className="bg-white py-12 border-b border-slate-100/80">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 mb-8">
            Empresas parceiras e clientes atendidos pela SUSEG
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 md:gap-24">
            {/* CASAN Logo */}
            <div className="flex items-center gap-3 group border border-slate-100 rounded-2xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-sm" title="Parceria de longos anos">
              <CasanLogo className="h-10" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-slate-700 leading-none">CASAN</span>
                <span className="text-[8px] font-bold text-suseg-green tracking-wider uppercase mt-1">Parceiro há anos</span>
              </div>
            </div>

            {/* Outras marcas em estilo texto sóbrio e profissional */}
            <div className="flex items-center gap-2 text-slate-350 hover:text-slate-500 transition-colors">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Construtora Sul</span>
            </div>
            <div className="flex items-center gap-2 text-slate-350 hover:text-slate-500 transition-colors">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Shopping Centro</span>
            </div>
            <div className="flex items-center gap-2 text-slate-350 hover:text-slate-500 transition-colors">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Jardim Botânico Condomínio</span>
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
                    onClick={() => handleServiceSelect(svc.tag)}
                    className="w-full py-3 bg-slate-50 group-hover:bg-suseg-green group-hover:text-white text-slate-600 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Saber Mais & Orçar</span>
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

      {/* Seção Calculadora de Economia EV (Desejo/Engajamento) */}
      <section id="calculadora" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">Simulador Financeiro</span>
            <h2 className="text-3xl md:text-4xl font-black text-chombo-dark">Calcule sua Economia com Carro Elétrico</h2>
            <p className="text-slate-500 font-medium">Veja na ponta do lápis o retorno financeiro ao trocar o combustível fóssil pela recarga elétrica residencial.</p>
          </div>
          
          <EvCalculator />
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
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-100 cursor-pointer transition-all duration-300"
              >
                {/* Visual placeholder with styled gradient and icon */}
                <div className={`aspect-square bg-gradient-to-br ${item.gradient} flex flex-col items-center justify-center p-6 text-center text-white relative`}>
                  {item.icon}
                  <span className="text-xs font-extrabold uppercase tracking-widest text-suseg-green bg-suseg-green-light px-2.5 py-0.5 rounded-full mt-4">
                    {item.category}
                  </span>
                  
                  {/* Hover overlay with zoom icon */}
                  <div className="absolute inset-0 bg-chombo-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 flex-col">
                    <svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Ampliar Detalhes</span>
                  </div>
                </div>
                <div className="p-4 bg-white border-t border-slate-50">
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
                      "{t.comment}"
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
          
          {/* Informações da Esquerda */}
          <div className="md:col-span-6 space-y-8">
            <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">Solicitar Contato</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-chombo-dark leading-tight">
              Pronto para elevar o nível do seu projeto?
            </h2>
            <p className="text-slate-500 leading-relaxed font-medium">
              Fale com a nossa equipe de engenharia hoje mesmo. Preencha os campos ao lado para receber um diagnóstico e orçamento detalhado sem qualquer compromisso.
            </p>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-suseg-green-light border border-suseg-green/20 text-suseg-green mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-chombo-dark text-sm">Responsabilidade Técnica</h4>
                  <p className="text-xs text-slate-500 font-medium">Engenheiros registrados e certificados para garantir a correta execução.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-suseg-green-light border border-suseg-green/20 text-suseg-green mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-chombo-dark text-sm">Garantia Integrada</h4>
                  <p className="text-xs text-slate-500 font-medium">Suporte pós-venda prioritário com equipe técnica de plantão rápido.</p>
                </div>
              </div>
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

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-16 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="flex justify-center">
            <SusegLogo showText={true} />
          </div>
          <div className="flex justify-center space-x-6 text-slate-400 font-bold">
            <a href="#servicos" className="hover:text-suseg-green">Serviços</a>
            <span>•</span>
            <a href="#calculadora" className="hover:text-suseg-green">Simulador EV</a>
            <span>•</span>
            <a href="#galeria" className="hover:text-suseg-green">Portfólio</a>
            <span>•</span>
            <a href="/login" className="hover:text-suseg-green">CRM</a>
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
            <div className={`w-full aspect-video bg-gradient-to-br ${activeImage.gradient} flex items-center justify-center text-white relative`}>
              {activeImage.icon}
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 cursor-pointer transition-colors"
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
      <WhatsAppButton />
    </div>
  );
}
