'use client';

import React, { useState, useEffect } from 'react';

export default function EvCalculator() {
  const [kmMonth, setKmMonth] = useState(1500);
  const [kmLiter, setKmLiter] = useState(10);
  const [fuelPrice, setFuelPrice] = useState(5.80);
  const [energyPrice, setEnergyPrice] = useState(0.85);

  // Derived values computed during rendering
  const fuelCost = (kmMonth / kmLiter) * fuelPrice;
  const kmPerKwh = 6.0;
  const energyCost = (kmMonth / kmPerKwh) * energyPrice;

  const monthlyFuelCost = Math.round(fuelCost);
  const monthlyEnergyCost = Math.round(energyCost);
  const monthlySavings = Math.max(0, monthlyFuelCost - monthlyEnergyCost);
  const annualSavings = monthlySavings * 12;
  const savingsPercent = monthlyFuelCost > 0 ? Math.round((monthlySavings / monthlyFuelCost) * 100) : 0;

  // Animated values
  const [displayedSavings, setDisplayedSavings] = useState(0);
  const [displayedAnnual, setDisplayedAnnual] = useState(0);

  // Smooth easing interpolation for monthly savings
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayedSavings((prev) => {
        const diff = monthlySavings - prev;
        if (Math.abs(diff) <= 1) {
          clearInterval(timer);
          return monthlySavings;
        }
        return prev + (diff > 0 ? Math.ceil(diff / 5) : Math.floor(diff / 5));
      });
    }, 16);

    return () => clearInterval(timer);
  }, [monthlySavings]);

  // Smooth easing interpolation for annual savings
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayedAnnual((prev) => {
        const diff = annualSavings - prev;
        if (Math.abs(diff) <= 1) {
          clearInterval(timer);
          return annualSavings;
        }
        return prev + (diff > 0 ? Math.ceil(diff / 5) : Math.floor(diff / 5));
      });
    }, 16);

    return () => clearInterval(timer);
  }, [annualSavings]);

  const getPercent = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  // Relative width calculation for comparison bars
  const maxCost = Math.max(monthlyFuelCost, monthlyEnergyCost, 1);
  const fuelBarWidth = (monthlyFuelCost / maxCost) * 100;
  const energyBarWidth = (monthlyEnergyCost / maxCost) * 100;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto overflow-hidden relative">
      {/* Detalhe de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-suseg-green/5 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* Painel de Inputs (Col 7) */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-8">
          
          <div className="space-y-6">
            {/* Input Distância */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs sm:text-sm font-black text-chombo-dark">
                <span>Distância Percorrida por Mês</span>
                <span className="text-suseg-green bg-suseg-green-light px-3 py-1 rounded-xl font-bold text-xs shadow-sm shadow-suseg-green/5 border border-suseg-green/10 transition-all duration-300 transform scale-105">
                  {kmMonth} km
                </span>
              </div>
              <div className="relative flex items-center h-6">
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={kmMonth}
                  onChange={(e) => setKmMonth(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #007A3E 0%, #007A3E ${getPercent(kmMonth, 500, 5000)}%, #E2E8F0 ${getPercent(kmMonth, 500, 5000)}%, #E2E8F0 100%)`
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#00542a] transition-all hover:h-2.5 outline-none"
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                <span>500 km</span>
                <span>5.000 km</span>
              </div>
            </div>

            {/* Input Consumo */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs sm:text-sm font-black text-chombo-dark">
                <span>Consumo do Veículo a Combustão</span>
                <span className="text-suseg-green bg-suseg-green-light px-3 py-1 rounded-xl font-bold text-xs shadow-sm shadow-suseg-green/5 border border-suseg-green/10 transition-all duration-300 transform scale-105">
                  {kmLiter} km/L
                </span>
              </div>
              <div className="relative flex items-center h-6">
                <input
                  type="range"
                  min="6"
                  max="20"
                  step="0.5"
                  value={kmLiter}
                  onChange={(e) => setKmLiter(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #007A3E 0%, #007A3E ${getPercent(kmLiter, 6, 20)}%, #E2E8F0 ${getPercent(kmLiter, 6, 20)}%, #E2E8F0 100%)`
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#00542a] transition-all hover:h-2.5 outline-none"
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                <span>6 km/L</span>
                <span>20 km/L</span>
              </div>
            </div>

            {/* Preços e Tarifas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Preço do Combustível</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-450">R$</span>
                  <input
                    type="number"
                    step="0.10"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-suseg-green rounded-2xl pl-8 pr-3 py-3 text-sm text-slate-800 font-bold transition-all outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Tarifa de Energia</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-450">R$</span>
                  <input
                    type="number"
                    step="0.05"
                    value={energyPrice}
                    onChange={(e) => setEnergyPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-suseg-green rounded-2xl pl-8 pr-3 py-3 text-sm text-slate-800 font-bold transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico Comparativo Interativo */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comparativo de Custo Mensal</h4>
            
            <div className="space-y-3">
              {/* Barra Combustível */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Veículo a Combustão</span>
                  <span className="font-mono text-slate-650">R$ {monthlyFuelCost}</span>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded-lg overflow-hidden">
                  <div
                    style={{ width: `${fuelBarWidth}%` }}
                    className="h-full bg-gradient-to-r from-red-400 to-rose-500 rounded-lg transition-all duration-300 ease-out"
                  />
                </div>
              </div>

              {/* Barra Elétrico */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-suseg-green">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-suseg-green animate-pulse" />
                    Veículo Elétrico (Recarga SUSEG)
                  </span>
                  <span className="font-mono font-extrabold">R$ {monthlyEnergyCost}</span>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded-lg overflow-hidden">
                  <div
                    style={{ width: `${energyBarWidth}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-suseg-green rounded-lg transition-all duration-300 ease-out shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Painel de Resultados (Col 5) */}
        <div className="md:col-span-5 p-8 bg-gradient-to-br from-chombo-dark via-slate-900 to-slate-950 text-white rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[350px] shadow-2xl border border-slate-800/50 group">
          {/* Efeito Glow interativo */}
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-suseg-green/10 rounded-full blur-3xl pointer-events-none group-hover:bg-suseg-green/20 transition-all duration-500" />
          
          {/* Watermark de Escudo */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 text-white/5 pointer-events-none group-hover:scale-105 transition-transform duration-500">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-suseg-green bg-suseg-green-light/20 border border-suseg-green/30 px-3 py-1 rounded-full">
                Resultado Estimado
              </span>
              <span className="text-[10px] font-extrabold text-[#74dfa4] bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                Poupança de ~{savingsPercent}%
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Economia Mensal</span>
              <div className="text-4xl font-black text-suseg-green-light flex items-baseline gap-1.5 transition-all duration-300 transform group-hover:scale-102">
                <span className="text-xl font-bold">R$</span>
                <span className="font-mono tracking-tight">{displayedSavings.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Economia Anual</span>
              <div className="text-5xl sm:text-6xl font-black text-white flex items-baseline gap-1.5 transition-all duration-300 transform group-hover:scale-102">
                <span className="text-2xl font-bold">R$</span>
                <span className="font-mono tracking-tighter text-glow">{displayedAnnual.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 text-[9px] text-slate-400 leading-relaxed relative z-10">
            <p className="font-medium">* Baseado em taxa média de 6,0 km/kWh para veículo elétrico.</p>
            <p className="mt-1 font-semibold text-suseg-green">Troque combustíveis fósseis por recarga elétrica e economize hoje.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
