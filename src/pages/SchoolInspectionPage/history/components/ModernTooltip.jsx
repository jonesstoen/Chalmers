import React from "react";

export default function ModernTooltip({ visible, text }) {
    if (!visible) return null;

    return (
        <div
            className="ratio-card-tooltip"
            style={{
                position: "absolute",
                top: "-120px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "12px 18px",
                minWidth: "160px",
                background: "rgba(0,0,0,0.85)",
                color: "white",
                borderRadius: "12px",
                fontSize: "0.85rem",
                lineHeight: "1.4",
                whiteSpace: "pre-line",
                zIndex: 20,
                opacity: visible ? 1 : 0,
                transition: "opacity 0.2s ease, transform 0.2s ease",
                pointerEvents: "none",
                boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            }}
        >
            {text}
        </div>
    );
}
