import { Circle, Defs, G, LinearGradient, Path, Rect, Stop, Svg, Text, View } from '@react-pdf/renderer';
import type { BrochureBrandSnapshot } from './buildSyllabusBrochureModel';
import { ink, PAGE } from './theme';

export function BrochureLogo({ size = 36 }: { size?: number }) {
  const gid = `logo-${Math.round(size)}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${gid}-a`} x1="15" y1="5" x2="85" y2="95">
          <Stop offset="0%" stopColor="#38bdf8" />
          <Stop offset="45%" stopColor="#2563eb" />
          <Stop offset="100%" stopColor="#1d4ed8" />
        </LinearGradient>
        <LinearGradient id={`${gid}-b`} x1="45" y1="20" x2="70" y2="80">
          <Stop offset="0%" stopColor="#67e8f9" />
          <Stop offset="60%" stopColor="#06b6d4" />
          <Stop offset="100%" stopColor="#0284c7" />
        </LinearGradient>
        <LinearGradient id={`${gid}-pulse`} x1="0" y1="50" x2="100" y2="50">
          <Stop offset="0%" stopColor="#38bdf8" stopOpacity={0.2} />
          <Stop offset="50%" stopColor="#06b6d4" />
          <Stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
        </LinearGradient>
      </Defs>
      <Rect x="6" y="6" width="88" height="88" rx="22" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
      <Path
        d="M 14 55 L 28 55 L 32 50 L 37 62 L 42 46 L 46 55 L 86 55"
        stroke={`url(#${gid}-pulse)`}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M 54 13 L 26 48 L 46 48 L 38 87 L 74 44 L 52 44 Z" fill={`url(#${gid}-a)`} />
      <Path d="M 54 13 L 42 48 L 52 44 Z" fill={`url(#${gid}-b)`} />
      <Path d="M 46 48 L 38 87 L 58 52 L 46 48 Z" fill={`url(#${gid}-b)`} />
      <Circle cx="54" cy="13" r="2.5" fill="#e0f2fe" />
      <Circle cx="38" cy="87" r="2" fill="#38bdf8" />
    </Svg>
  );
}

export function Wordmark({
  brand,
  size = 'md',
}: {
  brand: BrochureBrandSnapshot;
  size?: 'sm' | 'md' | 'lg';
}) {
  const titleSize = size === 'lg' ? 22 : size === 'sm' ? 11 : 14;
  const badgeSize = size === 'lg' ? 8 : 7;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <BrochureLogo size={size === 'lg' ? 48 : size === 'sm' ? 22 : 28} />
      <View style={{ marginLeft: size === 'lg' ? 12 : 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: titleSize, color: ink.white }}>
            {brand.wordmarkPrefix}
          </Text>
          <Text style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: titleSize, color: ink.accent }}>
            {brand.wordmarkAccent}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: badgeSize,
              color: ink.muted,
              letterSpacing: 1.4,
              marginLeft: 6,
              textTransform: 'uppercase',
            }}
          >
            {brand.badge}
          </Text>
        </View>
        {size !== 'sm' && (
          <Text style={{ fontFamily: 'Inter', fontSize: 7, color: ink.muted2, marginTop: 2 }}>
            {brand.tagline}
          </Text>
        )}
      </View>
    </View>
  );
}

