'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SusegLogo from '@/components/public/suseg-logo';
import LeadForm from '@/components/public/lead-form';
import EvCalculator from '@/components/public/ev-calculator';
import WhatsAppButton from '@/components/public/whatsapp-button';
import { getPublicWhatsappNumber } from '@/app/actions/whatsapp';

export default function CarregamentoVeicularPage() {
  const [whatsappNumber, setWhatsappNumber] = useState('5541999999999');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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

  const faqs = [
    {
      question: 'Posso instalar um carregador de carro elétrico em meu condomínio?',
      answer: 'Sim! No entanto, condomínios exigem a emissão de uma ART (Anotação de Responsabilidade Técnica) assinada por engenheiro eletricista e, muitas vezes, um sistema de gestão de carga (Load Management) para evitar a sobrecarga da rede do prédio. A SUSEG cuida de todo esse processo, desde a vistoria e homologação até a instalação final.',
    },
    {
      question: 'O que é a vistoria técnica prévia e por que ela é obrigatória?',
      answer: 'A vistoria técnica serve para avaliar se a infraestrutura elétrica atual do seu imóvel (cabos, disjuntores, aterramento, transformador) suporta a potência do carregador (que costuma variar de 7.4 kW a 22 kW). Instalar sem essa análise prévia coloca em risco a fiação geral, podendo causar curtos-circuitos ou desligamentos inesperados.',
    },
    {
      question: 'Qual a diferença de tempo de recarga entre carregadores?',
      answer: 'O tempo de recarga depende da potência do carregador e da capacidade de aceitação do carro. Carregadores residenciais padrão (AC) operam geralmente em 7.4 kW (monofásico/bifásico) ou 11 kW e 22 kW (trifásicos). Uma recarga de 0 a 100% em 7.4 kW leva cerca de 6 a 8 horas, ideal para o período noturno.',
    },
    {
      question: 'A SUSEG emite a ART de instalação?',
      answer: 'Sim. Todas as nossas instalações de infraestrutura e carregamento para condomínios e comércios acompanham a emissão da ART (ou TRT) de execução, assinada por nossos engenheiros parceiros, garantindo total conformidade legal e segurança perante a administração e seguradoras.',
    },
    {
      question: 'O que é o sistema de Load Management (Gestão de Carga)?',
      answer: 'O gerenciamento de carga é uma tecnologia inteligente que distribui a energia disponível no prédio entre os carregadores em uso. Se vários carros carregarem ao mesmo tempo, o sistema limita temporariamente a potência individual para não desarmar o disjuntor geral do condomínio, reestabelecendo a velocidade total conforme os carros terminam de carregar.',
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
            <Link href="/seguranca-automacao" className="hover:text-suseg-green transition-colors">Segurança & Automação</Link>
            <a href="#beneficios" className="hover:text-suseg-green transition-colors">Por Que SUSEG</a>
            <a href="#simulador" className="hover:text-suseg-green transition-colors">Simulador</a>
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
            Vistoria Gratuita
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-6 bg-gradient-to-b from-emerald-50 via-white to-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,122,62,0.03)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-suseg-green/20 bg-suseg-green-light text-suseg-green text-[10px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-suseg-green animate-pulse" />
              Instalação Profissional Homologada
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-chombo-dark">
              Recarga Prática e{' '}
              <span className="text-suseg-green block sm:inline">
                100% Segura
              </span>{' '}
              na sua Garagem.
            </h1>
            
            <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
              Instalação especializada de carregadores de veículos elétricos (Wallbox) em residências, condomínios e empresas, seguindo as normas **ABNT NBR 17019** e **NBR 5410**. Proteja seu patrimônio e garanta o máximo desempenho do seu carro.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <a
                href="#orcamento"
                className="w-full sm:w-auto px-8 py-4 bg-suseg-green hover:bg-suseg-green-dark text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-suseg-green/20 text-center cursor-pointer active:scale-[0.98]"
              >
                Agendar Vistoria Técnica
              </a>
              <a
                href="#simulador"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-650 border border-slate-200 font-bold text-sm rounded-xl transition-all shadow-sm text-center cursor-pointer active:scale-[0.98]"
              >
                Simular Economia
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100/50 bg-white p-2">
              {/* Representação visual elegante em gradiente com símbolo elétrico */}
              <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
                <div className="w-20 h-20 bg-suseg-green/10 border border-suseg-green/30 text-suseg-green rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black tracking-tight leading-snug">Estação de Recarga Residencial</h3>
                <p className="text-xs text-slate-400 font-medium max-w-xs mt-2 leading-relaxed">
                  Infraestrutura de alta potência instalada de acordo com as especificações exigidas pelas montadoras.
                </p>
              </div>
              
              <div className="absolute bottom-6 left-6 bg-chombo-dark/90 backdrop-blur-md border border-slate-700/50 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-suseg-green animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Normatização ABNT NBR 17019</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Perigos de Instalações Amadoras vs Solução Profissional */}
      <section id="beneficios" className="py-20 md:py-28 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">Diferenciais Técnicos</span>
            <h2 className="text-3xl md:text-4xl font-black text-chombo-dark leading-tight">Por Que a Instalação Não Pode Ser Improvisada?</h2>
            <p className="text-slate-500 font-medium">Carregadores veiculares demandam alta corrente elétrica por horas seguidas. Veja o perigo do improviso e a segurança de contar com engenharia de ponta.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
            {/* O perigo */}
            <div className="p-8 rounded-3xl bg-red-50/30 border border-red-150 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold text-red-950">Os Riscos do Improviso (Instalação Amadora)</h3>
                
                <ul className="space-y-3.5 text-red-900 text-sm font-semibold">
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 text-base">✕</span>
                    <span>**Superaquecimento e Incêndio**: Fios subdimensionados derretem devido à carga prolongada do veículo.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 text-base">✕</span>
                    <span>**Perda da Garantia do Carro**: Montadoras exigem laudo e instalação em conformidade técnica.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 text-base">✕</span>
                    <span>**Falta de Dispositivos de Surtos (DPS)**: Deixa o carro elétrico exposto a queimas por raios na rede.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 text-base">✕</span>
                    <span>**Problemas de Multa em Condomínios**: Instalar sem ART/TRT ou autorização gera penalidades imediatas.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* A solução */}
            <div className="p-8 rounded-3xl bg-emerald-50/20 border border-suseg-green/20 flex flex-col justify-between space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-suseg-green/5 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-6 relative z-10">
                <div className="w-12 h-12 bg-suseg-green-light text-suseg-green rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold text-chombo-dark">Padrão de Segurança SUSEG</h3>
                
                <ul className="space-y-3.5 text-slate-600 text-sm font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="text-suseg-green text-base">✓</span>
                    <span>**Equipamentos de Proteção Corretos**: DPS classe II e Disjuntor Curva B específicos para cargas sensíveis.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-suseg-green text-base">✓</span>
                    <span>**Aterramento Dedicado (NBR 13571)**: Evita choques elétricos na lataria do veículo e ruídos de carga.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-suseg-green text-base">✓</span>
                    <span>**Gestão de Carga (Load Management)**: Essencial para garagens coletivas carregarem múltiplos carros.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-suseg-green text-base">✓</span>
                    <span>**Entrega Legal com ART/TRT**: Emissão imediata de documentação assinada por engenheiro habilitado.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Como Funciona Nosso Atendimento */}
      <section id="funcionamento" className="py-20 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">Metodologia</span>
            <h2 className="text-3xl md:text-4xl font-black text-chombo-dark">Nosso Processo de Instalação</h2>
            <p className="text-slate-500 font-medium">Do contato inicial à entrega técnica com total segurança.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Vistoria Técnica Prévia',
                description: 'Avaliamos a capacidade do seu padrão de energia, fiação existente, necessidades de adequação e o melhor trajeto físico para o cabeamento estruturado.',
              },
              {
                step: '02',
                title: 'ART de Engenharia e Homologação',
                description: 'Elaboramos o projeto de engenharia, emitimos a ART de responsabilidade e auxiliamos no processo de liberação técnica junto à construtora ou condomínio.',
              },
              {
                step: '03',
                title: 'Instalação e Teste de Entrega',
                description: 'Executamos a fiação em eletrodutos reforçados, instalamos os quadros de proteção dedicados e realizamos testes de isolamento e carga assistida.',
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

      {/* Seção do Simulador de Economia */}
      <section id="simulador" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">Economia Real</span>
            <h2 className="text-3xl md:text-4xl font-black text-chombo-dark">Calcule seu Retorno</h2>
            <p className="text-slate-500 font-medium">Insira seus dados de uso semanal para simular o quanto você economiza recarregando em casa em comparação ao combustível tradicional.</p>
          </div>
          
          <EvCalculator />
        </div>
      </section>

      {/* Seção FAQs / Perguntas Frequentes */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-100">
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
      <section id="orcamento" className="py-20 md:py-28 bg-white relative border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          <div className="md:col-span-6 space-y-8">
            <span className="text-xs font-bold text-suseg-green uppercase tracking-widest block">Orçamento Personalizado</span>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-chombo-dark leading-tight">
                Instale seu Carregador com Engenheiros Especializados
              </h2>
              <p className="text-slate-500 leading-relaxed font-semibold">
                Nossa equipe de engenharia elétrica entrega seu ponto de recarga com total segurança jurídica, vistoria de capacidade de carga inclusa e homologação junto ao condomínio.
              </p>
              <p className="text-sm text-suseg-green font-extrabold tracking-wide uppercase">
                Agende sua vistoria preenchendo o formulário ao lado.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                'Vistoria técnica prévia inclusa',
                'Instalação de DPS e proteção dedicada',
                'Emissão de ART/TRT de engenharia',
                'Cabeamento normatizado antichamas',
                'Aterramento elétrico exclusivo',
                'Garantia completa dos serviços executados',
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
              <h3 className="text-lg font-black text-chombo-dark mb-6">Solicitar Contato e Orçamento</h3>
              <LeadForm defaultService="Carregamento Veicular" />
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
            Pronto para eletrificar sua garagem com segurança?
          </h2>
          <p className="text-base sm:text-lg text-slate-350 max-w-xl mx-auto font-medium leading-relaxed">
            Não improvise. Tenha um ponto de recarga homologado por engenharia especializada. Fale conosco agora.
          </p>

          <div className="pt-4">
            <a
              href={`https://wa.me/${whatsappNumber}?text=Olá!%20Gostaria%20de%20um%20orçamento%20para%20instalação%20de%20carregador%20veicular%20com%20a%20SUSEG.`}
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
          <div className="flex justify-center flex-wrap gap-y-2 gap-x-6 text-slate-400 font-bold">
            <Link href="/" className="hover:text-suseg-green">Página Inicial</Link>
            <span>•</span>
            <Link href="/carregamento-veicular" className="hover:text-suseg-green">Carregamento Veicular</Link>
            <span>•</span>
            <Link href="/seguranca-automacao" className="hover:text-suseg-green">Segurança & Automação</Link>
            <span>•</span>
            <a href="#beneficios" className="hover:text-suseg-green">Por Que SUSEG</a>
            <span>•</span>
            <a href="#simulador" className="hover:text-suseg-green">Simulador</a>
            <span>•</span>
            <Link href="/login" className="hover:text-suseg-green">Acessar CRM</Link>
          </div>
          <p className="max-w-md mx-auto text-slate-400 font-medium">
            SUSEG Engenharia & Automação © 2026. Todos os direitos reservados. Soluções premium de infraestrutura elétrica e mobilidade.
          </p>
        </div>
      </footer>

      {/* Botão Flutuante do WhatsApp */}
      <WhatsAppButton whatsappNumber={whatsappNumber} />
    </div>
  );
}
