// shared/ui/icons/Icon.jsx
import React from 'react'

// Import SVG files as URLs (DHIS2 build system imports SVGs as URLs, not React components)
import ChairIconUrl from './chair.svg'
import ClassroomIconUrl from './classroom.svg'
import FemaleIconUrl from './female.svg'
import LockIconUrl from './lock.svg'
import MaleIconUrl from './male.svg'
import StudentIconUrl from './student.svg'
import TeacherIconUrl from './teacher.svg'
import ToiletIconUrl from './toilet.svg'

const iconMap = {
    chair: ChairIconUrl,
    classroom: ClassroomIconUrl,
    female: FemaleIconUrl,
    lock: LockIconUrl,
    male: MaleIconUrl,
    student: StudentIconUrl,
    teacher: TeacherIconUrl,
    toilet: ToiletIconUrl,
}

/**
 * Icon component that renders SVG icons as images
 * @param {string} name - Name of the icon file (without .svg extension)
 * @param {number} size - Size of the icon in pixels (default: 20)
 * @param {string} color - Color of the icon (default: currentColor)
 * @param {object} style - Additional styles
 */
export default function Icon({ name, size = 20, color = 'currentColor', style = {} }) {
    const iconUrl = iconMap[name]
    
    if (!iconUrl) {
        console.warn(`Icon "${name}" not found`)
        return null
    }
    
    // Get color filter for non-black colors
    const colorFilter = getColorFilter(color)
    
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
                flexShrink: 0,
                ...style,
            }}
        >
            <img
                src={iconUrl}
                alt={name}
                width={size}
                height={size}
                style={{
                    display: 'block',
                    width: size,
                    height: size,
                    filter: colorFilter || 'none',
                }}
            />
        </span>
    )
}

// Helper to convert color to CSS filter
function getColorFilter(color) {
    if (color === '#2563eb' || color === 'blue') {
        return 'invert(27%) sepia(98%) saturate(2878%) hue-rotate(212deg) brightness(96%) contrast(92%)'
    }
    if (color === '#b91c1c' || color === 'red') {
        return 'invert(15%) sepia(94%) saturate(7151%) hue-rotate(349deg) brightness(95%) contrast(84%)'
    }
    if (color === 'currentColor' || color === '#000000' || !color) {
        return 'none'
    }
    return 'none'
}

/**
 * CombinedIcon component for displaying multiple icons together
 */
export function CombinedIcon({ icons = [], size = 20, gap = 4, style = {} }) {
    if (!icons || icons.length === 0) return null
    
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: gap,
                ...style,
            }}
        >
            {icons.map((iconName, index) => (
                <Icon key={index} name={iconName} size={size} />
            ))}
        </span>
    )
}

