"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function BlogContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // Load blog CSS
    if (!document.querySelector('link[href="/assets/css/blog.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/assets/css/blog.css";
      document.head.appendChild(link);
    }

    // Only load scripts once on initial mount
    const loadScripts = async () => {
      // Check if scripts are already loaded
      const scriptsLoaded =
        (window as any).BLOG_DATA && (window as any).renderList;

      if (!scriptsLoaded) {
        // Load blog-data.js first
        if (!document.querySelector('script[src="/assets/js/blog-data.js"]')) {
          await new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "/assets/js/blog-data.js";
            script.onload = () => resolve(true);
            document.body.appendChild(script);
          });
        }

        // Load blog-engine.js second
        if (
          !document.querySelector('script[src="/assets/js/blog-engine.js"]')
        ) {
          await new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "/assets/js/blog-engine.js";
            script.onload = () => resolve(true);
            document.body.appendChild(script);
          });
        }
      }

      // Manually trigger blog rendering
      if (postId) {
        if ((window as any).renderArticle) {
          (window as any).renderArticle(postId);
        }
      } else {
        if ((window as any).renderList) {
          (window as any).renderList();
        }
      }

      // Hide skeleton after a short delay to ensure content is rendered
      setTimeout(() => setIsLoading(false), 300);
    };

    loadScripts();
  }, [postId]);

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.02) 25%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0.02) 75%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
          border-radius: 4px;
        }

        .skeleton-title {
          height: 48px;
          width: 60%;
          margin: 0 auto 30px;
        }

        .skeleton-card {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          overflow: hidden;
        }

        .skeleton-img {
          height: 200px;
          width: 100%;
        }

        .skeleton-text {
          height: 20px;
          margin: 10px 15px;
        }

        .skeleton-text-short {
          height: 16px;
          width: 70%;
          margin: 10px 15px;
        }
      `}</style>

      <div className="blog-container">
        <nav className="blog-nav">
          <Link href="/" className="back-link">
            ← Back to Trainer
          </Link>
          <h1 className="blog-logo">
            VALORANT <span style={{ color: "var(--primary)" }}>BLOG</span>
          </h1>
        </nav>

        {isLoading && (
          <div style={{ padding: "40px 0" }}>
            {!postId ? (
              // Skeleton for blog list
              <>
                <div className="skeleton skeleton-title"></div>
                <div className="blog-grid">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-card">
                      <div className="skeleton skeleton-img"></div>
                      <div className="skeleton skeleton-text"></div>
                      <div className="skeleton skeleton-text"></div>
                      <div className="skeleton skeleton-text-short"></div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Skeleton for article view
              <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <div
                  className="skeleton"
                  style={{
                    height: "40px",
                    width: "200px",
                    marginBottom: "20px",
                  }}
                ></div>
                <div
                  className="skeleton"
                  style={{ height: "60px", width: "80%", marginBottom: "10px" }}
                ></div>
                <div
                  className="skeleton"
                  style={{ height: "20px", width: "40%", marginBottom: "30px" }}
                ></div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{
                      height: "16px",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          id="blog-content"
          className="blog-content"
          style={{ display: isLoading ? "none" : "block" }}
        ></div>
      </div>
    </>
  );
}

export default function BlogPage() {
  return (
    <Suspense
      fallback={<div style={{ minHeight: "100vh", background: "#0f0f23" }} />}
    >
      <BlogContent />
    </Suspense>
  );
}
