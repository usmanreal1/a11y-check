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

// ─── video-captions ──────────────────────────────────────────────────────────
export function CaptionedVideo() {
  return (
    <video src="talk.mp4">
      <track kind="captions" src="captions.vtt" srcLang="en" label="English" />
    </video>
  )
}
export function UncaptionedVideo() {
  // ❌ no captions track
  return <video src="talk.mp4"></video>
}

// ─── tab-index ───────────────────────────────────────────────────────────────
export function GoodTabIndex() {
  return <div role="button" tabIndex={0} onKeyDown={() => {}}>Click</div>
}
export function BadTabIndex() {
  // ⚠️ positive tabIndex disrupts natural tab order
  return <button tabIndex={3}>Submit</button>
}

// ─── aria-hidden-focus ───────────────────────────────────────────────────────
export function GoodAriaHidden() {
  return <span aria-hidden="true">✓</span>
}
export function BadAriaHiddenButton() {
  // ❌ focusable button hidden from assistive tech but still reachable by keyboard
  return <button aria-hidden="true">Close</button>
}

// ─── select-label ────────────────────────────────────────────────────────────
export function GoodSelect() {
  return <select aria-label="Country"><option>United States</option></select>
}
export function UnlabelledSelect() {
  // ❌ no label
  return <select><option>United States</option></select>
}

// ─── textarea-label ──────────────────────────────────────────────────────────
export function GoodTextarea() {
  return <textarea aria-label="Message" />
}
export function UnlabelledTextarea() {
  // ❌ no label
  return <textarea placeholder="Write something..." />
}

// ─── duplicate-id ────────────────────────────────────────────────────────────
export function GoodIds() {
  return <div><span id="first" /><span id="second" /></div>
}
export function DuplicateIds() {
  // ❌ same id used twice
  return <div><span id="title" /><span id="title" /></div>
}

// ─── table-captions ──────────────────────────────────────────────────────────
export function GoodTableCaption() {
  return (
    <table>
      <caption>Q1 Sales by Region</caption>
      <tbody><tr><th scope="col">Region</th><th scope="col">Sales</th></tr></tbody>
    </table>
  )
}
export function TableNoCaption() {
  // ⚠️ no caption or aria-label
  return (
    <table>
      <tbody><tr><th scope="col">Region</th><td>West</td></tr></tbody>
    </table>
  )
}

// ─── table-headers ───────────────────────────────────────────────────────────
export function GoodTableHeaders() {
  return (
    <table aria-label="Employees">
      <thead><tr><th scope="col">Name</th><th scope="col">Role</th></tr></thead>
      <tbody><tr><td>Alice</td><td>Engineer</td></tr></tbody>
    </table>
  )
}
export function TableNoHeaders() {
  // ❌ data cells but no header cells
  return (
    <table aria-label="Employees">
      <tbody><tr><td>Alice</td><td>Engineer</td></tr></tbody>
    </table>
  )
}
