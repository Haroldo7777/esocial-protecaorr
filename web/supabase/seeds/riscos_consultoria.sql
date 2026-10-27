-- Seed gerado de riscos_consultoria.csv — NÃO editar à mão.
-- Riscos próprios da consultoria (camada consultoria). Inserido para cada
-- consultoria existente; idempotente via NOT EXISTS (nome por consultoria).
begin;
insert into risco_catalogo (camada, consultoria_id, categoria, nome, nome_esocial, codigo_tabela24, qualitativo)
select 'consultoria', c.id, 'Físico', 'Postura predominantemente sentada', '#24 - Outros', null, true
from consultoria c
where not exists (
  select 1 from risco_catalogo x
  where x.camada = 'consultoria' and x.consultoria_id = c.id and x.nome = 'Postura predominantemente sentada'
);
commit;
