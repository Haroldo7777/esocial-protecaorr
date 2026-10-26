// Validações oficiais reaproveitadas em formulários e no servidor.

export function cnpjValido(v: string): boolean {
  const d = v.replace(/\D/g, "");
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const n = d.split("").map(Number);
  const calc = (arr: number[]) => {
    let p = arr.length - 7,
      s = 0;
    for (const x of arr) {
      s += x * p;
      p--;
      if (p < 2) p = 9;
    }
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(n.slice(0, 12));
  const d2 = calc(n.slice(0, 12).concat(d1));
  return n[12] === d1 && n[13] === d2;
}

export function cpfValido(v: string): boolean {
  const d = v.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const n = d.split("").map(Number);
  let s = 0;
  for (let i = 0; i < 9; i++) s += n[i] * (10 - i);
  let r = (s * 10) % 11;
  if (r === 10) r = 0;
  if (r !== n[9]) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += n[i] * (11 - i);
  r = (s * 10) % 11;
  if (r === 10) r = 0;
  return r === n[10];
}

/** CBO: 6 dígitos (validação de formato; a validação de existência é contra o seed oficial). */
export function cboFormatoValido(v: string): boolean {
  return /^\d{6}$/.test(v.replace(/\D/g, ""));
}

export const mascaraCnpj = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\/\d{4})(\d)/, "$1-$2");

export const mascaraCpf = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
