// =============================================================================
// ExerciseCoach.jsx — the exercise screen for ONE assigned exercise.
//
// What it does, many times per second:
//   1. Shows the front camera (mirrored, like a mirror)
//   2. Asks the pose model where the patient's body points are
//   3. Draws the skeleton on top of the video
//   4. Measures the clinical angle for this exercise (see angles.js)
//   5. Warns (on screen + out loud, in the patient's chosen language) if they
//      go outside the physio's permitted range
//   6. Counts reps (leniently) and says whether each one reached the target
// When the patient presses "Finish session", it hands ONLY the numbers to
// onFinish — never the video. The parent page saves them.
// =============================================================================

import { useEffect, useRef, useState } from "react";
import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision";
import { usePoseLandmarker } from "./usePoseLandmarker";
import {
  landmarksFor, measureAngle, visibleEnough, makeSmoother, makeRepCounter, outsideSafeRange,
} from "./angles";
import { getStrings, DEFAULT_LANG } from "../i18n/messages";

// Spoken feedback using the browser's built-in text-to-speech
// (works for patients with eye injuries too, and they don't need to look at the screen).
// speechLang is e.g. "ar-LB" or "fr-FR". If the phone has no voice for that exact
// region, we pick any voice of the same language (e.g. any Arabic voice).
function speak(text, speechLang) {
  if (!("speechSynthesis" in window)) return; // browser doesn't support speech
  window.speechSynthesis.cancel();            // stop any message still playing
  const u = new SpeechSynthesisUtterance(text);
  u.lang = speechLang;
  const base = speechLang.split("-")[0];      // "ar-LB" -> "ar"
  const voices = window.speechSynthesis.getVoices();
  const voice =
    voices.find((v) => v.lang === speechLang) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(base));
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

/**
 * assignment = one exercise the physio prescribed, e.g.
 *   { exerciseId: "supine_heel_slide", side: "left", startAngle: 0, targetAngle: 90,
 *     permittedMin: 0, permittedMax: 100, reps: 10, stopCriteria: "..." }
 *   (angles in degrees, 0° = neutral, e.g. a straight knee)
 * lang = language code from i18n/messages.js ("ar", "en", "fr", ...)
 * onFinish(summary) = called with the results when "Finish session" is pressed
 * onCancel() = go back without saving
 */
