import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';

const APP_URL = 'https://liga-de-la-suerte-production.up.railway.app/';

export default function AppQRCode() {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      {/* Botón flotante / visible en la esquina superior derecha */}
      <div className="fixed right-3 top-3 z-40 sm:right-6 sm:top-5">
        <button
          onClick={() => setAbierto(true)}
          className="group flex items-center gap-2 rounded-2xl border border-amber-300/40 bg-[#03203c]/90 px-3 py-2 text-xs font-bold text-amber-300 shadow-xl backdrop-blur-md transition-all hover:border-amber-300 hover:bg-[#073663] hover:scale-105 active:scale-95"
          title="Ver Código QR de la App Web"
          aria-label="Abrir código QR de la aplicación"
        >
          {/* Mini preview del QR */}
          <div className="rounded-lg bg-white p-0.5 shadow-sm">
            <QRCodeSVG value={APP_URL} size={24} level="L" />
          </div>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <QrCode className="h-3.5 w-3.5" />
            Código QR
          </span>
        </button>
      </div>

      {/* Modal / Ventana emergente con el Código QR en grande */}
      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setAbierto(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-amber-300/40 bg-gradient-to-b from-[#073867] to-[#02182d] p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar */}
            <button
              onClick={() => setAbierto(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
              aria-label="Cerrar modal de QR"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Encabezado */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300">
              <Smartphone className="h-6 w-6" />
            </div>

            <h3 className="mt-3 font-heading text-xl font-bold text-white">
              Escanear con tu Celular
            </h3>
            <p className="mt-1 text-xs text-sky-200/70">
              Apunta la cámara de tu teléfono a este código QR para abrir la app web directamente:
            </p>

            {/* Contenedor del Código QR */}
            <div className="mx-auto my-5 flex w-fit items-center justify-center rounded-2xl bg-white p-4 shadow-xl ring-4 ring-amber-300/30">
              <QRCodeSVG
                value={APP_URL}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* URL y botón de copiar */}
            <div className="rounded-xl border border-white/10 bg-[#02182d]/80 p-2.5">
              <p className="truncate font-mono text-[11px] text-amber-200/90 selection:bg-amber-300 selection:text-black">
                {APP_URL}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={copiarEnlace}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-xs font-bold text-[#03213e] shadow-md transition hover:brightness-110 active:scale-95"
              >
                {copiado ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-900" />
                    ¡Enlace Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar Enlace
                  </>
                )}
              </button>

              <a
                href={APP_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
                title="Abrir en nueva pestaña"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

