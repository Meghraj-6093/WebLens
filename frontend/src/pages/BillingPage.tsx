import React, { useState, useEffect } from 'react';
import { CreditCard, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { PricingPlan } from '@weblens/shared';

export const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const token = localStorage.getItem('weblens_token');

  useEffect(() => {
    fetch('http://localhost:3001/api/billing/plans')
      .then(res => res.json())
      .then(data => setPlans(data))
      .catch(err => console.error('Failed to load plans', err));
  }, []);

  const handleUpgrade = async (tier: string) => {
    if (!token) return;
    setIsUpgrading(tier);

    try {
      const res = await fetch('http://localhost:3001/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tier })
      });

      if (res.ok) {
        setSuccessMessage(`Successfully upgraded to ${tier.toUpperCase()} plan!`);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      console.error('Upgrade failed', err);
    } finally {
      setIsUpgrading(null);
    }
  };

  const currentTier = user?.tier || 'free';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/15 border border-[#FF6B35]/30 text-[#FF6B35] text-xs font-bold uppercase tracking-wider">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Flexible Plans for Developers & Agencies</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#F3F0E8] tracking-tight">
          Supercharge Your Website Audits
        </h1>
        <p className="text-sm text-[#8E8A82]">
          Scale from single site checks to automated daily monitoring, multi-competitor benchmarking, white-label client reports, and developer APIs.
        </p>
      </div>

      {successMessage && (
        <div className="max-w-md mx-auto p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-xs text-[#34D399] font-bold">
          {successMessage}
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((p) => {
          const isCurrent = currentTier === p.id;
          return (
            <div
              key={p.id}
              className={`card-glow rounded-3xl p-8 border flex flex-col justify-between relative transition-all ${p.highlighted ? 'border-[#FF6B35] shadow-2xl shadow-[#FF6B35]/10 bg-[#11151B]' : 'border-[rgba(243,240,232,0.08)] bg-[#11151B]'}`}
            >
              {p.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#FF6B35] text-[#080A0E] text-[10px] font-black uppercase tracking-widest shadow">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#F3F0E8]">{p.name}</h3>
                  <p className="text-xs text-[#8E8A82] mt-1 min-h-[32px]">{p.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-[#F3F0E8] font-mono">${p.priceMonthly}</span>
                  <span className="text-xs text-[#6E6A63] font-medium">/ month</span>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-[rgba(243,240,232,0.08)]">
                  <div className="text-[11px] font-bold text-[#8E8A82] uppercase tracking-wider">Features included:</div>
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-[#D8D4CA]">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-[#34D399] flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                {isCurrent ? (
                  <Button size="md" variant="ghost" disabled className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    size="md"
                    variant={p.highlighted ? 'primary' : 'secondary'}
                    className="w-full"
                    onClick={() => handleUpgrade(p.id)}
                    isLoading={isUpgrading === p.id}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Upgrade to {p.name}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
