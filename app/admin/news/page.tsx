import { prisma } from "@/app/lib/prisma";

import { refreshNewsAction, toggleNewsAction } from "./actions";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = { vehicles: "Vehículos", music: "Música", street: "Street" };

export default async function AdminNewsPage() {
  const articles = await prisma.newsArticle.findMany({ orderBy: [{ isActive: "desc" }, { editorialScore: "desc" }, { publishedAt: "desc" }] });
  return <div className="mx-auto max-w-7xl">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div><p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Editorial</p><h1 className="mt-3 text-4xl font-medium tracking-tight text-white">Noticias</h1><p className="mt-3 max-w-xl text-sm leading-7 text-white/45">Selección persistente por idioma, territorio y categoría. Solo se muestran noticias con una puntuación editorial de 60 o más.</p></div>
      <form action={refreshNewsAction}><button className="border border-[#c9a86a]/60 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9a86a] transition hover:bg-[#c9a86a] hover:text-black">Forzar actualización</button></form>
    </div>
    <div className="overflow-x-auto border border-white/10 bg-white/[0.02]"><table className="w-full min-w-[900px] text-left"><thead className="border-b border-white/10 text-[10px] uppercase tracking-[0.16em] text-white/35"><tr><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Noticia</th><th className="px-5 py-4">Edición</th><th className="px-5 py-4">Categoría</th><th className="px-5 py-4">Score</th><th className="px-5 py-4">Acción</th></tr></thead><tbody className="divide-y divide-white/10">{articles.map((article) => <tr key={article.id} className="align-top text-sm text-white/70"><td className="px-5 py-5"><span className={`inline-flex h-2 w-2 rounded-full ${article.isActive ? "bg-green-400" : "bg-white/25"}`} aria-label={article.isActive ? "Activa" : "Oculta"} /></td><td className="max-w-md px-5 py-5"><a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium leading-6 text-white hover:text-[#c9a86a]">{article.title}</a><p className="mt-2 text-xs text-white/35">{article.source}</p></td><td className="px-5 py-5">{article.locale.toUpperCase()} · {article.region}</td><td className="px-5 py-5">{categoryLabels[article.category] ?? article.category}</td><td className="px-5 py-5 font-semibold text-[#c9a86a]">{article.editorialScore}</td><td className="px-5 py-5"><form action={toggleNewsAction}><input type="hidden" name="id" value={article.id} /><input type="hidden" name="isActive" value={String(!article.isActive)} /><button className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55 hover:text-white">{article.isActive ? "Ocultar" : "Activar"}</button></form></td></tr>)}</tbody></table>{articles.length === 0 && <p className="px-5 py-12 text-sm text-white/40">Todavía no hay noticias. Ejecuta una actualización cuando las variables de entorno estén configuradas.</p>}</div>
  </div>;
}