"use client";

import { useState } from "react";
import { Check, Zap, Crown, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";

type BillingCycle = "monthly" | "yearly";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const { toast } = useToast();

  const plans = [
    {
      name: "Free",
      icon: Zap,
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for getting started with content creation",
      features: [
        "Up to 10 posts per month",
        "Basic AI content generation",
        "1 social media account",
        "Email support",
        "Basic analytics",
        "Content calendar access",
      ],
      cta: "Get Started",
      highlighted: false,
      current: true,
    },
    {
      name: "Curative Pro",
      subtitle: "PREMIUM CONCIERGE",
      icon: Crown,
      price: { monthly: 149, yearly: 1490 },
      description: "Unlock AI-assisted scheduling, collaboration spaces, and campaign-level insights tailor-made for high-performing teams.",
      features: [
        "Unlimited AI batches & smart review flows",
        "Advanced analytics with channel heatmaps",
        "Dedicated strategist office hours",
      ],
      cta: "Explore upgrades",
      highlighted: true,
      current: false,
      premium: true,
    },
    {
      name: "Enterprise",
      icon: Rocket,
      price: { monthly: 99, yearly: 990 },
      description: "For teams and agencies managing multiple brands",
      features: [
        "Everything in Pro",
        "Unlimited social accounts",
        "Team collaboration (up to 10 users)",
        "Dedicated account manager",
        "Custom AI model training",
        "API access",
        "White-label options",
        "24/7 phone support",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      highlighted: false,
      current: false,
    },
  ];

  const handleSelectPlan = async (planName: string) => {
    if (planName === "Free") {
      toast({
        title: "Current Plan",
        description: "You are already on the Free plan.",
        variant: "default",
      });
      return;
    }

    if (planName === "Enterprise") {
      toast({
        title: "Contact Sales",
        description: "Our team will reach out to discuss your enterprise needs.",
        variant: "default",
      });
      return;
    }

    // Handle Pro plan upgrade
    toast({
      title: "Upgrade Initiated",
      description: "Redirecting to checkout...",
      variant: "default",
    });

    // TODO: Implement actual payment flow (Stripe, etc.)
    // For now, just simulate the action
  };

  const getSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyCost = monthlyPrice * 12;
    const savings = monthlyCost - yearlyPrice;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { amount: savings, percentage };
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[#2D2424]">
          Choose Your Plan
        </h1>
        <p className="text-lg text-[#6B5E5E] max-w-2xl mx-auto">
          Scale your content creation with flexible pricing that grows with your business
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-[#2D2424]" : "text-[#6B5E5E]"}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
          className="relative inline-flex h-7 w-12 items-center rounded-full bg-[#E9DCC9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D2B193] focus:ring-offset-2"
          role="switch"
          aria-checked={billingCycle === "yearly"}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-[#D2B193] transition-transform ${
              billingCycle === "yearly" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-[#2D2424]" : "text-[#6B5E5E]"}`}>
          Yearly
        </span>
        {billingCycle === "yearly" && (
          <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Save up to 17%
          </span>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const price = plan.price[billingCycle];
          const savings = billingCycle === "yearly" && plan.price.monthly > 0
            ? getSavings(plan.price.monthly, plan.price.yearly)
            : null;

          return (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                plan.highlighted && (plan as any).premium
                  ? "bg-gradient-to-br from-[#3A2F2F] via-[#4A3F3F] to-[#3A2F2F] text-white shadow-[0_32px_100px_rgba(0,0,0,0.4)] scale-105 border border-white/10"
                  : plan.highlighted
                  ? "bg-gradient-to-br from-[#D2B193] to-[#B89B7B] text-white shadow-2xl scale-105 border-2 border-[#D2B193]"
                  : "bg-white border-2 border-gray-200 hover:border-[#D2B193] hover:shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-[#D2B193] px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              {plan.current && !plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#6B5E5E] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="space-y-6">
                {/* Icon & Name */}
                <div className="space-y-3">
                  {(plan as any).subtitle && (
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70 font-semibold">
                      {(plan as any).subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      plan.highlighted && (plan as any).premium
                        ? "bg-white/10 backdrop-blur-sm"
                        : plan.highlighted
                        ? "bg-white/20"
                        : "bg-gradient-to-br from-[#D2B193] to-[#B89B7B]"
                    }`}>
                      <Icon className={`h-6 w-6 ${plan.highlighted ? "text-white" : "text-white"}`} />
                    </div>
                    <h3 className={`text-2xl font-bold ${plan.highlighted ? "text-white" : "text-[#2D2424]"}`}>
                      {plan.name}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-sm ${plan.highlighted ? "text-white/90" : "text-[#6B5E5E]"}`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="py-4">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold ${plan.highlighted ? "text-white" : "text-[#2D2424]"}`}>
                      ${price}
                    </span>
                    <span className={`text-lg ${plan.highlighted ? "text-white/80" : "text-[#6B5E5E]"}`}>
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  {savings && (
                    <p className={`mt-2 text-sm ${plan.highlighted ? "text-white/90" : "text-green-600"}`}>
                      Save ${savings.amount}/year ({savings.percentage}% off)
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full py-6 text-base font-semibold transition-all duration-300 rounded-xl ${
                    plan.highlighted && (plan as any).premium
                      ? "bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 hover:border-white/50"
                      : plan.highlighted
                      ? "bg-white text-[#D2B193] hover:bg-gray-100"
                      : plan.current
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#D2B193] text-white hover:bg-[#C2A183]"
                  }`}
                  disabled={plan.current && !plan.highlighted}
                >
                  {plan.cta}
                  {!plan.current && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>

                {/* Features */}
                <div className="pt-6 space-y-4">
                  <p className={`text-sm font-semibold uppercase tracking-wider ${
                    plan.highlighted ? "text-white/90" : "text-[#6B5E5E]"
                  }`}>
                    What's included:
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? "text-white" : "text-[#D2B193]"
                        }`} />
                        <span className={`text-sm ${plan.highlighted ? "text-white/90" : "text-[#6B5E5E]"}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-16 text-center space-y-4">
        <h3 className="text-2xl font-bold text-[#2D2424]">
          Need help choosing?
        </h3>
        <p className="text-[#6B5E5E] max-w-2xl mx-auto">
          All plans include a 14-day free trial. No credit card required. 
          You can upgrade, downgrade, or cancel anytime.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            className="border-[#D2B193] text-[#D2B193] hover:bg-[#D2B193] hover:text-white"
          >
            Compare Plans
          </Button>
          <Button
            variant="secondary"
            className="bg-white border-gray-300 text-[#2D2424] hover:bg-gray-50"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
