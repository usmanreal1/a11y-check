// sample.tsx — intentionally contains a11y issues for manual CLI testing
// Run: npm run dev -- examples/sample.tsx

// ─── alt-text ───────────────────────────────────────────────────────────────
export function GoodImage() {
  return <img src="dog.jpg" alt="A golden retriever playing fetch" />
}
export function DecorativeImage() {
  return <img src="divider.png" alt="" />
}
export function MissingAlt() {
  // ❌ no alt attribute
  return <img src="photo.jpg" />
}
export function BareAlt() {
  // ❌ alt with no value
  return <img src="icon.png" alt />
}

// ─── button-label ────────────────────────────────────────────────────────────
export function GoodButton() {
  return <button>Submit form</button>
}
export function EmptyButton() {
  // ❌ no label
  return <button />
}
export function IconButton() {
  // ❌ img with no alt inside button
  return <button><img src="close.svg" /></button>
}

// ─── input-label ─────────────────────────────────────────────────────────────
export function GoodInput() {
  return <input type="text" aria-label="Email address" />
}
export function UnlabelledInput() {
  // ❌ no label, no id, no aria-label
  return <input type="text" />
}

// ─── link-text ───────────────────────────────────────────────────────────────
export function GoodLink() {
  return <a href="/guide">Read our accessibility guide</a>
}
export function EmptyLink() {
  // ❌ no text
  return <a href="/page"></a>
}
export function VagueLink() {
  // ⚠️ non-descriptive text
  return <a href="/more">click here</a>
}

// ─── interactive-role ────────────────────────────────────────────────────────
export function GoodInteractive() {
  return (
    <div onClick={() => {}} role="button" onKeyDown={() => {}} tabIndex={0}>
      Click me
    </div>
  )
}
export function BadInteractive() {
  // ❌ div with onClick but missing role, keyHandler, tabIndex
  return <div onClick={() => {}}>Click me</div>
}

// ─── aria-valid-attr ─────────────────────────────────────────────────────────
export function GoodAria() {
  return <div aria-label="Navigation" />
}
export function BadAria() {
  // ❌ made-up ARIA attribute
  return <div aria-fake="value" />
}

// ─── heading-order ───────────────────────────────────────────────────────────
export function GoodHeadings() {
  return (
    <div>
      <h1>Page Title</h1>
      <h2>Section</h2>
      <h3>Subsection</h3>
    </div>
  )
}
export function BadHeadings() {
  return (
    <div>
      {/* ⚠️ h1 followed by h3, skipping h2 */}
      <h1>Page Title</h1>
      <h3>Subsection</h3>
    </div>
  )
}

// ─── link-href ───────────────────────────────────────────────────────────────
export function GoodHref() {
  return <a href="/contact">Contact us</a>
}
export function MissingHref() {
  // ❌ no href
  return <a>Contact us</a>
}
export function HashHref() {
  // ⚠️ href="#" goes nowhere
  return <a href="#">Contact us</a>
}

// ─── iframe-title ────────────────────────────────────────────────────────────
export function GoodIframe() {
  return <iframe src="map.html" title="Store location on Google Maps" />
}
export function UntitledIframe() {
  // ❌ no title
  return <iframe src="map.html" />
}

// ─── autoplay-media ──────────────────────────────────────────────────────────
export function GoodVideo() {
  return <video src="hero.mp4" autoPlay muted />
}
export function BadVideo() {
  // ❌ autoplays audio without muted
  return <video src="hero.mp4" autoPlay />
}
export function BadAudio() {
  // ❌ autoplays audio
  return <audio src="bg.mp3" autoPlay />
}
