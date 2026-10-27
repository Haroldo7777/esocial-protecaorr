-- Seed gerado de tabela24_esocial.csv — NÃO editar à mão.
-- Camada oficial do eSocial (Tabela 24), somente leitura no app.
begin;
delete from risco_catalogo where camada = 'esocial';
-- (CSV vazio: preencha com os dados oficiais e rode o gerador novamente)
commit;
