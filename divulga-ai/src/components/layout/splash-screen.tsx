"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LogoMark } from "./logo";

/** Splash animada exibida uma vez por sessão, como no app nativo. */
export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("splash") === "1";
      sessionStorage.setItem("splash", "1");
    } catch {}
    const timer = setTimeout(() => setShow(false), seen ? 0 : 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="splash fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary"
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
          aria-label="Carregando"
          role="status"
        >
          <motion.div
            initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}>
              <LogoMark className="size-24 drop-shadow-lg" />
            </motion.div>
          </motion.div>
          <motion.p
            className="mt-6 text-2xl font-semibold text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            Divulga <span className="text-accent">ai</span>
          </motion.p>
          <motion.p className="mt-2 text-sm text-white/80" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }}>
            Carregando...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
