-- Seed gerado de exames.csv — NÃO editar à mão.
-- Catálogo de tipos de exame por consultoria (exame_tipo). Inserido para cada
-- consultoria existente; idempotente via ON CONFLICT (consultoria_id, nome).
begin;
insert into exame_tipo (consultoria_id, nome, aso_admissional, aso_periodico, aso_demissional, aso_retorno, aso_mudanca)
select c.id, v.nome, v.a, v.p, v.d, v.rt, v.mr
from consultoria c
cross join (values
  ('Acetilcolinesterase plasmática', true, true, true, true, true),
  ('Audiometria tonal ocupacional', true, true, true, true, true),
  ('Avaliação Clínica Ocupacional (Anamnese e Exame físico)', true, true, true, true, true),
  ('Avaliação da acuidade visual', true, true, true, true, true),
  ('Glicemia', true, true, true, true, true),
  ('Hemograma com contagem de plaquetas ou frações (eritrograma, leucograma, plaquetas)', true, true, true, true, true),
  ('Prova de função pulmonar completa (ou espirometria)', true, true, true, true, true),
  ('Radiografia de coluna lombo-sacra', true, true, true, true, true),
  ('Radiografia de tórax (PA) Padrão OIT (o mais recente), com pelo menos um leitor habilitado', true, true, true, true, true),
  ('Micólogico Direto', true, true, true, true, true)
) as v(nome, a, p, d, rt, mr)
on conflict (consultoria_id, nome) do nothing;
commit;
