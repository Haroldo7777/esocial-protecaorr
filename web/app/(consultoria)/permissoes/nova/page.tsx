import Link from "next/link";
import FormPerfil from "./form";
import { criarPerfil } from "./actions";

export const dynamic = "force-dynamic";

export default function NovoPerfilPage() {
  return (
    <div>
      <Link href="/permissoes" className="text-sm text-brand-ink">
        ← Voltar
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-4">Novo perfil de acesso</h1>
      <FormPerfil action={criarPerfil} />
    </div>
  );
}
