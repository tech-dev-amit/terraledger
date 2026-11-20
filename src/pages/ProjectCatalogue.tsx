import { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Download,
  MapPin,
  Calendar,
  Building,
  CheckCircle2,
  FileText,
  Copy,
  Layers,
  Sparkles,
  PhoneCall,
  Mail,
  ShieldCheck,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Project } from '@/lib/types';

export function ProjectCatalogue({
  projectId,
  onBack,
}: {
  projectId: string;
  onBack?: () => void;
}) {
  const { projects, towers, units } = useStore();
  const [copied, setCopied] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const project: Project | undefined = projects.find(
    (p) => p.id === projectId || p.share_slug === projectId
  );

  if (!project) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center text-center p-8">
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <p className="mt-2 text-slate-500">The project you are looking for is either unavailable or has been removed.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        )}
      </div>
    );
  }

  const projectTowers = towers.filter((t) => t.project_id === project.id);
  const projectUnits = units.filter((u) => u.project_id === project.id);
  const availableUnits = projectUnits.filter((u) => u.status === 'Available');

  const shareUrl = `${window.location.origin}/?page=project-view&id=${project.share_slug || project.id}`;

  const copyShareLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${project.name} - Official Project Catalogue`,
          text: `Explore ${project.name} in ${project.locality}, ${project.city}. View floor plans, pricing, and live inventory.`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Geo map embed URL using OpenStreetMap
  const lat = project.geo_lat || 12.9716;
  const lng = project.geo_lng || 77.5946;
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015}%2C${lat - 0.01}%2C${lng + 0.015}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

  const allImages = [
    project.image_url,
    ...(project.gallery_images || []),
  ].filter(Boolean) as string[];

  const formatPrice = (p: number) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
    return `₹${p.toLocaleString('en-IN')}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 print:max-w-none print:p-0 print:space-y-6">
      {/* Printable / Screen Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur print:hidden">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </button>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {project.publish_status === 'Published' ? 'Live Published Catalogue' : 'Draft Preview'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-all shadow-sm active:scale-95"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Copied Link!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-indigo-600" /> Share Project Link
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-glow-indigo hover:opacity-95 transition-all active:scale-95"
          >
            <Download className="h-4 w-4" /> Download PDF Catalogue
          </button>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="relative h-72 sm:h-96 w-full bg-slate-900">
          <img
            src={project.image_url || '/projects/meridian-heights.webp'}
            alt={project.name}
            className="h-full w-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Badges on hero */}
          <div className="absolute top-6 left-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold tracking-tight text-slate-900 shadow-md backdrop-blur">
              {project.property_type}
            </span>
            <span className="rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md backdrop-blur">
              {project.status}
            </span>
            {project.rera_no && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" /> RERA Registered
              </span>
            )}
          </div>

          {/* Title & Location details */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-white">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tightest drop-shadow-md">
                {project.name}
              </h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm sm:text-base text-slate-200 font-medium">
                <MapPin className="h-4 w-4 text-indigo-400 shrink-0" />
                {project.locality}, {project.city}
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 sm:p-4 backdrop-blur-md shadow-lg text-right">
              <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-200">Price Guide</p>
              <p className="text-xl sm:text-2xl font-black text-white tabular-nums">
                {project.price_range_min ? formatPrice(project.price_range_min) : 'On Request'}
                {project.price_range_max && project.price_range_max !== project.price_range_min
                  ? ` – ${formatPrice(project.price_range_max)}`
                  : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-slate-50/70 border-t border-slate-100 text-center">
          <div className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Units</p>
            <p className="mt-1 text-xl font-extrabold text-slate-800 tabular-nums">
              {projectUnits.length || project.total_units || 'Premium Portfolio'}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold">{availableUnits.length} Ready for Booking</p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Towers / Blocks</p>
            <p className="mt-1 text-xl font-extrabold text-slate-800 tabular-nums">
              {projectTowers.length || '1 Master Block'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Planned Architecture</p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Possession</p>
            <p className="mt-1 text-xl font-extrabold text-slate-800 tabular-nums">
              {project.possession_date
                ? new Date(project.possession_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                : 'Under Schedule'}
            </p>
            <p className="text-[11px] text-indigo-600 font-semibold">On-Schedule Milestone</p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">RERA Registration</p>
            <p className="mt-1 text-xs font-bold text-slate-800 truncate px-2" title={project.rera_no || 'Approved'}>
              {project.rera_no || 'Verified / In Process'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">100% Compliant Project</p>
          </div>
        </div>
      </div>

      {/* Project Overview Story */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Sparkles className="h-5 w-5 text-indigo-600" /> Project Overview & Lifestyle
            </h2>
            <div className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed space-y-3 font-normal">
              <p>
                {project.description ||
                  `${project.name} represents a signature architectural achievement in ${project.locality}, ${project.city}. Thoughtfully designed to optimize natural ventilation, daylight, and expansive open vistas, this landmark development balances urban prestige with serene sanctuary.`}
              </p>
              <p>
                Engineered with earthquake-resistant RCC construction, premium Italian marble/vitrified finishes, and acoustic double-glazed windows, every detail caters to discerning buyers seeking superior craftsmanship and long-term capital appreciation.
              </p>
            </div>
          </div>

          {/* Photo Gallery */}
          {allImages.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                <Maximize2 className="h-5 w-5 text-indigo-600" /> Architectural Gallery
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    className="group relative h-36 sm:h-44 overflow-hidden rounded-xl bg-slate-100 cursor-pointer border border-slate-200/60"
                  >
                    <img
                      src={img}
                      alt={`${project.name} view ${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities & Lifestyle */}
          {project.amenities && project.amenities.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                <Layers className="h-5 w-5 text-indigo-600" /> World-Class Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {project.amenities.map((amenity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Units Matrix / Floor Inventory Preview */}
          {projectUnits.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Building className="h-5 w-5 text-indigo-600" /> Unit Configurations & Pricing
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  Showing {projectUnits.slice(0, 8).length} of {projectUnits.length} sample units
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-y border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Unit No</th>
                      <th className="py-2.5 px-3">Floor</th>
                      <th className="py-2.5 px-3">Configuration</th>
                      <th className="py-2.5 px-3">Carpet / Super Area</th>
                      <th className="py-2.5 px-3">Facing</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {projectUnits.slice(0, 10).map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{u.unit_no}</td>
                        <td className="py-2.5 px-3 text-slate-600">{u.floor === 0 ? 'G' : `F${u.floor}`}</td>
                        <td className="py-2.5 px-3 font-semibold text-indigo-900">{u.config}</td>
                        <td className="py-2.5 px-3 text-slate-600">{u.area_sqft} sq.ft.</td>
                        <td className="py-2.5 px-3 text-slate-600">{u.facing}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatPrice(u.price)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              u.status === 'Available'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : u.status === 'Booked'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info & Map & Contact */}
        <div className="space-y-6">
          {/* Geo-Location Map Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm overflow-hidden">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
              <MapPin className="h-4 w-4 text-indigo-600" /> Location & Connectivity
            </h3>
            <p className="text-xs text-slate-500 mb-3 font-medium">
              Coordinates: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
            </p>
            <div className="h-56 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
              <iframe
                title="Project Location Map"
                src={mapEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
            </a>
          </div>

          {/* Documents & Legal Clearances */}
          {project.documents && project.documents.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
                <FileText className="h-4 w-4 text-indigo-600" /> Documents & Clearances
              </h3>
              <div className="space-y-2.5">
                {project.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs shadow-sm hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate">{doc.name}</p>
                        {doc.size && <p className="text-[10px] text-slate-400">{doc.size}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Opening document: ${doc.name}`)}
                      className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-200 shadow-xs hover:bg-indigo-50"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Builder Sales Contact Box */}
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 p-5 shadow-sm">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-900">Official Sales Desk</p>
            <h4 className="mt-1 text-base font-bold text-slate-900">TerraLedger Premier Realty</h4>
            <p className="mt-1 text-xs text-slate-600">
              Direct developer sales office. No brokerage for direct inquiries. Contact our senior portfolio manager today.
            </p>

            <div className="mt-4 space-y-2">
              <a
                href="tel:+918000459900"
                className="flex items-center gap-2.5 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-950 shadow-xs hover:bg-indigo-50 transition-colors"
              >
                <PhoneCall className="h-4 w-4 text-indigo-600" /> +91 80004 59900
              </a>
              <a
                href="mailto:sales@terraledger.in"
                className="flex items-center gap-2.5 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-950 shadow-xs hover:bg-indigo-50 transition-colors"
              >
                <Mail className="h-4 w-4 text-indigo-600" /> sales@terraledger.in
              </a>
            </div>

            <div className="mt-4 rounded-xl bg-white/80 p-3 border border-indigo-100 text-[11px] text-slate-600 font-medium">
              <p>📍 Site Office: {project.locality}, {project.city}</p>
              <p className="mt-1">🕒 Working Hours: Mon – Sun (9:30 AM – 7:00 PM)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImg(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <img src={selectedImg} alt="Enlarged preview" className="h-full w-full object-contain" />
            <button
              onClick={() => setSelectedImg(null)}
              className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}