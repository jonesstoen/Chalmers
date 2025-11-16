import { Chart as ChartJS, Tooltip, Legend, LinearScale, Title } from 'chart.js'
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix'
import { Chart } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(MatrixController, MatrixElement, LinearScale, Tooltip, Legend, Title, ChartDataLabels)

export default function Heatmap({ processed }) {
    if (!processed?.length) return <p>No data available</p>

    // ✅ Use only the latest event
    const latestEvent = processed[processed.length - 1]
    const eventsToShow = latestEvent ? [latestEvent] : []

    const ratios = [
        { key: 'seatsToLearner', label: 'Seats/Learner', threshold: v => v >= 1 },
        { key: 'learnerToClassroom', label: 'Learners/Classroom', threshold: v => v <= 53 },
        { key: 'learnerToTeacher', label: 'Learners/Teacher', threshold: v => v <= 45 },
        { key: 'learnerToToilet', label: 'Learners/Toilet', threshold: v => v <= 25 },
    ]

    // ✅ Build matrix data with totals included
    const matrixData = []
    eventsToShow.forEach((event, yIndex) => {
        ratios.forEach((r, xIndex) => {
            const value = Number(event.ratios?.[r.key]) || NaN
            const meets = r.threshold(value)
            matrixData.push({
                x: xIndex,
                y: yIndex,
                v: value,
                meets,
                label: r.label,
                date: event.date,
                totals: {
                    learners: event.learners ?? 'N/A',
                    seats: event.seats ?? 'N/A',
                    classrooms: event.classrooms ?? 'N/A',
                    teachers: event.teachers ?? 'N/A',
                    toilets: event.toilets ?? 'N/A',
                },
            })
        })
    })

    // ✅ White–green–red gradient color scale
    const colorScale = (v, meets) => {
        if (isNaN(v)) return 'rgba(200,200,200,0.3)'
        if (v === 1) return 'rgba(255,255,255,1)'
        const intensity = Math.min(Math.abs(v - 1) / 2, 1)
        return meets
            ? `rgba(0,200,0,${0.3 + intensity * 0.7})`
            : `rgba(220,0,0,${0.3 + intensity * 0.7})`
    }

    const data = {
        datasets: [
            {
                label: 'Infrastructure Ratios',
                data: matrixData,
                backgroundColor: ctx => {
                    const { v, meets } = ctx.raw
                    return colorScale(v, meets)
                },
                borderWidth: 1,
                width: ({ chart }) =>
                    chart.chartArea ? chart.chartArea.width / (ratios.length * 1.3) : 40,
                height: ({ chart }) =>
                    chart.chartArea ? chart.chartArea.height / (eventsToShow.length * 1.3) : 40,
            },
        ],
    }

    const options = {
        responsive: true,
        aspectRatio: 1.2,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'School Infrastructure Adequacy (Latest Event)',
                font: { size: 18 },
            },
            tooltip: {
                callbacks: {
                    title: ctx => ctx[0].raw.label,
                    label: ctx => {
                        const r = ctx.raw
                        const t = r.totals || {}
                        const ratio = isNaN(r.v) ? 'N/A' : r.v.toFixed(2)

                        switch (r.label) {
                            case 'Seats/Learner':
                                return `Seats: ${t.seats} | Learners: ${t.learners} → Ratio: ${ratio}`
                            case 'Learners/Classroom':
                                return `Learners: ${t.learners} | Classrooms: ${t.classrooms} → Ratio: ${ratio}`
                            case 'Learners/Teacher':
                                return `Learners: ${t.learners} | Teachers: ${t.teachers} → Ratio: ${ratio}`
                            case 'Learners/Toilet':
                                return `Learners: ${t.learners} | Toilets: ${t.toilets} → Ratio: ${ratio}`
                            default:
                                return `Ratio: ${ratio}`
                        }
                    },
                },
            },
            datalabels: {
                display: true,
                color: '#111',
                font: { weight: 'bold', size: 12 },
                align: 'center',
                formatter: v => (isNaN(v.v) ? '' : v.v.toFixed(1)),
            },
        },
        scales: {
            x: {
                type: 'linear',
                position: 'top',
                ticks: {
                    callback: (v, i) => ratios[i]?.label || '',
                    autoSkip: false,
                    font: { size: 11 },
                },
                grid: { display: false },
            },
            y: {
                type: 'linear',
                reverse: true,
                ticks: {
                    callback: (v, i) => eventsToShow[i]?.date || '',
                    autoSkip: false,
                    font: { size: 10 },
                },
                grid: { display: false },
            },
        },
    }

    return (
        <div style={{ width: '95%', height: '500px', margin: 'auto' }}>
            <Chart type="matrix" data={data} options={options} />
        </div>
    )
}
