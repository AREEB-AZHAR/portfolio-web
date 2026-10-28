import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cogniverseRpg: resolve(__dirname, 'projects/cogniverse-rpg.html'),
        cryptoDashboard: resolve(__dirname, 'projects/crypto-dashboard.html'),
        adaptiveDifficulty: resolve(__dirname, 'projects/adaptive-difficulty.html'),
        blockchainAttestation: resolve(__dirname, 'projects/blockchain-attestation.html'),
        rustbotEngine: resolve(__dirname, 'projects/rustbot-engine.html'),
        alphaBetaAgent: resolve(__dirname, 'projects/alpha-beta-agent.html'),
        giantFlowers: resolve(__dirname, 'projects/giant-flowers.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
