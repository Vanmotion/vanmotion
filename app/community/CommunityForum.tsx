"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./community.module.css";

type ForumKey =
  | "MUSIC"
  | "FASHION"
  | "AUTOMOTIVE";

type AuthStep =
  | "topic"
  | "identity"
  | "code"
  | "authenticated";

const forums = [
  {
    number: "01",
    title: "MUSIC" as ForumKey,
    image: "/images/community/music.png",
    text: "Emerging artists · New releases · Submissions",
  },
  {
    number: "02",
    title: "FASHION" as ForumKey,
    image: "/images/community/fashion.png",
    text: "Streetwear · Independent fashion creators · Ideas",
  },
  {
    number: "03",
    title: "AUTOMOTIVE" as ForumKey,
    image: "/images/community/automotive.png",
    text: "4x4 · Camper builds · Restorations · Conversions",
  },
];

const forumContent = {
  MUSIC: {
    intro:
      "A community for emerging artists, musicians and creators. Present your latest tracks, share your projects and introduce your sound to a new audience. A space to discover new talent, promote your creations and connect with other artists.",
    topics: [],
  },

  FASHION: {
    intro:
      "A community for independent designers, fashion creators and emerging brands. Showcase your collections, share your designs and reveal the creative process behind every piece. A space to discover new ideas, talent and unique fashion proposals.",
    topics: [],
  },

  AUTOMOTIVE: {
    intro:
      "A community for vehicle builders, creators and enthusiasts. Share camper conversions, 4x4 projects, unique builds and custom transformations. A space to showcase ideas, processes and experiences behind every vehicle.",
    topics: [],
  },
};

export default function CommunityForum() {
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
    useState<any[]>([]);

  const [selectedTopic, setSelectedTopic] =
    useState<any | null>(null);

  const [replyText, setReplyText] =
    useState("");

  const [replies, setReplies] =
    useState<any[]>([]);

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

  const realTopics = topics
    .filter(
      (topic) =>
        topic.category === activeForum,
    )
    .map((topic) => [
      topic.title,
      topic.body,
    ]);

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
        "Enter your email and community name.",
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
            "We could not send the access code.",
        );
        return;
      }

      setAuthStep("code");
    } catch {
      setError(
        "Connection error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setError("");

    if (!/^\d{6}$/.test(code.trim())) {
      setError(
        "Enter the 6-digit code.",
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
            "We could not verify the code.",
        );
        return;
      }

      setAuthStep("authenticated");
    } catch {
      setError(
        "Connection error. Please try again.",
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
                quality={95}
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
                  {forum.title}
                </h2>

                <p>{forum.text}</p>
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
                    ← BACK
                  </button>

                  <h2>
                    {selectedTopic.title}
                  </h2>

                  <p>
                    {selectedTopic.body}
                  </p>

                  {selectedTopic.attachments?.map(
                    (image: any) => (
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
                    REPLIES
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
                      placeholder="Write your opinion..."
                      rows={4}
                    />

                    <button
                      type="button"
                      onClick={sendReply}
                    >
                      SEND ↗
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
                      {activeForum}
                    </span>

                    <h3>
                      {activeForum}
                    </h3>
                  </div>

                  <div
                    className={
                      styles.panelIntro
                    }
                  >
                    <p>
                      {content.intro}
                    </p>

                    <button
                      type="button"
                      className={
                        styles.closePanel
                      }
                      onClick={
                        closePanel
                      }
                      aria-label="Close"
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
                        key={topic[0]}
                        onClick={() => {
                          const realTopic =
                            topics.find(
                              (item) =>
                                item.title === topic[0],
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
                            {topic[0]}
                          </strong>

                          <span>
                            COMMUNITY ·{" "}
                            {topic[1]}
                          </span>
                        </div>

                        <div
                          className={
                            styles.topicReplies
                          }
                        >
                          <span>0</span>
                          <small>
                            REPLIES
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
                      RECENT COMMUNITY PROJECTS
                    </span>

                    {topics.map((item) => (
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
                            "COMMUNITY USER"}
                        </small>

                        {item.attachments?.map(
                          (image: any) => (
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
                    OPEN COMMUNITY
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
                    SHARE YOUR PROJECT ↗
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
                      {activeForum}
                    </span>

                    <h3>
                      {authStep ===
                      "topic"
                        ? "SHARE YOUR PROJECT ↗"
                        : authStep ===
                            "identity"
                          ? "JOIN COMMUNITY"
                          : authStep ===
                              "code"
                            ? "CHECK YOUR EMAIL"
                            : "WELCOME"}
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
                    aria-label="Back"
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
                      <span>TITLE</span>

                      <input
                        type="text"
                        value={title}
                        onChange={(event) =>
                          setTitle(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Give your topic a clear title"
                        maxLength={120}
                      />
                    </label>

                    <label
                      className={
                        styles.field
                      }
                    >
                      <span>
                        MESSAGE
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
                        placeholder="Share your idea, project or question"
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
                          + ADD IMAGE
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
                            {images.length} / 5 IMAGES READY
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
                              "Add a title and message first.",
                            );
                            return;
                          }

                          setAuthStep(
                            "identity",
                          );
                        }}
                      >
                        CONTINUE
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
                        COMMUNITY NAME
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
                        placeholder="How should we call you?"
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
                          ? "SENDING..."
                          : "SEND CODE"}
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
                      We sent a
                      six-digit access code
                      to{" "}
                      <strong>
                        {email}
                      </strong>
                      .
                    </p>

                    <label
                      className={`${styles.field} ${styles.codeField}`}
                    >
                      <span>
                        ACCESS CODE
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
                        SEND AGAIN
                      </button>

                      <button
                        type="button"
                        onClick={
                          verifyCode
                        }
                        disabled={loading}
                      >
                        {loading
                          ? "VERIFYING..."
                          : "VERIFY & CONTINUE"}
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
                        ACCESS CONFIRMED
                      </span>

                      <p>
                        You are now signed
                        in to VANMOTION
                        Community.
                      </p>

                      <small>
                        Your topic is ready
                        for the next step.
                      </small>
                    </div>

                    <div
                      className={
                        styles.composerFoot
                      }
                    >
                      <span>
                        SESSION ACTIVE
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
                                    "Image upload failed",
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
                                  "Could not publish topic",
                              );
                            }

                            setError(
                              "TOPIC PUBLISHED",
                            );

                          } catch (error) {
                            setError(
                              error instanceof Error
                                ? error.message
                                : "Could not publish topic",
                            );
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                      >
                        {loading
                          ? "PUBLISHING..."
                          : "PUBLISH NEXT"}
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
