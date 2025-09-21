import { AffiliateLoginForm } from "@/components/affiliate-login-form"

export default function AffiliateLoginPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Painel do Afiliado</h1>
            <p className="text-gray-400">Entre com suas credenciais</p>
          </div>

          <AffiliateLoginForm />

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{" "}
              <a href="/afiliado/register" className="text-blue-400 hover:text-blue-300">
                Cadastre-se aqui
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
