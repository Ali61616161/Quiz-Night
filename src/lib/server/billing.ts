import { PLANS, yearlyPrice, type PlanId } from "@config/plans";
import { audit, db, save, type Coupon, type Venue } from "./db";
import { sendMail } from "./mail";

export const KDV = 0.2;
const DAY = 24 * 3600_000;

export interface BillingProvider {
  name: string;
  charge(p: { venueId: string; amountTry: number; paymentToken: string; description: string }): Promise<{ ok: true; ref: string } | { ok: false; error: string }>;
}

/** Sahte sağlayıcı: "fail" ile biten token ödemeyi reddeder. Yerel geliştirme ve test içindir. */
export const fakeProvider: BillingProvider = {
  name: "fake",
  async charge(p) {
    if (p.paymentToken.endsWith("fail")) return { ok: false, error: "Kart reddedildi. Başka bir kart dene." };
    return { ok: true, ref: `fake_${Date.now()}` };
  },
};

/** iyzico iskeleti: Checkout Form / abonelik API'si bağlanacak. Anahtarlar `.env` içinde. */
export const iyzicoProvider: BillingProvider = {
  name: "iyzico",
  async charge() {
    if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) return { ok: false, error: "Ödeme sağlayıcısı yapılandırılmadı." };
    // TODO: iyzipay SDK ile abonelik başlat, HMAC imzalı istek, 3D Secure yönlendirmesi.
    return { ok: false, error: "iyzico entegrasyonu henüz tamamlanmadı." };
  },
};
export const provider = (): BillingProvider => (process.env.BILLING_PROVIDER === "iyzico" ? iyzicoProvider : fakeProvider);

export function findCoupon(code: string, now = Date.now()): Coupon | null {
  const c = db.coupons[code.trim().toUpperCase()];
  if (!c) return null;
  if (c.expires && c.expires < now) return null;
  if (c.uses >= c.maxUses) return null;
  return c;
}

export function quote(plan: PlanId, cycle: "monthly" | "yearly", couponCode?: string) {
  const P = PLANS[plan];
  const gross = cycle === "yearly" ? yearlyPrice(P) : P.priceTryMonthly;
  const c = couponCode ? findCoupon(couponCode) : null;
  const off = c ? Math.round((gross * c.percentOff) / 100) : 0;
  const net = gross - off;
  const kdv = Math.round(net * KDV * 100) / 100;
  return { gross, discount: off, net, kdv, total: Math.round((net + kdv) * 100) / 100, coupon: c };
}

export async function subscribe(v: Venue, plan: PlanId, cycle: "monthly" | "yearly", paymentToken: string, couponCode?: string) {
  if (plan === "free") return downgrade(v);
  const q = quote(plan, cycle, couponCode);
  if (couponCode && !q.coupon) return { ok: false as const, error: "Kupon geçersiz ya da süresi dolmuş." };
  const r = await provider().charge({ venueId: v.id, amountTry: q.total, paymentToken, description: `${PLANS[plan].name} ${cycle}` });
  const inv = { id: Math.random().toString(36).slice(2, 10), at: Date.now(), amountTry: q.total, kdv: q.kdv, plan, status: r.ok ? ("paid" as const) : ("failed" as const) };
  v.invoices.push(inv);
  if (!r.ok) { save(); return { ok: false as const, error: r.error }; }
  v.plan = plan; v.cycle = cycle; v.status = "active";
  v.renewsAt = Date.now() + (cycle === "yearly" ? 365 : 30) * DAY;
  if (q.coupon) { q.coupon.uses++; v.couponCode = q.coupon.code; v.discountPercent = q.coupon.percentOff; v.discountMonthsLeft = cycle === "monthly" ? Math.max(0, q.coupon.months - 1) : 0; }
  audit(v.ownerEmail, `abonelik: ${plan}/${cycle}`);
  save();
  return { ok: true as const, invoice: inv };
}

/** Planı düşürmek özellikleri kapatır, veriyi silmez (kapılar `can()` ile sunucuda). */
export function downgrade(v: Venue) {
  v.plan = "free"; v.status = "active"; v.renewsAt = null; v.discountPercent = 0; v.discountMonthsLeft = 0;
  audit(v.ownerEmail, "plan düşürüldü: free"); save();
  return { ok: true as const };
}

export function cancel(v: Venue) {
  if (v.plan === "free") return;
  v.status = "canceled"; // dönem sonuna kadar plan geçerli (effectivePlan)
  audit(v.ownerEmail, "abonelik iptal"); save();
}

/** Yenileme (cron). Başarısız ödemede past_due, 7 gün sonra effectivePlan ücretsize düşer. */
export async function renewDue(now = Date.now()) {
  let renewed = 0, failed = 0;
  for (const v of Object.values(db.venues)) {
    if (v.plan === "free" || !v.renewsAt || v.renewsAt > now || v.status === "canceled") continue;
    const disc = v.discountMonthsLeft > 0 ? v.discountPercent : 0;
    const gross = v.cycle === "yearly" ? yearlyPrice(PLANS[v.plan]) : PLANS[v.plan].priceTryMonthly;
    const net = gross - Math.round((gross * disc) / 100);
    const total = Math.round(net * (1 + KDV) * 100) / 100;
    const r = await provider().charge({ venueId: v.id, amountTry: total, paymentToken: "saved", description: "yenileme" });
    v.invoices.push({ id: Math.random().toString(36).slice(2, 10), at: now, amountTry: total, kdv: Math.round(net * KDV * 100) / 100, plan: v.plan, status: r.ok ? "paid" : "failed" });
    if (r.ok) { v.renewsAt = now + (v.cycle === "yearly" ? 365 : 30) * DAY; v.status = "active"; if (v.discountMonthsLeft > 0) v.discountMonthsLeft--; renewed++; }
    else { v.status = "past_due"; failed++; sendMail(v.ownerEmail, "Ödeme alınamadı", "Aboneliğin yenilenemedi. 7 gün içinde ödeme yöntemini güncelle, yoksa plan ücretsize düşer."); }
  }
  save();
  return { renewed, failed };
}
