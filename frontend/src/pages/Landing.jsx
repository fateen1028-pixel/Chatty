import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
    ArrowRight,
    CheckCheck,
    Code2,
    Database,
    ExternalLink,
    KeyRound,
    Lock,
    LockKeyhole,
    MessageSquare,
    MonitorSmartphone,
    Send,
    Server,
    ShieldCheck,
    Smartphone,
    Wifi,
    Zap,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MESSAGE = "The new encryption flow is live 🚀";

const STORY_COPY_CLASS = `
  absolute left-[5.5%] top-1/2 z-30
  w-[38%] -translate-y-1/2

  max-lg:left-[4%]
  max-lg:w-[40%]

  max-md:bottom-0
  max-md:left-0
  max-md:right-0
  max-md:top-auto
  max-md:flex
  max-md:min-h-[210px]
  max-md:w-auto
  max-md:translate-y-0
  max-md:flex-col
  max-md:justify-end
  max-md:bg-gradient-to-t
  max-md:from-[#030708]
  max-md:from-70%
  max-md:via-[#030708]/95
  max-md:to-transparent
  max-md:px-5
  max-md:pb-5
  max-md:pt-12
`;

const STORY_HEADING_CLASS = `
  max-w-[9.5ch]
  text-[clamp(3.1rem,5.15vw,6rem)]
  font-medium
  leading-[0.91]
  tracking-[-0.065em]

  max-md:max-w-[12ch]
  max-md:text-[clamp(2.1rem,9vw,3rem)]
  max-md:leading-[0.96]
  max-md:tracking-[-0.05em]
`;

function Avatar({ name }) {
    return (
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-cyan-400/10 text-sm font-bold text-cyan-300 ring-1 ring-cyan-300/20">
            {name.charAt(0)}
        </div>
    );
}

function ArchitectureNode({
                              nodeRef,
                              icon: Icon,
                              label,
                              title,
                              description,
                          }) {
    return (
        <div
            ref={nodeRef}
            data-architecture-node
            className="relative z-10 flex min-w-0 flex-col items-center text-center"
        >
            <div className="grid size-11 place-items-center rounded-2xl border border-cyan-300/20 bg-[#0B171B] text-cyan-300 shadow-[0_0_45px_rgba(34,211,238,0.08)] sm:size-14">
                <Icon size={20} />
            </div>

            <span className="mt-2 text-[8px] font-bold uppercase tracking-[0.16em] text-cyan-400/60 sm:mt-3 sm:text-[10px] sm:tracking-[0.2em]">
        {label}
      </span>

            <strong className="mt-1 text-[10px] font-semibold text-white sm:text-xs">
                {title}
            </strong>

            <span className="mt-1 hidden max-w-28 text-[10px] leading-relaxed text-slate-500 lg:block">
        {description}
      </span>
        </div>
    );
}

function ReceiverPhone({
                           phoneRef,
                           anchorRef,
                           bubbleRef,
                           statusRef,
                       }) {
    return (
        <div
            ref={phoneRef}
            style={{ opacity: 0 }}
            className="
        absolute right-[4%] top-1/2 z-20
        h-[440px] w-[230px]
        -translate-y-1/2
        overflow-hidden
        rounded-[34px]
        border border-cyan-300/20
        bg-[#071114]/95
        shadow-[0_45px_110px_rgba(0,0,0,0.65)]
        backdrop-blur-2xl

        max-lg:right-[2%]
        max-lg:h-[390px]
        max-lg:w-[205px]

        max-md:right-1/2
        max-md:top-[26%]
        max-md:h-[270px]
        max-md:w-[165px]
        max-md:translate-x-1/2
      "
        >
            <div className="mx-auto h-5 w-20 rounded-b-2xl bg-black" />

            <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-4 max-md:h-14 max-md:px-3">
                <div className="max-md:scale-90">
                    <Avatar name="Alex" />
                </div>

                <div>
                    <strong className="block text-xs font-semibold text-white">
                        Alex
                    </strong>

                    <span className="mt-0.5 block text-[10px] font-medium text-emerald-400">
            Online
          </span>
                </div>
            </div>

            <div className="relative h-[310px] px-4 py-5 max-lg:h-[265px] max-md:h-[155px] max-md:px-3 max-md:py-3">
                <div
                    ref={anchorRef}
                    className="absolute bottom-[86px] right-[82px] size-px max-md:bottom-[66px] max-md:right-[65px]"
                    aria-hidden="true"
                />

                <div
                    ref={bubbleRef}
                    style={{ opacity: 0 }}
                    className="
            absolute bottom-16 right-4
            max-w-[175px]
            origin-bottom-right
            rounded-2xl rounded-br-sm
            bg-gradient-to-br from-cyan-500 to-blue-600
            px-3.5 py-2.5
            text-[11px] leading-relaxed text-white
            shadow-[0_15px_40px_rgba(6,182,212,0.24)]

            max-md:bottom-7
            max-md:right-3
            max-md:max-w-[145px]
            max-md:px-3
            max-md:py-2
            max-md:text-[9px]
          "
                >
                    {MESSAGE}

                    <div
                        ref={statusRef}
                        style={{ opacity: 0 }}
                        className="mt-1.5 flex items-center justify-end gap-1 text-[9px] font-medium text-cyan-100"
                    >
                        <CheckCheck size={12} />
                        <span>Read</span>
                    </div>
                </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] py-2 pl-3 pr-2 max-md:bottom-2 max-md:py-1.5">
        <span className="flex-1 text-[10px] text-slate-600 max-md:text-[8px]">
          Message...
        </span>

                <div className="grid size-7 place-items-center rounded-full bg-cyan-400 text-[#041012] max-md:size-6">
                    <Send size={12} />
                </div>
            </div>
        </div>
    );
}

function FeatureRow({
                        number,
                        icon: Icon,
                        title,
                        description,
                        detail,
                    }) {
    return (
        <article
            data-reveal
            className="grid gap-6 py-10 md:grid-cols-[80px_1fr_1.3fr] md:gap-10 md:py-14"
        >
      <span className="font-mono text-sm text-slate-400 dark:text-slate-600">
        {number}
      </span>

            <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-cyan-600 dark:border-white/[0.08] dark:bg-white/[0.025] dark:text-cyan-400">
                    <Icon size={20} />
                </div>

                <h3 className="max-w-sm text-xl font-semibold tracking-tight">
                    {title}
                </h3>
            </div>

            <div>
                <p className="text-[15px] leading-7 text-slate-600 dark:text-slate-400">
                    {description}
                </p>

                <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-600">
                    {detail}
                </p>
            </div>
        </article>
    );
}

