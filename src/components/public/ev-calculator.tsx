'use client';

import React, { useState, useEffect } from 'react';

export default function EvCalculator() {
  const [kmMonth, setKmMonth] = useState(1500);
  const [kmLiter, setKmLiter] = useState(10);
  const [fuelPrice, setFuelPrice] = useState(5.80);
  const [energyPrice, setEnergyPrice] = useState(0.85);

  const [monthlySavings, setMonthlySavings] = useState(0);
  const [annualSavings, setAnnualSavings] = useState(0);

  useEffect(() => {
    // Cálculo do custo do combustível fóssil
    const monthlyFuelCost = (kmMonth / kmLiter) * fuelPrice;

    // Cálculo do custo da energia elétrica (média de 6 km por kWh para um elétrico típico)
    const kmPerKwh = 6.0;
    const monthlyEnergyCost = (kmMonth / kmPerKwh) * energyPrice;

    const savingsM = Math.max(0, monthlyFuelCost - monthlyEnergyCost);
    const savingsA = savingsM * 12;

    setMonthlySavings(Math.round(savingsM));
    setAnnualSavings(Math.round(savingsA));
  }, [kmMonth, kmLiter, fuelPrice, energyPrice]);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Painel de Inputs */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-bold text-chombo">
              <span>Distância Percorrida por Mês</span>
              <span className="text-suseg-green bg-suseg-green-light px-2.5 py-0.5 rounded-lg font-mono font-bold text-xs">{kmMonth} km</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={kmMonth}
              onChange={(e) => setKmMonth(Number(e.target.value))}
              className="w-full accent-suseg-green h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <span>500 km</span>
              <span>5.000 km</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-bold text-chombo">
              <span>Consumo Médio (Combustão)</span>
              <span className="text-suseg-green bg-suseg-green-light px-2.5 py-0.5 rounded-lg font-mono font-bold text-xs">{kmLiter} km/L</span>
            </div>
            <input
              type="range"
              min="6"
              max="20"
              step="0.5"
              value={kmLiter}
              onChange={(e) => setKmLiter(Number(e.target.value))}
              className="w-full accent-suseg-green h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <span>6 km/L</span>
              <span>20 km/L</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Preço do Combustível (R$/L)</label>
              <input
                type="number"
                step="0.10"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-bold focus:border-suseg-green focus:ring-1 focus:ring-suseg-green outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Tarifa de Energia (R$/kWh)</label>
              <input
                type="number"
                step="0.05"
                value={energyPrice}
                onChange={(e) => setEnergyPrice(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-bold focus:border-suseg-green focus:ring-1 focus:ring-suseg-green outline-none"
              />
            </div>
          </div>
        </div>

        {/* Painel de Resultados */}
        <div className="p-6 sm:p-8 bg-chombo text-white rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px] shadow-lg">
          {/* Decorative Shield Watermark */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 text-white/5 pointer-events-none">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
          </div>

          <div className="space-y-6 relative z-10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-suseg-green bg-suseg-green-light/90 px-3 py-1 rounded-full border border-suseg-green/30">Economia Estimada SUSEG</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Mensal</span>
              <div className="text-3xl sm:text-4xl font-black text-suseg-green-light flex items-baseline gap-1">
                <span className="text-lg">R$</span>
                <span className="font-mono">{monthlySavings.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Anual</span>
              <div className="text-5xl sm:text-6xl font-black text-white flex items-baseline gap-1">
                <span className="text-2xl font-bold">R$</span>
                <span className="font-mono">{annualSavings.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700/60 text-[9px] text-slate-400 leading-relaxed relative z-10">
            * Baseado em consumo de 6,0 km/kWh para veículo elétrico (EV) em recarga residencial.
          </div>
        </div>
      </div>
    </div>
  );
}
