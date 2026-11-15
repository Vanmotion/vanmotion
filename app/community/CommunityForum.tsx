/* eslint-disable @next/next/no-img-element -- Raw img is intentional here for dynamic/external/preview media. */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./community.module.css";
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
  author: CommunityAuthor;
  createdAt: string;
  updatedAt: string;
};

const forums = [
  {
    number: "01",
    title: "MUSIC" as ForumKey,
    image: "/images/community/music-optimized.jpg",
    text: { es: "Artistas emergentes · Estrenos · Propuestas", en: "Emerging artists · New releases · Submissions" },
  },
  {
    number: "02",
    title: "FASHION" as ForumKey,
    image: "/images/community/fashion-optimized.jpg",
    text: { es: "Ropa urbana · Diseñadores independientes · Ideas", en: "Streetwear · Independent fashion creators · Ideas" },
  },
  {
    number: "03",
    title: "AUTOMOTIVE" as ForumKey,
    image: "/images/community/automotive-optimized.jpg",
    text: { es: "4x4 · Camperizaciones · Restauraciones · Transformaciones", en: "4x4 · Camper builds · Restorations · Conversions" },
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
  const language: Language = selectedLanguage || initialLanguage;
  const t = (en: string, es: string) => language === "es" ? es : en;
  const categoryLabel = (category: ForumKey) => {
    if (language !== "es") return category;
    return category === "MUSIC" ? "MÚSICA" : category === "FASHION" ? "MODA" : "MOTOR";
  };
  const [activeForum, setActiveForum] =
    useState<ForumKey | null>(null);

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

  const [selectedTopic, setSelectedTopic] =
    useState<CommunityTopic | null>(null);

  const [replyText, setReplyText] =
    useState("");

  const [replies, setReplies] =
    useState<CommunityReply[]>([]);

  useEffect(() => {
    async function loadTopics() {
      try {
        const response = await fetch(
          "/api/community/topics",
        );

        const data =
          await response.json();

        setTopics(
          data.topics || [],
        );
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
    setEmail("");
    setUsername("");
    setCode("");
    setError("");
    setLoading(false);
  }

  function closePanel() {
    setActiveForum(null);
    resetComposer();
    setSelectedTopic(null);
  }

  function closeTopic() {
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
      <section className={styles.forums}>
        {forums.map((forum) => (
          <button
            type="button"
            key={forum.title}
            className={styles.card}
            onClick={() => {
              setActiveForum(
                forum.title,
              );
              resetComposer();
            }}
          >
            <div className={styles.cardImage}>
              <Image
                src={forum.image}
                alt={forum.title}
                fill
                quality={75}
                sizes="33vw"
                className={styles.forumImage}
              />

              <div
                className={styles.reveal}
                aria-hidden="true"
              />
            </div>

            <div className={styles.cardInfo}>
              <span
                className={styles.number}
              >
                {forum.number}
              </span>

              <div
                className={styles.cardText}
              >
                <h2>
                  {categoryLabel(forum.title)}
                </h2>

                <p>{forum.text[language]}</p>
              </div>

              <span
                className={
                  styles.cardArrow
                }
              >
                ↗
              </span>
            </div>
          </button>
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
                    {selectedTopic.title}
                  </h2>

                  <p>
                    {selectedTopic.body}
                  </p>

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
                            {reply.body}
                          </p>
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

                    <button
                      type="button"
                      onClick={sendReply}
                    >
                      {t("SEND ↗", "ENVIAR ↗")}
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
                      COMMUNITY /{" "}
                      {categoryLabel(activeForum)}
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
                    (topic, index) => (
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
                        <span
                          className={
                            styles.topicNumber
                          }
                        >
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <div
                          className={
                            styles.topicMain
                          }
                        >
                          <strong>
                            {topic.title}
                          </strong>

                          <span>
                            COMMUNITY ·{" "}
                            {topic.body}
                          </span>
                        </div>

                        <div
                          className={
                            styles.topicReplies
                          }
                        >
                          <span>0</span>
                          <small>
                            {t("REPLIES", "RESPUESTAS")}
                          </small>
                        </div>

                        <span
                          className={
                            styles.topicArrow
                          }
                        >
                          ↗
                        </span>
                      </button>
                    ),
                  )}
                </div>

                {topics.length > 0 && (
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
                          {item.title}
                        </strong>

                        <p>
                          {item.body}
                        </p>

                        <small>
                          {item.author?.username ||
                            t('COMMUNITY USER', 'USUARIO DE LA COMUNIDAD')}
                        </small>

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
                  <span>
                    {t("OPEN COMMUNITY", "COMUNIDAD ABIERTA")}
                  </span>

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
                    {t(t('SHARE YOUR PROJECT ↗', 'COMPARTE TU PROYECTO ↗'), "COMPARTE TU PROYECTO ↗")}
                    <span>↗</span>
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
                      COMMUNITY /{" "}
                      {categoryLabel(activeForum)}
                    </span>

                    <h3>
                      {authStep ===
                      "topic"
                        ? t('SHARE YOUR PROJECT ↗', 'COMPARTE TU PROYECTO ↗')
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
                        <span>↗</span>
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
                        <span>↗</span>
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
                        <span>↗</span>
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

                            setError(
                              t('TOPIC PUBLISHED', 'TEMA PUBLICADO'),
                            );

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
                        <span>↗</span>
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
