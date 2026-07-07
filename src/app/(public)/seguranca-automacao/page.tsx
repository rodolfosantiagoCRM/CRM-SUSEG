'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SusegLogo from '@/components/public/suseg-logo';
import LeadForm from '@/components/public/lead-form';
import WhatsAppButton from '@/components/public/whatsapp-button';
import { getPublicWhatsappNumber } from '@/app/actions/whatsapp';

export default function SegurancaAutomacaoPage() {
  const [whatsappNumber, setWhatsappNumber] = useState('5541999999999');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState('Automação Residencial e Predial');

  const handleSelectService = (title: string) => {
    if (title.includes('Segurança') || title.includes('Controle')) {
      setSelectedService('Segurança Eletrônica');
    } else if (title.includes('Automação')) {
      setSelectedService('Automação Residencial e Predial');
    } else {
      setSelectedService('');
    }
  };

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

  const solutions = [
    {
      title: 'Segurança Eletrônica Inteligente',
      description: 'Sistemas completos de proteção ativa e passiva para residências, condomínios e indústrias.',
      features: [
        'Câmeras CFTV IP de alta resolução (Full HD e 4K)',
        'Monitoramento por IA de presença e cruzamento de linha',
        'Alarmes com sensores de presença de dupla tecnologia',
        'Sensores de barreira físicos (barreiras perimetrais)',
        'Gravação redundante local e em nuvem contra invasão',
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Controle de Acesso Biométrico e Facial',
      description: 'Gestão de fluxo e liberação de entrada e saída com máxima precisão tecnológica.',
      features: [
        'Leitores faciais ultrarrápidos com sensor de temperatura',
        'Cadastro unificado e relatórios de fluxo de pessoas',
        'Integração com fechaduras eletromecânicas e magnéticas',
        'Cancelas automáticas com leitura de placas (LPR)',
        'Tag veicular por radiofrequência (sem parar na portaria)',
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Automação Residencial e Predial',
      description: 'Conforto e eficiência energética integrados em uma única central gerenciável.',
      features: [
        'Controle integrado de iluminação e persianas elétricas',
        'Climatização inteligente programada por zona e horário',
        'Sistemas multiroom de áudio e vídeo de alta fidelidade',
        'Sensores de vazamento de gás e água com corte automático',
        'Monitoramento em tempo real do consumo elétrico geral',
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
      ),
    },
  ];

  const faqs = [
    {
      question: 'Como funciona o monitoramento de câmeras por Inteligência Artificial?',
      answer: 'Nossas câmeras IP inteligentes contam com algoritmos avançados capazes de distinguir pessoas e veículos de animais ou galhos em movimento. Isso evita disparos falsos de alarmes e permite programar cercas virtuais: se alguém cruzar a linha em horário proibido, um alerta imediato é enviado para a central e o seu celular.',
    },
    {
      question: 'Os sistemas de segurança continuam funcionando em caso de falta de energia?',
      answer: 'Sim! Integramos nobreaks e bancos de baterias superdimensionados em todas as centrais de alarme, câmeras e controle de acesso. O sistema mantém o monitoramento ativo e a liberação de portões funcionando com segurança por várias horas até o restabelecimento da energia da rede pública.',
    },
    {
      question: 'Posso gerenciar os sistemas de segurança e automação por aplicativo?',
      answer: 'Com certeza. Tanto o sistema de câmeras e alarme quanto os controles de automação (luzes, ar condicionado e portas) são unificados em aplicativos móveis práticos. Você pode visualizar câmeras em tempo real, ativar/desativar o alarme à distância e ajustar a temperatura de casa no caminho do trabalho.',
    },
    {
      question: 'É possível instalar biometria facial em portarias de condomínios já existentes?',
      answer: 'Sim, realizamos a adequação física e elétrica da portaria atual do condomínio. Instalamos leitores faciais com tecnologia de ponta que funcionam inclusive no escuro ou em condições de chuva, integrando com as fechaduras magnéticas já instaladas no local.',
    },
  ];

  const handleFaqToggle = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-chombo font-sans selection:bg-suseg-green selection:text-white overflow-x-hidden">
      
      {/* Header / Nav */}
      <header className="fixed top-0 left-0 w-full z-45 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/">
            <SusegLogo />
          </Link>
          
          <nav className="hidden md:flex space-x-8 text-sm font-bold text-slate-500">
            <Link href="/" className="hover:text-suseg-green transition-colors">Página Inicial</Link>
            <Link href="/carregamento-veicular" className="hover:text-suseg-green transition-colors">Carregamento Veicular</Link>
            <a href="#solucoes" className="hover:text-suseg-green transition-colors">Soluções</a>
            <a href="#funcionamento" className="hover:text-suseg-green transition-colors">Como Funciona</a>
            <a href="#faq" className="hover:text-suseg-green transition-colors">Dúvidas</a>
            <a href="/login" className="text-suseg-green hover:text-suseg-green-dark transition-colors font-extrabold flex items-center gap-1">
              Acessar CRM
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </nav>
          
          <a
            href="#orcamento"
            className="px-5 py-2.5 bg-suseg-green hover:bg-suseg-green-dark text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-suseg-green/10 cursor-pointer"
          >
            Orçamento Rápido
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-6 bg-gradient-to-b from-blue-50/50 via-white to-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,122,62,0.02)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-suseg-green animate-pulse" />
              Segurança Eletrônica & Conforto Predial
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-chombo-dark">
              Proteção Inteligente e{' '}
              <span className="text-suseg-green block sm:inline">
                Automação
              </span>{' '}
              de Alto Padrão.
            </h1>
            
            <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
              Projetamos e integramos sistemas de segurança avançados (CFTV IP, alarmes ativos, controle de acesso facial) e automação inteligente de iluminação, persianas e climatização. Soluções premium sob medida para sua residência, empresa ou condomínio.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <a
                href="#orcamento"
                className="w-full sm:w-auto px-8 py-4 bg-suseg-green hover:bg-suseg-green-dark text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-suseg-green/20 text-center cursor-pointer active:scale-[0.98]"
              >
                Solicitar Estudo de Segurança
              </a>
              <a
                href="#solucoes"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-650 border border-slate-200 font-bold text-sm rounded-xl transition-all shadow-sm text-center cursor-pointer active:scale-[0.98]"
              >
                Conhecer Soluções
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100/50 bg-white p-2">
              <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
                <div className="w-20 h-20 bg-slate-700/30 border border-slate-600/30 text-suseg-green rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-suseg-green/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black tracking-tight leading-snug">Monitoramento IP Integrado</h3>
                <p className="text-xs text-slate-400 font-medium max-w-xs mt-2 leading-relaxed">
                  Câmeras dome de alta resolução com detecção de movimento baseada em inteligência artificial.
                </p>
              </div>
              
              <div className="absolute bottom-6 left-6 bg-chombo-dark/90 backdrop-blur-md border border-slate-700/50 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-suseg-green" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Monitoramento Integrado 24h</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção das Soluções */}
      <section id="solucoes" className="py-20 md:py-28 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">Tecnologia Premium</span>
            <h2 className="text-3xl md:text-4xl font-black text-chombo-dark leading-tight">Soluções Desenvolvidas por Engenharia</h2>
            <p className="text-slate-500 font-medium">Equipamentos homologados e instalados por técnicos qualificados para garantir segurança duradoura.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {solutions.map((sol, index) => (
              <div key={index} className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-suseg-green/20 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-8 group">
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-suseg-green-light text-suseg-green rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105">
                    {sol.icon}
                  </div>
                  <h3 className="text-xl font-extrabold text-chombo-dark group-hover:text-suseg-green transition-colors">{sol.title}</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">{sol.description}</p>
                  
                  <ul className="space-y-2.5 text-slate-650 text-xs font-medium border-t border-slate-200/50 pt-4">
                    {sol.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2">
                        <span className="text-suseg-green text-sm">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-slate-100/60 mt-auto">
                  <a
                    href="#orcamento"
                    onClick={() => handleSelectService(sol.title)}
                    className="w-full text-center py-2.5 bg-suseg-green hover:bg-suseg-green-dark text-white rounded-xl font-extrabold text-xs transition-all shadow-md shadow-suseg-green/10 active:scale-[0.98] cursor-pointer"
                  >
                    Solicitar Orçamento
                  </a>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=Olá!%20Gostaria%20de%20um%20orçamento%20para%20${encodeURIComponent(sol.title)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-extrabold text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 text-emerald-500 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.62.963 3.41 1.47 5.238 1.472 5.516 0 10.007-4.49 10.01-10.01.002-2.673-1.04-5.184-2.937-7.084-1.896-1.899-4.41-2.942-7.08-2.943-5.52 0-10.01 4.49-10.014 10.01-.002 1.902.501 3.758 1.458 5.4l-.993 3.626 3.722-.976zm12.182-8.312c-.29-.145-1.72-.848-1.986-.944-.267-.097-.461-.145-.656.145-.194.29-.752.944-.922 1.138-.17.194-.34.218-.63.072-1.285-.644-2.126-1.127-2.973-2.58-.222-.38.222-.353.636-1.18.069-.145.034-.27-.017-.38-.05-.11-.461-1.11-.63-1.524-.166-.399-.334-.345-.461-.351-.12-.006-.258-.007-.396-.007s-.362.052-.552.258c-.19.206-.723.707-.723 1.724 0 1.017.74 2.001.843 2.14.103.14 1.457 2.224 3.53 3.12.493.213.878.34 1.179.436.497.158.95.135 1.307.082.399-.06 1.72-.703 1.962-1.383.243-.68.243-1.264.17-1.382-.073-.118-.267-.19-.557-.335z"/>
                    </svg>
                    Entrar em Contato
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Como Funciona Nosso Atendimento */}
      <section id="funcionamento" className="py-20 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">Metodologia</span>
            <h2 className="text-3xl md:text-4xl font-black text-chombo-dark">Do Projeto à Entrega Técnica</h2>
            <p className="text-slate-500 font-medium">Análise rigorosa e especificação correta evitam dores de cabeça e garantem o funcionamento perfeito do sistema.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Estudo do Local & Vulnerabilidade',
                description: 'Nossa equipe realiza uma análise física do imóvel para mapear pontos cegos de câmeras, zonas críticas para sensores e necessidades de acoplamento de automação.',
              },
              {
                step: '02',
                title: 'Projeto Técnico Detalhado',
                description: 'Especificamos os equipamentos ideais (no-breaks, tipos de lentes de câmeras, sensores imunes a animais) para que o sistema atenda exatamente suas demandas de uso.',
              },
              {
                step: '03',
                title: 'Instalação & Configuração de Apps',
                description: 'Passamos cabeamentos organizados e protegidos, instalamos os quadros centrais e configuramos os aplicativos móveis em seus celulares com testes práticos de funcionamento.',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <span className="text-3xl font-black text-suseg-green/30 block leading-none">{item.step}</span>
                <h3 className="text-lg font-extrabold text-chombo-dark">{item.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção FAQs / Perguntas Frequentes */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">Perguntas Frequentes</span>
            <h2 className="text-3xl font-black text-chombo-dark">Dúvidas Comuns de Clientes</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-150 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => handleFaqToggle(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-sm text-chombo-dark gap-4 cursor-pointer hover:bg-slate-50/50"
                >
                  <span>{faq.question}</span>
                  <span className={`transform transition-transform text-suseg-green text-lg font-black leading-none ${activeFaq === idx ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs text-slate-500 leading-relaxed border-t border-slate-50 font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário de Captura */}
      <section id="orcamento" className="py-20 md:py-28 bg-slate-50 relative border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          <div className="md:col-span-6 space-y-8">
            <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">Orçamento Personalizado</span>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-chombo-dark leading-tight">
                Proteja Seu Imóvel Com Quem Entende de Engenharia
              </h2>
              <p className="text-slate-500 leading-relaxed font-semibold">
                Desenvolvemos projetos e integramos sistemas de monitoramento ativo e automação residencial/predial de alto padrão para trazer tranquilidade ao seu dia a dia.
              </p>
              <p className="text-sm text-suseg-green font-extrabold tracking-wide uppercase">
                Receba uma proposta técnica preenchendo o formulário ao lado.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                'Análise física de segurança inclusa',
                'Instalação com cabeamento estruturado',
                'Nobreaks e redundância de energia',
                'Integração mobile completa',
                'Suporte técnico pós-venda ágil',
                'Materiais e equipamentos homologados',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-5 h-5 bg-suseg-green-light rounded-full flex items-center justify-center text-suseg-green mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-650 leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-suseg-green" />
              <h3 className="text-lg font-black text-chombo-dark mb-6">Solicitar Proposta Comercial</h3>
              <LeadForm defaultService={selectedService} />
            </div>
          </div>
        </div>
      </section>

      {/* Chamada Final */}
      <section className="py-20 bg-chombo text-white relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Quer transformar a segurança e o conforto do seu imóvel?
          </h2>
          <p className="text-base sm:text-lg text-slate-350 max-w-xl mx-auto font-medium leading-relaxed">
            Consulte nossa engenharia especializada e obtenha um projeto robusto de monitoramento e automação predial.
          </p>

          <div className="pt-4">
            <a
              href={`https://wa.me/${whatsappNumber}?text=Olá!%20Gostaria%20de%20um%20orçamento%20para%20soluções%20de%20Segurança%20e%20Automação%20com%20a%20SUSEG.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer hover:scale-103 active:scale-97"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-16 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="flex justify-center">
            <Link href="/">
              <SusegLogo className="h-16" />
            </Link>
          </div>
          <div className="flex justify-center space-x-6 text-slate-400 font-bold">
            <Link href="/" className="hover:text-suseg-green">Página Inicial</Link>
            <span>•</span>
            <Link href="/carregamento-veicular" className="hover:text-suseg-green">Carregamento Veicular</Link>
            <span>•</span>
            <a href="#solucoes" className="hover:text-suseg-green">Soluções</a>
            <span>•</span>
            <a href="#faq" className="hover:text-suseg-green">Dúvidas</a>
            <span>•</span>
            <Link href="/login" className="hover:text-suseg-green">Acessar CRM</Link>
          </div>
          <p className="max-w-md mx-auto text-slate-400 font-medium">
            SUSEG Engenharia & Automação © 2026. Todos os direitos reservados. Soluções premium de segurança eletrônica, alarmes e automação inteligente.
          </p>
        </div>
      </footer>

      {/* Botão Flutuante do WhatsApp */}
      <WhatsAppButton whatsappNumber={whatsappNumber} />
    </div>
  );
}
