// Panel derecho del login: en vez de una imagen de stock (mármol, gradientes),
// el hero es un plano técnico de una pieza torneada — el objeto de trabajo
// real de la empresa. El cartucho inferior imita el "cuadro de rotulación"
// de un plano de taller real (proyecto / escala / material / N° de plano).
export function BlueprintHero() {
  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-[#1C1F24] lg:flex">
      {/* Grid de fondo, como el papel milimetrado de un plano */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
        <defs>
          <pattern id="grid-blueprint" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#8A94A3" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-blueprint)" />
      </svg>

      <div className="relative z-10 px-10 pt-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#8A94A3]">
          Plano de referencia · Vista en corte
        </p>
      </div>

      {/* Pieza torneada en corte, con líneas de cota reales de un dibujo técnico */}
      <svg
        viewBox="0 0 480 480"
        className="relative z-10 mx-auto w-full max-w-md flex-1"
        aria-hidden="true"
      >
        {/* Línea de centro (norma: raya-punto-raya) */}
        <line x1="240" y1="30" x2="240" y2="450" stroke="#2B5C8C" strokeWidth="1" strokeDasharray="18 6 2 6" opacity="0.6" />
        <line x1="30" y1="240" x2="450" y2="240" stroke="#2B5C8C" strokeWidth="1" strokeDasharray="18 6 2 6" opacity="0.6" />

        {/* Diámetro exterior */}
        <circle cx="240" cy="240" r="150" fill="none" stroke="#D7DCE3" strokeWidth="1.5" />
        {/* Barreno interior */}
        <circle cx="240" cy="240" r="66" fill="none" stroke="#D7DCE3" strokeWidth="1.5" />
        {/* Achurado de corte (norma de sección de material sólido) */}
        <g stroke="#E0972B" strokeWidth="1" opacity="0.55">
          {Array.from({ length: 14 }).map((_, i) => {
            const offset = -150 + i * 23;
            return <line key={i} x1={240 + offset} y1="90" x2={240 + offset + 60} y2="390" />;
          })}
        </g>
        <circle cx="240" cy="240" r="150" fill="#1C1F24" opacity="0" />
        <clipPath id="anillo-corte">
          <path
            d="M240,90 a150,150 0 1,1 -0.1,0 Z M240,174 a66,66 0 1,0 0.1,0 Z"
            fillRule="evenodd"
          />
        </clipPath>
        <g clipPath="url(#anillo-corte)">
          <g stroke="#E0972B" strokeWidth="1" opacity="0.55">
            {Array.from({ length: 20 }).map((_, i) => {
              const offset = -160 + i * 18;
              return <line key={i} x1={240 + offset} y1="80" x2={240 + offset + 60} y2="400" />;
            })}
          </g>
        </g>

        {/* Chaflán de detalle con línea de referencia */}
        <path d="M 240 90 L 258 108" stroke="#D7DCE3" strokeWidth="1.5" fill="none" />
        <line x1="258" y1="108" x2="320" y2="70" stroke="#8A94A3" strokeWidth="1" />
        <text x="326" y="74" fill="#8A94A3" fontSize="13" fontFamily="'JetBrains Mono', monospace">R2</text>

        {/* Cota de diámetro exterior */}
        <line x1="90" y1="440" x2="390" y2="440" stroke="#8A94A3" strokeWidth="1" />
        <line x1="90" y1="432" x2="90" y2="448" stroke="#8A94A3" strokeWidth="1" />
        <line x1="390" y1="432" x2="390" y2="448" stroke="#8A94A3" strokeWidth="1" />
        <text x="240" y="464" fill="#D7DCE3" fontSize="14" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">
          ⌀84.0
        </text>

        {/* Cota de barreno interior */}
        <line x1="205" y1="240" x2="205" y2="240" stroke="#8A94A3" strokeWidth="1" />
        <text x="240" y="245" fill="#8A94A3" fontSize="12" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">
          ⌀30.0
        </text>
      </svg>

      {/* Cartucho de rotulación, como en un plano de taller real */}
      <div className="relative z-10 grid grid-cols-2 gap-px border-t border-[#3A3F47] bg-[#3A3F47] text-[10px] font-mono uppercase tracking-wider sm:grid-cols-4">
        {[
          ['Proyecto', 'Metalmod Core'],
          ['Escala', '1:1'],
          ['Material', 'Acero 1045'],
          ['Plano N°', 'MM-LOGIN-01'],
        ].map(([label, value]) => (
          <div key={label} className="bg-[#1C1F24] px-4 py-3">
            <div className="text-[#8A94A3]">{label}</div>
            <div className="mt-0.5 text-[#D7DCE3]">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
