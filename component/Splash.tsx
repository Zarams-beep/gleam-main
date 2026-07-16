"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type Letter = { char: string; x: number; y: number; rotate: number }

// Each letter flies in from its own distinct direction/angle instead of a
// uniform slide — this is what gives the "flying in from different angles"
// feel rather than a single-axis stagger.
const letters: Letter[] = [
  { char: "G", x: -280, y: -190, rotate: -50 },
  { char: "l", x: 10, y: -300, rotate: 25 },
  { char: "e", x: 300, y: -160, rotate: 55 },
  { char: "a", x: -240, y: 230, rotate: -35 },
  { char: "m", x: 260, y: 210, rotate: 40 },
]

const letterVariants = {
  hidden: (l: Letter) => ({
    opacity: 0,
    x: l.x,
    y: l.y,
    rotate: l.rotate,
    scale: 0.4,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 20 },
  },
}

type Stage = "flying" | "sweep" | "tagline"

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [stage, setStage] = useState<Stage>("flying")

  useEffect(() => {
    // Letters finish landing (last one starts at (letters.length-1)*0.12s and
    // takes ~0.7s to settle) — then the light sweep glides through, then the
    // tagline, then we hand off to the homepage crossfade.
    const sweepTimer = setTimeout(() => setStage("sweep"), 1450)
    const taglineTimer = setTimeout(() => setStage("tagline"), 2650)
    const finishTimer = setTimeout(() => onFinish(), 3900)

    return () => {
      clearTimeout(sweepTimer)
      clearTimeout(taglineTimer)
      clearTimeout(finishTimer)
    }
  }, [onFinish])

  return (
    <div className="splash-container" onClick={onFinish}>
      <div className="splash-letter-container">
        {letters.map((l, i) => (
          <motion.span
            key={l.char}
            className={`splash-letter ${stage !== "flying" ? "splash-letter-lit" : ""}`}
            custom={l}
            variants={letterVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: i * 0.12 }}
          >
            {l.char}
          </motion.span>
        ))}

        {stage !== "flying" && (
          <motion.div
            className="splash-sweep"
            initial={{ x: "-160%" }}
            animate={{ x: "160%" }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
        )}
      </div>

      {stage === "tagline" && (
        <motion.p
          className="splash-tagline sparkle-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Brighten Someone&apos;s Day, One Word at a Time.
        </motion.p>
      )}
    </div>
  )
}
