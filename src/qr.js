import { resolve } from 'node:path';
import { AppError, ERROR_CODES } from './errors.js';

const DEFAULT_OUTPUT_PATH = '.wwebjs_auth/qr.png';

// Presenta el código QR de vinculación de WhatsApp: lo dibuja en la terminal
// (ASCII) y lo guarda como PNG para escanearlo desde otro dispositivo.
// Las dependencias (terminal, png) se inyectan para poder testearlas con dobles.
export function createQrPresenter({ terminal, png, logger, outputPath = DEFAULT_OUTPUT_PATH }) {
  const absolutePath = resolve(outputPath);

  return {
    get outputPath() {
      return absolutePath;
    },

    async present(qr) {
      if (typeof qr !== 'string' || qr.trim() === '') {
        if (logger) logger.warn('whatsapp', 'Se recibió un código QR vacío; se ignora.');
        return;
      }

      terminal.generate(qr, { small: true });

      try {
        await png.toFile(outputPath, qr);
        if (logger) logger.info('whatsapp', `Código QR guardado como PNG: ${absolutePath}`);
      } catch (error) {
        throw new AppError(ERROR_CODES.WHATSAPP_QR_FILE, {
          message: `No se pudo guardar el QR como PNG en ${absolutePath}: ${error.message}`,
          details: { path: absolutePath },
          cause: error instanceof Error ? error : undefined,
        });
      }
    },
  };
}