export default function ExerciseCoach({ assignment, lang = DEFAULT_LANG, onFinish, onCancel }) {
  const videoRef = useRef(null);   // the <video> showing the camera
  const canvasRef = useRef(null);  // the <canvas> on top where the skeleton is drawn
  const { landmarkerRef, ready, error } = usePoseLandmarker(); // the pose model

  // All text (spoken + on screen) in the chosen language.
  // Kept in a ref too, so the detection loop always uses the current language
  // without having to restart (which would reset the rep count).
  const t = getStrings(lang);
  const tRef = useRef(t);
  tRef.current = t;

  // Values shown on screen (changing these re-renders the page)
  const [angle, setAngle] = useState(null);
  const [reps, setReps] = useState(0);
  const [warning, setWarning] = useState("");

  // Values kept between frames without re-rendering
  const repLogRef = useRef([]);     // details of every finished rep
  const lastSpokenRef = useRef(0);  // when we last spoke (to avoid talking non-stop)

  // Which body points this exercise needs on this side (null = unknown exercise)
  const points = landmarksFor(assignment.exerciseId, assignment.side);

  // 1. Start the camera
  useEffect(() => {
    let stream;
    let cancelled = false;
    navigator.mediaDevices
      // Ask permission for the front ("user") camera, no microphone
      .getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach((tr) => tr.stop()); return; }
        stream = s;
        videoRef.current.srcObject = s; // show the camera in the <video>
        return videoRef.current.play();
      })
      .catch((e) => setWarning(tRef.current.ui.cameraBlocked + e.message));
    // Cleanup: turn the camera off when leaving this screen
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  // 2. Detection loop (starts once the pose model is ready)
  useEffect(() => {
    if (!ready || !points) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const draw = new DrawingUtils(ctx); // MediaPipe helper for drawing skeletons
    const smooth = makeSmoother(0.3);
    // Reps are measured from the physio's start angle towards their target
    const counter = makeRepCounter({ start: assignment.startAngle, target: assignment.targetAngle });

    let rafId;          // ID of the scheduled next frame (so we can cancel it)
    let lastTime = -1;  // video time of the last frame we processed

    // Say one of the coach's messages ("tooFar", "good", ...) in the current
    // language — at most once every 2.5 seconds, unless `force` is true
    const say = (key, force = false) => {
      const now = performance.now();
      if (force || now - lastSpokenRef.current > 2500) { // don't spam the patient
        speak(tRef.current.speech[key], tRef.current.speechLang);
        lastSpokenRef.current = now;
      }
    };

    // Runs on every screen refresh (~30–60 times per second)
    const loop = () => {
      rafId = requestAnimationFrame(loop); // schedule the next run
      // Skip if the video isn't ready yet, or there's no new frame since last time
      if (video.readyState < 2 || video.currentTime === lastTime) return;
      lastTime = video.currentTime;

      // Make the drawing area match the camera size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Ask the model where the body points are in this frame
      const result = landmarkerRef.current.detectForVideo(video, performance.now());
      ctx.clearRect(0, 0, canvas.width, canvas.height); // erase last frame's drawing

      const lms = result.landmarks?.[0];        // normalized (for drawing + visibility)
      const world = result.worldLandmarks?.[0]; // meters (for angles)
      if (!lms || !world) return;               // no person found in this frame

      // Draw the skeleton: green lines between joints, orange dots on joints
      draw.drawConnectors(lms, PoseLandmarker.POSE_CONNECTIONS, { color: "#4ade80", lineWidth: 3 });
      draw.drawLandmarks(lms, { color: "#f97316", radius: 3 });

      // If part of the limb is off-camera, the angle can't be trusted
      if (!visibleEnough(lms, points)) {
        setWarning(tRef.current.ui.moveIntoView);
        say("notVisible");
        return;
      }

      // Measure the clinical angle, smoothed to reduce jitter
      const ang = smooth(measureAngle(assignment.exerciseId, assignment.side, world));
      if (ang == null) return; // no angle yet
      setAngle(Math.round(ang));

      // Safety check against the physio's permitted range
      if (outsideSafeRange(ang, assignment)) {
        setWarning(tRef.current.ui.pastSafe);
        say("tooFar");
      } else {
        setWarning("");
      }

      // Count reps. When one finishes, record it and give spoken feedback.
      const { reps: r, completed } = counter(ang);
      if (completed) {
        repLogRef.current.push({
          peakAngle: completed.peakAngle,
          reachedTarget: completed.reachedTarget,
          t: Date.now(),
        });
        setReps(r);
        if (r === assignment.reps) say("done", true); // prescription complete
        else say(completed.reachedTarget ? "good" : "notEnough");
      }
    };

    loop();
    // Cleanup: stop the loop when leaving this screen
    return () => cancelAnimationFrame(rafId);
  }, [ready, points, assignment, landmarkerRef]);

  // 3. Hand only numbers to the parent, never video (privacy)
  function finish() {
    window.speechSynthesis?.cancel();
    onFinish?.({
      exerciseId: assignment.exerciseId,
      side: assignment.side,
      plan: {
        startAngle: assignment.startAngle,
        targetAngle: assignment.targetAngle,
        permittedMin: assignment.permittedMin,
        permittedMax: assignment.permittedMax,
        reps: assignment.reps,
      },
      reps: repLogRef.current,
      performedAt: new Date().toISOString(),
    });
  }

  if (!points) return <p className="alert-error">Unknown exercise: {assignment.exerciseId}</p>;
  if (error) return <p dir={t.dir} className="alert-error">{t.ui.modelError}{String(error)}</p>;

  return (
    // dir="rtl" makes Arabic text read right-to-left
    <div dir={t.dir} className="stagger mx-auto flex max-w-[640px] flex-col gap-4">
      <h2 className="text-2xl font-bold">
        {t.exercises[assignment.exerciseId] ?? assignment.exerciseId} · {t.ui[assignment.side]}
      </h2>
      {/* Video and canvas are stacked: the skeleton drawing sits on top of the camera */}
      <div className="hud-frame overflow-hidden bg-ink" style={{ position: "relative" }}>
        {/* mirrored so it feels like a mirror to the patient.
            Video AND canvas both use object-contain inside the same 4:3 box, so they
            scale and letterbox identically and the skeleton always lines up with the
            body — even when a phone camera gives a tall (portrait) image.
            (object-cover would crop only the video and misalign the skeleton.) */}
        <video ref={videoRef} playsInline muted className="block aspect-[4/3] bg-ink object-contain" style={{ width: "100%", transform: "scaleX(-1)" }} />
        <canvas ref={canvasRef} className="object-contain"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "scaleX(-1)" }} />
      </div>
      {!ready && <p className="animate-pulse text-center text-sm font-medium text-muted">{t.ui.loading}</p>}
      {/* Big, easy-to-read live numbers */}
      <dl className="readout">
        <div><dt>{t.ui.angle}</dt><dd className="text-accent">{angle ?? "—"}°</dd></div>
        <div><dt>{t.ui.target}</dt><dd>{assignment.targetAngle}°</dd></div>
        {/* key={reps}: remounts on each new rep so the number pops once */}
        <div><dt>{t.ui.reps}</dt><dd><span key={reps} className="inline-block animate-tick">{reps}</span><span className="text-muted">/{assignment.reps}</span></dd></div>
      </dl>
      {warning && <p role="alert" className="animate-alert-in border-s-4 border-danger bg-danger-tint px-5 py-4 text-xl font-semibold text-danger">{warning}</p>}
      {reps >= assignment.reps && <p className="animate-alert-in border-s-4 border-success bg-success-tint px-5 py-4 text-xl font-semibold text-success">{t.ui.targetReached}</p>}
      <div className="flex gap-3">
        <button className="btn-primary btn-lg flex-1" onClick={finish}>{t.ui.finish}</button>
        <button className="btn-secondary btn-lg" onClick={() => onCancel?.()}>{t.ui.back}</button>
      </div>
    </div>
  );
}
