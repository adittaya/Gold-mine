module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:5173', // Default Vite dev server port
    viewportWidth: 375,  // Mobile width
    viewportHeight: 667, // Mobile height
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    chromeWebSecurity: false,
    retries: 2,
    pageLoadTimeout: 60000,
    requestTimeout: 10000,
    responseTimeout: 30000,
  },
};