const Landing = () => {
    const rootRef = useRef(null);
    const storyRef = useRef(null);
    const stageRef = useRef(null);

    const appShellRef = useRef(null);
    const composerTextRef = useRef(null);
    const sendButtonRef = useRef(null);

    const sourceAnchorRef = useRef(null);
    const coreAnchorRef = useRef(null);

    const messageActorRef = useRef(null);
    const encryptionCoreRef = useRef(null);
    const packetRef = useRef(null);
    const decryptFlashRef = useRef(null);

    const architectureRailRef = useRef(null);
    const socketNodeRef = useRef(null);
    const serverNodeRef = useRef(null);
    const databaseNodeRef = useRef(null);

    const receiverPhoneRef = useRef(null);
    const receiverAnchorRef = useRef(null);
    const receiverBubbleRef = useRef(null);
    const readStatusRef = useRef(null);

    const progressLineRef = useRef(null);

    const positionsRef = useRef({
        source: { x: 0, y: 0 },
        core: { x: 0, y: 0 },
        socket: { x: 0, y: 0 },
        server: { x: 0, y: 0 },
        database: { x: 0, y: 0 },
        receiver: { x: 0, y: 0 },
    });

    useGSAP(
        () => {
            const media = gsap.matchMedia();

            // The cinematic timeline exists only on desktop/tablet.
            // GSAP automatically removes the pin spacer when this query stops matching.
            media.add("(min-width: 768px)", () => {
                const stage = stageRef.current;
                const actor = messageActorRef.current;
                const core = encryptionCoreRef.current;
                const packet = packetRef.current;
                const flash = decryptFlashRef.current;

                const requiredRefs = {
                    stage,
                    actor,
                    core,
                    packet,
                    flash,
                    appShell: appShellRef.current,
                    composerText: composerTextRef.current,
                    sendButton: sendButtonRef.current,
                    sourceAnchor: sourceAnchorRef.current,
                    coreAnchor: coreAnchorRef.current,
                    architectureRail: architectureRailRef.current,
                    socketNode: socketNodeRef.current,
                    serverNode: serverNodeRef.current,
                    databaseNode: databaseNodeRef.current,
                    receiverPhone: receiverPhoneRef.current,
                    receiverAnchor: receiverAnchorRef.current,
                    receiverBubble: receiverBubbleRef.current,
                    readStatus: readStatusRef.current,
                    progressLine: progressLineRef.current,
                };

                const missingRefs = Object.entries(requiredRefs)
                    .filter(([, value]) => !value)
                    .map(([name]) => name);

                if (missingRefs.length > 0) {
                    console.error(
                        "Chatty scroll animation could not initialize. Missing refs:",
                        missingRefs,
                    );

                    return undefined;
                }

                const select = gsap.utils.selector(rootRef);

                function getCentreInsideStage(element) {
                    const stageRect = stage.getBoundingClientRect();
                    const elementRect = element.getBoundingClientRect();

                    return {
                        x:
                            elementRect.left -
                            stageRect.left +
                            elementRect.width / 2,
                        y:
                            elementRect.top -
                            stageRect.top +
                            elementRect.height / 2,
                    };
                }

                function measurePositions() {
                    positionsRef.current = {
                        source: getCentreInsideStage(sourceAnchorRef.current),
                        core: getCentreInsideStage(coreAnchorRef.current),
                        socket: getCentreInsideStage(socketNodeRef.current),
                        server: getCentreInsideStage(serverNodeRef.current),
                        database: getCentreInsideStage(databaseNodeRef.current),
                        receiver: getCentreInsideStage(receiverAnchorRef.current),
                    };

                    gsap.set(actor, {
                        x: positionsRef.current.source.x,
                        y: positionsRef.current.source.y,
                    });

                    gsap.set(core, {
                        x: positionsRef.current.core.x,
                        y: positionsRef.current.core.y,
                    });

                    gsap.set(packet, {
                        x: positionsRef.current.core.x,
                        y: positionsRef.current.core.y,
                    });

                    gsap.set(flash, {
                        x: positionsRef.current.receiver.x,
                        y: positionsRef.current.receiver.y,
                    });
                }

                gsap.set(actor, {
                    xPercent: -50,
                    yPercent: -50,
                    autoAlpha: 0,
                    scale: 0.75,
                });

                gsap.set(core, {
                    xPercent: -50,
                    yPercent: -50,
                    autoAlpha: 0,
                    scale: 0.3,
                });

                gsap.set(packet, {
                    xPercent: -50,
                    yPercent: -50,
                    autoAlpha: 0,
                    scale: 0.55,
                });

                gsap.set(flash, {
                    xPercent: -50,
                    yPercent: -50,
                    autoAlpha: 0,
                    scale: 0.2,
                });

                gsap.set(composerTextRef.current, {
                    clipPath: "inset(0 100% 0 0)",
                });

                gsap.set(
                    select(
                        "[data-story-copy]:not([data-story-copy='intro'])",
                    ),
                    {
                        autoAlpha: 0,
                        y: 42,
                    },
                );

                gsap.set(select("[data-breakdown-card]"), {
                    autoAlpha: 0,
                    y: 24,
                    scale: 0.78,
                });

                gsap.set(select("[data-byte]"), {
                    autoAlpha: 0,
                    y: 15,
                    scale: 0.4,
                });

                gsap.set(select("[data-architecture-node]"), {
                    autoAlpha: 0,
                    y: 22,
                    scale: 0.84,
                });

                gsap.set(architectureRailRef.current, {
                    autoAlpha: 0,
                });

                gsap.set(select("[data-rail-line]"), {
                    scaleX: 0,
                    transformOrigin: "left center",
                });

                gsap.set(receiverPhoneRef.current, {
                    autoAlpha: 0,
                    x: 70,
                    scale: 0.92,
                });

                gsap.set(receiverBubbleRef.current, {
                    autoAlpha: 0,
                    y: 20,
                    scale: 0.85,
                });

                gsap.set(readStatusRef.current, {
                    autoAlpha: 0,
                });

                gsap.set(progressLineRef.current, {
                    scaleX: 0,
                    transformOrigin: "left center",
                });

                measurePositions();

                const isMobile = false;

                const timeline = gsap.timeline({
                    defaults: {
                        ease: "power2.inOut",
                    },

                    scrollTrigger: {
                        id: "chatty-desktop-story",
                        trigger: storyRef.current,
                        start: "top top+=64",

                        end: () =>
                            `+=${Math.max(
                                5600,
                                window.innerHeight * 6.5,
                            )}`,

                        pin: true,
                        scrub: isMobile ? 0.45 : 0.8,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        onRefresh: measurePositions,
                    },
                });

                /*
                 * 01 — Compose
                 */
                timeline
                    .addLabel("compose")

                    .to(
                        select("[data-story-copy='intro']"),
                        {
                            autoAlpha: 0,
                            y: -45,
                            duration: 0.55,
                        },
                        "compose",
                    )

                    .to(
                        select("[data-scroll-hint]"),
                        {
                            autoAlpha: 0,
                            duration: 0.25,
                        },
                        "compose",
                    )

                    .to(
                        select("[data-story-copy='compose']"),
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.55,
                        },
                        "compose+=0.25",
                    )

                    .to(
                        appShellRef.current,
                        {
                            scale: isMobile ? 1 : 1.025,
                            boxShadow:
                                "0 48px 140px rgba(0,0,0,0.75), 0 0 85px rgba(34,211,238,0.13)",
                            duration: 0.6,
                        },
                        "compose+=0.12",
                    )

                    .to(
                        composerTextRef.current,
                        {
                            clipPath: "inset(0 0% 0 0)",
                            duration: 1.1,
                            ease: "steps(28)",
                        },
                        "compose+=0.5",
                    )

                    .to(
                        select("[data-cursor]"),
                        {
                            autoAlpha: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.12,
                        },
                        "compose+=0.52",
                    );

                /*
                 * 02 — Send
                 */
                timeline
                    .addLabel("send", ">+=0.28")

                    .to(
                        sendButtonRef.current,
                        {
                            scale: 1.2,
                            boxShadow:
                                "0 0 35px rgba(34,211,238,0.65)",
                            duration: 0.18,
                        },
                        "send",
                    )

                    .to(
                        sendButtonRef.current,
                        {
                            scale: 1,
                            boxShadow:
                                "0 0 0 rgba(34,211,238,0)",
                            duration: 0.2,
                        },
                        "send+=0.18",
                    )

                    .to(
                        composerTextRef.current,
                        {
                            autoAlpha: 0,
                            duration: 0.16,
                        },
                        "send+=0.18",
                    )

                    .to(
                        actor,
                        {
                            autoAlpha: 1,
                            scale: isMobile ? 0.8 : 1,
                            duration: 0.32,
                        },
                        "send+=0.22",
                    )

                    .to(
                        select("[data-story-copy='compose']"),
                        {
                            autoAlpha: 0,
                            y: -35,
                            duration: 0.4,
                        },
                        "send+=0.58",
                    );

                /*
                 * 03 — Extract
                 */
                timeline
                    .addLabel("extract", ">+=0.2")

                    .to(
                        actor,
                        {
                            x: () => positionsRef.current.core.x,
                            y: () => positionsRef.current.core.y,
                            scale: isMobile ? 0.9 : 1.15,
                            duration: 1,
                        },
                        "extract",
                    )

                    .to(
                        appShellRef.current,
                        {
                            autoAlpha: 0.14,
                            scale: isMobile ? 0.96 : 0.94,
                            filter: "blur(1.5px)",
                            duration: 0.7,
                        },
                        "extract+=0.2",
                    )

                    .to(
                        select("[data-story-copy='encrypt']"),
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.5,
                        },
                        "extract+=0.52",
                    );

                /*
                 * 04 — Encrypt
                 */
                timeline
                    .addLabel("encrypt")

                    .to(
                        actor,
                        {
                            autoAlpha: 0,
                            scale: 0.35,
                            duration: 0.24,
                        },
                        "encrypt",
                    )

                    .to(
                        core,
                        {
                            autoAlpha: 1,
                            scale: 1,
                            duration: 0.42,
                        },
                        "encrypt",
                    )

                    .to(
                        select("[data-ring='outer']"),
                        {
                            rotation: 200,
                            scale: 1.48,
                            duration: 1,
                        },
                        "encrypt",
                    )

                    .to(
                        select("[data-ring='inner']"),
                        {
                            rotation: -170,
                            scale: 1.25,
                            duration: 1,
                        },
                        "encrypt",
                    )

                    .to(
                        select("[data-byte]"),
                        {
                            autoAlpha: 1,
                            y: 0,
                            scale: 1,
                            stagger: 0.045,
                            duration: 0.24,
                        },
                        "encrypt+=0.12",
                    )

                    .to(
                        select("[data-breakdown-card]"),
                        {
                            autoAlpha: 1,
                            y: 0,
                            scale: 1,
                            stagger: 0.1,
                            duration: 0.38,
                        },
                        "encrypt+=0.24",
                    );

                /*
                 * 05 — Ciphertext remains
                 */
                timeline
                    .addLabel("ciphertext", ">+=0.55")

                    .to(
                        select("[data-breakdown='plaintext']"),
                        {
                            autoAlpha: 0,
                            x: -40,
                            scale: 0.9,
                            duration: 0.35,
                        },
                        "ciphertext",
                    )

                    .to(
                        select("[data-breakdown='ciphertext']"),
                        {
                            scale: 1.08,
                            boxShadow:
                                "0 0 60px rgba(34,211,238,0.22)",
                            duration: 0.4,
                        },
                        "ciphertext",
                    )

                    .to(
                        select("[data-cipher-label]"),
                        {
                            color: "#67e8f9",
                            duration: 0.25,
                        },
                        "ciphertext",
                    );

                /*
                 * 06 — Transport
                 */
                timeline
                    .addLabel("transport", ">+=0.5")

                    .to(
                        select("[data-story-copy='encrypt']"),
                        {
                            autoAlpha: 0,
                            y: -35,
                            duration: 0.4,
                        },
                        "transport",
                    )

                    .to(
                        select("[data-breakdown-card]"),
                        {
                            autoAlpha: 0,
                            y: -20,
                            scale: 0.85,
                            stagger: 0.04,
                            duration: 0.3,
                        },
                        "transport",
                    )

                    .to(
                        select("[data-byte]"),
                        {
                            autoAlpha: 0,
                            scale: 0.3,
                            stagger: 0.025,
                            duration: 0.22,
                        },
                        "transport",
                    )

                    .to(
                        core,
                        {
                            autoAlpha: 0,
                            scale: 0.55,
                            duration: 0.3,
                        },
                        "transport+=0.08",
                    )

                    .to(
                        select("[data-story-copy='transport']"),
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.5,
                        },
                        "transport+=0.2",
                    )

                    .to(
                        architectureRailRef.current,
                        {
                            autoAlpha: 1,
                            duration: 0.35,
                        },
                        "transport+=0.25",
                    )

                    .to(
                        select("[data-rail-line]"),
                        {
                            scaleX: 1,
                            duration: 0.8,
                        },
                        "transport+=0.3",
                    )

                    .to(
                        select("[data-architecture-node]"),
                        {
                            autoAlpha: 1,
                            y: 0,
                            scale: 1,
                            stagger: 0.12,
                            duration: 0.32,
                        },
                        "transport+=0.35",
                    )

                    .to(
                        packet,
                        {
                            autoAlpha: 1,
                            scale: isMobile ? 0.8 : 1,
                            duration: 0.32,
                        },
                        "transport+=0.45",
                    )

                    .to(
                        packet,
                        {
                            x: () => positionsRef.current.socket.x,
                            y: () => positionsRef.current.socket.y,
                            duration: 0.65,
                        },
                        "transport+=0.58",
                    )

                    .to(
                        socketNodeRef.current,
                        {
                            scale: 1.13,
                            duration: 0.16,
                        },
                        "transport+=1.02",
                    )

                    .to(
                        socketNodeRef.current,
                        {
                            scale: 1,
                            duration: 0.16,
                        },
                        "transport+=1.18",
                    )

                    .to(
                        packet,
                        {
                            x: () => positionsRef.current.server.x,
                            y: () => positionsRef.current.server.y,
                            duration: 0.65,
                        },
                        "transport+=1.23",
                    )

                    .to(
                        serverNodeRef.current,
                        {
                            scale: 1.13,
                            duration: 0.16,
                        },
                        "transport+=1.67",
                    )

                    .to(
                        serverNodeRef.current,
                        {
                            scale: 1,
                            duration: 0.16,
                        },
                        "transport+=1.83",
                    )

                    .to(
                        packet,
                        {
                            x: () => positionsRef.current.database.x,
                            y: () => positionsRef.current.database.y,
                            duration: 0.65,
                        },
                        "transport+=1.88",
                    )

                    .to(
                        databaseNodeRef.current,
                        {
                            scale: 1.13,
                            duration: 0.16,
                        },
                        "transport+=2.32",
                    )

                    .to(
                        databaseNodeRef.current,
                        {
                            scale: 1,
                            duration: 0.16,
                        },
                        "transport+=2.48",
                    );

                /*
                 * 07 — Deliver
                 */
                timeline
                    .addLabel("deliver", ">+=0.28")

                    .to(
                        receiverPhoneRef.current,
                        {
                            autoAlpha: 1,
                            x: 0,
                            scale: 1,
                            duration: 0.58,
                        },
                        "deliver",
                    )

                    .to(
                        packet,
                        {
                            x: () => positionsRef.current.receiver.x,
                            y: () => positionsRef.current.receiver.y,
                            duration: 0.9,
                        },
                        "deliver+=0.25",
                    )

                    .to(
                        select("[data-story-copy='transport']"),
                        {
                            autoAlpha: 0,
                            y: -35,
                            duration: 0.4,
                        },
                        "deliver+=0.5",
                    )

                    .to(
                        architectureRailRef.current,
                        {
                            autoAlpha: 0,
                            duration: 0.4,
                        },
                        "deliver+=0.55",
                    )

                    .to(
                        packet,
                        {
                            autoAlpha: 0,
                            scale: 0.45,
                            duration: 0.22,
                        },
                        "deliver+=1.08",
                    )

                    .to(
                        flash,
                        {
                            autoAlpha: 1,
                            scale: 1.45,
                            duration: 0.16,
                        },
                        "deliver+=1.08",
                    )

                    .to(
                        flash,
                        {
                            autoAlpha: 0,
                            scale: 2.7,
                            duration: 0.3,
                        },
                        "deliver+=1.24",
                    )

                    .to(
                        receiverBubbleRef.current,
                        {
                            autoAlpha: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.4,
                        },
                        "deliver+=1.3",
                    )

                    .to(
                        readStatusRef.current,
                        {
                            autoAlpha: 1,
                            duration: 0.25,
                        },
                        "deliver+=1.68",
                    )

                    .to(
                        select("[data-story-copy='final']"),
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.5,
                        },
                        "deliver+=1.38",
                    );

                const storyDuration = timeline.duration();

                timeline.to(
                    progressLineRef.current,
                    {
                        scaleX: 1,
                        ease: "none",
                        duration: storyDuration,
                    },
                    0,
                );

                gsap.utils
                    .toArray(select("[data-reveal]"))
                    .forEach((element) => {
                        gsap.from(element, {
                            autoAlpha: 0,
                            y: 55,
                            duration: 0.8,
                            ease: "power3.out",

                            scrollTrigger: {
                                trigger: element,
                                start: "top 87%",
                                once: true,
                            },
                        });
                    });

                function refreshMeasurements() {
                    measurePositions();
                }

                ScrollTrigger.addEventListener(
                    "refreshInit",
                    refreshMeasurements,
                );

                requestAnimationFrame(() => {
                    measurePositions();
                    ScrollTrigger.refresh();
                });

                if (document.fonts?.ready) {
                    document.fonts.ready.then(() => {
                        measurePositions();
                        ScrollTrigger.refresh();
                    });
                }

                return () => {
                    ScrollTrigger.removeEventListener(
                        "refreshInit",
                        refreshMeasurements,
                    );
                };
            });

            // Defensive cleanup for mobile and for DevTools breakpoint changes.
            // This prevents an old desktop pin-spacer from leaving thousands of
            // pixels of blank scroll space after the viewport becomes mobile.
            media.add("(max-width: 767px)", () => {
                const desktopStory = storyRef.current;

                ScrollTrigger.getAll().forEach((trigger) => {
                    if (
                        trigger.trigger === desktopStory ||
                        trigger.pin === desktopStory
                    ) {
                        trigger.kill(true);
                    }
                });

                requestAnimationFrame(() => {
                    ScrollTrigger.refresh(true);
                });
            });

            return () => {
                media.revert();
                requestAnimationFrame(() => {
                    ScrollTrigger.refresh(true);
                });
            };
        },
        {
            scope: rootRef,
        },
    );

    const currentYear = new Date().getFullYear();

    return (
        <div
            ref={rootRef}
            className="min-h-screen overflow-x-clip bg-white font-sans text-slate-900 selection:bg-cyan-500/30 dark:bg-[#080A0C] dark:text-slate-100"
        >
            {/* Header */}
            <header className="sticky top-0 z-50 h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#080A0C]/90">
                <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-4 sm:px-6">
                    <Link
                        to="/"
                        aria-label="Chatty home"
                        className="flex items-center gap-2 text-lg font-bold tracking-tight"
                    >
                        <MessageSquare className="size-5 text-cyan-500" />
                        <span>Chatty</span>
                    </Link>

                    <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex dark:text-slate-400">
                        <a
                            href="#journey"
                            className="transition-colors hover:text-slate-950 dark:hover:text-white"
                        >
                            Message journey
                        </a>

                        <a
                            href="#features"
                            className="transition-colors hover:text-slate-950 dark:hover:text-white"
                        >
                            Features
                        </a>

                        <a
                            href="https://github.com/fateen1028-pixel/Chatty"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 transition-colors hover:text-slate-950 dark:hover:text-white"
                        >
                            <ExternalLink size={14} />
                            GitHub
                        </a>
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            to="/login"
                            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 outline-none transition-colors hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-cyan-500 dark:text-slate-300 dark:hover:text-white"
                        >
                            Log in
                        </Link>

                        <Link
                            to="/register"
                            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white outline-none transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-cyan-500 dark:bg-white dark:text-slate-950"
                        >
              <span className="hidden sm:inline">
                Create account
              </span>

                            <span className="sm:hidden">
                Sign up
              </span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Static mobile landing — intentionally no GSAP or pinned scrolling */}
            <section className="bg-[#030708] text-white md:hidden">
                <div className="mx-auto max-w-md px-5 pb-10 pt-12">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400">
                        Secure real-time messaging
                    </p>

                    <h1 className="mt-4 max-w-[10ch] text-[2.75rem] font-medium leading-[0.92] tracking-[-0.06em]">
                        Your messages should stay yours.
                    </h1>

                    <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
                        Chatty encrypts messages on the sender device, transports only protected data, and decrypts them on the intended device.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-slate-950"
                        >
                            Start messaging
                            <ArrowRight size={14} />
                        </Link>

                        <a
                            href="https://github.com/fateen1028-pixel/Chatty"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white"
                        >
                            <ExternalLink size={14} />
                            View source
                        </a>
                    </div>
                </div>

                <div className="px-4 pb-12">
                    <div className="mx-auto max-w-md overflow-hidden rounded-[22px] border border-cyan-300/15 bg-[#071114] shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
                        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
                            <div className="flex items-center gap-3">
                                <Avatar name="Alex" />
                                <div>
                                    <strong className="block text-xs text-white">Alex</strong>
                                    <span className="mt-0.5 block text-[10px] text-emerald-400">Online now</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 rounded-full border border-cyan-400/15 bg-cyan-400/[0.04] px-2.5 py-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-cyan-300">
                                <LockKeyhole size={10} />
                                Encrypted
                            </div>
                        </div>

                        <div className="min-h-[250px] px-4 py-5">
                            <div className="flex justify-center">
                                <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-[7px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                    <ShieldCheck size={10} />
                                    End-to-end encrypted
                                </div>
                            </div>

                            <div className="mt-6 flex justify-start">
                                <div className="max-w-[78%] rounded-2xl rounded-bl-sm border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[10px] leading-relaxed text-slate-300">
                                    Is the new encryption build ready?
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-gradient-to-br from-cyan-500 to-blue-600 px-3 py-2 text-[10px] leading-relaxed text-white shadow-[0_12px_32px_rgba(6,182,212,0.2)]">
                                    {MESSAGE}
                                    <div className="mt-1 flex items-center justify-end gap-1 text-[8px] text-cyan-100">
                                        <CheckCheck size={11} />
                                        Read
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/[0.06] p-3">
                            <div className="flex items-center gap-2">
                                <div className="flex min-w-0 flex-1 items-center rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-2.5 text-[9px] text-slate-500">
                                    Message Alex...
                                </div>
                                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-cyan-400 text-[#031014]">
                                    <Send size={14} strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/[0.07] px-5 py-12">
                    <div className="mx-auto max-w-md space-y-8">
                        {[
                            {
                                number: "01",
                                icon: LockKeyhole,
                                title: "Encrypted before leaving",
                                text: "AES-GCM protects the readable message inside the browser before transmission.",
                            },
                            {
                                number: "02",
                                icon: Wifi,
                                title: "Delivered in real time",
                                text: "Spring Boot, STOMP and WebSockets transport the encrypted payload instantly.",
                            },
                            {
                                number: "03",
                                icon: ShieldCheck,
                                title: "Decrypted for the recipient",
                                text: "The intended device recovers the message and updates delivered and read status.",
                            },
                        ].map(({ number, icon: Icon, title, text: description }) => (
                            <article key={number} className="grid grid-cols-[42px_1fr] gap-4">
                                <div className="grid size-10 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-400/[0.06] text-cyan-300">
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-400">
                                        {number}
                                    </span>
                                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
                                        {title}
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        {description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Scroll-driven story — desktop/tablet only */}
            <section
                id="journey"
                ref={storyRef}
                className="
    hidden
    md:block
    relative
    h-[calc(100dvh-64px)]
    min-h-[680px]
    overflow-hidden
    bg-[#030708]
    text-white

    max-md:h-[calc(100dvh-64px)]
    max-md:min-h-[560px]
  "
            >
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.11]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                        backgroundSize: "72px 72px",
                        maskImage:
                            "radial-gradient(circle at 62% 50%, black, transparent 76%)",
                    }}
                />

                <div className="pointer-events-none absolute left-[58%] top-1/2 size-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.07] blur-[125px]" />

                <div
                    ref={stageRef}
                    className="absolute inset-0"
                >
                    {/* Intro */}
                    <div
                        data-story-copy="intro"
                        className={STORY_COPY_CLASS}
                    >
                        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400 sm:mb-5 sm:text-[11px] sm:tracking-[0.24em]">
                            Secure real-time messaging
                        </p>

                        <h1 className={STORY_HEADING_CLASS}>
                            Your messages should stay yours.
                        </h1>

                        <p className="mt-7 max-w-md text-[15px] leading-7 text-slate-400 max-md:hidden">
                            Follow one message as it is composed,
                            encrypted, transported and recovered only
                            on the intended device.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3 max-md:mt-5">
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.03] max-md:px-4 max-md:py-2.5 max-md:text-xs"
                            >
                                Start messaging
                                <ArrowRight size={15} />
                            </Link>

                            <a
                                href="https://github.com/fateen1028-pixel/Chatty"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition-colors hover:bg-white/[0.08] max-md:px-4 max-md:py-2.5 max-md:text-xs"
                            >
                                <ExternalLink size={15} />
                                View source
                            </a>
                        </div>
                    </div>

                    {/* Compose */}
                    <div
                        data-story-copy="compose"
                        style={{ opacity: 0 }}
                        className={STORY_COPY_CLASS}
                    >
                        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400 sm:text-[11px] sm:tracking-[0.24em]">
                            01 — Compose
                        </p>

                        <h2 className={STORY_HEADING_CLASS}>
                            It begins as ordinary language.
                        </h2>

                        <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400 max-md:hidden">
                            A normal message inside a normal conversation.
                            Protection begins before it leaves the browser.
                        </p>
                    </div>

                    {/* Encrypt */}
                    <div
                        data-story-copy="encrypt"
                        style={{ opacity: 0 }}
                        className={STORY_COPY_CLASS}
                    >
                        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400 sm:text-[11px] sm:tracking-[0.24em]">
                            02 — Encrypt locally
                        </p>

                        <h2 className={STORY_HEADING_CLASS}>
                            Readable text becomes protected data.
                        </h2>

                        <p className="mt-6 max-w-md text-sm leading-7 text-slate-400 max-md:hidden">
                            AES-GCM protects the message. RSA-OAEP
                            protects the key required to recover it.
                        </p>
                    </div>

                    {/* Transport */}
                    <div
                        data-story-copy="transport"
                        style={{ opacity: 0 }}
                        className={STORY_COPY_CLASS}
                    >
                        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400 sm:text-[11px] sm:tracking-[0.24em]">
                            03 — Deliver in real time
                        </p>

                        <h2 className={STORY_HEADING_CLASS}>
                            The server moves data—not secrets.
                        </h2>

                        <p className="mt-6 max-w-md text-sm leading-7 text-slate-400 max-md:hidden">
                            Spring Boot, STOMP and WebSockets move the
                            encrypted payload without needing readable text.
                        </p>
                    </div>

                    {/* Final */}
                    <div
                        data-story-copy="final"
                        style={{ opacity: 0 }}
                        className={STORY_COPY_CLASS}
                    >
                        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400 sm:text-[11px] sm:tracking-[0.24em]">
                            04 — Decrypt on the intended device
                        </p>

                        <h2 className={STORY_HEADING_CLASS}>
                            Readable to them. Meaningless to everyone else.
                        </h2>

                        <Link
                            to="/register"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.03] max-md:px-4 max-md:py-2.5 max-md:text-xs"
                        >
                            Open Chatty
                            <ArrowRight size={15} />
                        </Link>
                    </div>

                    {/* Chat preview */}
                    <div
                        ref={appShellRef}
                        className="
              absolute right-[4%] top-1/2 z-10
              flex h-[510px] w-[57%] max-w-[790px]
              -translate-y-1/2
              overflow-hidden
              rounded-[26px]
              border border-white/[0.09]
              bg-[#081013]/95
              shadow-[0_45px_120px_rgba(0,0,0,0.58)]
              backdrop-blur-2xl

              max-lg:right-[2%]
              max-lg:w-[55%]

              max-md:left-3
max-md:right-3
max-md:top-[28%]
max-md:h-[290px]
max-md:w-auto
max-md:rounded-[20px]
            "
                    >
                        <aside className="flex w-[235px] shrink-0 flex-col border-r border-white/[0.06] bg-white/[0.015] max-lg:w-[195px] max-md:hidden">
                            <div className="border-b border-white/[0.06] p-4">
                                <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
                                    <svg
                                        className="size-4 text-slate-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>

                                    <span className="text-[11px] text-slate-600">
                    Search messages
                  </span>
                                </div>
                            </div>

                            <div className="space-y-1.5 p-2">
                                <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] p-2.5">
                                    <Avatar name="Alex" />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between gap-2">
                                            <strong className="text-xs text-white">
                                                Alex
                                            </strong>

                                            <span className="text-[9px] text-slate-600">
                        Now
                      </span>
                                        </div>

                                        <p className="mt-1 truncate text-[10px] text-slate-500">
                                            Testing the new build...
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-xl p-2.5 opacity-55">
                                    <Avatar name="Sarah" />

                                    <div className="min-w-0 flex-1">
                                        <strong className="text-xs text-white">
                                            Sarah
                                        </strong>

                                        <p className="mt-1 truncate text-[10px] text-slate-500">
                                            Are we still meeting?
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <div className="relative flex min-w-0 flex-1 flex-col">
                            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-5 max-md:h-12 max-md:px-3">
                                <div className="flex items-center gap-3">
                                    <div className="max-md:scale-90">
                                        <Avatar name="Alex" />
                                    </div>

                                    <div>
                                        <strong className="block text-xs text-white">
                                            Alex
                                        </strong>

                                        <span className="mt-0.5 block text-[10px] text-emerald-400">
                      Online now
                    </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.04] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-cyan-300 max-md:px-2 max-md:text-[7px]">
                                    <LockKeyhole size={10} />
                                    Encrypted
                                </div>
                            </div>

                            <div className="relative min-h-0 flex-1 overflow-hidden p-5 max-md:p-3">
                                <div className="flex justify-center max-[380px]:hidden">
                                    <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500 max-md:px-2 max-md:text-[7px]">
                                        <ShieldCheck size={10} />
                                        End-to-end encrypted
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-start max-md:mt-3">
                                    <div className="max-w-[76%] rounded-2xl rounded-bl-sm border border-white/[0.07] bg-white/[0.035] px-3.5 py-2.5 text-[11px] leading-relaxed text-slate-300 max-md:px-3 max-md:py-2 max-md:text-[9px]">
                                        Is the new encryption build ready?
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end max-md:hidden">
                                    <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-cyan-500/15 px-3.5 py-2.5 text-[11px] leading-relaxed text-cyan-100">
                                        Running the final test now.
                                    </div>
                                </div>

                                <div
                                    ref={sourceAnchorRef}
                                    className="absolute bottom-[92px] right-[130px] size-px max-md:bottom-[42px] max-md:right-[88px]"
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="border-t border-white/[0.06] p-3 max-md:p-2">
                                <div className="flex items-center gap-2">
                                    <div className="relative flex min-w-0 flex-1 items-center overflow-hidden rounded-full border border-white/[0.07] bg-white/[0.035] px-4 py-3 max-md:px-3 max-md:py-2.5">
                    <span
                        ref={composerTextRef}
                        className="whitespace-nowrap text-[11px] text-slate-300 max-md:text-[9px]"
                    >
                      {MESSAGE}
                    </span>

                                        <span
                                            data-cursor
                                            className="ml-0.5 h-4 w-px bg-cyan-300"
                                        />
                                    </div>

                                    <button
                                        ref={sendButtonRef}
                                        type="button"
                                        aria-label="Send preview message"
                                        className="grid size-10 shrink-0 place-items-center rounded-full bg-cyan-400 text-[#031014] max-md:size-9"
                                    >
                                        <Send size={15} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Encryption core anchor */}
                    <div
                        ref={coreAnchorRef}
                        className="
              pointer-events-none
              absolute
              left-[68%]
              top-[49%]
              size-px

              max-md:left-1/2