export function PageBackdrop({ variant = 'inner' }: { variant?: 'cover' | 'inner' }) {
  return (
    <View
      fixed
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Svg width={PAGE.width} height={PAGE.height} viewBox={`0 0 ${PAGE.width} ${PAGE.height}`}>
        <Rect x="0" y="0" width={PAGE.width} height={PAGE.height} fill={ink.bg} />
        <Defs>
          <LinearGradient id={`bg-top-${variant}`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={ink.primaryDark} />
            <Stop offset="55%" stopColor={ink.accent} />
            <Stop offset="100%" stopColor={ink.secondary} />
          </LinearGradient>
        </Defs>
        <G opacity={variant === 'cover' ? 0.22 : 0.14}>
          <Circle cx="510" cy="70" r="150" fill={ink.primary} />
        </G>
        <G opacity={0.1}>
          <Circle cx="70" cy="780" r="170" fill={ink.secondary} />
        </G>
        <G opacity={variant === 'cover' ? 0.16 : 0.07}>
          <Path
            d="M 24 430 L 90 430 L 118 388 L 156 478 L 198 352 L 236 430 L 572 430"
            stroke={ink.accent}
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
        <Rect x="0" y="0" width={PAGE.width} height="3.5" fill={`url(#bg-top-${variant})`} />
        <Rect x="0" y={PAGE.height - 3.5} width={PAGE.width} height="3.5" fill={ink.primaryDark} />
        <Rect
          x="12"
          y="12"
          width={PAGE.width - 24}
          height={PAGE.height - 24}
          rx="10"
          fill="none"
          stroke={ink.accent}
          strokeWidth="0.7"
          opacity={0.22}
        />
      </Svg>
    </View>
  );
}

export function HeaderBar({ brand, label }: { brand: BrochureBrandSnapshot; label: string }) {
  return (
    <View
      fixed
      style={{
        position: 'absolute',
        top: 20,
        left: PAGE.padX,
        right: PAGE.padX,
        height: 28,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Wordmark brand={brand} size="sm" />
      <Text
        style={{
          fontFamily: 'Inter',
          fontSize: 7.5,
          fontWeight: 600,
          color: ink.accentSoft,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function FooterBar({ brand }: { brand: BrochureBrandSnapshot }) {
  return (
    <View
      fixed
      style={{
        position: 'absolute',
        bottom: 16,
        left: PAGE.padX,
        right: PAGE.padX,
        height: 22,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontFamily: 'Inter', fontSize: 7, color: ink.muted2 }}>
        {brand.name} · Temario oficial · Documento promocional
      </Text>
      <Text
        style={{ fontFamily: 'Inter', fontSize: 7, color: ink.muted, fontWeight: 600 }}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

export function StrokeIcon({
  name,
  color = ink.accent,
  size = 14,
}: {
  name: 'book' | 'layers' | 'award' | 'lock' | 'shield' | 'users' | 'file' | 'cap' | 'calendar';
  color?: string;
  size?: number;
}) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.8,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'book' && (
        <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" {...stroke} />
      )}
      {name === 'layers' && (
        <>
          <Path d="M12 2 2 7l10 5 10-5-10-5z" {...stroke} />
          <Path d="M2 17l10 5 10-5" {...stroke} />
          <Path d="M2 12l10 5 10-5" {...stroke} />
        </>
      )}
      {name === 'award' && (
        <>
          <Circle cx="12" cy="8" r="6" {...stroke} />
          <Path d="M8.2 14.4 7 22l5-3 5 3-1.2-7.6" {...stroke} />
        </>
      )}
      {name === 'lock' && (
        <>
          <Rect x="5" y="11" width="14" height="10" rx="2" {...stroke} />
          <Path d="M8 11V7a4 4 0 0 1 8 0v4" {...stroke} />
        </>
      )}
      {name === 'shield' && (
        <Path d="M12 3 5 6v6c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3z" {...stroke} />
      )}
      {name === 'users' && (
        <>
          <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...stroke} />
          <Circle cx="9" cy="7" r="4" {...stroke} />
          <Path d="M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" {...stroke} />
        </>
      )}
      {name === 'file' && (
        <>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...stroke} />
          <Path d="M14 2v6h6 M8 13h8 M8 17h6" {...stroke} />
        </>
      )}
      {name === 'cap' && (
        <>
          <Path d="M22 10 12 4 2 10l10 6 10-6z" {...stroke} />
          <Path d="M6 12v5c3 2 9 2 12 0v-5" {...stroke} />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect x="3" y="4" width="18" height="18" rx="2" {...stroke} />
          <Path d="M16 2v4 M8 2v4 M3 10h18" {...stroke} />
        </>
      )}
    </Svg>
  );
}
