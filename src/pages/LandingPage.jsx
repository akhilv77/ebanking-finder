import { Building2 } from "lucide-react";
import SingleLookupForm from "@/components/SingleLookupForm";
import CsvUploadSection from "@/components/CsvUploadSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <header className="bg-[#0f1729] text-white">
        <div className="mx-auto max-w-2xl px-6 py-5 flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-600">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight leading-tight">
              BankTech Finder
            </h1>
            <p className="text-xs text-slate-400">
              Identify e-banking providers for US banks &amp; credit unions
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 space-y-5">
        {/* Single Lookup */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-primary">
              Find E-Banking Provider
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Enter the homepage URL of any US bank or credit union to identify
              their provider.
            </p>
          </div>
          <div className="px-6 py-5">
            <SingleLookupForm />
          </div>
        </div>

        {/* CSV Bulk */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-5">
            <CsvUploadSection />
          </div>
        </div>
      </main>
    </div>
  );
}
