import Link from "next/link";
import FormPerfil, { type PerfilInicial } from "../../nova/form";
import { atualizarPerfil } from "./actions";
import { getPerfil } from "@/lib/data/admin";
import { AvisoBanco } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EditarPerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getPerfil(id);

  if (!res.ok) {
    return (
      <div>
        <Link href="/permissoes" className="text-sm text-brand-ink">
          ← Voltar
        </Link>
        <AvisoBanco erro={res.erro} />
      </div>
    );
  }

  const p = res.dados;
  const initial: PerfilInicial = {
    nome: p.nome,
    descricao: p.descricao,
    permissoes: new Set(p.permissoes),
  };
  const acao = atualizarPerfil.bind(null, id);

  return (
    <div>
      <Link href="/permissoes" className="text-sm text-brand-ink">
        ← Voltar
      </Link>
      <h1 className="text-xl font-bold mt-2 mb-4">Editar perfil: {p.nome}</h1>
      <FormPerfil
        action={acao}
        initial={initial}
        submitLabel="Salvar alterações"
        bloqueado={p.padrao_sistema}
      />
    </div>
  );
}
