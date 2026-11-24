import { Component, useCallback, useEffect, useRef, useState } from 'react'
import { Ascii } from 'ascii.rest/react'
import * as gitGraph from 'ascii.rest/pieces/git-graph'
import * as bootLog from 'ascii.rest/pieces/boot-log'
import AvatarSceneEntry from './AvatarSceneEntry'
import './App.css'

const slowBootLog = {
  meta: bootLog.meta,
  default: (...args) => {
    const frame = bootLog.default(...args)
    return (time, env) => frame(time * 0.8, env)
  },
}

class AsciiPieceBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onFailure()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function KyotoScene() {
  const [piece, setPiece] = useState(null)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [reducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    let active = true
    import('ascii.rest/pieces/kyoto-dusk')
      .then((loadedPiece) => {
        if (active) setPiece(loadedPiece)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!piece || failed) return undefined
    const timeout = window.setTimeout(() => setReady(true), 500)
    return () => window.clearTimeout(timeout)
  }, [piece, failed])

  return (
    <div className={`hero-art${ready && !failed ? ' is-ready' : ''}`}>
      <video
        className="hero-art__fallback"
        src="/kyoto-dusk.mp4"
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      {piece && !failed && (
        <AsciiPieceBoundary onFailure={() => setFailed(true)}>
          <Ascii
            piece={piece}
            className="hero-art__ascii"
            label="Animated Kyoto at dusk, with a pagoda, cherry tree and lantern"
            style={{ height: '100%' }}
          />
        </AsciiPieceBoundary>
      )}
    </div>
  )
}

function JalMahalScene() {
  const artRef = useRef(null)
  const videoRef = useRef(null)
  const [artReady, setArtReady] = useState(false)

  useEffect(() => {
    const art = artRef.current
    if (!art) return undefined

    const observer = new MutationObserver(() => {
      if (art.childElementCount > 0) setArtReady(true)
    })
    observer.observe(art, { childList: true })
    if (art.childElementCount > 0) setArtReady(true)

    if (!customElements.get('ascii-art') && !document.querySelector('[data-ascii-rest-script]')) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://ascii.rest/ascii.js'
      script.dataset.asciiRestScript = 'true'
      document.head.appendChild(script)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (artReady) videoRef.current?.pause()
  }, [artReady])

  return (
    <div className={`hero-art hero-art--light${artReady ? ' is-ready' : ''}`}>
      <video
        ref={videoRef}
        className="hero-art__jal-video"
        src="/jal-mahal.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <ascii-art
        ref={artRef}
        piece="jal-mahal"
        className="hero-art__jal-art"
        aria-label="Animated ASCII art of Jal Mahal"
      />
    </div>
  )
}

