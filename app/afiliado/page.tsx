import { AffiliateDashboard } from "@/components/affiliate-dashboard"

export default async function AfiliadoPage() {
  // Dados fictícios do afiliado para demonstração
  const mockAffiliate = {
    id: "demo-affiliate-id",
    affiliate_code: "DEMO123",
    user_email: "demo@afiliado.com",
    user_name: "Usuário Demo",
    password_hash: "",
    commission_rate: 0.1,
    total_earnings: 1250.5,
    total_referrals: 25,
    active_referrals: 18,
    total_sales: 12,
    status: "active" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Dados fictícios das estatísticas
  const mockStats = {
    total_referrals: 25,
    active_referrals: 18,
    total_sales: 12,
    total_earnings: 1250.5,
    clicks_today: 45,
    monthly_earnings: [
      { sale_date: "2024-01-15", commission_amount: "150.00" },
      { sale_date: "2024-02-20", commission_amount: "200.50" },
      { sale_date: "2024-03-10", commission_amount: "300.00" },
      { sale_date: "2024-04-05", commission_amount: "180.25" },
      { sale_date: "2024-05-12", commission_amount: "420.75" },
    ],
    recent_sales: [
      {
        buyer_email: "cliente1@email.com",
        sale_date: "2024-05-10",
        commission_amount: "50.00",
        key_type: "Premium",
      },
      {
        buyer_email: "cliente2@email.com",
        sale_date: "2024-05-08",
        commission_amount: "75.50",
        key_type: "VIP",
      },
      {
        buyer_email: "cliente3@email.com",
        sale_date: "2024-05-05",
        commission_amount: "30.00",
        key_type: "Basic",
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AffiliateDashboard affiliate={mockAffiliate} stats={mockStats} />
    </div>
  )
}
