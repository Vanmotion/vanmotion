/* eslint-disable @next/next/no-img-element -- Raw img is intentional here for dynamic/external/preview media. */
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "./community.module.css";
import { useMusicPlayer } from "@/app/components/music/MusicPlayerContext";
import { useLanguage } from "@/app/components/language/LanguageProvider";
import type { Language } from "@/app/language";

type ForumKey =
  | "MUSIC"
  | "FASHION"
  | "AUTOMOTIVE";

type AuthStep =
  | "topic"
  | "identity"
  | "code"
  | "authenticated";

type CommunityAuthor = {
  id: string;
  username: string;
  displayName: string | null;
  role:
    | "MEMBER"
    | "MODERATOR"
    | "ADMIN";
};

type CommunityAttachment = {
  id: string;
  url: string;
  type: string;
};

type CommunityTopic = {
  id: string;
  category: ForumKey;
  title: string;
  body: string;
  allowAutoTranslation: boolean;
  status:
    | "OPEN"
    | "LOCKED"
    | "HIDDEN";
  author: CommunityAuthor;
  attachments:
    CommunityAttachment[];
  createdAt: string;
  updatedAt: string;
};

type CommunityReply = {
  id: string;
  body: string;
  topicId: string;
  allowAutoTranslation: boolean;
  author: CommunityAuthor;
  createdAt: string;
  updatedAt: string;
};

type TranslationKind = "topic-title" | "topic-body" | "reply-body";
type TranslationPart = { kind: TranslationKind; id: string; source: string };
type TranslationResult = {
  kind: TranslationKind;
  id: string;
  text: string;
  sourceLanguage: string | null;
};

const forums = [
  {
    title: "MUSIC" as ForumKey,
    image: "/images/community/music-optimized.jpg",
    text: { es: "Artistas emergentes · Estrenos · Propuestas", en: "Emerging artists · New releases · Submissions" },
  },
  {
    title: "FASHION" as ForumKey,
    image: "/images/community/fashion-optimized.jpg",
    text: { es: "Ropa urbana · Diseñadores independientes · Ideas", en: "Streetwear · Independent fashion creators · Ideas" },
  },
  {
    title: "AUTOMOTIVE" as ForumKey,
    image: "/images/community/automotive-optimized.jpg",
    text: { es: "4x4 · Camperizaciones · Restauraciones", en: "4x4 · Camper builds · Restorations" },
  },
];

const forumContent = {
  MUSIC: {
    intro: {
      es: "Una comunidad para artistas emergentes, músicos y creadores. Presenta tus nuevas canciones, comparte tus proyectos y da a conocer tu sonido. Un espacio para descubrir talento, promocionar tus creaciones y conectar con otros artistas.",
      en: "A community for emerging artists, musicians and creators. Present your latest tracks, share your projects and introduce your sound to a new audience. A space to discover new talent, promote your creations and connect with other artists.",
    },
    topics: [],
  },

  FASHION: {
    intro: {
      es: "Una comunidad para diseñadores independientes, creadores de moda y marcas emergentes. Muestra tus colecciones, comparte tus diseños y enseña el proceso creativo de cada pieza. Un espacio para descubrir ideas, talento y nuevas propuestas de moda.",
      en: "A community for independent designers, fashion creators and emerging brands. Showcase your collections, share your designs and reveal the creative process behind every piece. A space to discover new ideas, talent and unique fashion proposals.",
    },
    topics: [],
  },

  AUTOMOTIVE: {
    intro: {
      es: "Una comunidad para creadores, preparadores y aficionados al motor. Comparte camperizaciones, proyectos 4x4, vehículos especiales y transformaciones a medida. Un espacio para mostrar ideas, procesos y experiencias detrás de cada vehículo.",
      en: "A community for vehicle builders, creators and enthusiasts. Share camper conversions, 4x4 projects, unique builds and custom transformations. A space to showcase ideas, processes and experiences behind every vehicle.",
    },
    topics: [],
  },
};

