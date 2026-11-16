import Link from "next/link";

import { requireAdminSession } from "@/app/lib/admin-session";
import { prisma } from "@/app/lib/prisma";
import ConfirmButton from "./ConfirmButton";
import {
  deleteCommunityTopic,
  deleteCommunityReply,
  blockCommunityUser,
  unblockCommunityUser,
} from "./actions";

export const dynamic = "force-dynamic";

function dateLabel(value: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(value);
}

const categoryNames = {
  MUSIC: "MÚSICA",
  FASHION: "MODA",
  AUTOMOTIVE: "MOTOR",
} as const;

export default async function CommunityAdminPage() {
  await requireAdminSession();

  const [topics, replies, users, totalTopics, totalUsers, suspendedUsers] =
    await Promise.all([
      prisma.communityTopic.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          body: true,
          category: true,
          status: true,
          createdAt: true,
          author: { select: { id: true, username: true, status: true } },
          _count: { select: { replies: true, attachments: true } },
        },
      }),
      prisma.communityReply.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: { select: { id: true, username: true, status: true } },
          topic: { select: { title: true, category: true } },
        },
      }),
      prisma.communityUser.findMany({
        take: 200,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          role: true,
          createdAt: true,
          _count: { select: { topics: true, replies: true } },
        },
      }),
      prisma.communityTopic.count(),
      prisma.communityUser.count(),
      prisma.communityUser.count({ where: { status: "SUSPENDED" } }),
    ]);

  return (
    <div className="mx-auto max-w-6xl pb-20 text-white">
      <header className="border-b border-white/10 pb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
          VANMOTION / ADMINISTRACIÓN
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Moderación de comunidad.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">
          MÚSICA, MODA y MOTOR siguen abiertos: las publicaciones aparecen sin aprobación previa.
          Solo desde este panel privado puedes eliminar contenido o suspender cuentas.
        </p>
        <Link href="/community" target="_blank" className="mt-5 inline-block text-sm underline underline-offset-4">
          Ver comunidad pública ↗
        </Link>
      </header>

      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="border border-white/15 bg-white/[0.04] p-5">
          <strong className="block text-3xl">{totalTopics}</strong>
          <span className="mt-2 block text-xs text-white/50">Publicaciones</span>
        </div>
        <div className="border border-white/15 bg-white/[0.04] p-5">
          <strong className="block text-3xl">{totalUsers}</strong>
          <span className="mt-2 block text-xs text-white/50">Usuarios registrados</span>
        </div>
        <div className="border border-white/15 bg-white/[0.04] p-5">
          <strong className="block text-3xl">{suspendedUsers}</strong>
          <span className="mt-2 block text-xs text-white/50">Usuarios bloqueados</span>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="moderation-topics">
        <h2 id="moderation-topics" className="text-2xl font-semibold">Publicaciones</h2>
        <p className="mt-2 text-sm text-white/45">Últimas 100. Al eliminar una publicación también desaparecen sus respuestas y referencias a las fotografías.</p>
        <div className="mt-5 space-y-3">
          {topics.length === 0 && <p className="border border-white/10 p-5 text-white/50">Todavía no hay publicaciones.</p>}
          {topics.map((topic) => (
            <article key={topic.id} className="border border-white/15 bg-[#0d0d0d] p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold tracking-widest text-white/45">
                    {categoryNames[topic.category]} · {topic.status} · {dateLabel(topic.createdAt)}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold break-words">{topic.title}</h3>
                  <p className="mt-2 text-xs text-white/50">
                    Autor: {topic.author.username} · {topic._count.attachments} imágenes · {topic._count.replies} respuestas
                    {topic.author.status === "SUSPENDED" ? " · USUARIO BLOQUEADO" : ""}
                  </p>
                </div>
                <form action={deleteCommunityTopic}>
                  <input type="hidden" name="topicId" value={topic.id} />
                  <ConfirmButton danger label="Eliminar publicación" question={`¿Eliminar definitivamente «${topic.title}» y todas sus respuestas?`} />
                </form>
              </div>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-white/65">{topic.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="moderation-replies">
        <h2 id="moderation-replies" className="text-2xl font-semibold">Respuestas</h2>
        <p className="mt-2 text-sm text-white/45">Últimas 100 respuestas publicadas.</p>
        <div className="mt-5 space-y-3">
          {replies.length === 0 && <p className="border border-white/10 p-5 text-white/50">Todavía no hay respuestas.</p>}
          {replies.map((reply) => (
            <article key={reply.id} className="flex flex-col gap-4 border border-white/15 bg-[#0d0d0d] p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold tracking-widest text-white/45">
                  {categoryNames[reply.topic.category]} · {reply.topic.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/70 whitespace-pre-wrap break-words">{reply.body}</p>
                <p className="mt-2 text-xs text-white/45">{reply.author.username} · {dateLabel(reply.createdAt)}</p>
              </div>
              <form action={deleteCommunityReply}>
                <input type="hidden" name="replyId" value={reply.id} />
                <ConfirmButton danger label="Eliminar respuesta" question="¿Eliminar definitivamente esta respuesta?" />
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="moderation-users">
        <h2 id="moderation-users" className="text-2xl font-semibold">Usuarios</h2>
        <p className="mt-2 text-sm text-white/45">Últimos 200. Al bloquear a alguien, se cierra su sesión y no puede volver a publicar con esa cuenta. Puedes desbloquearlo cuando quieras.</p>
        <div className="mt-5 space-y-3">
          {users.length === 0 && <p className="border border-white/10 p-5 text-white/50">Todavía no hay usuarios.</p>}
          {users.map((user) => (
            <article key={user.id} className="flex flex-col gap-4 border border-white/15 bg-[#0d0d0d] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold break-words">{user.username}</p>
                <p className="mt-1 text-xs break-all text-white/50">{user.email}</p>
                <p className="mt-2 text-xs text-white/45">
                  {user.status === "SUSPENDED" ? "BLOQUEADO" : "ACTIVO"} · {user._count.topics} publicaciones · {user._count.replies} respuestas · Alta {dateLabel(user.createdAt)}
                </p>
              </div>
              {user.role === "MEMBER" ? (
                <form action={user.status === "SUSPENDED" ? unblockCommunityUser : blockCommunityUser}>
                  <input type="hidden" name="userId" value={user.id} />
                  {user.status === "SUSPENDED" ? (
                    <ConfirmButton label="Desbloquear" question={`¿Permitir que ${user.username} vuelva a participar?`} />
                  ) : (
                    <ConfirmButton danger label="Bloquear usuario" question={`¿Bloquear a ${user.username} e invalidar todas sus sesiones?`} />
                  )}
                </form>
              ) : (
                <span className="text-xs text-white/40">Cuenta del equipo</span>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
