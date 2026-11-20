import { useState, useId } from 'react';
import {
  Building2,
  MapPin,
  Image as ImageIcon,
  FileText,
  Layers,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Share2,
  Download,
  ArrowRight,
  Info,
  Compass,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import type { ProjectInput, UnitInput } from '@/lib/store';
import { Card, SectionTitle, inputCls, Field } from '@/components/ui';

const PRESET_LOCATIONS = [
  { name: 'Bengaluru - Whitefield', lat: 12.9863, lng: 77.7335, city: 'Bengaluru', locality: 'ITPL Main Road, Whitefield' },
  { name: 'Bengaluru - Indiranagar', lat: 12.9784, lng: 77.6408, city: 'Bengaluru', locality: '100ft Road, Indiranagar' },
  { name: 'Hyderabad - Financial District', lat: 17.4401, lng: 78.3489, city: 'Hyderabad', locality: 'Nanakramguda, Financial District' },
  { name: 'Pune - Baner', lat: 18.5590, lng: 73.7868, city: 'Pune', locality: 'Baner-Pashan Link Road' },
  { name: 'Mumbai - BKC', lat: 19.0662, lng: 72.8687, city: 'Mumbai', locality: 'G Block, Bandra Kurla Complex' },
  { name: 'Gurgaon - Cyber City', lat: 28.4950, lng: 77.0895, city: 'Gurgaon', locality: 'DLF Phase 2, Cyber City' },
];

const AMENITY_OPTIONS = [
  'Clubhouse',
  'Infinity Pool',
  'Gym & CrossFit',
  '24x7 Security & CCTV',
  'Kids Play Park',
  'EV Charging Stations',
  'Jogging & Cycling Track',
  'Tennis & Badminton Court',
  'Landscaped Zen Gardens',
  'Co-Working Pods',
  '100% Power Backup',
  'Rooftop Star-Gazing Deck',
  'Pet Friendly Zone',
  'Banquet & Party Lawn',
];

const SAMPLE_GALLERY = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
];

