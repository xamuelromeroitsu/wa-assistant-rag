# 📲 Vinculación por QR (terminal y PNG)

> Wa-Assistant RAG · cómo vincular el bot a WhatsApp: QR en la terminal y copia en PNG.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-10-15 |
| Versión asociada | v0.1.0 |
| Dueño | Equipo |

## Descripción

Al arrancar sin sesión válida, el bot muestra el código QR de WhatsApp **de dos formas**:

1. **En la terminal**, dibujado en ASCII, listo para escanear con el celular.
2. **Como archivo PNG**, para escanearlo desde otro dispositivo o reenviarlo.

Está implementado en `src/qr.js` (`createQrPresenter`) con las librerías `qrcode-terminal` (ASCII) y `qrcode` (PNG).

## Requisitos

| Requisito | Detalle |
|---|---|
| Node.js | 20 o superior |
| WhatsApp | En el teléfono, con la sesión iniciada |
| Sesión | Sin sesión previa válida en `.wwebjs_auth/` (si ya hay una, no se pide QR) |

## Uso paso a paso

1. Arrancá el bot:
   ```bash
   npm run dev
   ```
2. Cuando aparezca el QR en la terminal, en el teléfono: **WhatsApp → Menú (⋮) → Dispositivos vinculados → Vincular un dispositivo**.
3. Escaneá el QR de la terminal (o abrí el PNG).
4. Al vincularse, el log muestra `Sesión conectada` y el bot empieza a responder mensajes.

## Dónde queda el PNG

| Aspecto | Valor |
|---|---|
| Ruta por defecto | `.wwebjs_auth/qr.png` |
| Variable | `QR_PNG_PATH` |
| Comportamiento | Se sobreescribe con cada QR nuevo; se conserva después de conectar |

La ruta por defecto vive dentro de `.wwebjs_auth/`, que está en `.gitignore`: el PNG nunca se commitea.

## Ciclo de vida

```
npm run dev → ¿hay sesión válida en .wwebjs_auth/?
   ├── Sí → no se pide QR, el bot conecta directo
   └── No  → evento 'qr'
              ├── QR en ASCII en la terminal
              └── QR como PNG en .wwebjs_auth/qr.png
                   ↓ (escaneo)
              evento 'ready' → bot conectado
```

whatsapp-web.js regenera el QR cada ~20 segundos hasta que se escanea; el PNG se sobreescribe en cada regeneración.

## Configuración

| Variable | Default | Descripción |
|---|---|---|
| `QR_PNG_PATH` | `.wwebjs_auth/qr.png` | Ruta del archivo PNG del QR |

## Solución de problemas

| Problema | Causa probable | Solución |
|---|---|---|
| El QR no se ve en la terminal | La terminal no renderiza bien el ASCII | Usá el PNG: `.wwebjs_auth/qr.png` |
| El PNG no se genera | Permisos de escritura o ruta inválida | El log muestra `ERR_WHATSAPP_003` y el QR sigue en la terminal; cambiá `QR_PNG_PATH` |
| El QR expira antes de escanear | whatsapp-web.js lo regenera solo | Esperá el QR nuevo, no hace falta reiniciar el bot |
| Pide QR en cada arranque | La sesión no persiste | No borres `.wwebjs_auth/` |

## Referencias

- [Integración con WhatsApp Web](../apis/03-whatsapp-webjs.md) — eventos y ciclo de sesión.
- [Configuración y variables de entorno](../nodejs/05-config-y-env.md) — variable `QR_PNG_PATH`.
- [Manejo de errores](../nodejs/03-error-handling.md) — código `ERR_WHATSAPP_003`.

---

↩️ [Volver al índice](../00-INDEX.md)
