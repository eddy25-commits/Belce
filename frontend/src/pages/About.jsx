import { SITE } from "../config/site";
import { usePageMeta } from "../hooks/usePageMeta";
import "./StaticPage.css";

export default function About() {
  usePageMeta(
    "About Us",
    `Learn about Belce, a trusted multi-collection store based in ${SITE.location}.`
  );

  return (
    <div className="container static-page">
      <span className="eyebrow">Our Story</span>
      <h1>About Belce</h1>
      <hr className="gold-rule" />
      <div className="static-page-content">
        <p>
          Belce started with a simple belief: the pieces you reach for every day —
          your watch, your sneakers, your bracelet, your favorite fit — deserve one
          trusted place to shop, not four different ones. Based in {SITE.location}, we
          bring watches, sneakers, bracelets, and clothes together under a single
          store built on quality and trust.
        </p>
        <p>
          We carefully select every product on our shelves, working only with
          suppliers we trust, so that when you shop with us, you can be confident
          you&rsquo;re getting the real thing.
        </p>
        <p>
          Whether you&rsquo;re building out your everyday rotation or shopping for
          something special, our team is here to help you find exactly what you
          need — with secure checkout and delivery across Ghana.
        </p>
      </div>
    </div>
  );
}
