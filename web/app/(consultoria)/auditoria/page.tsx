import { auditar, type Severidade, type CategoriaAchado } from "@/lib/data/auditoria";
import { listarEmpresas } from "@/lib/data/empresas";
import { AvisoBanco, Vazio } from "@/components/ui";

export const dynamic = "force-dynamic";

const LABEL_CAT: Record<CategoriaAchado, string> = {
  exame_aso: "Exame / ASO",
  exame_plano: "Plano de exames",
  treinamento: "Treinamento",
  cadastro: "Cadastro",
};

const SEV_CLS: Record<Severidade, string> = {
  alta: "bg-red-100 text-red-700",
  media: "bg-amber-100 text-amber-700",
  baixa: "bg-gray-100 text-gray-600",
};
const SEV_LABEL: Record<Severidade, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };

function Card({ titulo, valor, cor }: { titulo: string; valor: number; cor: string }) {
  return (
    <div className="bg-[var(--surface)] rounded-xl shadow p-4">
      <div className={`text-2xl font-bold ${cor}`}>{valor}</div>
      <div className="text-xs opacity-60 uppercase tracking-wide">{titulo}</div>
    </div>
  );
}

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ empresa?: string; sev?: string }>;
}) {
  const { empresa, sev } = await searchParams;
  const [res, empresasR] = await Promise.all([
    auditar(empresa || undefined),
    listarEmpresas(),
  ]);

  const todos = res.ok ? res.dados : [];
  const alta = todos.filter((a) => a.severidade === "alta").length;
  const media = todos.filter((a) => a.severidade === "media").length;
  const baixa = todos.filter((a) => a.severidade === "baixa").length;

  const sevFiltro = sev === "alta" || sev === "media" || sev === "baixa" ? sev : undefined;
  const lista = sevFiltro ? todos.filter((a) => a.severidade === sevFiltro) : todos;

  const empresas = empresasR.ok ? empresasR.empresas : [];

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Auditoria</h1>
      <p className="text-sm opacity-70 mb-4">
        Conformidade do cadastro: cruza os riscos de cada GHE com exames (plano e ASO),
        treinamentos e dados obrigatórios. Calculado ao vivo.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Card titulo="Total" valor={todos.length} cor="text-gray-700" />
        <Card titulo="Alta" valor={alta} cor="text-red-600" />
        <Card titulo="Média" valor={media} cor="text-amber-600" />
        <Card titulo="Baixa" valor={baixa} cor="text-gray-600" />
      </div>

      <form method="GET" className="flex flex-wrap items-end gap-3 mb-4">
        <label className="text-sm">
          <span className="block text-xs opacity-60 mb-1">Empresa</span>
          <select name="empresa" defaultValue={empresa ?? ""} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">Todas</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome_fantasia || e.razao_social}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs opacity-60 mb-1">Severidade</span>
          <select name="sev" defaultValue={sevFiltro ?? ""} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </label>
        <button className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold">
          Filtrar
        </button>
      </form>

      {!res.ok ? (
        <AvisoBanco erro={res.erro} />
      ) : lista.length === 0 ? (
        <Vazio texto="Nenhum achado de auditoria. Cadastro conforme 🎉" />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide opacity-60 border-b">
                <th className="p-3">Severidade</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Achado</th>
                <th className="p-3">Empresa</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((a) => (
                <tr key={a.chave} className="border-b last:border-0 align-top">
                  <td className="p-3">
                    <span className={`text-xs font-semibold rounded px-2 py-0.5 ${SEV_CLS[a.severidade]}`}>
                      {SEV_LABEL[a.severidade]}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap opacity-70">{LABEL_CAT[a.categoria]}</td>
                  <td className="p-3">
                    <div className="font-semibold">{a.titulo}</div>
                    <div className="text-xs opacity-60">{a.detalhe}</div>
                  </td>
                  <td className="p-3">{a.empresa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
