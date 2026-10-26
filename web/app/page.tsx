import { redirect } from "next/navigation";

export default function Home() {
  // a raiz leva ao dashboard; o middleware redireciona ao login se não houver sessão.
  redirect("/dashboard");
}
