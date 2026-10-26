import { listarEstabelecimentos } from "@/lib/data/empresa-ctx";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EstabelecimentosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await listarEstabelecimentos(id);

  return (
    <div>
      <CabecalhoLista
        titulo="Ambientes e Estabelecimentos"
        hrefNovo={`/empresas/${id}/estabelecimentos/nova`}
        rotuloNovo="+ Adicionar estabelecimento"
      />
      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhum estabelecimento. Cadastre a matriz e as filiais (leiaute S-1005)." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {res.dados.map((e) => (
            <div key={e.id} className="bg-[var(--surface)] rounded-xl shadow p-4">
              <div className="flex items-center gap-2">
                <b>{e.apelido || e.inscricao}</b>
                {e.tipo_unidade === "matriz" ? (
                  <span className="text-[10px] font-bold bg-brand-light text-brand-ink px-2 py-0.5 rounded-full">
                    MATRIZ
                  </span>
                ) : null}
              </div>
              <div className="text-sm opacity-70 mt-1">
                {e.tipo_inscricao.toUpperCase()}: {e.inscricao}
              </div>
              <div className="text-sm opacity-60">
                {[e.cidade, e.uf].filter(Boolean).join(" / ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
