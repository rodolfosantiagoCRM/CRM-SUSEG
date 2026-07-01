'use client';

import React, { useState } from 'react';
import { leadsService } from '@/services/leadsService';

export default function LeadForm({ defaultService = '' }: { defaultService?: string }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    tipo_servico: '',
  });

  React.useEffect(() => {
    if (defaultService) {
      setFormData((prev) => ({ ...prev, tipo_servico: defaultService }));
    }
  }, [defaultService]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await leadsService.createLead({
        nome: formData.nome,
        email: formData.email || null,
        telefone: formData.telefone,
        cidade: formData.cidade, // Captured location from user
        area_m2: null,
        endereco_obra: null,
        numero: null,
        tipo_servico: formData.tipo_servico || null,
      });

      setSuccess(true);
      setFormData({ nome: '', email: '', telefone: '', cidade: '', tipo_servico: '' });
    } catch (err: any) {
      console.error('Falha ao enviar lead:', err);
      setError(err.message || 'Ocorreu um erro ao enviar seus dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-16 h-16 bg-suseg-green-light border border-suseg-green/30 text-suseg-green rounded-full flex items-center justify-center mx-auto animate-bounce">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="text-xl font-bold text-chombo">Solicitação Enviada!</h4>
        <p className="text-sm text-slate-550 max-w-sm mx-auto">
          Agradecemos seu contato. Nossa equipe de engenharia analisará sua solicitação e entrará em contato via WhatsApp em breve.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm text-suseg-green hover:text-suseg-green-dark transition-colors font-bold underline cursor-pointer"
        >
          Enviar outra solicitação
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="nome" className="text-[10px] font-bold uppercase tracking-widest text-slate-450">
          Nome Completo
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          placeholder="Ex: João da Silva"
          className="w-full bg-white border border-slate-200 focus:border-suseg-green focus:ring-2 focus:ring-suseg-green/10 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition-all text-sm font-semibold"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="telefone" className="text-[10px] font-bold uppercase tracking-widest text-slate-450">
            WhatsApp / Celular
          </label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            required
            placeholder="(00) 99999-0000"
            className="w-full bg-white border border-slate-200 focus:border-suseg-green focus:ring-2 focus:ring-suseg-green/10 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition-all text-sm font-semibold"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-450">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="nome@exemplo.com"
            className="w-full bg-white border border-slate-200 focus:border-suseg-green focus:ring-2 focus:ring-suseg-green/10 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition-all text-sm font-semibold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="cidade" className="text-[10px] font-bold uppercase tracking-widest text-slate-450">
            Localização (Cidade/UF)
          </label>
          <input
            type="text"
            id="cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            required
            placeholder="Ex: Florianópolis / SC"
            className="w-full bg-white border border-slate-200 focus:border-suseg-green focus:ring-2 focus:ring-suseg-green/10 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition-all text-sm font-semibold"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="tipo_servico" className="text-[10px] font-bold uppercase tracking-widest text-slate-450">
            Serviço de Interesse
          </label>
          <div className="relative">
            <select
              id="tipo_servico"
              name="tipo_servico"
              value={formData.tipo_servico}
              onChange={handleChange}
              required
              className="w-full bg-white border border-slate-200 focus:border-suseg-green focus:ring-2 focus:ring-suseg-green/10 rounded-xl px-4 py-3 text-slate-805 outline-none transition-all text-sm appearance-none cursor-pointer font-semibold"
            >
              <option value="" disabled>Selecione o serviço</option>
              <option value="Carregamento Veicular">Carregamento Veicular (Infraestrutura EV)</option>
              <option value="Automação Residencial e Predial">Automação Residencial e Predial</option>
              <option value="Segurança Eletrônica">Segurança Eletrônica (CFTV, Alarme, Acesso)</option>
            </select>
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-650 text-xs rounded-xl font-semibold">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 mt-2 bg-suseg-green hover:bg-suseg-green-dark disabled:opacity-50 text-white font-black text-sm rounded-xl transition-all shadow-md shadow-suseg-green/15 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          'Solicitar Orçamento Gratuito'
        )}
      </button>
    </form>
  );
}
