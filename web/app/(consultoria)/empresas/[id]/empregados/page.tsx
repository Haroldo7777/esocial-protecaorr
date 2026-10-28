import { listarEmpregados } from "@/lib/data/empresa-ctx";
import { CabecalhoLista, AvisoBanco, Vazio } from "@/components/ui";
import { mascaraCpf } from "@/lib/validators";

export const dynamic = "force-dynamic";

export default async function EmpregadosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await listarEmpregados(id);

  return (
    <div>
      <CabecalhoLista titulo="Empregados" hrefNovo={`/empresas/${id}/empregados/nova`} rotuloNovo="+ Adicionar empregado" hrefImport={`/empresas/${id}/empregados/importar`} hrefExport={`/empresas/${id}/empregados/export`} />
      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : res.dados.length === 0 ? (
        <Vazio texto="Nenhum empregado ativo. Cadastre pelo botão acima (leiaute S-2200)." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Nome</th>
                <th className="p-3">CPF</th>
                <th className="p-3">Matrícula</th>
                <th className="p-3">Função</th>
                <th className="p-3">Categoria</th>
              </tr>
            </thead>
            <tbody>
              {res.dados.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="p-3 font-semibold">{e.nome}</td>
                  <td className="p-3">{mascaraCpf(e.cpf)}</td>
                  <td className="p-3">{e.matricula ?? "—"}</td>
                  <td className="p-3">{e.funcao?.nome ?? "—"}</td>
                  <td className="p-3">{e.categoria_esocial ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