export default function CommunityForum({ language: initialLanguage }: { language: Language }) {
  // V6: cambiar ES/EN sin desmontar este componente ni perder panel, texto o fotos.
  const { language: selectedLanguage } = useLanguage();
  const { videoSessionActive } = useMusicPlayer();
  const language: Language = selectedLanguage || initialLanguage;
  const t = (en: string, es: string) => language === "es" ? es : en;
  const categoryLabel = (category: ForumKey) => {
    if (language !== "es") return category;
    return category === "MUSIC" ? "MÚSICA" : category === "FASHION" ? "MODA" : "MOTOR";
  };
  const [activeForum, setActiveForum] =
    useState<ForumKey | null>(null);
  // En móvil, tocar la ficha muestra la cortina; solo ENTRAR abre el foro.
  const [highlightedForum, setHighlightedForum] = useState<ForumKey | null>(null);

  const [showComposer, setShowComposer] =
    useState(false);

  const [authStep, setAuthStep] =
    useState<AuthStep>("topic");

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [images, setImages] =
    useState<File[]>([]);

  const [email, setEmail] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [code, setCode] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [topics, setTopics] =
    useState<CommunityTopic[]>([]);
  const [topicsLoaded, setTopicsLoaded] = useState(false);

  const [selectedTopic, setSelectedTopic] =
    useState<CommunityTopic | null>(null);

  const [replyText, setReplyText] =
    useState("");
  const [allowTopicTranslation, setAllowTopicTranslation] = useState(false);
  const [allowReplyTranslation, setAllowReplyTranslation] = useState(false);

  const [replies, setReplies] =
    useState<CommunityReply[]>([]);

  // Se conserva siempre el original. La cache de servidor está en PostgreSQL.
  const [translatedParts, setTranslatedParts] = useState<Record<string, TranslationResult>>({});
  const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({});
  const requestedTranslations = useRef(new Set<string>());

  const partKey = (kind: TranslationKind, id: string) => `${language}:${kind}:${id}`;
  const originalKey = (kind: "topic" | "reply", id: string) => `${kind}:${id}`;
  const displayPart = (source: string, kind: TranslationKind, id: string) => {
    const original = originalKey(kind === "reply-body" ? "reply" : "topic", id);
    return showOriginal[original] ? source : translatedParts[partKey(kind, id)]?.text ?? source;
  };
  const isTranslated = (source: string, kind: TranslationKind, id: string) => {
    const result = translatedParts[partKey(kind, id)];
    return Boolean(result && result.text !== source && result.sourceLanguage?.toLowerCase() !== language);
  };
  const toggleOriginal = (kind: "topic" | "reply", id: string) => {
    const key = originalKey(kind, id);
    setShowOriginal((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  useEffect(() => {
    if (!activeForum) return;

    const parts: TranslationPart[] = [];
    for (const topic of topics) {
      if (topic.category !== activeForum || !topic.allowAutoTranslation) continue;
      parts.push({ kind: "topic-title", id: topic.id, source: topic.title });
      parts.push({ kind: "topic-body", id: topic.id, source: topic.body });
    }
    if (selectedTopic && selectedTopic.category === activeForum) {
      for (const reply of replies) {
        if (!reply.allowAutoTranslation) continue;
        parts.push({ kind: "reply-body", id: reply.id, source: reply.body });
      }
    }

    const pending = parts.filter((part) => {
      const key = `${language}:${part.kind}:${part.id}`;
      if (requestedTranslations.current.has(key)) return false;
      requestedTranslations.current.add(key);
      return true;
    });
    if (!pending.length) return;

    // Lotes reducidos para mantener tiempos de respuesta y controlar consumo.
    const batches: TranslationPart[][] = [];
    let batch: TranslationPart[] = [];
    let length = 0;
    for (const part of pending) {
      if (batch.length >= 5 || (batch.length && length + part.source.length > 9500)) {
        batches.push(batch);
        batch = [];
        length = 0;
      }
      batch.push(part);
      length += part.source.length;
    }
    if (batch.length) batches.push(batch);

    async function translate() {
      for (const group of batches) {
        try {
          const response = await fetch("/api/community/translations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              target: language,
              entries: group.map(({ kind, id }) => ({ kind, id })),
            }),
          });
          if (!response.ok) throw new Error(`Traducción no disponible (${response.status})`);
          const data: { translations?: TranslationResult[] } = await response.json();
          if (Array.isArray(data.translations)) {
            setTranslatedParts((previous) => {
              const next = { ...previous };
              for (const item of data.translations || []) {
                next[`${language}:${item.kind}:${item.id}`] = item;
              }
              return next;
            });
          }
        } catch {
          // Si MyMemory falla o se agota la cuota, se mantiene el texto original.
          for (const item of group) {
            requestedTranslations.current.delete(`${language}:${item.kind}:${item.id}`);
          }
          break;
        }
      }
    }
    void translate();
  }, [activeForum, language, replies, selectedTopic, topics]);

  useEffect(() => {
    async function loadTopics() {
      try {
        const response = await fetch(
          "/api/community/topics",
        );

        const data =
          await response.json();

        if (!response.ok) throw new Error("No se pudieron cargar los temas");
        setTopics(data.topics || []);
        setTopicsLoaded(true);
      } catch (error) {
        console.error(
          "COMMUNITY_LOAD_TOPICS_ERROR",
          error,
        );
      }
    }

    loadTopics();
  }, []);

  useEffect(() => {
    async function loadReplies() {
      if (!selectedTopic?.id) {
        setReplies([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/community/replies?topicId=${selectedTopic.id}`,
        );

        const data =
          await response.json();

        setReplies(
          data.replies || [],
        );

      } catch (error) {
        console.error(
          "COMMUNITY_LOAD_REPLIES_ERROR",
          error,
        );
      }
    }

    loadReplies();
  }, [selectedTopic]);

  const content =
    activeForum
      ? forumContent[activeForum]
      : null;

  const realTopics = topics.filter(
    (topic) =>
      topic.category === activeForum,
  );

  function resetComposer() {
    setShowComposer(false);
    setAuthStep("topic");
    setTitle("");
    setMessage("");
    setImages([]);
    setAllowTopicTranslation(false);
    setEmail("");
    setUsername("");
    setCode("");
    setError("");
    setLoading(false);
  }

  function openForum(forum: ForumKey) {
    setActiveForum(forum);
    setHighlightedForum(null);
    resetComposer();
  }

  function closePanel() {
    setActiveForum(null);
    resetComposer();
    setSelectedTopic(null);
  }

  function closeTopic() {
    setAllowReplyTranslation(false);
    setSelectedTopic(null);
  }

  async function sendReply() {
    if (!replyText.trim() || !selectedTopic?.id) {
      return;
    }

    try {
      const response = await fetch(
        "/api/community/replies",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            body: replyText,
            topicId: selectedTopic.id,
            allowAutoTranslation: allowReplyTranslation,
          }),
        },
      );

      const data =
        await response.json();

      if (response.ok) {
        setReplies([
          ...replies,
          data.reply,
        ]);

        setReplyText("");
        setAllowReplyTranslation(false);
      }

    } catch (error) {
      console.error(
        "COMMUNITY_SEND_REPLY_ERROR",
        error,
      );
    }
  }

  async function requestCode() {
    setError("");

    if (
      !email.trim() ||
      !username.trim()
    ) {
      setError(
        t('Enter your email and community name.', 'Introduce tu correo y tu nombre de usuario.'),
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/community/auth/request-code",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            t('We could not send the access code.', 'No hemos podido enviarte el código de acceso.'),
        );
        return;
      }

      setAuthStep("code");
    } catch {
      setError(
        t('Connection error. Please try again.', 'Error de conexión. Inténtalo de nuevo.'),
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setError("");

    if (!/^\d{6}$/.test(code.trim())) {
      setError(
        t('Enter the 6-digit code.', 'Introduce el código de seis cifras.'),
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/community/auth/verify-code",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            username,
            code,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            t('We could not verify the code.', 'No hemos podido verificar el código.'),
        );
        return;
      }

      setAuthStep("authenticated");
    } catch {
      setError(
        t('Connection error. Please try again.', 'Error de conexión. Inténtalo de nuevo.'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className={`${styles.forums} ${
        videoSessionActive ? styles.forumsVideoActive : ""
      }`}>
        {forums.map((forum) => (
          <article
            key={forum.title}
            className={`${styles.card} ${highlightedForum === forum.title ? styles.cardHighlighted : ""}`}
          >
            <button
              type="button"
              className={styles.cardTouchSurface}
              aria-label={t(`Preview ${categoryLabel(forum.title)}`, `Mostrar efecto de ${categoryLabel(forum.title)}`)}
              onClick={() => {
                if (window.matchMedia("(max-width: 800px)").matches) {
                  setHighlightedForum((current) => current === forum.title ? null : forum.title);
                } else {
                  openForum(forum.title);
                }
              }}
            />
            <div
              className={styles.cardImage}
              style={{
                backgroundImage: `url("${forum.image}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >


              <div
                className={styles.reveal}
                aria-hidden="true"
              />
            </div>

            <div className={styles.cardInfo}>

              <div
                className={styles.cardText}
              >
                <h2>
                  {categoryLabel(forum.title)}
                </h2>

                <p>{forum.text[language]}</p>
              </div>

              <button
                type="button"
                className={styles.cardAction}
                onClick={() => openForum(forum.title)}
              >
                {t("ENTER", "ENTRAR")}
              </button>
            </div>
          </article>
        ))}
      </section>

      {content && activeForum && (
        <div
          className={
            styles.panelBackdrop
          }
          onClick={closePanel}
        >
          <section
            className={
              styles.forumPanel
            }
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {selectedTopic ? (
              <>
                <div
                  className={
                    styles.topicDetail
                  }
                >
                  <button
                    type="button"
                    onClick={
                      closeTopic
                    }
                    className={
                      styles.topicBack
                    }
                  >
                    {t("← BACK", "← VOLVER")}
                  </button>

                   <h2>
                     {displayPart(selectedTopic.title, "topic-title", selectedTopic.id)}
                   </h2>

                   <p>
                     {displayPart(selectedTopic.body, "topic-body", selectedTopic.id)}
                   </p>
                   {(isTranslated(selectedTopic.title, "topic-title", selectedTopic.id) ||
                     isTranslated(selectedTopic.body, "topic-body", selectedTopic.id)) && (
                     <button type="button" className={styles.translationToggle}
                       onClick={() => toggleOriginal("topic", selectedTopic.id)}>
                       {showOriginal[originalKey("topic", selectedTopic.id)]
                         ? t("View translation", "Ver traducción")
                         : t("Automatically translated · View original", "Traducido automáticamente · Ver original")}
                     </button>
                   )}

                  {selectedTopic.attachments?.map(
                    (image: CommunityAttachment) => (
                      <Image
                        key={image.id}
                        src={image.url}
                        alt={
                          selectedTopic.title
                        }
                        width={600}
                        height={400}
                      />
                    ),
                  )}

                  <div
                    className={
                      styles.topicRepliesTitle
                    }
                  >
                    {t("REPLIES", "RESPUESTAS")}
                  </div>

                  <div
                    className={
                      styles.replyList
                    }
                  >
                    {replies.map(
                      (reply) => (
                        <article
                          key={reply.id}
                          className={
                            reply.author?.role === "ADMIN"
                              ? styles.adminReply
                              : styles.reply
                          }
                        >
                          <strong>
                            {reply.author?.username}
                          </strong>

                           <p>
                             {displayPart(reply.body, "reply-body", reply.id)}
                           </p>
                           {isTranslated(reply.body, "reply-body", reply.id) && (
                             <button type="button" className={styles.translationToggle}
                               onClick={() => toggleOriginal("reply", reply.id)}>
                               {showOriginal[originalKey("reply", reply.id)]
                                 ? t("View translation", "Ver traducción")
                                 : t("Automatically translated · View original", "Traducido automáticamente · Ver original")}
                             </button>
                           )}
                        </article>
                      ),
                    )}
                  </div>

                  <div
                    className={
                      styles.replyComposer
                    }
                  >
                    <textarea
                      value={replyText}
                      onChange={(event) =>
                        setReplyText(
                          event.target.value,
                        )
                      }
                      placeholder={t('Write your opinion...', 'Escribe tu opinión...')}
                      rows={4}
                    />

                    <label style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12, lineHeight: 1.5, cursor: "pointer" }}>
                      <input type="checkbox" checked={allowReplyTranslation}
                        onChange={(event) => setAllowReplyTranslation(event.target.checked)} />
                      <span>{t("Allow translation of this reply using MyMemory (external service that may retain and share the text).", "Permito traducir esta respuesta mediante MyMemory (servicio externo que puede conservar y compartir el texto).")}</span>
                    </label>
                    <button
                      type="button"
                      onClick={sendReply}
                    >
                      {t("SEND", "ENVIAR")}
                    </button>
                  </div>
                </div>
              </>
            ) : !showComposer ? (
              <>
                <div
                  className={
                    styles.forumPanelHead
                  }
                >
                  <div>
                    <span
                      className={
                        styles.forumPanelLabel
                      }
                    >
                      VANMOTION COMMUNITY
                    </span>

                    <h3>
                      {categoryLabel(activeForum)}
                    </h3>
                  </div>

                  <div
                    className={
                      styles.panelIntro
                    }
                  >
                    <p>
                      {content.intro[language]}
                    </p>

                    <button
                      type="button"
                      className={
                        styles.closePanel
                      }
                      onClick={
                        closePanel
                      }
                      aria-label={t('Close', 'Cerrar')}
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div
                  className={
                    styles.topicList
                  }
                >
                  {[...realTopics, ...content.topics].map(
                    (topic) => (
                      <button
                        type="button"
                        className={
                          styles.topic
                        }
                        key={topic.id}
                        onClick={() => {
                          const realTopic =
                            topics.find(
                              (item) =>
                                item.title === topic.title,
                            );

                          if (realTopic) {
                            setSelectedTopic(
                              realTopic,
                            );
                          }
                        }}
                      >

                        <div
                          className={
                            styles.topicMain
                          }
                        >
                          <strong>
                             {displayPart(topic.title, "topic-title", topic.id)}
                          </strong>

                          <span>
                            {displayPart(topic.body, "topic-body", topic.id)}
                          </span>
                        </div>



                      </button>
                    ),
                  )}
                </div>

                {topicsLoaded && realTopics.length === 0 && (
                  <p className={styles.emptyForum}>
                    {t(
                      "No projects published yet. Be the first to share yours.",
                      "Aún no hay proyectos publicados. Sé el primero en compartir el tuyo.",
                    )}
                  </p>
                )}

                {realTopics.length > 0 && (
                  <div
                    className={
                      styles.communityPosts
                    }
                  >
                    <span>
                      {t("RECENT COMMUNITY PROJECTS", "PROYECTOS RECIENTES DE LA COMUNIDAD")}
                    </span>

                    {topics
                      .filter(
                        (item) =>
                          item.category === activeForum,
                      )
                      .map((item) => (
                      <article
                        key={item.id}
                      >
                         <strong>
                           {displayPart(item.title, "topic-title", item.id)}
                         </strong>

                         <p>
                           {displayPart(item.body, "topic-body", item.id)}
                         </p>

                         <small>
                           {item.author?.username ||
                             t('COMMUNITY USER', 'USUARIO DE LA COMUNIDAD')}
                         </small>
                         {(isTranslated(item.title, "topic-title", item.id) ||
                           isTranslated(item.body, "topic-body", item.id)) && (
                           <button type="button" className={styles.translationToggle}
                             onClick={() => toggleOriginal("topic", item.id)}>
                             {showOriginal[originalKey("topic", item.id)]
                               ? t("View translation", "Ver traducción")
                               : t("Automatically translated · View original", "Traducido automáticamente · Ver original")}
                           </button>
                         )}

                        {item.attachments?.map(
                          (image: CommunityAttachment) => (
                            <Image
                              key={image.id}
                              src={image.url}
                              alt={item.title}
                              width={900}
                              height={600}
                            />
                          ),
                        )}
                      </article>
                    ))}
                  </div>
                )}

                <div
                  className={
                    styles.forumPanelFoot
                  }
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowComposer(
                        true,
                      );
                      setAuthStep(
                        "topic",
                      );
                    }}
                  >
                    {t("PUBLISH PROJECT", "PUBLICAR PROYECTO")}
                  </button>
                </div>
              </>
            ) : (
              <div
                className={
                  styles.composer
                }
              >
                <div
                  className={
                    styles.composerTop
                  }
                >
                  <div>
                    <span
                      className={
                        styles.forumPanelLabel
                      }
                    >
                      VANMOTION COMMUNITY
                    </span>

                    <h3>
                      {authStep ===
                      "topic"
                        ? t('SHARE YOUR PROJECT', 'COMPARTE TU PROYECTO')
                        : authStep ===
                            "identity"
                          ? t('JOIN COMMUNITY', 'ÚNETE A LA COMUNIDAD')
                          : authStep ===
                              "code"
                            ? t('CHECK YOUR EMAIL', 'REVISA TU CORREO')
                            : t('WELCOME', 'BIENVENIDO')}
                    </h3>
                  </div>

                  <button
                    type="button"
                    className={
                      styles.closePanel
                    }
                    onClick={() => {
                      if (
                        authStep ===
                        "topic"
                      ) {
                        resetComposer();
                      } else {
                        setAuthStep(
                          "topic",
                        );
                        setError("");
                      }
                    }}
                    aria-label={t('Back', 'Volver')}
                  >
                    ×
                  </button>
                </div>

                {authStep ===
                  "topic" && (
                  <>
                    <label
                      className={
                        styles.field
                      }
                    >
                      <span>{t("TITLE", "TÍTULO")}</span>

                      <input
                        type="text"
                        value={title}
                        onChange={(event) =>
                          setTitle(
                            event.target
                              .value,
                          )
                        }
                        placeholder={t('Give your topic a clear title', 'Pon un título claro a tu tema')}
                        maxLength={120}
                      />
                    </label>

                    <label
                      className={
                        styles.field
                      }
                    >
                      <span>
                        {t("MESSAGE", "MENSAJE")}
                      </span>

                      <textarea
                        rows={5}
                        value={message}
                        onChange={(event) =>
                          setMessage(
                            event.target
                              .value,
                          )
                        }
                        placeholder={t('Share your idea, project or question', 'Comparte tu idea, proyecto o pregunta')}
                        maxLength={5000}
                      />
                    </label>

                    <label style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12, lineHeight: 1.5, cursor: "pointer" }}>
                      <input type="checkbox" checked={allowTopicTranslation}
                        onChange={(event) => setAllowTopicTranslation(event.target.checked)} />
                      <span>{t("Allow translation of this post with MyMemory (external service that may retain and share the text).", "Permito traducir esta publicación con MyMemory (servicio externo que puede conservar y compartir el texto).")}</span>
                    </label>
                    <div
                      className={
                        styles.imageUploader
                      }
                    >
                      <label>
                        <span>
                          {t("+ ADD IMAGE", "+ AÑADIR IMAGEN")}
                        </span>

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          hidden
                          onChange={(event) => {
                            const files = Array.from(
                              event.target.files || [],
                            ).slice(0, 5);

                            setImages((prev) =>
                              [
                                ...prev,
                                ...files,
                              ].slice(0, 5),
                            );
                          }}
                        />
                      </label>

                      {images.length > 0 && (
                        <>
                          <small>
                            {images.length} / 5 {t("IMAGES READY", "IMÁGENES LISTAS")}
                          </small>

                          <div
                            className={
                              styles.imagePreviewGrid
                            }
                          >
                            {images.map(
                              (image) => (
                                <img
                                  key={
                                    image.name
                                  }
                                  src={
                                    URL.createObjectURL(
                                      image,
                                    )
                                  }
                                  alt=""
                                />
                              ),
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div
                      className={
                        styles.composerFoot
                      }
                    >
                      <span>
                        ACCOUNT REQUIRED
                        TO PUBLISH
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setError("");

                          if (
                            title
                              .trim()
                              .length <
                              3 ||
                            message
                              .trim()
                              .length <
                              3
                          ) {
                            setError(
                              t('Add a title and message first.', 'Primero añade un título y un mensaje.'),
                            );
                            return;
                          }

                          setAuthStep(
                            "identity",
                          );
                        }}
                      >
                        {t("CONTINUE", "CONTINUAR")}
                      </button>
                    </div>
                  </>
                )}

                {authStep ===
                  "identity" && (
                  <>
                    <label
                      className={
                        styles.field
                      }
                    >
                      <span>
                        EMAIL
                      </span>

                      <input
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(
                            event.target
                              .value,
                          )
                        }
                        placeholder="you@email.com"
                      />
                    </label>

                    <label
                      className={
                        styles.field
                      }
                    >
                      <span>
                        {t("COMMUNITY NAME", "NOMBRE EN LA COMUNIDAD")}
                      </span>

                      <input
                        type="text"
                        autoComplete="username"
                        value={username}
                        onChange={(event) =>
                          setUsername(
                            event.target
                              .value,
                          )
                        }
                        placeholder={t('How should we call you?', '¿Cómo quieres que te llamemos?')}
                        maxLength={40}
                      />
                    </label>

                    <div
                      className={
                        styles.composerFoot
                      }
                    >
                      <span>
                        NO PASSWORD
                        REQUIRED
                      </span>

                      <button
                        type="button"
                        onClick={
                          requestCode
                        }
                        disabled={loading}
                      >
                        {loading
                          ? t('SENDING...', 'ENVIANDO...')
                          : t('SEND CODE', 'ENVIAR CÓDIGO')}
                      </button>
                    </div>
                  </>
                )}

                {authStep ===
                  "code" && (
                  <>
                    <p
                      className={
                        styles.authMessage
                      }
                    >
                      {t("We sent a six-digit access code to", "Hemos enviado un código de acceso de seis cifras a")}{" "}
                      <strong>
                        {email}
                      </strong>
                      .
                    </p>

                    <label
                      className={`${styles.field} ${styles.codeField}`}
                    >
                      <span>
                        {t("ACCESS CODE", "CÓDIGO DE ACCESO")}
                      </span>

                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={code}
                        onChange={(event) =>
                          setCode(
                            event.target
                              .value.replace(
                                /\D/g,
                                "",
                              ),
                          )
                        }
                        placeholder="000000"
                        maxLength={6}
                      />
                    </label>

                    <div
                      className={
                        styles.composerFoot
                      }
                    >
                      <button
                        type="button"
                        className={
                          styles.secondaryAction
                        }
                        onClick={
                          requestCode
                        }
                        disabled={loading}
                      >
                        {t("SEND AGAIN", "REENVIAR")}
                      </button>

                      <button
                        type="button"
                        onClick={
                          verifyCode
                        }
                        disabled={loading}
                      >
                        {loading
                          ? t('VERIFYING...', 'VERIFICANDO...')
                          : t('VERIFY & CONTINUE', 'VERIFICAR Y CONTINUAR')}
                      </button>
                    </div>
                  </>
                )}

                {authStep ===
                  "authenticated" && (
                  <>
                    <div
                      className={
                        styles.authSuccess
                      }
                    >
                      <span>
                        {t("ACCESS CONFIRMED", "ACCESO CONFIRMADO")}
                      </span>

                      <p>
                        {t("You are now signed in to VANMOTION Community.", "Has iniciado sesión en la comunidad VANMOTION.")}
                      </p>

                      <small>
                        {t("Your topic is ready for the next step.", "Tu publicación está lista para el siguiente paso.")}
                      </small>
                    </div>

                    <div
                      className={
                        styles.composerFoot
                      }
                    >
                      <span>
                        {t("SESSION ACTIVE", "SESIÓN ACTIVA")}
                      </span>

                      <button
                        type="button"
                        onClick={async () => {
                          setError("");
                          setLoading(true);

                          try {
                            const uploadedImages: string[] = [];

                            for (const image of images) {
                              const formData = new FormData();
                              formData.append(
                                "file",
                                image,
                              );

                              const uploadResponse =
                                await fetch(
                                  "/api/community/upload",
                                  {
                                    method: "POST",
                                    body: formData,
                                  },
                                );

                              const uploadData =
                                await uploadResponse.json();

                              if (!uploadResponse.ok) {
                                throw new Error(
                                  uploadData.error ||
                                    t('Image upload failed', 'No se pudo subir la imagen'),
                                );
                              }

                              uploadedImages.push(
                                uploadData.url,
                              );
                            }

                            const response = await fetch(
                              "/api/community/topics",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type":
                                    "application/json",
                                },
                                body: JSON.stringify({
                                  category: activeForum,
                                  title,
                                  message,
                                  attachments: uploadedImages,
                                  allowAutoTranslation: allowTopicTranslation,
                                }),
                              },
                            );

                            const data =
                              await response.json();

                            if (!response.ok) {
                              throw new Error(
                                data.error ||
                                  t('Could not publish topic', 'No se pudo publicar el tema'),
                              );
                            }

                            if (!data.topic?.id) {
                              throw new Error("El servidor no confirmó el artículo.");
                            }

                            setTopics((previous) => [
                              data.topic as CommunityTopic,
                              ...previous.filter((item) => item.id !== data.topic.id),
                            ]);
                            setTopicsLoaded(true);
                            setSelectedTopic(data.topic as CommunityTopic);
                            setShowComposer(false);
                            setAuthStep("topic");
                            setError("");

                          } catch (error) {
                            setError(
                              error instanceof Error
                                ? error.message
                                : t('Could not publish topic', 'No se pudo publicar el tema'),
                            );
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                      >
                        {loading
                          ? t('PUBLISHING...', 'PUBLICANDO...')
                          : t('PUBLISH NEXT', 'PUBLICAR AHORA')}
                      </button>
                    </div>
                  </>
                )}

                {error && (
                  <p
                    className={
                      styles.authError
                    }
                  >
                    {error}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
