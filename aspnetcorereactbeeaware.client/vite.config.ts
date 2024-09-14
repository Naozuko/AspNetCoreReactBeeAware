import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const baseFolder =
    process.env.APPDATA !== undefined && process.env.APPDATA !== ''
        ? `${process.env.APPDATA}/ASP.NET/https`
        : `${process.env.HOME}/.aspnet/https`;

const certificateName = "aspnetcorereactbeeaware.client";
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

export default defineConfig({
    plugins: [plugin()],
    server: {
        https: fs.existsSync(certFilePath) && fs.existsSync(keyFilePath) ? {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        } : undefined,
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://localhost:44395',
                secure: false,
                changeOrigin: true
            }
        }
    }
});