import { PageHeader, GlassCard, SectionTitle } from '@/components/dashboard/kit'

const CURRENCIES = [
  { code: 'CNY', label: '人民币（¥）' },
  { code: 'USD', label: '美元（$）' },
]

export default function CurrencyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="货币" description="店铺商品价格使用的币种。" />

      <GlassCard>
        <SectionTitle title="店铺币种" />
        <div className="space-y-2.5">
          {CURRENCIES.map((c) => (
            <label
              key={c.code}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border transition-colors ${
                c.code === 'CNY'
                  ? 'bg-white border-iris/60'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <input
                type="radio"
                name="currency"
                defaultChecked={c.code === 'CNY'}
                disabled={c.code !== 'CNY'}
                className="accent-iris"
              />
              <span className="text-sm font-semibold text-gray-800">{c.code}</span>
              <span className="text-xs text-gray-500">{c.label}</span>
              {c.code === 'CNY' && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-iris text-iris">
                  当前
                </span>
              )}
            </label>
          ))}
        </div>
        <p className="mt-6 pt-5 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
          多币种切换功能即将上线，当前店铺默认使用人民币（CNY）。
        </p>
      </GlassCard>
    </div>
  )
}
