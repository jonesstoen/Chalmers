/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',

    entryPoints: {
        app: './src/App/App.jsx',
    },

    pwa: {
        enabled: true,
    },

    direction: 'auto',
}

module.exports = config
