import PropTypes from 'prop-types';
import { CornerMarks } from './CornerMarks';

export function Panel({ eyebrow, title, tone = 'default', children }) {
  const headerTone =
    tone === 'primary'
      ? 'bg-[#1C1F24] text-white'
      : tone === 'danger'
      ? 'bg-[#C1272D] text-white'
      : 'bg-white text-[#1C1F24] border-b border-slate-200';

  return (
    <div className="relative border border-slate-200 bg-white shadow-sm h-full flex flex-col">
      <CornerMarks />
      <div className={`px-4 py-3 ${headerTone}`}>
        {eyebrow && (
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">
            {eyebrow}
          </div>
        )}
        <div className="font-['Oswald',sans-serif] text-sm font-semibold uppercase tracking-wide">
          {title}
        </div>
      </div>
      <div className="p-4 flex-grow flex items-center justify-center min-h-[250px]">
        {children}
      </div>
    </div>
  );
}

Panel.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(['default', 'primary', 'danger']),
  children: PropTypes.node,
};