max-md:top-[26%]
            "
                        aria-hidden="true"
                    />

                    {/* Travelling message */}
                    <div
                        ref={messageActorRef}
                        style={{ opacity: 0 }}
                        className="
              pointer-events-none
              absolute left-0 top-0 z-40
              max-w-[280px]
              rounded-2xl rounded-br-sm
              bg-gradient-to-br from-cyan-500 to-blue-600
              px-4 py-3
              text-[12px] font-medium leading-relaxed text-white
              shadow-[0_22px_60px_rgba(6,182,212,0.35)]
              will-change-transform

              max-md:max-w-[190px]
              max-md:px-3
              max-md:py-2
              max-md:text-[9px]
            "
                    >
                        {MESSAGE}
                    </div>

                    {/* Encryption core */}
                    <div
                        ref={encryptionCoreRef}
                        style={{ opacity: 0 }}
                        className="pointer-events-none absolute left-0 top-0 z-30 size-44 will-change-transform max-md:size-28"
                    >
                        <div
                            data-ring="outer"
                            className="absolute inset-0 rounded-full border border-cyan-300/30 border-r-transparent"
                        />

                        <div
                            data-ring="inner"
                            className="absolute inset-8 rounded-full border border-cyan-300/30 border-t-transparent max-md:inset-5"
                        />

                        <div className="absolute inset-[58px] grid place-items-center rounded-full bg-cyan-400/15 text-cyan-200 shadow-[0_0_75px_rgba(34,211,238,0.32)] max-md:inset-9">
                            <LockKeyhole size={25} />
                        </div>

                        {[
                            ["9F", "left-1/2 top-[-25px]"],
                            ["A2", "right-[-28px] top-[20%]"],
                            ["7C", "right-[-28px] bottom-[18%]"],
                            ["11", "bottom-[-22px] right-[25%]"],
                            ["E8", "bottom-[-22px] left-[22%]"],
                            ["4B", "left-[-28px] bottom-[20%]"],
                            ["C3", "left-[-28px] top-[22%]"],
                            ["90", "left-1/2 top-1/2"],
                        ].map(([value, position], index) => (
                            <span
                                key={`${value}-${index}`}
                                data-byte
                                className={`absolute ${position} -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] font-bold text-cyan-300 max-md:text-[8px]`}
                            >
                {value}
              </span>
                        ))}
                    </div>

                    {/* Desktop-only breakdown cards */}
                    <div
                        data-breakdown-card
                        data-breakdown="plaintext"
                        style={{ opacity: 0 }}
                        className="absolute left-[43%] top-[19%] z-40 w-[220px] rounded-2xl border border-white/[0.09] bg-[#0B1519]/90 p-4 shadow-2xl backdrop-blur-xl max-lg:left-[40%] max-md:hidden"
                    >
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Plaintext
            </span>

                        <p className="mt-2 text-xs leading-relaxed text-white">
                            “{MESSAGE}”
                        </p>
                    </div>

                    <div
                        data-breakdown-card
                        data-breakdown="key"
                        style={{ opacity: 0 }}
                        className="absolute right-[5%] top-[18%] z-40 w-[205px] rounded-2xl border border-cyan-400/15 bg-[#0B1519]/90 p-4 shadow-2xl backdrop-blur-xl max-md:hidden"
                    >
                        <div className="flex items-center gap-2 text-cyan-300">
                            <KeyRound size={15} />

                            <span className="text-[9px] font-bold uppercase tracking-[0.17em]">
                AES session key
              </span>
                        </div>

                        <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-400">
                            7D2A-F9C8-113E
                        </p>
                    </div>

                    <div
                        data-breakdown-card
                        data-breakdown="iv"
                        style={{ opacity: 0 }}
                        className="absolute bottom-[16%] left-[44%] z-40 w-[190px] rounded-2xl border border-white/[0.09] bg-[#0B1519]/90 p-4 shadow-2xl backdrop-blur-xl max-md:hidden"
                    >
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Initialization vector
            </span>

                        <p className="mt-2 font-mono text-[10px] text-slate-300">
                            F4 9A 31 C8 7B
                        </p>
                    </div>

                    {/* Ciphertext card remains on mobile */}
                    <div
                        data-breakdown-card
                        data-breakdown="ciphertext"
                        style={{ opacity: 0 }}
                        className="
              absolute bottom-[14%] right-[5%] z-40
              w-[230px]
              rounded-2xl
              border border-cyan-400/20
              bg-[#0B1519]/90
              p-4
              shadow-2xl
              backdrop-blur-xl

              max-md:bottom-auto
              max-md:left-1/2
              max-md:right-auto
              max-md:top-[11%]
              max-md:w-[180px]
              max-md:-translate-x-1/2
              max-md:p-3
            "
                    >
                        <div className="flex items-center gap-2">
                            <LockKeyhole
                                size={14}
                                className="text-cyan-300"
                            />

                            <span
                                data-cipher-label
                                className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500"
                            >
                Encrypted payload
              </span>
                        </div>

                        <p className="mt-2 font-mono text-[10px] leading-relaxed text-cyan-200">
                            9F A2 7C 11 E8 4B C3 90
                        </p>
                    </div>

                    {/* Architecture rail */}
                    <div
                        ref={architectureRailRef}
                        style={{ opacity: 0 }}
                        className="
              absolute left-[43%] right-[5%] top-1/2 z-[25]
              -translate-y-1/2

              max-md:left-3
              max-md:right-3
              max-md:top-[26%]
            "
                    >
                        <div
                            data-rail-line
                            className="absolute left-[16%] right-[16%] top-[22px] h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent sm:top-7"
                        />

                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <ArchitectureNode
                                nodeRef={socketNodeRef}
                                icon={Wifi}
                                label="Transport"
                                title="WebSocket"
                                description="Real-time STOMP delivery"
                            />

                            <ArchitectureNode
                                nodeRef={serverNodeRef}
                                icon={Server}
                                label="Backend"
                                title="Spring Boot"
                                description="Moves encrypted payloads"
                            />

                            <ArchitectureNode
                                nodeRef={databaseNodeRef}
                                icon={Database}
                                label="Storage"
                                title="PostgreSQL"
                                description="Stores encrypted content"
                            />
                        </div>
                    </div>

                    {/* Packet */}
                    <div
                        ref={packetRef}
                        style={{ opacity: 0 }}
                        className="
              pointer-events-none
              absolute left-0 top-0 z-50
              flex items-center gap-2
              rounded-xl
              border border-cyan-300/25
              bg-[#071419]/95
              px-3 py-2
              text-cyan-200
              shadow-[0_0_45px_rgba(34,211,238,0.22)]
              backdrop-blur-xl
              will-change-transform

              max-md:px-2
              max-md:py-1.5
            "
                    >
                        <LockKeyhole size={14} />

                        <div>
              <span className="block text-[8px] font-bold uppercase tracking-[0.15em] max-md:text-[7px]">
                Encrypted payload
              </span>

                            <code className="mt-0.5 block text-[9px] max-md:text-[7px]">
                                9F A2 7C 11
                            </code>
                        </div>
                    </div>

                    <ReceiverPhone
                        phoneRef={receiverPhoneRef}
                        anchorRef={receiverAnchorRef}
                        bubbleRef={receiverBubbleRef}
                        statusRef={readStatusRef}
                    />

                    <div
                        ref={decryptFlashRef}
                        style={{ opacity: 0 }}
                        className="pointer-events-none absolute left-0 top-0 z-50 size-24 rounded-full bg-white shadow-[0_0_55px_white,0_0_150px_rgba(34,211,238,0.85)] will-change-transform max-md:size-16"
                    />

                    <div
                        data-scroll-hint
                        className="absolute bottom-6 right-[4%] z-50 flex items-center gap-3 max-md:hidden"
                    >
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Scroll to follow the message
            </span>

                        <div className="h-px w-28 overflow-hidden bg-white/10">
                            <div
                                ref={progressLineRef}
                                className="h-full w-full bg-cyan-300"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section
                id="features"
                className="border-t border-slate-200/80 bg-white py-16 dark:border-white/[0.06] dark:bg-[#080A0C] md:py-32"
            >
                <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
                    <div
                        data-reveal
                        className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
                    >
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-400">
                                Product capabilities
                            </p>

                            <h2 className="mt-5 max-w-[11ch] text-3xl font-semibold leading-[0.98] tracking-[-0.045em] md:max-w-[9ch] md:text-6xl md:leading-[0.95] md:tracking-[-0.055em]">
                                More than a polished chat interface.
                            </h2>
                        </div>

                        <p className="max-w-xl self-end text-base leading-8 text-slate-600 dark:text-slate-400">
                            Chatty coordinates cryptography,
                            authentication, WebSocket state and message
                            persistence as one working system.
                        </p>
                    </div>

                    <div className="mt-20 divide-y divide-slate-200/80 border-y border-slate-200/80 dark:divide-white/[0.07] dark:border-white/[0.07]">
                        <FeatureRow
                            number="01"
                            icon={LockKeyhole}
                            title="End-to-end encrypted conversations"
                            description="Message content is encrypted before transmission. The backend stores encrypted payloads instead of readable conversation text."
                            detail="AES-GCM encryption with RSA-OAEP key wrapping."
                        />

                        <FeatureRow
                            number="02"
                            icon={Zap}
                            title="Real-time conversation state"
                            description="Messages, online presence, typing state, delivery updates and read receipts remain synchronized without page refreshes."
                            detail="WebSocket and STOMP-based communication."
                        />

                        <FeatureRow
                            number="03"
                            icon={MonitorSmartphone}
                            title="Session and device security"
                            description="Authentication, refresh tokens, device keys and account recovery are handled as separate security responsibilities."
                            detail="JWT access tokens and HTTP-only refresh cookies."
                        />
                    </div>
                </div>
            </section>

            {/* Device security */}
            <section className="overflow-hidden border-t border-slate-200/80 bg-slate-50 py-16 dark:border-white/[0.06] dark:bg-[#0B0D10] md:py-32">
                <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        <div data-reveal>
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-400">
                                Device-aware security
                            </p>

                            <h2 className="mt-5 max-w-[12ch] text-3xl font-semibold leading-[0.98] tracking-[-0.045em] md:max-w-[10ch] md:text-6xl md:leading-[0.95] md:tracking-[-0.055em]">
                                Every device has its own cryptographic identity.
                            </h2>

                            <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-400">
                                Public keys can be registered with the account
                                while private keys remain inside the browser
                                device that created them.
                            </p>
                        </div>

                        <div
                            data-reveal
                            className="relative mx-auto grid w-full max-w-xl grid-cols-1 gap-4 md:grid-cols-3 md:items-end md:gap-5"
                        >
                            <div className="relative flex min-h-[150px] flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#101317] md:h-[270px] md:rounded-[24px]">
                                <div className="grid size-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-500">
                                    <Smartphone size={19} />
                                </div>

                                <div className="mt-auto">
                                    <strong className="block text-xs sm:text-sm">
                                        Phone
                                    </strong>

                                    <span className="mt-2 block text-[8px] font-bold uppercase tracking-[0.1em] text-emerald-500 sm:text-[10px] sm:tracking-[0.13em]">
                    Trusted
                  </span>
                                </div>
                            </div>

                            <div className="relative flex min-h-[170px] flex-col overflow-hidden rounded-[20px] border border-cyan-400/35 bg-white p-4 shadow-[0_24px_60px_rgba(6,182,212,0.1)] dark:bg-[#101317] md:h-[330px] md:rounded-[24px] md:shadow-[0_35px_90px_rgba(6,182,212,0.13)]">
                                <div className="grid size-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-500">
                                    <MonitorSmartphone size={19} />
                                </div>

                                <div className="mt-auto">
                                    <strong className="block text-xs sm:text-sm">
                                        Desktop
                                    </strong>

                                    <span className="mt-2 block text-[8px] font-bold uppercase tracking-[0.1em] text-emerald-500 sm:text-[10px] sm:tracking-[0.13em]">
                    Current
                  </span>
                                </div>
                            </div>

                            <div className="relative flex min-h-[150px] flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#101317] md:h-[240px] md:rounded-[24px]">
                                <div className="grid size-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-500">
                                    <KeyRound size={19} />
                                </div>

                                <div className="mt-auto">
                                    <strong className="block text-xs sm:text-sm">
                                        New device
                                    </strong>

                                    <span className="mt-2 block text-[8px] font-bold uppercase tracking-[0.1em] text-amber-500 sm:text-[10px] sm:tracking-[0.13em]">
                    Key required
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Engineering */}
            <section className="border-t border-slate-200/80 bg-white py-16 dark:border-white/[0.06] dark:bg-[#080A0C] md:py-32">
                <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
                    <div
                        data-reveal
                        className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-24"
                    >
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-400">
                                Built as a real system
                            </p>

                            <h2 className="mt-5 max-w-[12ch] text-3xl font-semibold leading-[0.98] tracking-[-0.045em] md:max-w-[10ch] md:text-6xl md:leading-[0.95] md:tracking-[-0.055em]">
                                Not another messaging UI mockup.
                            </h2>

                            <p className="mt-7 max-w-lg text-base leading-8 text-slate-600 dark:text-slate-400">
                                Chatty is a full-stack engineering project by
                                Mohamed Fateen, built around real
                                authentication, persistence, cryptography and
                                real-time state.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 border-l border-t border-slate-200 dark:border-white/[0.08] sm:grid-cols-2">
                            {[
                                ["Frontend", "React + Vite", Code2],
                                ["Backend", "Spring Boot", Server],
                                ["Real time", "WebSocket + STOMP", Wifi],
                                ["Database", "PostgreSQL", Database],
                                ["Encryption", "Web Crypto API", ShieldCheck],
                                ["Authentication", "JWT + cookies", Lock],
                            ].map(([label, value, Icon]) => (
                                <div
                                    key={label}
                                    className="min-h-36 border-b border-r border-slate-200 p-5 dark:border-white/[0.08] sm:p-7"
                                >
                                    <Icon
                                        size={20}
                                        className="text-cyan-500"
                                    />

                                    <span className="mt-8 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-600">
                    {label}
                  </span>

                                    <strong className="mt-2 block text-sm sm:text-base">
                                        {value}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#030708] py-20 text-white md:py-36">
                <div className="pointer-events-none absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.08] blur-[130px]" />

                <div
                    data-reveal
                    className="relative z-10 mx-auto max-w-[1180px] px-4 text-center sm:px-6"
                >
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-400">
                        Chatty
                    </p>

                    <h2 className="mx-auto mt-6 max-w-[10ch] text-4xl font-medium leading-[0.94] tracking-[-0.055em] md:max-w-[9ch] md:text-7xl md:leading-[0.9] md:tracking-[-0.07em] lg:text-8xl">
                        Your messages. Nobody else&apos;s business.
                    </h2>

                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.03]"
                        >
                            Create an account
                            <ArrowRight size={16} />
                        </Link>

                        <a
                            href="https://github.com/fateen1028-pixel/Chatty"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition-colors hover:bg-white/[0.08]"
                        >
                            <ExternalLink size={16} />
                            View source
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200/80 bg-white py-8 dark:border-white/[0.06] dark:bg-[#080A0C]">
                <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-5 px-4 sm:flex-row sm:px-6">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <MessageSquare className="size-4 text-cyan-500" />
                        Chatty
                    </div>

                    <div className="flex items-center gap-6 text-[13px] font-medium text-slate-500 dark:text-slate-400">
                        <a
                            href="https://github.com/fateen1028-pixel/Chatty"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-slate-950 dark:hover:text-white"
                        >
                            GitHub
                        </a>

                        <a
                            href="https://fateen.dev/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-slate-950 dark:hover:text-white"
                        >
                            Developer portfolio
                        </a>
                    </div>

                    <p className="text-[12px] font-medium text-slate-400 dark:text-slate-600">
                        Built by Mohamed Fateen © {currentYear}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
