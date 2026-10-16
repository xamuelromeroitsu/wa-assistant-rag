import { describe, it, expect, vi } from 'vitest';
import { createQrPresenter } from '../../src/qr.js';

function makeDoubles(overrides = {}) {
  const generate = vi.fn();
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
  const deps = {
    terminal: { generate },
    png: { toFile: vi.fn(async () => undefined) },
    logger,
    ...overrides,
  };
  const presenter = createQrPresenter(deps);
  return { presenter, generate, toFile: deps.png.toFile, logger };
}

describe('qr.js', () => {
  it('dibuja el QR en la terminal en formato chico', async () => {
    const { presenter, generate } = makeDoubles();

    await presenter.present('QR-DE-PRUEBA');

    expect(generate).toHaveBeenCalledWith('QR-DE-PRUEBA', { small: true });
  });

  it('guarda el QR como PNG en la ruta configurada y loguea la ruta absoluta', async () => {
    const { presenter, toFile, logger } = makeDoubles({ outputPath: 'tmp/qr.png' });

    await presenter.present('QR-DE-PRUEBA');

    expect(toFile).toHaveBeenCalledWith('tmp/qr.png', 'QR-DE-PRUEBA');
    expect(logger.info).toHaveBeenCalledWith('whatsapp', expect.stringContaining('tmp'));
    expect(presenter.outputPath).toMatch(/qr\.png$/);
  });

  it('usa .wwebjs_auth/qr.png como ruta por defecto', async () => {
    const { presenter, toFile } = makeDoubles();

    await presenter.present('QR-DE-PRUEBA');

    expect(toFile).toHaveBeenCalledWith('.wwebjs_auth/qr.png', 'QR-DE-PRUEBA');
  });

  it('envuelve el fallo de escritura en ERR_WHATSAPP_003 con mensaje amigable', async () => {
    const toFile = vi.fn(async () => {
      throw new Error('EACCES');
    });
    const { presenter } = makeDoubles({ png: { toFile } });

    await expect(presenter.present('QR-DE-PRUEBA')).rejects.toMatchObject({
      code: 'ERR_WHATSAPP_003',
      userMessage: expect.stringContaining('PNG'),
    });
  });

  it('ignora un QR vacío sin tocar terminal ni PNG', async () => {
    const { presenter, generate, toFile, logger } = makeDoubles();

    await presenter.present('   ');

    expect(generate).not.toHaveBeenCalled();
    expect(toFile).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });
});
