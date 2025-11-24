import React from "react";
import styles from './ModernTooltip.module.css'

export default function ModernTooltip({ visible, text }) {
    if (!visible) return null;

    return (
        <div
            className={`${styles.tooltip} ${visible ? styles.tooltipVisible : ''}`}
        >
            {text}
        </div>
    );
}
