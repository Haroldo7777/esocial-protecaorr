-- ============================================================================
-- risco_catalogo: nome/descrição do agente conforme o eSocial (ex.: "#136 -
-- Benzeno e seus compostos tóxicos"), usado como referência ao lado do código
-- da Tabela 24. Preenchido pelos seeds da camada oficial.
-- ============================================================================
alter table risco_catalogo add column nome_esocial text;
