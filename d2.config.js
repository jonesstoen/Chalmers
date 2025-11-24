/** @type {{
 *   type: string,
 *   entryPoints: { app: string },
 *   direction: string,
 *   pwa?: object
 * }}
 */
const config = {
    type: 'app',

    entryPoints: {
        app: './src/App/App.jsx',
    },

    direction: 'auto',

    // Enable PWA support
    pwa: {
        enabled: true,

        // You can customize these or leave as defaults
        caching: {
            // Cache your static bundles
            patterns: ['**/*.{js,css,html}'],
        },

        // Recommended DHIS2 default service worker behavior
        serviceWorker: {
            // Cache first -> offline-friendly
            strategy: 'generateSW',
        },

        manifest: {
            short_name: "Inspection",
            name: "School Inspection App",
            icons: [
                {
                    src: "app-icon-192.png",
                    sizes: "192x192",
                    type: "image/png",
                },
                {
                    src: "app-icon-512.png",
                    sizes: "512x512",
                    type: "image/png",
                }
            ],
            start_url: ".",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: "#0A5BD0"
        }
    }
}

module.exports = config
