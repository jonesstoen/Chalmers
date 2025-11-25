export const SCHOOL_INSPECTION_FIELDS = [
    {
        id: 'Nvp4hIbXrzF',
        label: 'Computer lab available?',
        type: 'BOOLEAN',
        child_query: {
            id: 'gzhjCMe7OyS',
            label: 'Computer lab condition (1–5)',
            type: 'INTEGER_POSITIVE',
        },
    },
    {
        id: 'IKiSAA19Xvl',
        label: 'Electricity available?',
        type: 'BOOLEAN',
        child_query: {
            id: 'MH2eDd7qWxR',
            label: 'Electricity condition (1–5)',
            type: 'INTEGER_POSITIVE',
        },
    },
    {
        id: 'n9KwS4rY2HC',
        label: 'Handwashing facilities available?',
        type: 'BOOLEAN',
        child_query: {
            id: 'ie3bFiVatHT',
            label: 'Handwashing condition (1–5)',
            type: 'INTEGER_POSITIVE',
        },
    },
    {
        id: 'Y6DQqwTdhiZ',
        label: 'Library available?',
        type: 'BOOLEAN',
        child_query: {
            id: 'IAomDvMcUDr',
            label: 'Library condition (1–5)',
            type: 'NUMBER',
        },
    },
    {
        id: 'XThfmg6f2oC',
        label: 'Playground available?',
        type: 'BOOLEAN',
        child_query: {
            id: 'JzZfwXtdL6G',
            label: 'Playground condition (1–5)',
            type: 'INTEGER_POSITIVE',
        },
    },
    { id: 'ya5SyA5hej4', label: 'Number of classrooms', type: 'NUMBER' },
    {
        id: 'XIgpDhDC4Ol',
        label: 'Number of clean and secure classrooms',
        type: 'NUMBER',
    },
    {
        id: 'I13NTyLrHBm',
        label: 'Toilets for teachers',
        type: 'INTEGER_ZERO_OR_POSITIVE',
    },
    { id: 'QXcKg7GSr4e', label: 'Toilets for boys', type: 'NUMBER' },
    { id: 'OGmIo4kFUYr', label: 'Toilets for girls', type: 'NUMBER' },
    {
        id: 'DO0LBJfXY00',
        label: 'Learners (students)',
        type: 'INTEGER_ZERO_OR_POSITIVE',
    },
    {
        id: 'jcC1uz56IpY',
        label: 'Number of seats',
        type: 'INTEGER_ZERO_OR_POSITIVE',
    },
    {
        id: 'LME331J5aev',
        label: 'Number of teachers',
        type: 'INTEGER_ZERO_OR_POSITIVE',
    },
    {
        id: 'iytoDmoTUWY',
        label: 'Total toilets',
        type: 'INTEGER_ZERO_OR_POSITIVE',
    },
]

export const FACILITY_IDS = [
    'Nvp4hIbXrzF',
    'IKiSAA19Xvl',
    'n9KwS4rY2HC',
    'Y6DQqwTdhiZ',
    'XThfmg6f2oC',
]

export const CAPACITY_IDS = [
    'ya5SyA5hej4',
    'XIgpDhDC4Ol',
    'DO0LBJfXY00',
    'jcC1uz56IpY',
    'LME331J5aev',
]

export const SANITATION_IDS = [
    'I13NTyLrHBm',
    'QXcKg7GSr4e',
    'OGmIo4kFUYr',
]

export const TOTAL_TOILETS_ID = 'iytoDmoTUWY'

export const CHILD_FIELD_IDS = [
    'gzhjCMe7OyS',
    'MH2eDd7qWxR',
    'ie3bFiVatHT',
    'IAomDvMcUDr',
    'JzZfwXtdL6G',
]