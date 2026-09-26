import { useEffect, useRef } from "react";

const SCRIPT_SRC =
  "https://pl31444445.profitableratecpmnetwork.com/ba83f02f59d0c8a4a225889bc99c99ea/invoke.js";

const CONTAINER_ID =
  "container-ba83f02f59d0c8a4a225889bc99c99ea";

export default function AdsterraBanner() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper) return;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = SCRIPT_SRC;

    const container = document.createElement("div");
    container.id = CONTAINER_ID;

    wrapper.appendChild(script);
    wrapper.appendChild(container);

    return () => {
      wrapper.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="w-full my-6 flex justify-center"
      aria-label="Publicidade"
    />
  );
}