export function AddProject({
  onProjectCreated,
}: {
  onProjectCreated?: (projectId: string) => void;
}) {
  const { addProject } = useStore();
  const fileInputId = useId();

  // Basic Form State
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState('Apartments');
  const [city, setCity] = useState('Bengaluru');
  const [locality, setLocality] = useState('');
  const [possessionDate, setPossessionDate] = useState('2027-12-31');
  const [status, setStatus] = useState('Under Construction');
  const [reraNo, setReraNo] = useState('');
  const [description, setDescription] = useState('');

  // Pricing State
  const [priceMin, setPriceMin] = useState<number | ''>(12500000);
  const [priceMax, setPriceMax] = useState<number | ''>(21000000);

  // Geo Location State
  const [lat, setLat] = useState<number>(12.9863);
  const [lng, setLng] = useState<number>(77.7335);

  // Amenities
  const [amenities, setAmenities] = useState<string[]>([
    'Clubhouse',
    'Infinity Pool',
    'Gym & CrossFit',
    '24x7 Security & CCTV',
    'EV Charging Stations',
  ]);
  const [customAmenity, setCustomAmenity] = useState('');

  // Media & Images
  const [heroImage, setHeroImage] = useState('/projects/meridian-heights.webp');
  const [galleryImages, setGalleryImages] = useState<string[]>([...SAMPLE_GALLERY.slice(0, 3)]);

  // Documents
  const [documents, setDocuments] = useState<{ name: string; url: string; size?: string }[]>([
    { name: 'RERA Approval Certificate.pdf', url: '#', size: '2.1 MB' },
    { name: 'Master Floor Plan & Layout.pdf', url: '#', size: '5.8 MB' },
  ]);
  const [newDocName, setNewDocName] = useState('');

  // Towers & Units Generator
  const [towerName, setTowerName] = useState('Tower 1');
  const [towerFloors, setTowerFloors] = useState<number>(8);
  const [unitsPerFloor, setUnitsPerFloor] = useState<number>(4);
  const [unitConfig, setUnitConfig] = useState('3 BHK');
  const [unitArea, setUnitArea] = useState<number>(1450);
  const [unitBasePrice, setUnitBasePrice] = useState<number>(14500000);
  const [generatedUnits, setGeneratedUnits] = useState<UnitInput[]>([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  // Handle Location Preset
  const handleSelectPreset = (preset: (typeof PRESET_LOCATIONS)[0]) => {
    setCity(preset.city);
    setLocality(preset.locality);
    setLat(preset.lat);
    setLng(preset.lng);
  };

  // Toggle Amenity
  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleAddCustomAmenity = () => {
    if (customAmenity.trim() && !amenities.includes(customAmenity.trim())) {
      setAmenities((prev) => [...prev, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  // Upload Local Image file -> Data URL
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setGalleryImages((prev) => [dataUrl, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Generate batch units
  const handleGenerateUnits = () => {
    const newUnits: UnitInput[] = [];
    const facings = ['East', 'West', 'North-East', 'North'];

    for (let f = 1; f <= towerFloors; f++) {
      for (let u = 1; u <= unitsPerFloor; u++) {
        const uNo = `${towerName.charAt(0)}${f}0${u}`;
        const price = unitBasePrice + (f - 1) * 100000 + (u - 1) * 50000;
        newUnits.push({
          floor: f,
          unit_no: uNo,
          config: u % 2 === 0 ? '3 BHK' : unitConfig,
          area_sqft: unitArea + (u % 2 === 0 ? 200 : 0),
          facing: facings[(u - 1) % facings.length],
          price,
          status: 'Available',
          tower_name: towerName,
        });
      }
    }
    setGeneratedUnits(newUnits);
  };

  // Add Document
  const handleAddDocument = () => {
    if (newDocName.trim()) {
      setDocuments((prev) => [
        ...prev,
        { name: `${newDocName.trim()}.pdf`, url: '#', size: '3.4 MB' },
      ]);
      setNewDocName('');
    }
  };

  // Save / Publish
  const handleSave = async (publishStatus: 'Draft' | 'Published') => {
    if (!name.trim()) {
      alert('Please enter a Project Name');
      return;
    }

    try {
      setIsSubmitting(true);

      const projectData: ProjectInput = {
        name: name.trim(),
        property_type: propertyType,
        city: city.trim(),
        locality: locality.trim() || 'Central Boulevard',
        possession_date: possessionDate || null,
        status,
        image_url: heroImage,
        description: description.trim() || `${name} is a premier luxury development located in ${locality || city}.`,
        publish_status: publishStatus,
        rera_no: reraNo.trim() || null,
        amenities,
        gallery_images: galleryImages,
        documents,
        geo_lat: lat,
        geo_lng: lng,
        price_range_min: typeof priceMin === 'number' ? priceMin : null,
        price_range_max: typeof priceMax === 'number' ? priceMax : null,
        total_units: generatedUnits.length > 0 ? generatedUnits.length : 24,
      };

      const towersData = [{ name: towerName, floors: towerFloors }];
      const unitsData = generatedUnits.length > 0 ? generatedUnits : undefined;

      const newId = await addProject(projectData, towersData, unitsData);
      const slug = (name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6)).replace(/^-+|-+$/g, '');

      setCreatedProjectId(newId);
      setCreatedSlug(slug);

      if (onProjectCreated) {
        onProjectCreated(newId);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Geo map embed URL for live preview
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015}%2C${lat - 0.01}%2C${lng + 0.015}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

  // Success view when project is created
  if (createdProjectId) {
    const shareableUrl = `${window.location.origin}/?page=project-view&id=${createdSlug || createdProjectId}`;

    return (
      <div className="mx-auto max-w-3xl space-y-6 py-6 animate-fade-up">
        <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white p-8 shadow-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-glow-emerald">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tightest text-slate-900">
            Project Successfully Saved!
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            <strong>{name}</strong> is now live in your TerraLedger database. You can share the customer catalogue link or download a printable PDF catalogue anytime.
          </p>

          {/* Share Link Box */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Customer Shareable Link:
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={shareableUrl}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareableUrl);
                  alert('Shareable link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition-all"
              >
                <Share2 className="h-3.5 w-3.5" /> Copy Link
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={shareableUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-indigo hover:opacity-95 transition-all"
            >
              <ExternalLink className="h-4 w-4" /> Open Live Customer Catalogue
            </a>

            <button
              onClick={() => {
                window.open(shareableUrl, '_blank');
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
            >
              <Download className="h-4 w-4 text-indigo-600" /> Print / Download PDF
            </button>

            <button
              onClick={() => {
                setCreatedProjectId(null);
                setName('');
                setGeneratedUnits([]);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              + Create Another Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20 animate-fade-up">
      {/* Page Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-glow-indigo">
              <Building2 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tightest text-slate-900">Add New Project</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Define comprehensive project specifications, units matrix, geo-location, images, and publish to clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave('Draft')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave('Published')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-glow-indigo hover:opacity-95 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            {isSubmitting ? 'Publishing...' : 'Publish Project'}
          </button>
        </div>
      </div>

      {/* 1. Basic Details Card */}
      <Card className="p-6">
        <SectionTitle>1. General Project Details</SectionTitle>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Field label="Project Name *">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sobha Royal Pavilion, Prestige Falcon City"
                className={inputCls}
                required
              />
            </Field>
          </div>

          <div>
            <Field label="Property Type">
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className={inputCls}
              >
                <option value="Apartments">Luxury Apartments</option>
                <option value="Villas">Gated Villas</option>
                <option value="Commercial">Commercial / Tech Hub</option>
                <option value="Plots">Plotted Development</option>
                <option value="Penthouse">Sky Villas & Penthouses</option>
              </select>
            </Field>
          </div>

          <div>
            <Field label="City">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                className={inputCls}
              />
            </Field>
          </div>

          <div>
            <Field label="Locality / Neighborhood">
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Whitefield, ITPL Road"
                className={inputCls}
              />
            </Field>
          </div>

          <div>
            <Field label="Target Possession Date">
              <input
                type="date"
                value={possessionDate}
                onChange={(e) => setPossessionDate(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <div>
            <Field label="Development Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputCls}
              >
                <option value="Pre-Launch">Pre-Launch</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Nearing Possession">Nearing Possession</option>
                <option value="Ready to Move">Ready to Move</option>
              </select>
            </Field>
          </div>

          <div>
            <Field label="RERA Registration Number">
              <input
                type="text"
                value={reraNo}
                onChange={(e) => setReraNo(e.target.value)}
                placeholder="e.g. PRM/KA/RERA/1251/446/..."
                className={inputCls}
              />
            </Field>
          </div>

          <div>
            <Field label="Hero Banner Image URL">
              <input
                type="text"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="/projects/meridian-heights.webp"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="md:col-span-3">
            <Field label="Marketing Description & Highlights">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe architectural highlights, landscape themes, proximity to metro/schools, and smart home features..."
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      </Card>

      {/* 2. Geo Location & Map Integration */}
      <Card className="p-6">
        <SectionTitle
          right={
            <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
              <Compass className="h-3.5 w-3.5" /> Interactive Map Preview
            </span>
          }
        >
          2. Geo Location & Map Pin Integration
        </SectionTitle>

        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-2 font-medium">Quick Presets:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_LOCATIONS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Field label="Latitude">
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className={inputCls}
                />
              </Field>
              <Field label="Longitude">
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className={inputCls}
                />
              </Field>
              <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-3 text-xs text-indigo-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" /> GPS Coordinates Live Pin
                </p>
                <p className="mt-1 text-slate-600">
                  Customers viewing the project catalogue will see this exact location on an interactive map with one-click directions.
                </p>
              </div>
            </div>

            <div className="h-52 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
              <iframe
                title="Location Map"
                src={mapEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Pricing & Batch Units Generator */}
      <Card className="p-6">
        <SectionTitle>3. Pricing & Units Matrix</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Field label="Price Range Starting (₹)">
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : '')}
              className={inputCls}
            />
          </Field>
          <Field label="Price Range Maximum (₹)">
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : '')}
              className={inputCls}
            />
          </Field>
        </div>

        {/* Batch Generator */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Tower & Unit Batch Generator
              </p>
              <p className="text-[11px] text-slate-500">
                Instantly populate your unit inventory matrix with realistic floor pricing
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateUnits}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Generate Units
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Tower Name</label>
              <input
                type="text"
                value={towerName}
                onChange={(e) => setTowerName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Total Floors</label>
              <input
                type="number"
                value={towerFloors}
                onChange={(e) => setTowerFloors(Number(e.target.value) || 1)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Units / Floor</label>
              <input
                type="number"
                value={unitsPerFloor}
                onChange={(e) => setUnitsPerFloor(Number(e.target.value) || 1)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Primary Config</label>
              <input
                type="text"
                value={unitConfig}
                onChange={(e) => setUnitConfig(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Area (Sq.Ft.)</label>
              <input
                type="number"
                value={unitArea}
                onChange={(e) => setUnitArea(Number(e.target.value) || 1000)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Base Price (₹)</label>
              <input
                type="number"
                value={unitBasePrice}
                onChange={(e) => setUnitBasePrice(Number(e.target.value) || 1000000)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>
          </div>

          {generatedUnits.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  {generatedUnits.length} Units Generated (Sample: {generatedUnits[0].unit_no} – {generatedUnits[generatedUnits.length - 1].unit_no})
                </span>
                <button
                  type="button"
                  onClick={() => setGeneratedUnits([])}
                  className="text-rose-600 hover:underline text-[11px] font-semibold"
                >
                  Clear Units
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 4. Architectural Gallery & Media */}
      <Card className="p-6">
        <SectionTitle
          right={
            <label
              htmlFor={fileInputId}
              className="cursor-pointer flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Upload Photos
            </label>
          }
        >
          4. Visual Gallery & Renderings
        </SectionTitle>

        <input
          id={fileInputId}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              className="group relative h-28 overflow-hidden rounded-xl bg-slate-100 border border-slate-200"
            >
              <img src={img} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/70 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}

          {galleryImages.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-slate-400">
              No gallery images uploaded. Click "Upload Photos" above or paste URLs.
            </div>
          )}
        </div>
      </Card>

      {/* 5. Amenities Checklist */}
      <Card className="p-6">
        <SectionTitle>5. Amenities & Highlights</SectionTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((item) => {
            const active = amenities.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleAmenity(item)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                {active && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                {item}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 max-w-sm">
          <input
            type="text"
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAmenity())}
            placeholder="Add custom amenity..."
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
          />
          <button
            type="button"
            onClick={handleAddCustomAmenity}
            className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
          >
            Add
          </button>
        </div>
      </Card>

      {/* 6. Documents & Brochures */}
      <Card className="p-6">
        <SectionTitle>6. Compliance Documents & Brochures</SectionTitle>
        <div className="mt-4 space-y-2">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span className="font-semibold text-slate-800">{doc.name}</span>
                {doc.size && <span className="text-[11px] text-slate-400">({doc.size})</span>}
              </div>
              <button
                type="button"
                onClick={() => setDocuments((prev) => prev.filter((_, i) => i !== idx))}
                className="text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              placeholder="e.g. Environmental Clearance 2026, Master Layout"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 flex-1 max-w-md"
            />
            <button
              type="button"
              onClick={handleAddDocument}
              className="flex items-center gap-1 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
            >
              <Plus className="h-3.5 w-3.5" /> Add Document
            </button>
          </div>
        </div>
      </Card>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
        <div>
          <p className="text-xs font-bold text-slate-800">Ready to Publish or Save Draft?</p>
          <p className="text-[11px] text-slate-500">
            Publishing enables customer link sharing and formatted PDF catalogue downloads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave('Draft')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave('Published')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-glow-indigo hover:opacity-95"
          >
            <Sparkles className="h-4 w-4" />
            {isSubmitting ? 'Publishing...' : 'Publish Project & Create Catalogue'}
          </button>
        </div>
      </div>
    </div>
  );
}