function BootIntro({ onFinish, isExiting }) {
  useEffect(() => {
    document.body.classList.add('intro-is-open')
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const timer = motionPreference.matches
      ? undefined
      : window.setTimeout(onFinish, 9000)
    if (motionPreference.matches) onFinish()

    function handleKeyDown(event) {
      if (event.key === 'Escape') onFinish()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      if (timer) window.clearTimeout(timer)
      document.body.classList.remove('intro-is-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onFinish])

  return (
    <section
      className={`boot-intro${isExiting ? ' is-exiting' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio boot sequence"
    >
      <Ascii
        piece={slowBootLog}
        className="boot-intro__art"
        label="Animated computer boot log"
      />
      <SpiderCorner />
    </section>
  )
}

function SpiderCorner() {
  const [piece, setPiece] = useState(null)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [reducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    let active = true
    import('ascii.rest/pieces/spider')
      .then((loadedPiece) => {
        if (active) setPiece(loadedPiece)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!piece || failed) return undefined
    const timeout = window.setTimeout(() => setReady(true), 350)
    return () => window.clearTimeout(timeout)
  }, [piece, failed])

  return (
    <div className={`boot-intro__spider${ready && !failed ? ' is-ready' : ''}`}>
      <video
        className="boot-intro__spider-video"
        src="/spider.mp4"
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      {piece && !failed && (
        <AsciiPieceBoundary onFailure={() => setFailed(true)}>
          <Ascii
            piece={piece}
            className="boot-intro__spider-ascii"
            label="Animated spider lowering itself on a web"
          />
        </AsciiPieceBoundary>
      )}
    </div>
  )
}

const projects = [
  {
    name: 'KAEMA',
    type: 'Identity · Art direction',
    description: 'A new point of view for a modern fashion label.',
    image:
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85',
    alt: 'Fashion portrait in warm late afternoon light',
    className: 'project-image--fashion',
  },
  {
    name: 'Airbuds',
    type: 'Digital product · 2025',
    description: 'A quieter way to tune in, and tune everything else out.',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=85',
    alt: 'Colorful headphones photographed against a vivid yellow backdrop',
    className: 'project-image--audio',
  },
  {
    name: 'The Serif',
    type: 'Campaign · Samsung',
    description: 'Giving the everyday screen a place in the room.',
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85',
    alt: 'Artful, sunlit living room with warm natural materials',
    className: 'project-image--interior',
  },
  {
    name: 'Kard',
    type: 'Brand · Fintech',
    description: 'Making the small moments with money feel more human.',
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85',
    alt: 'A customer making a contactless payment at a small shop',
    className: 'project-image--kard',
  },
]

function FloatingNav({ theme, onToggleTheme }) {
  const [activeSection, setActiveSection] = useState('top')
  const [botMood, setBotMood] = useState('idle')
  const [dismissedSection, setDismissedSection] = useState(null)
  const [connectionPrompt, setConnectionPrompt] = useState(false)
  const [githubRedirecting, setGithubRedirecting] = useState(false)
  const showDialogue =
    dismissedSection !== activeSection || botMood !== 'idle' || connectionPrompt
  const navRef = useRef(null)
  const botRef = useRef(null)
  const linkRefs = useRef({})
  const botClickCount = useRef(0)
  const botResetTimer = useRef(null)
  const dialogueTimer = useRef(null)
  const connectionTimer = useRef(null)
  const connectionPromptLocked = useRef(false)

  const activeNavId = activeSection === 'top'
    ? 'top'
    : activeSection === 'work'
      ? 'work'
      : 'biography'

  const moveBotTo = useCallback((clientX) => {
    const nav = navRef.current
    const bot = botRef.current
    if (!nav || !bot) return

    const bounds = nav.getBoundingClientRect()
    const edgeInset = 68 + bounds.height / 2
    const x = Math.min(
      bounds.width - edgeInset,
      Math.max(edgeInset, clientX - bounds.left),
    )
    bot.style.setProperty('--bot-offset', `${x - bounds.width / 2}px`)
  }, [])

  const resetBotToSection = useCallback(() => {
    const link = linkRefs.current[activeNavId]
    if (!link) return
    const bounds = link.getBoundingClientRect()
    moveBotTo(bounds.left + bounds.width / 2)
  }, [activeNavId, moveBotTo])

  const showConnectionPrompt = useCallback(() => {
    if (connectionPromptLocked.current) return
    connectionPromptLocked.current = true
    setConnectionPrompt(true)
    window.clearTimeout(dialogueTimer.current)
    window.clearTimeout(connectionTimer.current)
    connectionTimer.current = window.setTimeout(() => {
      setConnectionPrompt(false)
      setDismissedSection(activeSection)
    }, 2400)
  }, [activeSection])

  const dismissConnectionPrompt = useCallback(() => {
    connectionPromptLocked.current = false
    window.clearTimeout(connectionTimer.current)
    window.clearTimeout(dialogueTimer.current)
    setConnectionPrompt(false)
    setDismissedSection(activeSection)
  }, [activeSection])

  useEffect(() => {
    const sections = ['top', 'work', 'biography', 'lab', 'life', 'resume']
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.2, 0.5] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    resetBotToSection()
  }, [resetBotToSection])

  useEffect(() => () => {
    window.clearTimeout(botResetTimer.current)
    window.clearTimeout(dialogueTimer.current)
    window.clearTimeout(connectionTimer.current)
  }, [])

  useEffect(() => {
    function handlePageShow(event) {
      if (!event.persisted) return
      setGithubRedirecting(false)
      setBotMood('idle')
      setConnectionPrompt(false)
      connectionPromptLocked.current = false
      botClickCount.current = 0
      window.clearTimeout(botResetTimer.current)
      window.clearTimeout(dialogueTimer.current)
      window.clearTimeout(connectionTimer.current)
      setDismissedSection(activeSection)
      resetBotToSection()
    }

    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [activeSection, resetBotToSection])

  useEffect(() => {
    if (!githubRedirecting) return undefined
    const timeout = window.setTimeout(
      () => window.location.assign('https://github.com/Shardul270106'),
      3200,
    )
    return () => window.clearTimeout(timeout)
  }, [githubRedirecting])

  useEffect(() => {
    window.clearTimeout(dialogueTimer.current)
    dialogueTimer.current = window.setTimeout(
      () => setDismissedSection(activeSection),
      3600,
    )
    return () => window.clearTimeout(dialogueTimer.current)
  }, [activeSection])

  const handleBotClick = () => {
    botClickCount.current += 1
    const count = botClickCount.current
    setBotMood(count >= 5 ? 'dizzy' : count >= 2 ? 'squint' : 'happy')
    window.clearTimeout(botResetTimer.current)
    window.clearTimeout(dialogueTimer.current)
    botResetTimer.current = window.setTimeout(() => {
      botClickCount.current = 0
      setBotMood('idle')
      setDismissedSection(activeSection)
    }, 2400)
  }

  const links = [
    { label: 'Home', href: '#top', id: 'top' },
    { label: 'Work', href: '#work', id: 'work' },
    { label: 'About', href: '#biography', id: 'biography' },
  ]

  const dialogue = {
    top: 'Hi, welcome to my portfolio.',
    work: 'Here are a few things I’ve made.',
    biography: 'A little about me.',
    lab: 'This is where I try things out.',
    life: 'A few notes from beyond the screen.',
    resume: 'A quick look at my experience.',
  }[activeSection]

  const moodDialogue = {
    happy: 'Hey, nice to see you!',
    squint: 'Hehe, that tickles!',
    dizzy: 'Whoa, too many clicks!',
  }[botMood]

  return (
    <div className="floating-nav-dock">
      <nav
        ref={navRef}
        className="floating-nav"
        aria-label="Main navigation"
        onPointerMove={(event) => moveBotTo(event.clientX)}
        onPointerLeave={() => {
          resetBotToSection()
          dismissConnectionPrompt()
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            dismissConnectionPrompt()
          }
        }}
      >
        <div
          ref={botRef}
          className={`floating-nav__bot mood-${botMood}`}
        >
          <svg viewBox="0 0 136 46" focusable="false" aria-hidden="true">
            <path d="M 0 47 L 0 46 C 16.5 46 28.5 37.72 30 25.76 L 30 23 A 23 23 0 0 1 53 0 L 83 0 A 23 23 0 0 1 106 23 L 106 25.76 C 107.5 37.72 119.5 46 136 46 L 136 47 Z" />
            <rect className="floating-nav__face" x="33" y="3" width="70" height="40" rx="20" />
            <g className="floating-nav__expression floating-nav__expression--idle">
              <rect className="floating-nav__eye floating-nav__eye--left" x="46" y="11" width="13" height="21" rx="4" />
              <rect className="floating-nav__eye floating-nav__eye--right" x="77" y="11" width="13" height="21" rx="4" />
            </g>
            <g className="floating-nav__expression floating-nav__expression--happy">
              <path d="M 46 29 Q 52 16 59 29 M 77 29 Q 84 16 90 29" />
            </g>
            <g className="floating-nav__expression floating-nav__expression--squint">
              <path d="M 47 17 L 59 23 L 47 30 M 89 17 L 77 23 L 89 30" />
            </g>
            <g className="floating-nav__expression floating-nav__expression--dizzy">
              <path d="M 55 17 C 50 12 43 17 45 23 C 47 30 57 30 59 24 C 61 19 54 16 51 20 C 49 22 51 25 54 24 M 81 17 C 86 12 93 17 91 23 C 89 30 79 30 77 24 C 75 19 82 16 85 20 C 87 22 85 25 82 24" />
            </g>
          </svg>
          <span className="floating-nav__spark floating-nav__spark--one" />
          <span className="floating-nav__spark floating-nav__spark--two" />
          <span
            className={`floating-nav__dialogue${showDialogue ? ' is-visible' : ''}`}
            role="status"
            aria-live="polite"
          >
            {connectionPrompt ? 'Want to connect?' : moodDialogue || dialogue}
          </span>
          <button
            className="floating-nav__bot-button"
            type="button"
            aria-label="Play with the portfolio bot"
            onClick={handleBotClick}
            onFocus={resetBotToSection}
          />
        </div>
        {links.map((link) => (
          <a
            key={link.id}
            ref={(node) => { linkRefs.current[link.id] = node }}
            href={link.href}
            className={`floating-nav__link${activeNavId === link.id ? ' is-active' : ''}`}
            aria-current={activeNavId === link.id ? 'location' : undefined}
            onFocus={(event) => {
              const linkBounds = event.currentTarget.getBoundingClientRect()
              moveBotTo(linkBounds.left + linkBounds.width / 2)
            }}
          >
            {link.label}
            {activeNavId === link.id && <span className="floating-nav__dot" />}
          </a>
        ))}
        <span className="floating-nav__divider" aria-hidden="true" />
        <a
          className="floating-nav__social"
          href="https://www.linkedin.com/in/shardul-patil-a17786357/"
          target="_blank"
          rel="noreferrer"
          aria-label="Shardul Patil on LinkedIn"
          onPointerEnter={showConnectionPrompt}
          onFocus={showConnectionPrompt}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></svg>
        </a>
        <a
          className="floating-nav__social floating-nav__social--github"
          href="https://github.com/Shardul270106"
          aria-label="Shardul Patil on GitHub"
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
            event.preventDefault()
            setGithubRedirecting(true)
          }}
          onPointerEnter={showConnectionPrompt}
          onFocus={showConnectionPrompt}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.08c-3.1.68-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.64-1.24-1.64-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.7 2.62 1.21 3.26.93.1-.72.39-1.21.71-1.49-2.48-.28-5.09-1.24-5.09-5.53 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.71.78 1.15 1.78 1.15 3 0 4.3-2.62 5.25-5.11 5.52.4.35.76 1.03.76 2.08V22c0 .29.2.63.77.53A11.1 11.1 0 0 0 12 .9Z" /></svg>
        </a>
        <a
          className="floating-nav__social"
          href="https://www.instagram.com/iampatilshardul?bqrl=MTl5NnRlazBpeHRxMA=="
          target="_blank"
          rel="noreferrer"
          aria-label="Shardul Patil on Instagram"
          onPointerEnter={showConnectionPrompt}
          onFocus={showConnectionPrompt}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="floating-nav__icon-dot" cx="17.5" cy="6.8" r="1" /></svg>
        </a>
        <a
          className="floating-nav__social"
          href="mailto:shardulpatil260@gmail.com"
          aria-label="Email Shardul Patil"
          onPointerEnter={showConnectionPrompt}
          onFocus={showConnectionPrompt}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
        </a>
        <button
          className="floating-nav__theme"
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 15.2A8.5 8.5 0 0 1 8.8 3.6 8.5 8.5 0 1 0 20.4 15.2Z" /></svg>
          )}
        </button>
        <a className="floating-nav__resume" href="#resume" aria-label="Resume, link coming soon">
          Resume
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
        </a>
      </nav>
      {githubRedirecting && (
        <div className="github-opening" role="dialog" aria-modal="true" aria-label="Opening GitHub">
          <Ascii
            piece={gitGraph}
            className="github-opening__graph"
            label="Animated Git commit graph"
          />
          <p>Opening GitHub…</p>
        </div>
      )}
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem('portfolio-theme') === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })
  const [introPhase, setIntroPhase] = useState(() => {
    const navigation = window.performance?.getEntriesByType?.('navigation')?.[0]
    return navigation?.type === 'back_forward' ? 'done' : 'playing'
  })
  const showIntro = introPhase !== 'done'
  const finishIntro = useCallback(
    () => setIntroPhase((phase) => (phase === 'playing' ? 'exiting' : phase)),
    [],
  )

  useEffect(() => {
    if (introPhase !== 'exiting') return undefined
    const timeout = window.setTimeout(() => setIntroPhase('done'), 900)
    return () => window.clearTimeout(timeout)
  }, [introPhase])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'light' ? '#e5e0d7' : '#1a1d20',
    )
    try {
      window.localStorage.setItem('portfolio-theme', theme)
    } catch {
      // The selected theme still works for this page if storage is unavailable.
    }
  }, [theme])

  return (
    <>
      {showIntro && (
        <BootIntro onFinish={finishIntro} isExiting={introPhase === 'exiting'} />
      )}
      <main
        className={`portfolio${introPhase !== 'playing' ? ' is-visible' : ''}`}
        inert={showIntro}
        aria-hidden={showIntro}
      >
      <div className="page-content">
        <section id="top" className="intro" aria-labelledby="intro-title">
          <div className="intro__text">
            <p className="eyebrow">Independent designer · India</p>
            <h1 id="intro-title">
              I make digital things<br className="desktop-break" /> feel a little more human.
            </h1>
            <p className="intro__copy">
              I’m Shardul, a designer working across identity, product and the
              spaces in between.
            </p>
            <a className="section-cue" href="#work">↓ Selected work</a>
          </div>
          {theme === 'light' ? <JalMahalScene /> : <KyotoScene />}
        </section>

        <section id="work" className="work-section" aria-labelledby="work-title">
          <div className="section-heading">
            <h2 id="work-title">Selected work</h2>
            <p>2022 — 2025</p>
          </div>
          <div className="project-grid">
            {projects.map((project, index) => (
              <article className="project" key={project.name}>
                <div className={`project__image ${project.className}`}>
                  <img
                    src={project.image}
                    alt={project.alt}
                    loading={index > 1 ? 'lazy' : 'eager'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                  />
                </div>
                <div className="project__meta">
                  <div>
                    <h3>{project.name}</h3>
                    <p className="project__description">{project.description}</p>
                  </div>
                  <p className="project__type">{project.type}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="biography" className="text-section" aria-labelledby="biography-title">
          <p className="section-index">01 / Biography</p>
          <div className="text-section__body">
            <h2 id="biography-title">Curiosity is the common thread.</h2>
            <p>
              I’m an independent designer from India. I bring a considered,
              hands-on approach to the details that make a brand or product
              feel unmistakably itself — from the first sketch to the final
              interaction.
            </p>
          </div>
        </section>

        <section id="lab" className="text-section" aria-labelledby="lab-title">
          <p className="section-index">02 / Lab</p>
          <div className="text-section__body">
            <h2 id="lab-title">Room for the unfinished.</h2>
            <p>
              A small corner for experiments, half-formed ideas and things made
              simply to see what happens. Currently exploring type, motion and
              the edges of digital craft.
            </p>
          </div>
        </section>

        <section id="life" className="text-section" aria-labelledby="life-title">
          <p className="section-index">03 / Life</p>
          <div className="text-section__body">
            <h2 id="life-title">A life outside the pixels.</h2>
            <p>
              Looking for good light, new places and small details worth
              remembering. The things I notice away from a screen tend to find
              their way back into the work.
            </p>
          </div>
        </section>

        <section id="resume" className="text-section" aria-labelledby="resume-title">
          <p className="section-index">04 / Resume</p>
          <div className="text-section__body">
            <h2 id="resume-title">A little more about my work.</h2>
            <p>Resume link coming soon.</p>
          </div>
        </section>
      </div>

      <footer className="site-footer">
        <p>Shardul Patil</p>
        <a href="#top">Back to top ↑</a>
        <p>© 2025</p>
      </footer>
      </main>
      {introPhase === 'done' && (
        <>
          <AvatarSceneEntry />
          <FloatingNav
            theme={theme}
            onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
          />
        </>
      )}
    </>
  )
}

export default App
