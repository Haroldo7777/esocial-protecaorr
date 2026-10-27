import Link from "next/link";
import FormAcesso from "./form";
import { getUsuario, listarPerfisSimples } from "@/lib/data/admin";
import { AvisoBanco } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function GerirAcessoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [uR, perfisR] = await Promise.all([getUsuario(id), listarPerfisSimples()]);

  if (!uR.ok) {
    return (
      <div>
        <Link href="/usuarios" className="text-sm text-brand-ink">
          ← Voltar
        </Link>
        <AvisoBanco erro={uR.erro} />
      </div>
    );
  }

  const u = uR.dados;
  const perfis = perfisR.ok ? perfisR.dados : [];

  return (
    <div>
      <Link href="/usuarios" className="text-sm text-brand-ink">
        ← Voltar
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-4">Gerir acesso</h1>
      <FormAcesso
        usuarioId={u.id}
        nome={u.nome}
        email={u.email}
        ativo={u.ativo}
        perfis={perfis}
        selecionados={new Set(u.perfilIds)}
      />
    </div>
  );
}
