-- ============================================================================
-- Onboarding — funções para criar os perfis padrão de uma consultoria e para
-- fazer o bootstrap completo (consultoria + perfis + usuário admin).
-- Rodadas no lançamento, após criar o usuário no Supabase Auth.
-- ============================================================================

-- Perfis padrão (Administrador, Técnico SST, Operacional) com permissões.
-- Idempotente: pode rodar de novo sem duplicar.
create or replace function app_criar_perfis_padrao(p_consultoria uuid)
returns void language plpgsql as $$
declare
  v_modulos text[] := array[
    'empresas','estabelecimentos','funcoes','ghe','empregados',
    'riscos','medicina','documentos','treinamentos','epi',
    'vencimentos','auditoria','usuarios','perfis','configuracoes','log'
  ];
  v_admin uuid; v_tec uuid; v_oper uuid;
  m text; a text;
begin
  -- Administrador: acesso total
  insert into perfil_acesso (consultoria_id, nome, descricao, tipo_usuario, padrao_sistema)
  values (p_consultoria, 'Administrador', 'Acesso total ao sistema', 'consultoria', true)
  on conflict (consultoria_id, nome) do update set descricao = excluded.descricao
  returning id into v_admin;
  foreach m in array v_modulos loop
    foreach a in array array['ver','criar','editar','excluir'] loop
      insert into permissao (perfil_acesso_id, modulo, acao)
      values (v_admin, m, a::acao_rbac) on conflict do nothing;
    end loop;
  end loop;

  -- Técnico SST: ver/criar/editar (sem excluir)
  insert into perfil_acesso (consultoria_id, nome, descricao, tipo_usuario, padrao_sistema)
  values (p_consultoria, 'Técnico SST', 'Opera cadastros e SST (sem exclusões)', 'consultoria', true)
  on conflict (consultoria_id, nome) do update set descricao = excluded.descricao
  returning id into v_tec;
  foreach m in array v_modulos loop
    foreach a in array array['ver','criar','editar'] loop
      insert into permissao (perfil_acesso_id, modulo, acao)
      values (v_tec, m, a::acao_rbac) on conflict do nothing;
    end loop;
  end loop;

  -- Operacional: somente leitura
  insert into perfil_acesso (consultoria_id, nome, descricao, tipo_usuario, padrao_sistema)
  values (p_consultoria, 'Operacional (somente leitura)', 'Apenas visualização', 'consultoria', true)
  on conflict (consultoria_id, nome) do update set descricao = excluded.descricao
  returning id into v_oper;
  foreach m in array v_modulos loop
    insert into permissao (perfil_acesso_id, modulo, acao)
    values (v_oper, m, 'ver'::acao_rbac) on conflict do nothing;
  end loop;
end $$;

-- Bootstrap: cria a consultoria, os perfis padrão e o usuário admin (já criado
-- no Auth, cujo id é passado aqui) vinculado ao perfil Administrador.
-- Retorna o id da consultoria criada.
create or replace function app_bootstrap_consultoria(
  p_razao text,
  p_cnpj text,
  p_admin_user uuid,
  p_admin_nome text,
  p_admin_email text
) returns uuid language plpgsql as $$
declare
  v_cons uuid;
  v_admin_perfil uuid;
begin
  insert into consultoria (razao_social, cnpj)
  values (p_razao, nullif(p_cnpj, ''))
  returning id into v_cons;

  perform app_criar_perfis_padrao(v_cons);

  insert into usuario (id, consultoria_id, nome, email, tipo, ativo)
  values (p_admin_user, v_cons, p_admin_nome, p_admin_email, 'consultoria', true);

  select id into v_admin_perfil
  from perfil_acesso where consultoria_id = v_cons and nome = 'Administrador';

  insert into usuario_perfil (usuario_id, perfil_acesso_id)
  values (p_admin_user, v_admin_perfil) on conflict do nothing;

  return v_cons;
end $$;
